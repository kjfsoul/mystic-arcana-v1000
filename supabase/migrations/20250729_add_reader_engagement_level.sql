-- Add reader_engagement_level column to profiles table for Progressive Reveal System
-- This column tracks user engagement to unlock different visual representations of Sophia

-- Add the column with default value of 1 (starting level)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS reader_engagement_level INTEGER DEFAULT 1;

-- Add check constraint to ensure valid engagement levels (1-5)
ALTER TABLE public.profiles 
ADD CONSTRAINT check_reader_engagement_level 
CHECK (reader_engagement_level >= 1 AND reader_engagement_level <= 5);

-- Add comment to document the column purpose
COMMENT ON COLUMN public.profiles.reader_engagement_level IS 
'Progressive reveal level for virtual readers (1=cloaked, 5=fully revealed). Increases based on user engagement metrics.';

-- Create index for efficient querying by engagement level
CREATE INDEX IF NOT EXISTS idx_profiles_reader_engagement_level 
ON public.profiles(reader_engagement_level);

-- Update RLS policies to include the new column
-- Users can read their own engagement level
CREATE POLICY IF NOT EXISTS "Users can view own reader engagement level" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Users can update their own engagement level (for progressive reveals)
CREATE POLICY IF NOT EXISTS "Users can update own reader engagement level" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Optional: Create a function to safely increment engagement level
CREATE OR REPLACE FUNCTION increment_reader_engagement_level(user_id UUID, new_level INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only increment if new level is higher than current level
  UPDATE public.profiles 
  SET reader_engagement_level = new_level,
      updated_at = NOW()
  WHERE id = user_id 
    AND reader_engagement_level < new_level
    AND new_level >= 1 
    AND new_level <= 5;
  
  -- Return true if row was updated
  RETURN FOUND;
END;
$$;

-- Add comment to the function
COMMENT ON FUNCTION increment_reader_engagement_level(UUID, INTEGER) IS 
'Safely increments user engagement level for progressive reveal system. Only allows increases, not decreases.';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_reader_engagement_level(UUID, INTEGER) TO authenticated;