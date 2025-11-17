-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Employers table
CREATE TABLE employers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    industry TEXT,
    company_size TEXT CHECK (company_size IN ('1-50', '51-200', '201-500', '500+')),
    address TEXT,
    city TEXT,
    phone TEXT,
    email TEXT UNIQUE NOT NULL,
    website TEXT,
    logo_url TEXT,
    subscription_tier TEXT DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'growth', 'enterprise')),
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'suspended', 'cancelled')),
    modules_enabled JSONB DEFAULT '["employees"]'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_employers_updated_at
    BEFORE UPDATE ON employers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Profiles table (links to auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
    employee_id UUID, -- Will be linked after employees table is created
    role TEXT NOT NULL CHECK (role IN ('admin', 'hr_manager', 'manager', 'employee')),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    photo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_employers_email ON employers(email);
CREATE INDEX idx_employers_subscription ON employers(subscription_tier, subscription_status);
CREATE INDEX idx_profiles_employer ON profiles(employer_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Comments
COMMENT ON TABLE employers IS 'Company/organization accounts';
COMMENT ON TABLE profiles IS 'User profiles linked to auth.users';
