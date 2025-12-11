-- Fix WorkoutExercises Reps column - Convert from string to int
-- Date: 2025-12-12

USE fitlife_planner;

-- Step 1: Check current data
SELECT
    Id,
    Reps,
    CAST(Reps AS SIGNED) as RepsInt,
    CASE
        WHEN Reps REGEXP '^[0-9]+$' THEN 'Valid'
        ELSE 'Invalid'
    END as Status
FROM WorkoutExercises
LIMIT 10;

-- Step 2: Clean invalid data (set to 0 if not numeric)
UPDATE WorkoutExercises
SET Reps = '0'
WHERE Reps IS NULL OR Reps = '' OR NOT (Reps REGEXP '^[0-9]+$');

-- Step 3: Add temporary column
ALTER TABLE WorkoutExercises
ADD COLUMN RepsInt INT NOT NULL DEFAULT 0 AFTER Reps;

-- Step 4: Copy data to new column
UPDATE WorkoutExercises
SET RepsInt = CAST(Reps AS SIGNED);

-- Step 5: Drop old column
ALTER TABLE WorkoutExercises
DROP COLUMN Reps;

-- Step 6: Rename new column to Reps
ALTER TABLE WorkoutExercises
CHANGE COLUMN RepsInt Reps INT NOT NULL DEFAULT 0;

-- Verify
SELECT Id, Reps, Sets, RestSeconds
FROM WorkoutExercises
LIMIT 5;

-- Show final schema
DESCRIBE WorkoutExercises;
