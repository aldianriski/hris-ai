-- Seed data for new features (onboarding workflows, attendance anomalies)
-- WARNING: This file contains test data and should NOT be run in production

-- ============================================================================
-- Onboarding Workflows
-- ============================================================================

-- Create onboarding workflow for new employee (Ahmad Hidayat - probation status)
INSERT INTO onboarding_workflows (
    id,
    employer_id,
    employee_id,
    employee_name,
    workflow_type,
    status,
    steps,
    current_step,
    start_date,
    due_date,
    started_at,
    created_by,
    created_by_email
) VALUES
(
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000003',
    'Ahmad Hidayat',
    'onboarding',
    'in_progress',
    '[
        {
            "stepNumber": 1,
            "name": "Send Welcome Email",
            "status": "completed",
            "assignedTo": "HR Team",
            "completedBy": "siti.rahayu@majujaya.com",
            "completedAt": "2024-01-10T09:00:00Z",
            "notes": "Welcome email sent successfully"
        },
        {
            "stepNumber": 2,
            "name": "Prepare Workspace",
            "status": "completed",
            "assignedTo": "IT Team",
            "completedBy": "it@majujaya.com",
            "completedAt": "2024-01-10T14:00:00Z",
            "notes": "Desk and equipment prepared"
        },
        {
            "stepNumber": 3,
            "name": "Setup Equipment",
            "status": "in_progress",
            "assignedTo": "IT Team"
        },
        {
            "stepNumber": 4,
            "name": "Create System Accounts",
            "status": "pending",
            "assignedTo": "IT Team"
        },
        {
            "stepNumber": 5,
            "name": "Schedule Orientation",
            "status": "pending",
            "assignedTo": "HR Team"
        },
        {
            "stepNumber": 6,
            "name": "Assign Mentor",
            "status": "pending",
            "assignedTo": "Manager"
        },
        {
            "stepNumber": 7,
            "name": "First Day Welcome",
            "status": "pending",
            "assignedTo": "Manager"
        }
    ]'::jsonb,
    3,
    '2024-01-10T08:00:00Z',
    '2024-01-17T17:00:00Z',
    '2024-01-10T09:00:00Z',
    '10000000-0000-0000-0000-000000000002',
    'siti.rahayu@majujaya.com'
) ON CONFLICT (id) DO NOTHING;

-- Create completed onboarding workflow example
INSERT INTO onboarding_workflows (
    id,
    employer_id,
    employee_id,
    employee_name,
    workflow_type,
    status,
    steps,
    current_step,
    start_date,
    due_date,
    started_at,
    completed_at,
    created_by,
    created_by_email
) VALUES
(
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Budi Santoso',
    'onboarding',
    'completed',
    '[
        {
            "stepNumber": 1,
            "name": "Send Welcome Email",
            "status": "completed",
            "assignedTo": "HR Team",
            "completedBy": "hr@majujaya.com",
            "completedAt": "2023-01-15T09:00:00Z"
        },
        {
            "stepNumber": 2,
            "name": "Prepare Workspace",
            "status": "completed",
            "assignedTo": "IT Team",
            "completedBy": "it@majujaya.com",
            "completedAt": "2023-01-15T14:00:00Z"
        },
        {
            "stepNumber": 3,
            "name": "Setup Equipment",
            "status": "completed",
            "assignedTo": "IT Team",
            "completedBy": "it@majujaya.com",
            "completedAt": "2023-01-15T16:00:00Z"
        },
        {
            "stepNumber": 4,
            "name": "Create System Accounts",
            "status": "completed",
            "assignedTo": "IT Team",
            "completedBy": "it@majujaya.com",
            "completedAt": "2023-01-16T10:00:00Z"
        },
        {
            "stepNumber": 5,
            "name": "Schedule Orientation",
            "status": "completed",
            "assignedTo": "HR Team",
            "completedBy": "hr@majujaya.com",
            "completedAt": "2023-01-16T15:00:00Z"
        },
        {
            "stepNumber": 6,
            "name": "Assign Mentor",
            "status": "completed",
            "assignedTo": "Manager",
            "completedBy": "manager@majujaya.com",
            "completedAt": "2023-01-17T09:00:00Z"
        },
        {
            "stepNumber": 7,
            "name": "First Day Welcome",
            "status": "completed",
            "assignedTo": "Manager",
            "completedBy": "manager@majujaya.com",
            "completedAt": "2023-01-17T10:00:00Z"
        }
    ]'::jsonb,
    7,
    '2023-01-15T08:00:00Z',
    '2023-01-22T17:00:00Z',
    '2023-01-15T09:00:00Z',
    '2023-01-17T10:00:00Z',
    '10000000-0000-0000-0000-000000000002',
    'siti.rahayu@majujaya.com'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Attendance Anomalies
-- ============================================================================

-- Create sample attendance record with anomaly for testing
INSERT INTO attendance_records (
    id,
    employee_id,
    employer_id,
    date,
    clock_in,
    clock_out,
    location_lat,
    location_lng,
    location_address,
    work_hours_decimal,
    is_anomaly,
    anomaly_type,
    anomaly_reason,
    anomaly_confidence
) VALUES
(
    '30000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    CURRENT_DATE - INTERVAL '2 days',
    (CURRENT_DATE - INTERVAL '2 days') + TIME '08:00:00',
    (CURRENT_DATE - INTERVAL '2 days') + TIME '17:00:00',
    -7.2575,  -- Surabaya coordinates (should be Jakarta -6.2088, 106.8456)
    112.7521,
    'Surabaya, East Java',
    8.00,
    true,
    'location',
    'Clock-in location differs significantly from usual office location',
    0.89
) ON CONFLICT (id) DO NOTHING;

