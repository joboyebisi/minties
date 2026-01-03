-- Notifications System
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Wallet address
    type TEXT NOT NULL, -- 'deposit', 'yield', 'gift_sent', 'gift_claimed', 'circle_invite', 'system'
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid()::text OR true); -- For demo/MVP using 'true' or address match logic if generic

-- Ideally, we match 'user_id' to the wallet address passed in RLS or just Public for MVP demo
-- For this demo, we will allow public read/insert but in production restrict by auth.uid()
DROP POLICY IF EXISTS "Public read notifications" ON notifications;
DROP POLICY IF EXISTS "Public insert notifications" ON notifications;
DROP POLICY IF EXISTS "Public update notifications" ON notifications;

CREATE POLICY "Public read notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Public insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update notifications" ON notifications FOR UPDATE USING (true);
