-- Development seed data for Talixa HRIS
-- WARNING: This file contains test data and should NOT be run in production

-- Create a test employer
INSERT INTO employers (
    id,
    company_name,
    industry,
    company_size,
    address,
    city,
    phone,
    email,
    subscription_tier,
    modules_enabled
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'PT Maju Jaya',
    'F&B',
    '51-200',
    'Jl. Sudirman No. 123',
    'Jakarta',
    '+62 21 1234567',
    'hr@majujaya.com',
    'growth',
    '["employees", "attendance", "leave", "payroll", "performance", "documents", "compliance"]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Create test admin user profile (requires auth.users to exist first)
-- In development, create user via Supabase Dashboard first, then link here
-- INSERT INTO profiles (id, employer_id, role, full_name, email)
-- VALUES (
--     'your-auth-user-id',
--     '00000000-0000-0000-0000-000000000001',
--     'admin',
--     'Admin User',
--     'admin@majujaya.com'
-- );

-- Create test employees
INSERT INTO employees (
    id,
    employer_id,
    employee_number,
    full_name,
    email,
    phone,
    date_of_birth,
    gender,
    marital_status,
    address,
    city,
    join_date,
    employment_type,
    position,
    department,
    division,
    salary_base,
    bpjs_kesehatan_number,
    npwp,
    ptkp_status,
    bank_name,
    bank_account_number,
    status
) VALUES
(
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'EMP-2024-001',
    'Budi Santoso',
    'budi.santoso@majujaya.com',
    '+62 812 3456 7890',
    '1990-05-15',
    'male',
    'married',
    'Jl. Kebon Jeruk No. 45',
    'Jakarta',
    '2023-01-15',
    'PKWTT',
    'Senior Software Engineer',
    'Engineering',
    'Product Development',
    15000000,
    '0001234567890',
    '123456789012345',
    'K/2',
    'BCA',
    '1234567890',
    'active'
),
(
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'EMP-2024-002',
    'Siti Rahayu',
    'siti.rahayu@majujaya.com',
    '+62 813 9876 5432',
    '1995-08-20',
    'female',
    'single',
    'Jl. Cipete Raya No. 12',
    'Jakarta',
    '2023-06-01',
    'PKWTT',
    'HR Manager',
    'Human Resources',
    'People Operations',
    12000000,
    '0009876543210',
    '987654321098765',
    'TK/0',
    'Mandiri',
    '9876543210',
    'active'
),
(
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'EMP-2024-003',
    'Ahmad Hidayat',
    'ahmad.hidayat@majujaya.com',
    '+62 821 5555 6666',
    '1992-03-10',
    'male',
    'married',
    'Jl. Tebet Barat No. 77',
    'Jakarta',
    '2024-01-10',
    'PKWT',
    'Marketing Specialist',
    'Marketing',
    'Digital Marketing',
    8000000,
    '0005555666677',
    '555566667777888',
    'K/1',
    'BRI',
    '5555666677',
    'probation'
);

-- Set employee 2 (Siti) as manager for employee 3 (Ahmad)
UPDATE employees
SET manager_id = '10000000-0000-0000-0000-000000000002'
WHERE id = '10000000-0000-0000-0000-000000000003';

-- Create leave balances for employees
INSERT INTO leave_balances (
    employee_id,
    employer_id,
    year,
    annual_quota,
    annual_used,
    sick_used,
    unpaid_used
) VALUES
(
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    2024,
    12,
    5,
    2,
    0
),
(
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    2024,
    12,
    3,
    1,
    0
),
(
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    2024,
    12,
    0,
    0,
    0
);

-- Create default leave types
INSERT INTO leave_types (
    employer_id,
    name,
    code,
    description,
    is_paid,
    requires_approval,
    is_active
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'Annual Leave',
    'annual',
    'Paid annual leave',
    true,
    true,
    true
),
(
    '00000000-0000-0000-0000-000000000001',
    'Sick Leave',
    'sick',
    'Paid sick leave with doctor note',
    true,
    true,
    true
),
(
    '00000000-0000-0000-0000-000000000001',
    'Unpaid Leave',
    'unpaid',
    'Unpaid leave',
    false,
    true,
    true
);

-- Create sample leave requests
INSERT INTO leave_requests (
    employee_id,
    employer_id,
    leave_type,
    start_date,
    end_date,
    total_days,
    reason,
    status,
    approver_id,
    auto_approved,
    ai_confidence
) VALUES
(
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'annual',
    '2024-12-20',
    '2024-12-22',
    3,
    'Family vacation',
    'approved',
    '10000000-0000-0000-0000-000000000002',
    true,
    0.92
),
(
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'annual',
    '2024-11-25',
    '2024-11-26',
    2,
    'Personal matters',
    'pending',
    '10000000-0000-0000-0000-000000000002',
    false,
    NULL
);

-- Create sample attendance shifts
INSERT INTO attendance_shifts (
    employer_id,
    shift_name,
    start_time,
    end_time,
    break_duration_minutes,
    is_active
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'Morning Shift',
    '08:00',
    '17:00',
    60,
    true
),
(
    '00000000-0000-0000-0000-000000000001',
    'Evening Shift',
    '14:00',
    '22:00',
    60,
    true
);

-- Create sample attendance records
INSERT INTO attendance_records (
    employee_id,
    employer_id,
    date,
    clock_in,
    clock_out,
    location_lat,
    location_lng,
    work_hours_decimal
) VALUES
(
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    CURRENT_DATE - INTERVAL '1 day',
    (CURRENT_DATE - INTERVAL '1 day') + TIME '08:05:00',
    (CURRENT_DATE - INTERVAL '1 day') + TIME '17:10:00',
    -6.2088,
    106.8456,
    8.08
),
(
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    CURRENT_DATE - INTERVAL '1 day',
    (CURRENT_DATE - INTERVAL '1 day') + TIME '08:00:00',
    (CURRENT_DATE - INTERVAL '1 day') + TIME '17:00:00',
    -6.2088,
    106.8456,
    8.00
);

-- Create sample performance goals
INSERT INTO performance_goals (
    employee_id,
    employer_id,
    title,
    description,
    goal_type,
    category,
    target_value,
    current_value,
    unit,
    start_date,
    due_date,
    status,
    weight
) VALUES
(
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Complete 3 Major Features',
    'Deliver 3 major product features this quarter',
    'kpi',
    'Productivity',
    3,
    2,
    'count',
    '2024-10-01',
    '2024-12-31',
    'active',
    1.0
),
(
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Reduce Turnover Rate',
    'Reduce employee turnover to below 10%',
    'kpi',
    'Retention',
    10,
    12,
    '%',
    '2024-01-01',
    '2024-12-31',
    'active',
    1.0
);

-- Create workflow template for employee onboarding
INSERT INTO workflow_templates (
    employer_id,
    template_name,
    workflow_type,
    description,
    steps,
    is_active,
    is_system_template
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'Employee Onboarding',
    'onboarding',
    'Standard onboarding workflow for new employees',
    '[
        {
            "step": 1,
            "name": "Upload Documents",
            "type": "document_upload",
            "required_docs": ["ktp", "npwp", "bpjs_kesehatan"],
            "ai_extraction": true,
            "timeout_days": 3
        },
        {
            "step": 2,
            "name": "Complete Employee Profile",
            "type": "form_submission",
            "timeout_days": 2
        },
        {
            "step": 3,
            "name": "Manager Approval",
            "type": "approval",
            "approver_role": "manager",
            "auto_approve_if_confidence": 0.85
        },
        {
            "step": 4,
            "name": "Generate Employment Contract",
            "type": "document_generation",
            "template_type": "employment_contract_pkwtt"
        }
    ]'::jsonb,
    true,
    false
);

-- Create sample compliance alerts
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
    resolved
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'contract_expiry',
    'high',
    'PKWT Contract Expiring Soon',
    'Ahmad Hidayat''s PKWT contract expires in 30 days',
    'Review and renew or convert to PKWTT',
    'employee',
    '10000000-0000-0000-0000-000000000003',
    CURRENT_DATE + INTERVAL '30 days',
    false
);

COMMENT ON TABLE employers IS 'Sample employer data for development';
