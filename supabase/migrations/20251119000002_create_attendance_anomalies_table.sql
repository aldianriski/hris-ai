-- Attendance Anomalies Table
-- AI-detected attendance anomalies for HR review
-- Separate from attendance_records to allow for detailed tracking and approval workflow

CREATE TABLE attendance_anomalies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,

    -- Employee Reference
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    employee_name TEXT NOT NULL,

    -- Attendance Record Reference
    attendance_record_id UUID REFERENCES attendance_records(id) ON DELETE SET NULL,
    date DATE NOT NULL,

    -- Anomaly Details
    type TEXT NOT NULL CHECK (type IN (
        'location_deviation',
        'time_deviation',
        'excessive_hours',
        'pattern_break',
        'impossible_travel',
        'duplicate_entry',
        'missing_clock_out',
        'late_arrival',
        'early_departure'
    )),
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),

    -- Description
    description TEXT NOT NULL,
    normal_value TEXT,      -- e.g., "Office Location (Jakarta)"
    anomalous_value TEXT,    -- e.g., "Remote Location (Surabaya)"

    -- AI Detection
    ai_confidence NUMERIC(5, 2) NOT NULL CHECK (ai_confidence >= 0 AND ai_confidence <= 100),
    ai_suggestion TEXT,      -- AI-suggested action or correction
    detection_details JSONB, -- Detailed detection information

    -- Location Data (if location-based anomaly)
    location_data JSONB,
    /* Example:
    {
        "normal": {
            "lat": -6.2088,
            "lng": 106.8456,
            "address": "Jakarta Office"
        },
        "anomalous": {
            "lat": -7.2575,
            "lng": 112.7521,
            "address": "Surabaya"
        },
        "distance_km": 785.4
    }
    */

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),

    -- Review
    reviewed_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    reviewed_by_email TEXT,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,

    -- Detection
    detected_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_attendance_anomalies_updated_at
    BEFORE UPDATE ON attendance_anomalies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_attendance_anomalies_employer ON attendance_anomalies(employer_id);
CREATE INDEX idx_attendance_anomalies_employee ON attendance_anomalies(employee_id);
CREATE INDEX idx_attendance_anomalies_status ON attendance_anomalies(status);
CREATE INDEX idx_attendance_anomalies_severity ON attendance_anomalies(severity);
CREATE INDEX idx_attendance_anomalies_type ON attendance_anomalies(type);
CREATE INDEX idx_attendance_anomalies_date ON attendance_anomalies(date DESC);
CREATE INDEX idx_attendance_anomalies_detected ON attendance_anomalies(detected_at DESC);
CREATE INDEX idx_attendance_anomalies_pending ON attendance_anomalies(status, severity)
    WHERE status = 'pending';

-- Function to create anomaly from attendance record
CREATE OR REPLACE FUNCTION create_attendance_anomaly(
    p_attendance_record_id UUID,
    p_anomaly_type TEXT,
    p_severity TEXT,
    p_description TEXT,
    p_ai_confidence NUMERIC,
    p_normal_value TEXT DEFAULT NULL,
    p_anomalous_value TEXT DEFAULT NULL,
    p_location_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_anomaly_id UUID;
    v_employer_id UUID;
    v_employee_id UUID;
    v_employee_name TEXT;
    v_date DATE;
BEGIN
    -- Get attendance record details
    SELECT
        ar.employer_id,
        ar.employee_id,
        e.full_name,
        ar.date
    INTO
        v_employer_id,
        v_employee_id,
        v_employee_name,
        v_date
    FROM attendance_records ar
    JOIN employees e ON e.id = ar.employee_id
    WHERE ar.id = p_attendance_record_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Attendance record not found';
    END IF;

    -- Insert anomaly
    INSERT INTO attendance_anomalies (
        employer_id,
        employee_id,
        employee_name,
        attendance_record_id,
        date,
        type,
        severity,
        description,
        ai_confidence,
        normal_value,
        anomalous_value,
        location_data
    ) VALUES (
        v_employer_id,
        v_employee_id,
        v_employee_name,
        p_attendance_record_id,
        v_date,
        p_anomaly_type,
        p_severity,
        p_description,
        p_ai_confidence,
        p_normal_value,
        p_anomalous_value,
        p_location_data
    ) RETURNING id INTO v_anomaly_id;

    RETURN v_anomaly_id;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE attendance_anomalies IS 'AI-detected attendance anomalies requiring HR review';
COMMENT ON COLUMN attendance_anomalies.ai_confidence IS 'AI confidence score (0-100)';
COMMENT ON COLUMN attendance_anomalies.location_data IS 'Detailed location information for location-based anomalies';
COMMENT ON FUNCTION create_attendance_anomaly IS 'Helper function to create anomaly from attendance record';