-- Create attendance anomalies for AI review
INSERT INTO attendance_anomalies (
    id,
    employer_id,
    employee_id,
    employee_name,
    attendance_record_id,
    date,
    type,
    severity,
    description,
    normal_value,
    anomalous_value,
    ai_confidence,
    ai_suggestion,
    location_data,
    status,
    detected_at
) VALUES
(
    '40000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Budi Santoso',
    '30000000-0000-0000-0000-000000000001',
    CURRENT_DATE - INTERVAL '2 days',
    'location_deviation',
    'high',
    'Employee clocked in from Surabaya instead of Jakarta office. Distance: 785.4 km',
    'Jakarta Office',
    'Surabaya, East Java',
    89.5,
    'This appears to be a legitimate remote work situation. Review employee''s remote work policy and approve if authorized.',
    '{
        "normal": {
            "lat": -6.2088,
            "lng": 106.8456,
            "address": "Jakarta Office - Jl. Sudirman No. 123"
        },
        "anomalous": {
            "lat": -7.2575,
            "lng": 112.7521,
            "address": "Surabaya, East Java"
        },
        "distance_km": 785.4
    }'::jsonb,
    'pending',
    CURRENT_DATE - INTERVAL '2 days' + TIME '08:05:00'
),
(
    '40000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    'Siti Rahayu',
    NULL,
    CURRENT_DATE - INTERVAL '3 days',
    'excessive_hours',
    'medium',
    'Employee worked 12.5 hours, exceeding standard 8-hour workday by 4.5 hours',
    '8 hours',
    '12.5 hours',
    92.3,
    'Verify if overtime was authorized. Consider whether this was a project deadline or emergency situation.',
    NULL,
    'approved',
    CURRENT_DATE - INTERVAL '3 days' + TIME '20:30:00'
),
(
    '40000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000003',
    'Ahmad Hidayat',
    NULL,
    CURRENT_DATE - INTERVAL '1 day',
    'late_arrival',
    'low',
    'Employee arrived 45 minutes late (08:45 instead of 08:00)',
    '08:00',
    '08:45',
    95.8,
    'Minor tardiness. No action needed unless this becomes a pattern.',
    NULL,
    'rejected',
    CURRENT_DATE - INTERVAL '1 day' + TIME '08:45:00'
);

-- Update approved anomaly with reviewer info
UPDATE attendance_anomalies
SET
    reviewed_by = '10000000-0000-0000-0000-000000000002',
    reviewed_by_email = 'siti.rahayu@majujaya.com',
    reviewed_at = CURRENT_DATE - INTERVAL '2 days' + TIME '10:00:00',
    review_notes = 'Verified overtime was for quarterly report deadline. Approved.'
WHERE id = '40000000-0000-0000-0000-000000000002';

-- Update rejected anomaly with reviewer info
UPDATE attendance_anomalies
SET
    reviewed_by = '10000000-0000-0000-0000-000000000002',
    reviewed_by_email = 'siti.rahayu@majujaya.com',
    reviewed_at = CURRENT_DATE + TIME '09:00:00',
    review_notes = 'First occurrence, no pattern established. Verbal reminder given.'
WHERE id = '40000000-0000-0000-0000-000000000003';

-- ============================================================================
-- Update Compliance Alerts with Status Field
-- ============================================================================

-- Update existing compliance alerts to have status field
UPDATE compliance_alerts
SET status = 'active'
WHERE resolved = false;

UPDATE compliance_alerts
SET status = 'resolved'
WHERE resolved = true;

-- Add more sample compliance alerts with status
INSERT INTO compliance_alerts (
    employer_id,
    alert_type,
    severity,
    title,
    message,
    action_required,
    related_entity_type,
    related_entity_id,
    due_date,
    status,
    resolved
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'bpjs_payment_overdue',
    'critical',
    'BPJS Payment Overdue',
    'Monthly BPJS payment for November 2024 is 5 days overdue',
    'Make immediate payment to avoid penalties',
    'payroll_period',
    NULL,
    CURRENT_DATE - INTERVAL '5 days',
    'active',
    false
),
(
    '00000000-0000-0000-0000-000000000001',
    'document_expiry',
    'medium',
    'Employee KTP Expiring',
    'Budi Santoso''s KTP (National ID) expires in 60 days',
    'Request updated KTP document from employee',
    'employee',
    '10000000-0000-0000-0000-000000000001',
    CURRENT_DATE + INTERVAL '60 days',
    'active',
    false
),
(
    '00000000-0000-0000-0000-000000000001',
    'attendance_anomaly',
    'high',
    'Unusual Attendance Pattern',
    '3 attendance anomalies detected for review',
    'Review and approve/reject attendance anomalies',
    NULL,
    NULL,
    CURRENT_DATE + INTERVAL '2 days',
    'active',
    false
);

COMMENT ON TABLE onboarding_workflows IS 'Sample onboarding workflows for development testing';
COMMENT ON TABLE attendance_anomalies IS 'Sample AI-detected attendance anomalies for development testing';
