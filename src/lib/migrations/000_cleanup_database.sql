-- Drop all tables in correct order (respecting foreign keys)
-- This will completely wipe the database

DROP TABLE IF EXISTS notification_deliveries CASCADE;
DROP TABLE IF EXISTS push_subscriptions CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS hearings CASCADE;
DROP TABLE IF EXISTS case_activities CASCADE;
DROP TABLE IF EXISTS records CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS income CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS lookup_values CASCADE;
DROP TABLE IF EXISTS users CASCADE;
