-- Create a stored procedure to create the notifications table
CREATE OR REPLACE FUNCTION create_notifications_table()
RETURNS void AS $$
BEGIN
  -- Create notifications table if it doesn't exist
  CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Create index for faster queries
  CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
  
  -- Add comment to the table
  COMMENT ON TABLE notifications IS 'Stores user notifications for the gaming platform';
END;
$$ LANGUAGE plpgsql;
