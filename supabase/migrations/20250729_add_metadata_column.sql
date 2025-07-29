-- Add metadata column to tarot_readings table
-- This supports the save reading API which expects a metadata field

ALTER TABLE public.tarot_readings 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add index for metadata queries
CREATE INDEX IF NOT EXISTS idx_tarot_readings_metadata ON public.tarot_readings USING GIN (metadata);

-- Add comment for documentation
COMMENT ON COLUMN public.tarot_readings.metadata IS 'Additional metadata for readings including notes, privacy settings, and versioning';