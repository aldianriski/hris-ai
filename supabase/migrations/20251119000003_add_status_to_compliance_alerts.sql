-- Add status column to compliance_alerts table
-- This aligns with the ComplianceRepository which expects a status field
-- Status values: 'active', 'resolved', 'dismissed'

ALTER TABLE compliance_alerts
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
CHECK (status IN ('active', 'resolved', 'dismissed', 'open'));

-- Migrate existing data: set status based on resolved boolean
UPDATE compliance_alerts
SET status = CASE
    WHEN resolved = true THEN 'resolved'
    ELSE 'active'
END;

-- Create trigger to keep resolved boolean in sync with status
CREATE OR REPLACE FUNCTION sync_compliance_alert_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Sync resolved boolean when status changes
    IF NEW.status IN ('resolved', 'dismissed') THEN
        NEW.resolved := true;
        IF NEW.resolved_at IS NULL THEN
            NEW.resolved_at := CURRENT_TIMESTAMP;
        END IF;
    ELSE
        NEW.resolved := false;
        NEW.resolved_at := NULL;
        NEW.resolved_by := NULL;
        NEW.resolution_notes := NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_compliance_alert_resolved
    BEFORE INSERT OR UPDATE ON compliance_alerts
    FOR EACH ROW
    EXECUTE FUNCTION sync_compliance_alert_status();

-- Add index for status queries
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_status
ON compliance_alerts(status) WHERE status != 'resolved';

-- Comments
COMMENT ON COLUMN compliance_alerts.status IS 'Alert status: active, resolved, dismissed, open';
COMMENT ON FUNCTION sync_compliance_alert_status IS 'Keep resolved boolean in sync with status field';
