-- Function to update the updated_at timestamp in chat_rooms when a new message is added
CREATE OR REPLACE FUNCTION update_chat_rooms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the updated_at timestamp in the chat_rooms table
    UPDATE chat_rooms
    SET updated_at = NOW()
    WHERE id = NEW.chat_room_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to execute the function after a new message is inserted
CREATE TRIGGER update_chat_room_timestamp
AFTER INSERT ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_chat_rooms_updated_at();
