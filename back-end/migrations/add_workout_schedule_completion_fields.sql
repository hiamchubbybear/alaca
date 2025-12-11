-- Migration: Add IsCompleted and Notes to WorkoutSchedules table
-- Date: 2025-12-12

USE fitlife_planner;

-- Add IsCompleted column (default false)
ALTER TABLE `WorkoutSchedules`
ADD COLUMN `IsCompleted` TINYINT(1) NOT NULL DEFAULT 0 AFTER `Status`;

-- Add Notes column (nullable)
ALTER TABLE `WorkoutSchedules`
ADD COLUMN `Notes` TEXT NULL AFTER `CompletedAt`;

-- Update existing records to set IsCompleted based on Status
UPDATE `WorkoutSchedules`
SET `IsCompleted` = 1
WHERE `Status` = 'completed';

-- Verify changes
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'WorkoutSchedules'
  AND COLUMN_NAME IN ('IsCompleted', 'Notes')
ORDER BY ORDINAL_POSITION;
