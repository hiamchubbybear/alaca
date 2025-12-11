# Debug Workout Status Display Issue

## Problem

Workout status card không hiển thị "Đã hoàn thành" trong TrainingSection.

## Debug Steps

### 1. Open Browser Console

1. Mở trang Training
2. Mở DevTools (F12)
3. Vào tab Console
4. Refresh trang

### 2. Check Console Logs

Bạn sẽ thấy logs như sau:

```
[TrainingSection] Loading today's workout...
[TrainingSection] API Response: { success: true, data: {...} }
[TrainingSection] Workout data: { workoutScheduleId: "...", isCompleted: false, ... }
[TrainingSection] IsCompleted: false
```

### 3. Possible Issues & Solutions

#### Issue 1: API Returns 404

```
[TrainingSection] API Response: { success: false, message: "Not found" }
```

**Solution**: Backend endpoint chưa có data

```sql
-- Check database
SELECT * FROM WorkoutSchedules WHERE ScheduledDate >= CURDATE() LIMIT 1;

-- If empty, create test data
INSERT INTO WorkoutSchedules (Id, UserId, WorkoutId, ScheduledDate, IsCompleted, Notes)
VALUES (UUID(), 'your-user-id', 'workout-id', CURDATE(), 0, NULL);
```

#### Issue 2: API Returns Empty Data

```
[TrainingSection] No workout data or API failed
```

**Solution**: Check backend logs for errors

#### Issue 3: CORS Error

```
Access to fetch at 'http://localhost:5000/workouts/today' has been blocked by CORS
```

**Solution**: Check CORS settings in backend

#### Issue 4: Authentication Error

```
401 Unauthorized
```

**Solution**: Check access token

```javascript
// In console
localStorage.getItem('accessToken')
```

### 4. Manual API Test

Open browser console and run:

```javascript
// Test API directly
fetch('http://localhost:5000/workouts/today', {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json'
  }
})
  .then((r) => r.json())
  .then((data) => {
    console.log('API Response:', data)
    console.log('Has isCompleted?', 'isCompleted' in (data.data || {}))
    console.log('IsCompleted value:', data.data?.isCompleted)
  })
  .catch((err) => console.error('API Error:', err))
```

### 5. Check Network Tab

1. Open DevTools → Network tab
2. Filter by "workouts"
3. Refresh page
4. Click on `/workouts/today` request
5. Check:
   - Status code (should be 200)
   - Response body
   - Request headers (Authorization present?)

### 6. Verify Data Flow

```javascript
// In console, check state
// (Note: This only works if you expose state for debugging)

// Check if workout data is loaded
console.log('Workout loaded:', document.querySelector('.workout-status-card'))

// Check badge class
console.log('Badge:', document.querySelector('.workout-status-badge')?.className)
```

### 7. Force Complete a Workout

Test completion flow:

```javascript
// Get schedule ID from API
fetch('http://localhost:5000/workouts/latest', {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json'
  }
})
  .then((r) => r.json())
  .then((data) => {
    const scheduleId = data.data.workoutScheduleId

    // Complete it
    return fetch('http://localhost:5000/workouts/complete', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        workoutScheduleId: scheduleId,
        completedAt: new Date().toISOString(),
        notes: 'Test completion'
      })
    })
  })
  .then((r) => r.json())
  .then((result) => {
    console.log('Completion result:', result)
    // Refresh page to see updated status
    window.location.reload()
  })
```

## Expected Behavior

### When Workout NOT Completed:

```html
<div class="workout-status-badge pending">
  <svg>...</svg>
  Chưa hoàn thành
</div>
```

### When Workout Completed:

```html
<div class="workout-status-badge completed">
  <svg>...</svg>
  Đã hoàn thành
</div>
<p class="workout-completed-time">Hoàn thành lúc: 10:30</p>
```

## Quick Checklist

- [ ] Console shows API is called
- [ ] API returns 200 status
- [ ] Response has `isCompleted` field
- [ ] `todayWorkout` state is set
- [ ] Workout card is rendered
- [ ] Badge shows correct status
- [ ] CSS classes are applied

## Common Solutions

### 1. No Data in Database

```sql
-- Create test workout schedule
INSERT INTO WorkoutSchedules (Id, UserId, WorkoutId, ScheduledDate, IsCompleted, CompletedAt, Notes)
VALUES (
  UUID(),
  'your-user-id',
  (SELECT Id FROM Workouts LIMIT 1),
  CURDATE(),
  1,
  NOW(),
  'Test workout'
);
```

### 2. Backend Not Running

```bash
cd /Users/chessy/CodeSpace/fitlife-planner/back-end/fitlife-planner-back-end
dotnet run
```

### 3. Frontend Not Updated

```bash
# Clear cache and rebuild
cd /Users/chessy/CodeSpace/fitlife-planner/front-end
rm -rf node_modules/.cache
npm run dev
```

---

**Next Step**: Open browser console, check logs, and share what you see!
