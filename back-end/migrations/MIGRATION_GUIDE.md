# Database Migration Guide - Workout Schedule Completion Fields

## Issue

```
Error: Unknown column 'w.IsCompleted' in 'field list'
```

The database is missing the new columns that were added to the `WorkoutSchedule` model.

## Solution

### Option 1: Using Entity Framework Migrations (Recommended)

```bash
cd /Users/chessy/CodeSpace/fitlife-planner/back-end/fitlife-planner-back-end

# Create migration
dotnet ef migrations add AddWorkoutScheduleCompletionFields

# Review the generated migration file
# It should be in: Migrations/[timestamp]_AddWorkoutScheduleCompletionFields.cs

# Apply migration to database
dotnet ef database update

# Verify
dotnet ef migrations list
```

### Option 2: Manual SQL Script

If EF migrations don't work, run the SQL script manually:

```bash
# Connect to MySQL
mysql -u your_username -p fitlife_planner

# Or if using connection string from appsettings.json
mysql -u root -p fitlife_planner

# Then run:
source /Users/chessy/CodeSpace/fitlife-planner/back-end/migrations/add_workout_schedule_completion_fields.sql
```

Or execute directly:

```bash
mysql -u root -p fitlife_planner < /Users/chessy/CodeSpace/fitlife-planner/back-end/migrations/add_workout_schedule_completion_fields.sql
```

## Changes Made

### Model Changes (WorkoutSchedule.cs)

```csharp
// Added fields:
public bool IsCompleted { get; set; } = false;
public string? Notes { get; set; }

// Changed from nullable to non-nullable:
public DateTime ScheduledDate { get; set; }  // was DateTime?
```

### Database Schema Changes

```sql
-- New columns:
IsCompleted TINYINT(1) NOT NULL DEFAULT 0
Notes TEXT NULL

-- Existing data migration:
UPDATE WorkoutSchedules SET IsCompleted = 1 WHERE Status = 'completed'
```

## Verification

After running the migration, verify the changes:

### Check columns exist:

```sql
DESCRIBE WorkoutSchedules;
```

Expected output should include:

```
IsCompleted  | tinyint(1) | NO   |     | 0
Notes        | text       | YES  |     | NULL
```

### Test the API:

```bash
# Get latest workout
curl -X GET "http://localhost:5000/workouts/latest" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return data with isCompleted and notes fields
```

## Troubleshooting

### If migration fails:

1. **Check database connection:**

   ```bash
   mysql -u root -p
   SHOW DATABASES;
   USE fitlife_planner;
   SHOW TABLES;
   ```

2. **Check current schema:**

   ```sql
   DESCRIBE WorkoutSchedules;
   ```

3. **Manually add columns if needed:**

   ```sql
   ALTER TABLE WorkoutSchedules ADD COLUMN IsCompleted TINYINT(1) NOT NULL DEFAULT 0;
   ALTER TABLE WorkoutSchedules ADD COLUMN Notes TEXT NULL;
   ```

4. **Rollback if needed:**
   ```sql
   ALTER TABLE WorkoutSchedules DROP COLUMN IsCompleted;
   ALTER TABLE WorkoutSchedules DROP COLUMN Notes;
   ```

### If EF migrations are out of sync:

```bash
# Remove last migration (if not applied)
dotnet ef migrations remove

# Or reset all migrations (DANGER: will lose data)
dotnet ef database drop
dotnet ef database update
```

## Next Steps

After successful migration:

1. ✅ Restart the backend server
2. ✅ Test the workout endpoints
3. ✅ Verify frontend integration
4. ✅ Check WorkoutPlayer completion flow

## Files Modified

- `Api/Models/WorkoutSchedule.cs` - Added IsCompleted, Notes fields
- `Api/Services/WorkoutService.cs` - Uses new fields
- `Api/Controllers/WorkoutController.cs` - Returns new fields in DTOs
- `migrations/add_workout_schedule_completion_fields.sql` - Migration script

---

**Status**: Migration ready to apply
**Priority**: HIGH - Required for workout completion feature to work
**Estimated Time**: 2-5 minutes
