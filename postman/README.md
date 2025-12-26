# Custom Workout Schedule APIs - Postman Collection

## ✅ **Implementation Status**

### **Completed:**

- ✅ Models: `ScheduledExercise`, `WorkoutSchedule` (updated)
- ✅ DTOs: `CreateCustomScheduleRequestDTO`, `GetScheduleResponseDTO`
- ✅ Auto-BMI Recommendations: Workouts, Exercises, Meal Plans
- ✅ Backend builds successfully

### **Not Yet Implemented:**

- ⏳ Service methods: `CreateCustomWeeklySchedule`, `GetWeekScheduleWithExercises`
- ⏳ Controller endpoints (commented out)
- ⏳ Database migration for `ScheduledExercise` table

---

## 📋 **Available APIs**

### **1. Auto-BMI Recommendations** ✅ WORKING

All these APIs auto-detect user's goal, calories, and workout frequency from their BMI record:

```http
GET /recommendations/workouts          # Auto workout plan
GET /recommendations/exercises         # Auto exercise list
GET /recommendations/meal-plan         # Auto meal plan
```

**No parameters needed!** They all work automatically from BMI data.

---

### **2. Custom Workout Schedule** ⏳ READY TO IMPLEMENT

```http
POST /workout-schedules/custom-week    # Create custom weekly plan
GET  /workout-schedules/week/:weekNumber  # Get week details
PUT  /workout-schedules/:id/complete   # Mark as done
PUT  /workout-schedules/:id/skip       # Skip session
DELETE /workout-schedules/:id          # Delete schedule
```

---

## 🚀 **How to Use**

### **Import to Postman:**

1. Open Postman
2. Click **Import**
3. Select `custom-workout-schedule-apis.json`
4. Set environment variables:
   - `base_url`: `http://localhost:5000`
   - `access_token`: Your JWT token

### **Example: Create Custom Week**

```json
POST /workout-schedules/custom-week

{
  "weekNumber": 1,
  "sessions": [
    {
      "sessionNumber": 1,
      "sessionName": "Push Day",
      "scheduledDate": "2024-12-10",
      "exercises": [
        {
          "exerciseId": "uuid-bench-press",
          "sets": 4,
          "reps": 8,
          "restSeconds": 90,
          "notes": "Focus on form"
        },
        {
          "exerciseId": "uuid-shoulder-press",
          "sets": 3,
          "reps": 10,
          "restSeconds": 60
        }
      ]
    },
    {
      "sessionNumber": 2,
      "sessionName": "Pull Day",
      "exercises": [...]
    }
  ]
}
```

### **Response:**

```json
{
  "success": true,
  "data": {
    "weekNumber": 1,
    "totalSessions": 2,
    "sessions": [
      {
        "scheduleId": "uuid",
        "sessionNumber": 1,
        "sessionName": "Push Day",
        "exercises": [
          {
            "exerciseTitle": "Bench Press",
            "sets": 4,
            "reps": 8,
            "restSeconds": 90,
            "caloriesBurnedPerSet": 30
          }
        ],
        "totalDurationMin": 45,
        "estimatedCaloriesBurned": 360
      }
    ]
  }
}
```

---

## 🔧 **Next Steps to Complete**

### **1. Implement Service Methods**

Add to `WorkoutScheduleService.cs`:

- `CreateCustomWeeklySchedule()`
- `GetWeekScheduleWithExercises()`
- `UpdateScheduleSession()`
- `AddExerciseToSession()`
- `RemoveExerciseFromSession()`

### **2. Uncomment Controller Endpoints**

Uncomment in `WorkoutScheduleController.cs`

### **3. Create Database Migration**

```bash
dotnet ef migrations add AddScheduledExercises
dotnet ef database update
```

---

## 📊 **Database Schema**

### **New Table: ScheduledExercises**

```sql
CREATE TABLE ScheduledExercises (
    Id CHAR(36) PRIMARY KEY,
    ScheduleId CHAR(36) NOT NULL,
    ExerciseId CHAR(36) NOT NULL,
    OrderIndex INT NOT NULL,
    Sets INT NOT NULL,
    Reps INT NOT NULL,
    RestSeconds INT NOT NULL,
    Notes TEXT NULL,
    CreatedAt DATETIME NOT NULL,
    FOREIGN KEY (ScheduleId) REFERENCES WorkoutSchedules(Id),
    FOREIGN KEY (ExerciseId) REFERENCES ExerciseLibrary(Id)
);
```

### **Updated Table: WorkoutSchedules**

```sql
ALTER TABLE WorkoutSchedules
    MODIFY WorkoutId CHAR(36) NULL,
    ADD SessionName VARCHAR(255) NULL;
```

---

## 🎯 **Benefits**

✅ **Full Control:** Users create any workout structure
✅ **Unlimited Exercises:** No limits per session
✅ **Custom Parameters:** Sets, reps, rest all customizable
✅ **Week-based:** Organize by weeks, not fixed dates
✅ **Session-based:** "Buổi 1, 2, 3..." instead of Monday, Tuesday
✅ **Auto BMI Integration:** Smart recommendations

---

## 📝 **Notes**

- App is running on `http://localhost:5000`
- DB seeding warning can be ignored (connection timeout)
- All auto-BMI endpoints are fully functional
- Custom schedule endpoints need service implementation

**Full implementation plan:** See `.gemini/custom_workout_schedule_plan.md`
