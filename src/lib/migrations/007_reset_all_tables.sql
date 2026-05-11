-- Reset all tables (keep auth.users, but clear all data)
-- This will delete all data from all tables except auth.users

-- Delete all data from tables in correct order (respecting foreign keys)
DELETE FROM files;
DELETE FROM notification_deliveries;
DELETE FROM push_subscriptions;
DELETE FROM notifications;
DELETE FROM events;
DELETE FROM income_records;
DELETE FROM expense_records;
DELETE FROM cases;
DELETE FROM clients;
DELETE FROM lookup_values;
DELETE FROM users;

-- Reset sequences if any
-- (Not needed for UUID primary keys)
