# Workout Schedule API - Postman Collection

## Collection: Workout Schedule APIs

### Base URL

```
{{baseUrl}}/workouts
```

### Authentication

All endpoints require Bearer token authentication.

---

## 1. Get Today's Workout

**GET** `/workouts/today`

### Description

Get the workout scheduled for today.

### Headers

```
Authorization: Bearer {{accessToken}}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Successfully retrieved today's workout",
  "data": {
    "workoutScheduleId": "uuid",
    "workoutId": "uuid",
    "workoutName": "Full Body Workout",
    "scheduledDate": "2025-12-11T00:00:00Z",
    "isCompleted": false,
    "completedAt": null,
    "notes": null,
    "exercises": [
      {
        "workoutExerciseId": "uuid",
        "exerciseId": "uuid",
        "exerciseName": "Push-ups",
        "sets": 3,
        "reps": 12,
        "restTime": 45,
        "videoUrl": "https://youtube.com/...",
        "instructions": "Keep back straight...",
        "orderIndex": 0
      }
    ]
  }
}
```

### Postman Test Script

```javascript
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response has workout data", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.success).to.be.true;
  pm.expect(jsonData.data).to.have.property("workoutScheduleId");
  pm.expect(jsonData.data.exercises).to.be.an("array");
});
```

---

## 2. Get Latest Workout

**GET** `/workouts/latest`

### Description

Get the most recent workout schedule (for workout player).

### Headers

```
Authorization: Bearer {{accessToken}}
```

### Response (200 OK)

Same structure as "Get Today's Workout"

### Postman Test Script

```javascript
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Has exercises array", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.data.exercises).to.be.an("array");
  pm.expect(jsonData.data.exercises.length).to.be.greaterThan(0);
});

// Save schedule ID for later use
if (pm.response.code === 200) {
  var data = pm.response.json().data;
  pm.environment.set("workoutScheduleId", data.workoutScheduleId);
}
```

---

## 3. Get Workout Schedule by ID

**GET** `/workouts/schedules/:scheduleId`

### Description

Get a specific workout schedule by ID.

### Path Parameters

- `scheduleId` (UUID): The workout schedule ID

### Headers

```
Authorization: Bearer {{accessToken}}
```

### Example

```
GET /workouts/schedules/{{workoutScheduleId}}
```

### Response (200 OK)

Same structure as "Get Today's Workout"

### Postman Test Script

```javascript
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Schedule ID matches", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.data.workoutScheduleId).to.eql(
    pm.environment.get("workoutScheduleId")
  );
});
```

---

## 4. Complete Workout

**POST** `/workouts/complete`

### Description

Mark a workout as completed.

### Headers

```
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

### Request Body

```json
{
  "workoutScheduleId": "{{workoutScheduleId}}",
  "completedAt": "{{$isoTimestamp}}",
  "notes": "Great workout! Completed all sets."
}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Workout marked as completed successfully"
}
```

### Postman Pre-request Script

```javascript
// Ensure we have a schedule ID
if (!pm.environment.get("workoutScheduleId")) {
  console.log("No workoutScheduleId found. Run 'Get Latest Workout' first.");
}
```

### Postman Test Script

```javascript
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Workout marked as completed", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.success).to.be.true;
  pm.expect(jsonData.message).to.include("completed");
});
```

---

## 5. Get Workout History

**GET** `/workouts/history`

### Description

Get user's workout history with pagination.

### Headers

```
Authorization: Bearer {{accessToken}}
```

### Query Parameters

- `page` (integer, optional): Page number (default: 1)
- `pageSize` (integer, optional): Items per page (default: 10)

### Example

```
GET /workouts/history?page=1&pageSize=10
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Successfully retrieved workout history",
  "data": [
    {
      "workoutScheduleId": "uuid",
      "workoutName": "Full Body Workout",
      "scheduledDate": "2025-12-11T00:00:00Z",
      "isCompleted": true,
      "completedAt": "2025-12-11T10:30:00Z",
      "notes": "Great workout!",
      "exercises": [...]
    }
  ]
}
```

### Postman Test Script

```javascript
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("History is an array", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.data).to.be.an("array");
});

pm.test("Workouts are sorted by date", function () {
  var data = pm.response.json().data;
  if (data.length > 1) {
    var first = new Date(data[0].scheduledDate);
    var second = new Date(data[1].scheduledDate);
    pm.expect(first >= second).to.be.true;
  }
});
```

---

## 6. Get Workout Stats

**GET** `/workouts/stats`

### Description

Get user's workout statistics (completion rate, streaks, etc.).

### Headers

```
Authorization: Bearer {{accessToken}}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Successfully retrieved workout stats",
  "data": {
    "totalWorkouts": 30,
    "completedWorkouts": 25,
    "currentStreak": 7,
    "longestStreak": 14,
    "completionRate": 83.33
  }
}
```

### Postman Test Script

```javascript
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Stats have required fields", function () {
  var stats = pm.response.json().data;
  pm.expect(stats).to.have.property("totalWorkouts");
  pm.expect(stats).to.have.property("completedWorkouts");
  pm.expect(stats).to.have.property("currentStreak");
  pm.expect(stats).to.have.property("longestStreak");
  pm.expect(stats).to.have.property("completionRate");
});

pm.test("Completion rate is valid", function () {
  var stats = pm.response.json().data;
  pm.expect(stats.completionRate).to.be.at.least(0);
  pm.expect(stats.completionRate).to.be.at.most(100);
});
```

---

## Environment Variables

Add these to your Postman environment:

```json
{
  "baseUrl": "http://localhost:5000",
  "accessToken": "your_jwt_token_here",
  "workoutScheduleId": "will_be_set_automatically"
}
```

---

## Test Flow

Recommended order for testing:

1. **Login** → Get access token
2. **Get Latest Workout** → Save schedule ID
3. **Get Today's Workout** → Verify today's schedule
4. **Get Workout Schedule by ID** → Verify specific schedule
5. **Complete Workout** → Mark as completed
6. **Get Workout History** → Verify completion
7. **Get Workout Stats** → Check updated stats

---

## Error Responses

### 404 Not Found

```json
{
  "success": false,
  "message": "No workout scheduled for today"
}
```

### 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid workout schedule ID format"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

## Notes

- All dates are in ISO 8601 format (UTC)
- Schedule IDs are UUIDs
- Completion rate is a percentage (0-100)
- Streaks count consecutive days with completed workouts
- History is sorted by scheduled date (newest first)

---

**Created**: 2025-12-11
**Version**: 1.0
**Author**: FitLife Planner Team
