
-- Add recurring payment fields to money_boxes
ALTER TABLE money_boxes ADD COLUMN IF NOT EXISTS recurring_amount DECIMAL DEFAULT 0;
ALTER TABLE money_boxes ADD COLUMN IF NOT EXISTS contribution_frequency TEXT; -- 'daily', 'weekly', 'monthly'
ALTER TABLE money_boxes ADD COLUMN IF NOT EXISTS total_duration INTEGER;
