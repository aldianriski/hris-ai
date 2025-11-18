-- Migration: Create invoices table
-- Created: 2025-11-18
-- Description: Invoice management for tenant billing

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Invoice identification
  invoice_number VARCHAR(50) UNIQUE NOT NULL,

  -- Tenant relationship
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  -- Billing details
  billing_name VARCHAR(255) NOT NULL,
  billing_email VARCHAR(255) NOT NULL,
  billing_address TEXT,
  billing_tax_id VARCHAR(100), -- NPWP for Indonesia
  billing_phone VARCHAR(50),

  -- Line items (JSON array)
  line_items JSONB NOT NULL DEFAULT '[]'::JSONB,

  -- Amounts (in smallest currency unit, e.g., cents/rupiah)
  amount_subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  amount_tax DECIMAL(12, 2) NOT NULL DEFAULT 0,
  amount_discount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  amount_total DECIMAL(12, 2) NOT NULL DEFAULT 0,

  currency VARCHAR(3) DEFAULT 'IDR',

  -- Tax details
  tax_rate DECIMAL(5, 2) DEFAULT 11.00, -- PPN 11% for Indonesia
  tax_description VARCHAR(100) DEFAULT 'PPN 11%',

  -- Billing period
  billing_period_start TIMESTAMPTZ,
  billing_period_end TIMESTAMPTZ,

  -- Dates
  issue_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  -- Possible values: draft, sent, paid, overdue, cancelled, refunded

  -- Payment details
  payment_method VARCHAR(50), -- stripe, midtrans, manual, etc.
  payment_reference VARCHAR(255), -- Transaction ID or reference
  payment_notes TEXT,

  -- Discount/Coupon
  discount_code VARCHAR(100),
  discount_description VARCHAR(255),

  -- Stripe integration
  stripe_invoice_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  stripe_hosted_invoice_url TEXT,
  stripe_invoice_pdf_url TEXT,

  -- Notes
  notes TEXT,
  internal_notes TEXT, -- Not visible to customer

  -- Email tracking
  sent_at TIMESTAMPTZ,
  sent_to VARCHAR(255),
  reminder_sent_at TIMESTAMPTZ,
  reminder_count INTEGER DEFAULT 0,

  -- Metadata
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  last_modified_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_invoices_tenant_id ON public.invoices(tenant_id);
CREATE INDEX idx_invoices_invoice_number ON public.invoices(invoice_number);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX idx_invoices_issue_date ON public.invoices(issue_date DESC);
CREATE INDEX idx_invoices_paid_at ON public.invoices(paid_at);
CREATE INDEX idx_invoices_stripe_invoice_id ON public.invoices(stripe_invoice_id) WHERE stripe_invoice_id IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX idx_invoices_tenant_status ON public.invoices(tenant_id, status);
CREATE INDEX idx_invoices_status_due_date ON public.invoices(status, due_date);

-- Trigger for updated_at
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.invoices IS 'Invoices for tenant billing and subscription payments';
COMMENT ON COLUMN public.invoices.invoice_number IS 'Unique invoice number (e.g., INV-2024-001)';
COMMENT ON COLUMN public.invoices.line_items IS 'JSON array of line items with description, quantity, unit_price, amount';
COMMENT ON COLUMN public.invoices.status IS 'Invoice status: draft, sent, paid, overdue, cancelled, refunded';
COMMENT ON COLUMN public.invoices.tax_rate IS 'Tax rate as percentage (e.g., 11.00 for PPN 11%)';
COMMENT ON COLUMN public.invoices.billing_tax_id IS 'Customer tax ID (NPWP for Indonesia)';

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  month_part TEXT;
  sequence_part TEXT;
  next_number INTEGER;
BEGIN
  -- Get current year and month
  year_part := TO_CHAR(NOW(), 'YYYY');
  month_part := TO_CHAR(NOW(), 'MM');

  -- Get next sequence number for this month
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(invoice_number FROM 'INV-\d{4}-\d{2}-(\d+)') AS INTEGER)
  ), 0) + 1
  INTO next_number
  FROM public.invoices
  WHERE invoice_number LIKE 'INV-' || year_part || '-' || month_part || '-%';

  -- Format sequence with leading zeros (3 digits)
  sequence_part := LPAD(next_number::TEXT, 3, '0');

  -- Return formatted invoice number: INV-YYYY-MM-###
  RETURN 'INV-' || year_part || '-' || month_part || '-' || sequence_part;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_invoice_number() IS 'Generates sequential invoice number in format INV-YYYY-MM-###';

-- Function to automatically mark invoices as overdue
CREATE OR REPLACE FUNCTION mark_overdue_invoices()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.invoices
  SET status = 'overdue'
  WHERE status = 'sent'
    AND due_date < NOW()
    AND paid_at IS NULL;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION mark_overdue_invoices() IS 'Marks invoices as overdue if past due date and not paid';

-- Function to calculate invoice totals
CREATE OR REPLACE FUNCTION calculate_invoice_totals(
  p_subtotal DECIMAL,
  p_tax_rate DECIMAL,
  p_discount DECIMAL DEFAULT 0
)
RETURNS TABLE(
  subtotal DECIMAL,
  tax DECIMAL,
  discount DECIMAL,
  total DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p_subtotal AS subtotal,
    ROUND((p_subtotal - p_discount) * p_tax_rate / 100, 2) AS tax,
    p_discount AS discount,
    ROUND(p_subtotal - p_discount + ((p_subtotal - p_discount) * p_tax_rate / 100), 2) AS total;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_invoice_totals IS 'Calculates invoice totals including tax and discount';

-- RLS Policies (Row Level Security)
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Platform admins can see all invoices
CREATE POLICY "Platform admins can view all invoices"
  ON public.invoices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
        AND pr.slug IN ('super_admin', 'platform_admin', 'billing_admin')
    )
  );

-- Platform admins can create invoices
CREATE POLICY "Platform admins can create invoices"
  ON public.invoices
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
        AND pr.slug IN ('super_admin', 'platform_admin', 'billing_admin')
    )
  );

-- Platform admins can update invoices
CREATE POLICY "Platform admins can update invoices"
  ON public.invoices
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
        AND pr.slug IN ('super_admin', 'platform_admin', 'billing_admin')
    )
  );

-- Platform admins can delete invoices (soft delete recommended)
CREATE POLICY "Platform admins can delete invoices"
  ON public.invoices
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
        AND pr.slug IN ('super_admin', 'billing_admin')
    )
  );

-- Tenants can view their own invoices
CREATE POLICY "Tenants can view their own invoices"
  ON public.invoices
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT t.id FROM public.tenants t
      JOIN public.user_roles ur ON ur.tenant_id = t.id
      WHERE ur.user_id = auth.uid()
    )
  );
