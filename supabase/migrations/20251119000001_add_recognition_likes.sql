-- Add likes functionality to recognitions

-- Recognition Likes Table
CREATE TABLE IF NOT EXISTS public.recognition_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recognition_id UUID NOT NULL REFERENCES public.recognitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recognition_id, user_id) -- One like per user per recognition
);

-- Add likes_count column to recognitions for performance
ALTER TABLE public.recognitions ADD COLUMN IF NOT EXISTS likes_count INT DEFAULT 0;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_recognition_likes_recognition_id ON public.recognition_likes(recognition_id);
CREATE INDEX IF NOT EXISTS idx_recognition_likes_user_id ON public.recognition_likes(user_id);

-- RLS Policies
ALTER TABLE public.recognition_likes ENABLE ROW LEVEL SECURITY;

-- Users can view all likes on public recognitions
CREATE POLICY "Users can view likes on public recognitions"
  ON public.recognition_likes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.recognitions
      WHERE recognitions.id = recognition_likes.recognition_id
      AND (recognitions.is_public = true OR recognitions.to_user_id = auth.uid() OR recognitions.from_user_id = auth.uid())
    )
  );

-- Users can create likes
CREATE POLICY "Users can like recognitions"
  ON public.recognition_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "Users can unlike recognitions"
  ON public.recognition_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update likes_count
CREATE OR REPLACE FUNCTION update_recognition_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.recognitions
    SET likes_count = likes_count + 1
    WHERE id = NEW.recognition_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.recognitions
    SET likes_count = likes_count - 1
    WHERE id = OLD.recognition_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update likes_count
CREATE TRIGGER recognition_likes_count_trigger
AFTER INSERT OR DELETE ON public.recognition_likes
FOR EACH ROW EXECUTE FUNCTION update_recognition_likes_count();

COMMENT ON TABLE public.recognition_likes IS 'Tracks likes on recognition posts';
COMMENT ON COLUMN public.recognitions.likes_count IS 'Denormalized count of likes for performance';
