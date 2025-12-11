# Fix WorkoutExercises Reps Column Migration

## Problem

```
MySqlException: Data truncated for column 'Reps' at row 1
```

**Root Cause**:

- Model defines `Reps` as `int`
- Database has `Reps` as `VARCHAR` or `TEXT`
- Existing data contains non-numeric values like "8-12", "AMRAP", etc.
- Migration trying to convert directly to `int` fails

## Solution Options

### Option 1: Clean Data Then Migrate (Recommended)

Run the SQL script to safely convert:

```bash
mysql -u root -p fitlife_planner < /Users/chessy/CodeSpace/fitlife-planner/back-end/migrations/fix_workout_exercises_reps_to_int.sql
```

This script will:

1. ✅ Check current data
2. ✅ Clean invalid values (set to 0)
3. ✅ Create temporary int column
4. ✅ Copy converted data
5. ✅ Replace old column

### Option 2: Manual Database Fix

```sql
-- Connect to database
mysql -u root -p fitlife_planner

-- Check current data
SELECT Id, Reps FROM WorkoutExercises LIMIT 10;

-- Clean non-numeric values
UPDATE WorkoutExercises
SET Reps = '0'
WHERE Reps IS NULL
   OR Reps = ''
   OR NOT (Reps REGEXP '^[0-9]+$');

-- Now run EF migration
-- Exit MySQL and run:
-- dotnet ef database update
```

### Option 3: Delete Bad Data

If you don't need existing workout data:

```sql
-- DANGER: This deletes all workout exercises
TRUNCATE TABLE WorkoutExercises;

-- Then run migration
-- dotnet ef database update
```

## Step-by-Step Fix

### 1. Backup Database First!

```bash
mysqldump -u root -p fitlife_planner > backup_$(date +%Y%m%d).sql
```

### 2. Check Current Data

```sql
USE fitlife_planner;

-- See what's in Reps column
SELECT
    Id,
    Reps,
    CASE
        WHEN Reps REGEXP '^[0-9]+$' THEN 'Numeric'
        ELSE 'Non-Numeric'
    END as Type
FROM WorkoutExercises;
```

### 3. Run Fix Script

```bash
mysql -u root -p fitlife_planner < /Users/chessy/CodeSpace/fitlife-planner/back-end/migrations/fix_workout_exercises_reps_to_int.sql
```

### 4. Verify Fix

```sql
-- Check column type
DESCRIBE WorkoutExercises;

-- Should show:
-- Reps | int | NO | | 0 |

-- Check data
SELECT Id, Reps, Sets, RestSeconds FROM WorkoutExercises LIMIT 5;
```

### 5. Run Remaining Migrations

```bash
cd /Users/chessy/CodeSpace/fitlife-planner/back-end/fitlife-planner-back-end

# This should now work
dotnet ef database update
```

## Alternative: Change Model to String

If you want to keep "8-12" and "AMRAP" format:

### Update Model:

```csharp
// In WorkoutExercise.cs
public string Reps { get; set; } = "0"; // Keep as string
```

### Create Migration:

```bash
dotnet ef migrations add ChangeRepsToString
dotnet ef database update
```

## Recommended Approach

**For fitness app, use separate fields:**

```csharp
public class WorkoutExercise
{
    public int MinReps { get; set; } = 0;      // Minimum reps (e.g., 8)
    public int MaxReps { get; set; } = 0;      // Maximum reps (e.g., 12)
    public string RepsType { get; set; } = "fixed"; // "fixed", "range", "amrap"

    // Computed property
    public string RepsDisplay => RepsType switch
    {
        "range" => $"{MinReps}-{MaxReps}",
        "amrap" => "AMRAP",
        _ => MinReps.ToString()
    };
}
```

But for now, **just use int and clean the data**.

## After Migration

1. ✅ Restart backend server
2. ✅ Test workout endpoints
3. ✅ Verify data integrity
4. ✅ Update any seed data scripts

## Files

- `fix_workout_exercises_reps_to_int.sql` - Data cleaning script
- `WorkoutExercise.cs` - Model definition
- `AppDBContext.cs` - Database context

---

**Status**: Fix script ready
**Action Required**: Run SQL script then retry migration
**Estimated Time**: 5 minutes
