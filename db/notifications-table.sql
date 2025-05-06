-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Add indexes for common queries
    CONSTRAINT notifications_user_id_idx UNIQUE (id, user_id)
);

-- Add RLS policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications" 
    ON public.notifications FOR SELECT 
    USING (auth.uid() = user_id);

-- Users can only update their own notifications (for marking as read)
CREATE POLICY "Users can update their own notifications" 
    ON public.notifications FOR UPDATE 
    USING (auth.uid() = user_id);

-- Only authenticated users can delete their notifications
CREATE POLICY "Users can delete their own notifications" 
    ON public.notifications FOR DELETE 
    USING (auth.uid() = user_id);

-- Only service role can insert notifications
CREATE POLICY "Service role can insert notifications" 
    ON public.notifications FOR INSERT 
    WITH CHECK (true);

-- Grant permissions
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
