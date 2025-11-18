-- Performance reviews (Module 5: Performance Management)
CREATE TABLE performance_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,

    -- Review Period
    review_period TEXT NOT NULL, -- "2025-Q1", "2025-Annual", "Probation-2025-01"
    review_type TEXT NOT NULL CHECK (review_type IN ('probation', 'quarterly', 'annual', '360')),
    period_start DATE,
    period_end DATE,

    -- Goals and Achievements
    goals_set JSONB DEFAULT '[]'::jsonb,
    goals_achieved JSONB DEFAULT '[]'::jsonb,
    goal_completion_rate NUMERIC(3, 2), -- 0.85 = 85%

    -- Competencies (scored 1-5)
    competencies JSONB DEFAULT '{}'::jsonb,
    /* Example:
    {
        "technical_skills": 4,
        "communication": 5,
        "leadership": 3,
        "problem_solving": 4,
        "teamwork": 5
    }
    */

    -- Ratings
    rating_overall NUMERIC(3, 2) NOT NULL CHECK (rating_overall >= 1 AND rating_overall <= 5),
    rating_breakdown JSONB,

    -- Comments and Feedback
    reviewer_comments TEXT,
    employee_comments TEXT,
    strengths TEXT,
    areas_for_improvement TEXT,
    development_plan TEXT,

    -- 360 Feedback (if applicable)
    peer_reviews JSONB DEFAULT '[]'::jsonb,
    subordinate_reviews JSONB DEFAULT '[]'::jsonb,

    -- AI Sentiment Analysis
    sentiment_score NUMERIC(3, 2), -- -1 to 1
    sentiment_analysis JSONB,
    bias_detected BOOLEAN DEFAULT false,
    bias_details TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'acknowledged', 'completed')),

    -- Acknowledgement
    acknowledged_by_employee BOOLEAN DEFAULT false,
    acknowledged_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT valid_period_dates CHECK (period_end IS NULL OR period_end >= period_start),
    CONSTRAINT valid_goal_completion CHECK (goal_completion_rate IS NULL OR (goal_completion_rate >= 0 AND goal_completion_rate <= 1)),
    CONSTRAINT valid_sentiment CHECK (sentiment_score IS NULL OR (sentiment_score >= -1 AND sentiment_score <= 1))
);

CREATE TRIGGER update_performance_reviews_updated_at
    BEFORE UPDATE ON performance_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Performance goals (OKRs/KPIs)
CREATE TABLE performance_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,

    -- Goal Details
    title TEXT NOT NULL,
    description TEXT,
    goal_type TEXT CHECK (goal_type IN ('okr', 'kpi', 'individual', 'team')),
    category TEXT, -- "Sales", "Quality", "Efficiency", etc.

    -- Target and Progress
    target_value NUMERIC(15, 2),
    current_value NUMERIC(15, 2) DEFAULT 0,
    unit TEXT, -- "%", "IDR", "count", etc.
    progress_percentage NUMERIC(5, 2) DEFAULT 0,

    -- Timeline
    start_date DATE NOT NULL,
    due_date DATE NOT NULL,
    completed_date DATE,

    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'overdue')),

    -- Parent Goal (for cascading OKRs)
    parent_goal_id UUID REFERENCES performance_goals(id) ON DELETE SET NULL,

    -- Metadata
    weight NUMERIC(3, 2) DEFAULT 1.0, -- Importance weight
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT valid_goal_dates CHECK (due_date >= start_date),
    CONSTRAINT valid_progress CHECK (progress_percentage >= 0 AND progress_percentage <= 100)
);

CREATE TRIGGER update_performance_goals_updated_at
    BEFORE UPDATE ON performance_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_performance_reviews_employee ON performance_reviews(employee_id);
CREATE INDEX idx_performance_reviews_reviewer ON performance_reviews(reviewer_id);
CREATE INDEX idx_performance_reviews_employer ON performance_reviews(employer_id);
CREATE INDEX idx_performance_reviews_period ON performance_reviews(review_period);
CREATE INDEX idx_performance_reviews_status ON performance_reviews(status);
CREATE INDEX idx_performance_goals_employee ON performance_goals(employee_id);
CREATE INDEX idx_performance_goals_status ON performance_goals(status);
CREATE INDEX idx_performance_goals_due_date ON performance_goals(due_date);

-- Function to calculate goal progress
CREATE OR REPLACE FUNCTION calculate_goal_progress(
    p_current_value NUMERIC,
    p_target_value NUMERIC
)
RETURNS NUMERIC AS $$
BEGIN
    IF p_target_value = 0 THEN
        RETURN 0;
    END IF;

    RETURN ROUND(LEAST((p_current_value / p_target_value) * 100, 100), 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-calculate goal progress
CREATE OR REPLACE FUNCTION auto_calculate_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.target_value IS NOT NULL AND NEW.target_value > 0 THEN
        NEW.progress_percentage := calculate_goal_progress(
            COALESCE(NEW.current_value, 0),
            NEW.target_value
        );

        -- Auto-complete if 100%
        IF NEW.progress_percentage >= 100 AND NEW.status = 'active' THEN
            NEW.status := 'completed';
            NEW.completed_date := CURRENT_DATE;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_goal_progress
    BEFORE INSERT OR UPDATE ON performance_goals
    FOR EACH ROW
    EXECUTE FUNCTION auto_calculate_goal_progress();

COMMENT ON TABLE performance_reviews IS 'Employee performance reviews with AI sentiment analysis';
COMMENT ON TABLE performance_goals IS 'Individual and team goals (OKRs/KPIs)';
