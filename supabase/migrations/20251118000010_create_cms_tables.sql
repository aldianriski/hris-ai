-- =====================================================
-- Talixa HRIS - CMS Tables Migration
-- =====================================================
-- Purpose: Create tables for website content management
-- Author: Claude
-- Date: 2025-11-18
-- Related: docs/BRANDING_PRD.md
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- BLOG POSTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS cms_blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  category TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  featured_image_url TEXT,
  published_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  language TEXT DEFAULT 'id' CHECK (language IN ('id', 'en')),

  -- SEO fields
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  og_image_url TEXT,

  -- Analytics
  view_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT blog_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Indexes for blog posts
CREATE INDEX idx_cms_blog_posts_slug ON cms_blog_posts(slug);
CREATE INDEX idx_cms_blog_posts_published ON cms_blog_posts(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_cms_blog_posts_category ON cms_blog_posts(category) WHERE status = 'published';
CREATE INDEX idx_cms_blog_posts_author ON cms_blog_posts(author_id);
CREATE INDEX idx_cms_blog_posts_tags ON cms_blog_posts USING GIN(tags);
CREATE INDEX idx_cms_blog_posts_status ON cms_blog_posts(status);
CREATE INDEX idx_cms_blog_posts_language ON cms_blog_posts(language);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_cms_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cms_blog_posts_updated_at
  BEFORE UPDATE ON cms_blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_cms_blog_posts_updated_at();

-- =====================================================
-- CASE STUDIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS cms_case_studies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  industry TEXT,
  employee_count INTEGER,

  -- Content sections
  challenge JSONB,
  solution JSONB,
  results JSONB,

  -- Testimonial
  testimonial TEXT,
  testimonial_author TEXT,
  testimonial_role TEXT,

  -- Media
  logo_url TEXT,
  featured_image_url TEXT,

  -- Publishing
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,

  -- SEO
  seo_title TEXT,
  seo_description TEXT,

  -- Analytics
  view_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT case_study_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Indexes for case studies
CREATE INDEX idx_cms_case_studies_slug ON cms_case_studies(slug);
CREATE INDEX idx_cms_case_studies_industry ON cms_case_studies(industry) WHERE status = 'published';
CREATE INDEX idx_cms_case_studies_published ON cms_case_studies(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_cms_case_studies_status ON cms_case_studies(status);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_cms_case_studies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cms_case_studies_updated_at
  BEFORE UPDATE ON cms_case_studies
  FOR EACH ROW
  EXECUTE FUNCTION update_cms_case_studies_updated_at();

-- =====================================================
-- LANDING PAGES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS cms_landing_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  sections JSONB NOT NULL DEFAULT '[]',

  -- Publishing
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,

  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  og_image_url TEXT,

  -- Analytics
  view_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT landing_page_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Indexes for landing pages
CREATE INDEX idx_cms_landing_pages_slug ON cms_landing_pages(slug);
CREATE INDEX idx_cms_landing_pages_status ON cms_landing_pages(status);
CREATE INDEX idx_cms_landing_pages_published ON cms_landing_pages(published_at DESC) WHERE status = 'published';

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_cms_landing_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cms_landing_pages_updated_at
  BEFORE UPDATE ON cms_landing_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_cms_landing_pages_updated_at();

-- =====================================================
-- LEADS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  employee_count INTEGER,

  -- Source tracking
  source TEXT, -- homepage, pricing, demo, blog, case-study
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  referrer TEXT,

  -- Lead management
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost', 'spam')),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,

  -- Additional data
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  contacted_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ
);

-- Indexes for leads
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created ON leads(created_at DESC);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_utm_campaign ON leads(utm_campaign);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();

  -- Set contacted_at when status changes to contacted
  IF NEW.status = 'contacted' AND OLD.status != 'contacted' AND NEW.contacted_at IS NULL THEN
    NEW.contacted_at = NOW();
  END IF;

  -- Set converted_at when status changes to converted
  IF NEW.status = 'converted' AND OLD.status != 'converted' AND NEW.converted_at IS NULL THEN
    NEW.converted_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_leads_updated_at();

-- =====================================================
-- DEMO REQUESTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS demo_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT,
  phone TEXT,
  employee_count INTEGER,
  preferred_date TIMESTAMPTZ,
  message TEXT,

  -- Demo management
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled', 'no-show')),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  scheduled_date TIMESTAMPTZ,
  meeting_url TEXT,
  notes TEXT,

  -- Source tracking
  source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- Additional data
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for demo requests
CREATE INDEX idx_demo_requests_email ON demo_requests(email);
CREATE INDEX idx_demo_requests_status ON demo_requests(status);
CREATE INDEX idx_demo_requests_created ON demo_requests(created_at DESC);
CREATE INDEX idx_demo_requests_assigned_to ON demo_requests(assigned_to);
CREATE INDEX idx_demo_requests_scheduled_date ON demo_requests(scheduled_date) WHERE status IN ('scheduled', 'pending');

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_demo_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_demo_requests_updated_at
  BEFORE UPDATE ON demo_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_demo_requests_updated_at();

-- =====================================================
-- WEB ANALYTICS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS web_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL, -- page_view, cta_click, form_submit, download, video_play
  page_path TEXT,

  -- User tracking
  user_id TEXT, -- Anonymous ID or authenticated user ID
  session_id TEXT,

  -- Source tracking
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,

  -- Device/browser info
  user_agent TEXT,
  device_type TEXT, -- desktop, mobile, tablet
  browser TEXT,
  os TEXT,
  country TEXT,

  -- Additional data
  metadata JSONB DEFAULT '{}',

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for web analytics
CREATE INDEX idx_web_analytics_event_type ON web_analytics(event_type);
CREATE INDEX idx_web_analytics_created ON web_analytics(created_at DESC);
CREATE INDEX idx_web_analytics_page_path ON web_analytics(page_path);
CREATE INDEX idx_web_analytics_session_id ON web_analytics(session_id);
CREATE INDEX idx_web_analytics_utm_campaign ON web_analytics(utm_campaign);

-- Partition by month for better performance (optional, for high traffic)
-- CREATE TABLE web_analytics_y2025m11 PARTITION OF web_analytics
--   FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

-- =====================================================
-- NEWSLETTER SUBSCRIBERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,

  -- Subscription status
  status TEXT DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed', 'bounced', 'complained')),
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,

  -- Preferences
  preferences JSONB DEFAULT '{"frequency": "weekly", "topics": []}',

  -- Source tracking
  source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for newsletter subscribers
CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_status ON newsletter_subscribers(status);
CREATE INDEX idx_newsletter_subscribers_subscribed ON newsletter_subscribers(subscribed_at DESC) WHERE status = 'subscribed';

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_newsletter_subscribers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();

  -- Set unsubscribed_at when status changes to unsubscribed
  IF NEW.status = 'unsubscribed' AND OLD.status != 'unsubscribed' AND NEW.unsubscribed_at IS NULL THEN
    NEW.unsubscribed_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_newsletter_subscribers_updated_at
  BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_newsletter_subscribers_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE cms_blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public read access to published blog posts"
  ON cms_blog_posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Public read access to published case studies"
  ON cms_case_studies FOR SELECT
  USING (status = 'published');

CREATE POLICY "Public read access to published landing pages"
  ON cms_landing_pages FOR SELECT
  USING (status = 'published');

-- Platform admins can manage all CMS content
CREATE POLICY "Platform admins can manage blog posts"
  ON cms_blog_posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_platform_roles upr
      JOIN platform_roles pr ON upr.role_id = pr.id
      WHERE upr.user_id = auth.uid()
        AND pr.name IN ('super_admin', 'admin', 'content_manager')
    )
  );

