-- Gamification: Badges, Achievements, Points, and Recognition

-- Badges Definition Table
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  name_id VARCHAR(100) NOT NULL, -- Indonesian name
  description TEXT,
  description_id TEXT, -- Indonesian description
  category VARCHAR(50) NOT NULL, -- 'attendance', 'performance', 'learning', 'recognition'
  icon VARCHAR(50), -- Icon name or emoji
  color VARCHAR(20),
  points_value INT DEFAULT 0,
  rarity VARCHAR(20) DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  criteria JSONB, -- Conditions to earn the badge
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Badges (Earned Badges)
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  progress INT DEFAULT 100, -- Percentage progress (100 = earned)
  metadata JSONB, -- Additional context (e.g., streak count, score)
  UNIQUE(user_id, badge_id)
);

-- Gamification Points
CREATE TABLE IF NOT EXISTS public.user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INT DEFAULT 0,
  lifetime_points INT DEFAULT 0,
  level INT DEFAULT 1,
  rank VARCHAR(50),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Points Transaction Log
CREATE TABLE IF NOT EXISTS public.points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INT NOT NULL,
  action_type VARCHAR(100) NOT NULL, -- 'attendance_perfect', 'early_arrival', 'goal_completed', etc.
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recognition Wall
CREATE TABLE IF NOT EXISTS public.recognitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recognition_type VARCHAR(50) NOT NULL, -- 'thank_you', 'great_work', 'team_player', 'helpful', 'innovative'
  message TEXT,
  is_public BOOLEAN DEFAULT true,
  points_awarded INT DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leaderboard Snapshots (for performance)
CREATE TABLE IF NOT EXISTS public.leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_type VARCHAR(20) NOT NULL, -- 'weekly', 'monthly', 'quarterly', 'yearly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'attendance', 'performance', 'learning', 'recognition', 'overall'
  rankings JSONB NOT NULL, -- Array of {user_id, score, rank}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(period_type, period_start, category)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON public.user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON public.user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON public.points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recognitions_to_user ON public.recognitions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_recognitions_from_user ON public.recognitions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_period ON public.leaderboard_snapshots(period_type, period_start);

-- RLS Policies
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recognitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

-- Badges are public
CREATE POLICY "Badges are viewable by everyone"
  ON public.badges FOR SELECT
  USING (is_active = true);

-- Users can view their own badges
CREATE POLICY "Users can view their own badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view all earned badges
CREATE POLICY "All users can view earned badges"
  ON public.user_badges FOR SELECT
  USING (true);

-- Users can view their own points
CREATE POLICY "Users can view their own points"
  ON public.user_points FOR SELECT
  USING (auth.uid() = user_id);

-- All users can view leaderboard
CREATE POLICY "Leaderboard is viewable by everyone"
  ON public.user_points FOR SELECT
  USING (true);

-- Users can view their own transactions
CREATE POLICY "Users can view their own transactions"
  ON public.points_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view public recognitions
CREATE POLICY "Users can view public recognitions"
  ON public.recognitions FOR SELECT
  USING (is_public = true OR auth.uid() = to_user_id OR auth.uid() = from_user_id);

-- Users can create recognitions
CREATE POLICY "Users can create recognitions"
  ON public.recognitions FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- Leaderboard snapshots are public
CREATE POLICY "Leaderboard snapshots are viewable by everyone"
  ON public.leaderboard_snapshots FOR SELECT
  USING (true);

-- Insert Default Badges
INSERT INTO public.badges (name, name_id, description, description_id, category, icon, color, points_value, rarity, criteria) VALUES
  ('Perfect Attendance', 'Kehadiran Sempurna', 'No absences for a full month', 'Tidak ada ketidakhadiran selama sebulan penuh', 'attendance', '🏆', '#10b981', 100, 'rare', '{"type": "attendance", "target": 30, "period": "monthly"}'),
  ('Early Bird', 'Burung Awal', 'Arrive early for 10 consecutive days', 'Datang lebih awal selama 10 hari berturut-turut', 'attendance', '🐦', '#3b82f6', 50, 'common', '{"type": "early_arrival", "target": 10, "consecutive": true}'),
  ('Team Player', 'Pemain Tim', 'Receive 5 peer recognitions in a month', 'Menerima 5 pengakuan rekan dalam sebulan', 'recognition', '🤝', '#8b5cf6', 75, 'rare', '{"type": "recognition_count", "target": 5, "period": "monthly"}'),
  ('Learning Champion', 'Juara Pembelajaran', 'Complete 5 training courses', 'Menyelesaikan 5 kursus pelatihan', 'learning', '📚', '#f59e0b', 150, 'epic', '{"type": "courses_completed", "target": 5}'),
  ('Goal Crusher', 'Penghancur Target', 'Achieve 100% OKR completion', 'Mencapai 100% penyelesaian OKR', 'performance', '🎯', '#ef4444', 200, 'epic', '{"type": "okr_completion", "target": 100}'),
  ('Overtime Warrior', 'Pejuang Lembur', 'Work overtime for 20+ hours in a month', 'Lembur selama 20+ jam dalam sebulan', 'attendance', '⚔️', '#6366f1', 80, 'rare', '{"type": "overtime_hours", "target": 20, "period": "monthly"}'),
  ('Helpful Hand', 'Tangan Penolong', 'Help teammates 10 times', 'Membantu rekan tim sebanyak 10 kali', 'recognition', '🤚', '#14b8a6', 60, 'common', '{"type": "help_count", "target": 10}'),
  ('Innovation Star', 'Bintang Inovasi', 'Submit 3 innovative ideas', 'Mengajukan 3 ide inovatif', 'performance', '⭐', '#ec4899', 120, 'epic', '{"type": "ideas_submitted", "target": 3}'),
  ('Consistent Performer', 'Pemain Konsisten', 'Maintain 4+ rating for 3 quarters', 'Mempertahankan rating 4+ selama 3 kuartal', 'performance', '📈', '#10b981', 250, 'legendary', '{"type": "consistent_rating", "target": 4, "quarters": 3}'),
  ('Attendance Streak', 'Rekor Kehadiran', 'Perfect attendance for 90 days', 'Kehadiran sempurna selama 90 hari', 'attendance', '🔥', '#f59e0b', 300, 'legendary', '{"type": "attendance_streak", "target": 90}');

COMMENT ON TABLE public.badges IS 'Defines all available badges and achievements in the system';
COMMENT ON TABLE public.user_badges IS 'Tracks which badges each user has earned';
COMMENT ON TABLE public.user_points IS 'Stores user gamification points and levels';
COMMENT ON TABLE public.points_transactions IS 'Audit log of all points earned or spent';
COMMENT ON TABLE public.recognitions IS 'Peer-to-peer recognition and shout-outs';
COMMENT ON TABLE public.leaderboard_snapshots IS 'Pre-computed leaderboard rankings for performance';
