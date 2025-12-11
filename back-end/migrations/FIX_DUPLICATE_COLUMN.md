# Fix Duplicate Column Migration Error

## Error

```
Duplicate column name 'IsCompleted'
```

**Cause**: Column already exists in database (added manually), but EF migration tries to add it again.

## Solution

### Option 1: Remove Last Migration (Recommended)

```bash
cd /Users/chessy/CodeSpace/fitlife-planner/back-end/fitlife-planner-back-end

# Remove the last migration
dotnet ef migrations remove

# Check database current state
mysql -u root -p fitlife_planner -e "DESCRIBE WorkoutSchedules;"

# If IsCompleted and Notes already exist, you're done!
# If not, manually add them:
mysql -u root -p fitlife_planner < /Users/chessy/CodeSpace/fitlife-planner/back-end/migrations/add_workout_schedule_completion_fields.sql
```

### Option 2: Mark Migration as Applied

If columns already exist in database, tell EF to skip this migration:

```bash
# Check which migrations are applied
dotnet ef migrations list

# Manually mark migration as applied (replace with actual migration name)
mysql -u root -p fitlife_planner

# In MySQL:
INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion)
VALUES ('20251212_AddWorkoutScheduleCompletionFields', '9.0.0');
```

### Option 3: Sync Database with Model

Check what exists and what's missing:

```sql
-- Connect to database
mysql -u root -p fitlife_planner

-- Check WorkoutSchedules columns
DESCRIBE WorkoutSchedules;

-- Should have:
-- IsCompleted | tinyint(1) | NO
-- Notes       | text       | YES
```

**If columns exist:**

```bash
# Just remove the migration
dotnet ef migrations remove
```

**If columns don't exist:**

```bash
# Add them manually
mysql -u root -p fitlife_planner

ALTER TABLE WorkoutSchedules ADD COLUMN IsCompleted TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE WorkoutSchedules ADD COLUMN Notes TEXT NULL;

# Then remove migration
dotnet ef migrations remove
```

## Quick Fix Commands

```bash
# 1. Check current database state
mysql -u root -p fitlife_planner -e "DESCRIBE WorkoutSchedules;" | grep -E "IsCompleted|Notes"

# 2. If columns exist, remove migration
cd /Users/chessy/CodeSpace/fitlife-planner/back-end/fitlife-planner-back-end
dotnet ef migrations remove

# 3. Verify migrations list
dotnet ef migrations list

# 4. Try running app
dotnet run
```

## Verify Database State

```sql
USE fitlife_planner;

-- Check all columns
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'WorkoutSchedules'
ORDER BY ORDINAL_POSITION;

-- Should include:
-- IsCompleted | tinyint  | NO  | 0
-- Notes       | text     | YES | NULL
```

## After Fix

1. ✅ Remove problematic migration
2. ✅ Verify database has correct schema
3. ✅ Restart backend
4. ✅ Test API endpoints

---

**Quick Command:**

```bash
dotnet ef migrations remove && dotnet run
```
