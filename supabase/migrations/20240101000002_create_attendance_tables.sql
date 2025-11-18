-- Attendance records (Module 2: Time & Attendance)
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,

    -- Date and Time
    date DATE NOT NULL,
    clock_in TIMESTAMPTZ NOT NULL,
    clock_out TIMESTAMPTZ,

    -- Location
    location_lat NUMERIC(10, 7),
    location_lng NUMERIC(10, 7),
    location_address TEXT,
    clock_in_photo_url TEXT,
    clock_out_photo_url TEXT,

    -- Work Hours
    work_hours_decimal NUMERIC(5, 2),
    break_hours NUMERIC(5, 2) DEFAULT 0,
    overtime_hours NUMERIC(5, 2) DEFAULT 0,

    -- Shift Information
    shift_name TEXT,
    expected_clock_in TIME,
    expected_clock_out TIME,

    -- Anomaly Detection
    is_anomaly BOOLEAN DEFAULT false,
    anomaly_type TEXT CHECK (anomaly_type IN ('location', 'time', 'hours', 'impossible_travel')),
    anomaly_reason TEXT,
    anomaly_confidence NUMERIC(3, 2),

    -- Approval
    approved_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    approval_notes TEXT,

    -- Metadata
    device_info JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT unique_attendance_per_employee_per_day UNIQUE (employee_id, date),
    CONSTRAINT valid_clock_out CHECK (clock_out IS NULL OR clock_out > clock_in)
);

-- Attendance shifts (schedule templates)
CREATE TABLE attendance_shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
    shift_name TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_duration_minutes INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_shift_name_per_employer UNIQUE (employer_id, shift_name)
);

CREATE TRIGGER update_attendance_shifts_updated_at
    BEFORE UPDATE ON attendance_shifts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Employee shift assignments
CREATE TABLE employee_shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    shift_id UUID NOT NULL REFERENCES attendance_shifts(id) ON DELETE CASCADE,
    effective_from DATE NOT NULL,
    effective_to DATE,
    days_of_week INTEGER[] DEFAULT '{1,2,3,4,5}', -- 1=Monday, 7=Sunday
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_effective_dates CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

-- Indexes
CREATE INDEX idx_attendance_employee ON attendance_records(employee_id);
CREATE INDEX idx_attendance_employer ON attendance_records(employer_id);
CREATE INDEX idx_attendance_date ON attendance_records(date DESC);
CREATE INDEX idx_attendance_anomaly ON attendance_records(is_anomaly) WHERE is_anomaly = true;
CREATE INDEX idx_attendance_pending_approval ON attendance_records(approved_by) WHERE approved_by IS NULL AND is_anomaly = true;
CREATE INDEX idx_shifts_employer ON attendance_shifts(employer_id);
CREATE INDEX idx_employee_shifts_employee ON employee_shifts(employee_id);

-- Function to calculate work hours
CREATE OR REPLACE FUNCTION calculate_work_hours(
    p_clock_in TIMESTAMPTZ,
    p_clock_out TIMESTAMPTZ,
    p_break_hours NUMERIC DEFAULT 0
)
RETURNS NUMERIC AS $$
BEGIN
    IF p_clock_out IS NULL THEN
        RETURN NULL;
    END IF;

    RETURN ROUND(
        EXTRACT(EPOCH FROM (p_clock_out - p_clock_in)) / 3600 - p_break_hours,
        2
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-calculate work hours
CREATE OR REPLACE FUNCTION auto_calculate_work_hours()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.clock_out IS NOT NULL THEN
        NEW.work_hours_decimal := calculate_work_hours(
            NEW.clock_in,
            NEW.clock_out,
            COALESCE(NEW.break_hours, 0)
        );

        -- Calculate overtime (if > 8 hours)
        IF NEW.work_hours_decimal > 8 THEN
            NEW.overtime_hours := NEW.work_hours_decimal - 8;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_attendance_hours
    BEFORE INSERT OR UPDATE ON attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION auto_calculate_work_hours();

COMMENT ON TABLE attendance_records IS 'Employee attendance with GPS tracking and AI anomaly detection';
COMMENT ON TABLE attendance_shifts IS 'Shift schedule templates';
COMMENT ON TABLE employee_shifts IS 'Employee shift assignments';
