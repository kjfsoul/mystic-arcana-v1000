-- This migration creates the event_logs table for robust logging.

CREATE TABLE public.event_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Link to user, allow NULL for unauthenticated actions
    event_type VARCHAR(50) NOT NULL, -- e.g., 'tarot_draw', 'api_request', 'error', 'user_action'
    event_details JSONB, -- Detailed payload of the event
    ip_address INET, -- IP address of the user/request
    user_agent TEXT, -- User agent string
    session_id UUID, -- Optional: Link to a user session
    status VARCHAR(20), -- e.g., 'success', 'failure', 'info', 'warning'
    error_message TEXT -- For logging errors
);

ALTER TABLE public.event_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own logs (optional, depending on privacy needs)
CREATE POLICY "Users can view their own event logs" ON public.event_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Allow service role to insert/update/delete all logs
CREATE POLICY "Service role can manage all event logs" ON public.event_logs
FOR ALL
TO service_role
USING (TRUE);

-- Create an index for faster querying by user and event type
CREATE INDEX ON public.event_logs (user_id, event_type, timestamp DESC);
