-- Migration script - run once after backend update
-- Remove orphaned columns no longer mapped by Hibernate

ALTER TABLE saving_goals
    DROP COLUMN IF EXISTS current_amount;

ALTER TABLE variable_expenses
    DROP COLUMN IF EXISTS end_date;
