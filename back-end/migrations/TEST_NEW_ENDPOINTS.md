# Test New Workout Schedule Endpoints

## Current Issue

You're getting response from **OLD endpoint** (probably `/schedules/me`), which doesn't have `isCompleted` field.

## New Endpoints to Test

### 1. Get Today's Workout

```bash
GET http://localhost:5000/workouts/today
Authorization: Bearer YOUR_TOKEN
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Successfully retrieved today's workout",
  "data": {
    "workoutScheduleId": "uuid",
    "workoutId": "uuid",
    "workoutName": "Full Body Workout",
    "scheduledDate": "2025-12-12T00:00:00Z",
    "isCompleted": false,           // ✅ NEW FIELD
    "completedAt": null,
    "notes": null,                  // ✅ NEW FIELD
    "exercises": [...]
  }
}
```

### 2. Get Latest Workout

```bash
GET http://localhost:5000/workouts/latest
Authorization: Bearer YOUR_TOKEN
```

**Expected Response:** Same structure as above

### 3. Complete Workout

```bash
POST http://localhost:5000/workouts/complete
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "workoutScheduleId": "your-schedule-id",
  "completedAt": "2025-12-12T01:15:00Z",
  "notes": "Great workout!"
}
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Workout marked as completed successfully"
}
```

## Comparison

### OLD Endpoint Response (what you're seeing):

```json
{
  "scheduleId": "...",
  "weekNumber": 1,
  "sessionNumber": 1,
  "sessionName": "Buổi 1",
  "status": "planned",              // ❌ OLD field
  "exercises": [...]
  // ❌ No isCompleted
  // ❌ No notes
  // ❌ No workoutName
}
```

### NEW Endpoint Response (what you should get):

```json
{
  "workoutScheduleId": "...",
  "workoutId": "...",
  "workoutName": "Full Body Workout",  // ✅ NEW
  "scheduledDate": "...",
  "isCompleted": false,                // ✅ NEW
  "completedAt": null,
  "notes": null,                       // ✅ NEW
  "exercises": [...]
}
```

## Testing Steps

### 1. Check if new endpoints exist:

```bash
# List all routes
curl http://localhost:5000/swagger/v1/swagger.json | grep -A 5 "workouts"
```

### 2. Test Today's Workout:

```bash
curl -X GET "http://localhost:5000/workouts/today" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  | jq '.data.isCompleted'
```

Should return: `false` or `true`

### 3. Test Latest Workout:

```bash
curl -X GET "http://localhost:5000/workouts/latest" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  | jq '.data | {workoutName, isCompleted, notes}'
```

### 4. Complete a Workout:

```bash
# First get a schedule ID
SCHEDULE_ID=$(curl -X GET "http://localhost:5000/workouts/latest" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  | jq -r '.data.workoutScheduleId')

# Then complete it
curl -X POST "http://localhost:5000/workouts/complete" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"workoutScheduleId\": \"$SCHEDULE_ID\",
    \"completedAt\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
    \"notes\": \"Test completion\"
  }"
```

### 5. Verify Completion:

```bash
curl -X GET "http://localhost:5000/workouts/today" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  | jq '.data | {isCompleted, completedAt, notes}'
```

Should show:

```json
{
  "isCompleted": true,
  "completedAt": "2025-12-12T01:15:00Z",
  "notes": "Test completion"
}
```

## Frontend Integration

### Update API Call in Frontend:

```typescript
// OLD (what you might be using):
const response = await request("/schedules/me");

// NEW (what you should use):
const response = await getTodayWorkout();
// or
const response = await getLatestWorkout();
```

### Check Response Structure:

```typescript
if (response.success && response.data) {
  console.log("IsCompleted:", response.data.isCompleted);
  console.log("Notes:", response.data.notes);
  console.log("Workout Name:", response.data.workoutName);
}
```

## Troubleshooting

### If endpoints return 404:

1. Check server is running
2. Verify routes in `WorkoutController.cs`
3. Check Swagger UI: `http://localhost:5000/swagger`

### If isCompleted is undefined:

1. Check database has column:

   ```sql
   DESCRIBE WorkoutSchedules;
   ```

2. Check DTO mapping in `WorkoutService.cs`:

   ```csharp
   IsCompleted = schedule.IsCompleted,
   Notes = schedule.Notes,
   ```

3. Restart backend server

## Quick Verification

```bash
# Check database
mysql -u root -p fitlife_planner -e "SELECT Id, IsCompleted, Notes FROM WorkoutSchedules LIMIT 3;"

# Check API
curl http://localhost:5000/workouts/latest -H "Authorization: Bearer TOKEN" | jq '.data.isCompleted'
```

---

**Next Step**: Test `/workouts/today` or `/workouts/latest` endpoint, NOT `/schedules/me`
