-- Add expense_type column to track kurum vs kisisel expenses
ALTER TABLE expense_records ADD COLUMN IF NOT EXISTS expense_type VARCHAR(20) DEFAULT 'kurum';

-- Add index
CREATE INDEX IF NOT EXISTS idx_expense_records_type ON expense_records(expense_type);

-- Optional: add recorded_by for kisisel expenses
ALTER TABLE expense_records ADD COLUMN IF NOT EXISTS recorded_by UUID REFERENCES auth.users(id);