CREATE POLICY "Platform admins can manage case studies"
  ON cms_case_studies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_platform_roles upr
      JOIN platform_roles pr ON upr.role_id = pr.id
      WHERE upr.user_id = auth.uid()
        AND pr.name IN ('super_admin', 'admin', 'content_manager')
    )
  );

CREATE POLICY "Platform admins can manage landing pages"
  ON cms_landing_pages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_platform_roles upr
      JOIN platform_roles pr ON upr.role_id = pr.id
      WHERE upr.user_id = auth.uid()
        AND pr.name IN ('super_admin', 'admin', 'content_manager')
    )
  );

-- Leads policies
CREATE POLICY "Anyone can create leads"
  ON leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Platform admins can manage leads"
  ON leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_platform_roles upr
      JOIN platform_roles pr ON upr.role_id = pr.id
      WHERE upr.user_id = auth.uid()
        AND pr.name IN ('super_admin', 'admin', 'sales')
    )
  );

CREATE POLICY "Platform admins can update leads"
  ON leads FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_platform_roles upr
      JOIN platform_roles pr ON upr.role_id = pr.id
      WHERE upr.user_id = auth.uid()
        AND pr.name IN ('super_admin', 'admin', 'sales')
    )
  );

-- Demo requests policies
CREATE POLICY "Anyone can create demo requests"
  ON demo_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Platform admins can manage demo requests"
  ON demo_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_platform_roles upr
      JOIN platform_roles pr ON upr.role_id = pr.id
      WHERE upr.user_id = auth.uid()
        AND pr.name IN ('super_admin', 'admin', 'sales')
    )
  );

CREATE POLICY "Platform admins can update demo requests"
  ON demo_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_platform_roles upr
      JOIN platform_roles pr ON upr.role_id = pr.id
      WHERE upr.user_id = auth.uid()
        AND pr.name IN ('super_admin', 'admin', 'sales')
    )
  );

-- Web analytics policies
CREATE POLICY "Anyone can create analytics events"
  ON web_analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Platform admins can view analytics"
  ON web_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_platform_roles upr
      JOIN platform_roles pr ON upr.role_id = pr.id
      WHERE upr.user_id = auth.uid()
        AND pr.name IN ('super_admin', 'admin')
    )
  );

-- Newsletter policies
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own subscription"
  ON newsletter_subscribers FOR UPDATE
  USING (email = (SELECT email FROM users WHERE id = auth.uid()));

CREATE POLICY "Platform admins can manage newsletter"
  ON newsletter_subscribers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_platform_roles upr
      JOIN platform_roles pr ON upr.role_id = pr.id
      WHERE upr.user_id = auth.uid()
        AND pr.name IN ('super_admin', 'admin', 'content_manager')
    )
  );

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE cms_blog_posts IS 'Blog posts for Talixa marketing website';
COMMENT ON TABLE cms_case_studies IS 'Customer success stories and case studies';
COMMENT ON TABLE cms_landing_pages IS 'Dynamic landing pages with custom sections';
COMMENT ON TABLE leads IS 'Lead capture from website forms';
COMMENT ON TABLE demo_requests IS 'Demo scheduling requests';
COMMENT ON TABLE web_analytics IS 'Website analytics events tracking';
COMMENT ON TABLE newsletter_subscribers IS 'Newsletter email subscribers';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'CMS tables created successfully!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Tables:';
  RAISE NOTICE '  - cms_blog_posts';
  RAISE NOTICE '  - cms_case_studies';
  RAISE NOTICE '  - cms_landing_pages';
  RAISE NOTICE '  - leads';
  RAISE NOTICE '  - demo_requests';
  RAISE NOTICE '  - web_analytics';
  RAISE NOTICE '  - newsletter_subscribers';
  RAISE NOTICE '==============================================';
END $$;
