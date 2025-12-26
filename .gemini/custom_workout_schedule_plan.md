# Implementation Plan: Custom Weekly Workout Schedule

## Overview

Allow users to create fully customizable weekly workout schedules where they can:

- Define number of sessions per week
- Select exercises for each session
- Customize sets, reps, and rest time for each exercise
- Create complete 1-week workout plans

---

## Phase 1: Update Data Models

### 1.1 Update WorkoutSchedule Model

**File:** `Api/Models/WorkoutSchedule.cs`

**Changes:**

- Keep existing fields: `WeekNumber`, `SessionNumber`
- Keep `WorkoutId` nullable (optional - for linking to pre-made workouts)
- Add direct exercise relationships

### 1.2 Create New Model: ScheduledExercise

**File:** `Api/Models/ScheduledExercise.cs` (NEW)

**Purpose:** Store individual exercises within a schedule session

**Fields:**

```csharp
public class ScheduledExercise
{
    [Key] public Guid Id { get; set; }
    public Guid ScheduleId { get; set; }       // FK to WorkoutSchedule
    public Guid ExerciseId { get; set; }       // FK to ExerciseLibrary
    public int OrderIndex { get; set; }        // Order in the session (1, 2, 3...)
    public int Sets { get; set; }
    public int Reps { get; set; }
    public int RestSeconds { get; set; }
    public string? Notes { get; set; }

    // Navigation
    public WorkoutSchedule Schedule { get; set; }
    public ExerciseLibrary Exercise { get; set; }
}
```

### 1.3 Update WorkoutSchedule Navigation

**File:** `Api/Models/WorkoutSchedule.cs`

Add:

```csharp
public ICollection<ScheduledExercise> ScheduledExercises { get; set; } = new List<ScheduledExercise>();
```

---

## Phase 2: Create DTOs

### 2.1 Request DTO: CreateCustomScheduleRequestDTO

**File:** `Api/DTOs/Requests/CreateCustomScheduleRequestDTO.cs` (NEW)

```csharp
public class CreateCustomScheduleRequestDTO
{
    public int WeekNumber { get; set; } = 1;
    public List<SessionRequestDTO> Sessions { get; set; }
}

public class SessionRequestDTO
{
    public int SessionNumber { get; set; }     // Buổi thứ mấy (1-7)
    public string? SessionName { get; set; }   // Optional: "Push Day", "Leg Day"
    public DateTime? ScheduledDate { get; set; } // Optional specific date
    public List<ExerciseRequestDTO> Exercises { get; set; }
}

public class ExerciseRequestDTO
{
    public Guid ExerciseId { get; set; }
    public int Sets { get; set; }
    public int Reps { get; set; }
    public int RestSeconds { get; set; }
    public string? Notes { get; set; }
}
```

### 2.2 Response DTO: GetScheduleResponseDTO

**File:** `Api/DTOs/Responses/GetScheduleResponseDTO.cs` (NEW)

```csharp
public class GetScheduleResponseDTO
{
    public Guid ScheduleId { get; set; }
    public int WeekNumber { get; set; }
    public int SessionNumber { get; set; }
    public string? SessionName { get; set; }
    public DateTime? ScheduledDate { get; set; }
    public string Status { get; set; }
    public List<ScheduledExerciseDTO> Exercises { get; set; }
    public int TotalDurationMin { get; set; }  // Calculated
}

public class ScheduledExerciseDTO
{
    public Guid Id { get; set; }
    public Guid ExerciseId { get; set; }
    public string ExerciseTitle { get; set; }
    public string? PrimaryMuscle { get; set; }
    public int Sets { get; set; }
    public int Reps { get; set; }
    public int RestSeconds { get; set; }
    public string? Notes { get; set; }
    public string? VideoUrl { get; set; }
    public int EstimatedCaloriesBurned { get; set; }
}
```

---

## Phase 3: Update Service Layer

### 3.1 Update WorkoutScheduleService

**File:** `Api/Services/WorkoutScheduleService.cs`

**New Methods:**

#### A. CreateCustomWeeklySchedule

```csharp
public async Task<List<GetScheduleResponseDTO>> CreateCustomWeeklySchedule(
    CreateCustomScheduleRequestDTO dto)
{
    // 1. Validate user has profile & BMI record
    // 2. For each session in dto.Sessions:
    //    a. Create WorkoutSchedule record
    //    b. For each exercise in session:
    //       - Create ScheduledExercise record
    //       - Link to schedule
    // 3. Calculate total duration
    // 4. Return mapped response
}
```

#### B. GetWeekScheduleWithExercises

```csharp
public async Task<List<GetScheduleResponseDTO>> GetWeekScheduleWithExercises(
    int weekNumber)
{
    // 1. Get all schedules for user & week
    // 2. Include ScheduledExercises
    // 3. Include Exercise details from ExerciseLibrary
    // 4. Group by session
    // 5. Return formatted response
}
```

#### C. UpdateScheduleSession

```csharp
public async Task<GetScheduleResponseDTO> UpdateScheduleSession(
    Guid scheduleId,
    SessionRequestDTO dto)
{
    // 1. Find existing schedule
    // 2. Remove old ScheduledExercises
    // 3. Add new exercises from dto
    // 4. Update schedule metadata
    // 5. Return updated response
}
```

#### D. AddExerciseToSession

```csharp
public async Task<ScheduledExerciseDTO> AddExerciseToSession(
    Guid scheduleId,
    ExerciseRequestDTO dto)
{
    // Add single exercise to existing session
}
```

#### E. RemoveExerciseFromSession

```csharp
public async Task<bool> RemoveExerciseFromSession(
    Guid scheduledExerciseId)
{
    // Remove specific exercise from session
}
```

---

## Phase 4: Update Controller

### 4.1 New Endpoints in WorkoutScheduleController

**File:** `Api/Controllers/WorkoutScheduleController.cs`

```csharp
// POST /workout-schedules/custom-week
[HttpPost("custom-week")]
public async Task<IActionResult> CreateCustomWeek(
    [FromBody] CreateCustomScheduleRequestDTO dto)

// GET /workout-schedules/week/{weekNumber}
[HttpGet("week/{weekNumber:int}")]
public async Task<IActionResult> GetWeekWithDetails(int weekNumber)

// PUT /workout-schedules/{scheduleId}/session
[HttpPut("{scheduleId:guid}/session")]
public async Task<IActionResult> UpdateSession(
    Guid scheduleId,
    [FromBody] SessionRequestDTO dto)

// POST /workout-schedules/{scheduleId}/exercises
[HttpPost("{scheduleId:guid}/exercises")]
public async Task<IActionResult> AddExercise(
    Guid scheduleId,
    [FromBody] ExerciseRequestDTO dto)

// DELETE /workout-schedules/exercises/{exerciseId}
[HttpDelete("exercises/{exerciseId:guid}")]
public async Task<IActionResult> RemoveExercise(Guid exerciseId)
```

---

## Phase 5: Database Migration

### 5.1 Add Migration

**Command:**

```bash
dotnet ef migrations add AddScheduledExercises -p fitlife-planner-back-end.csproj
```

**What it creates:**

- `ScheduledExercises` table
- Foreign keys to `WorkoutSchedules` and `ExerciseLibrary`
- Indexes on `ScheduleId` and `ExerciseId`

---

## Phase 6: Frontend Integration

### 6.1 API Client

**File:** `front-end/src/api/workoutScheduleApi.ts` (NEW)

```typescript
export interface CreateCustomScheduleRequest {
  weekNumber: number;
  sessions: SessionRequest[];
}

export interface SessionRequest {
  sessionNumber: number;
  sessionName?: string;
  scheduledDate?: string;
  exercises: ExerciseRequest[];
}

export interface ExerciseRequest {
  exerciseId: string;
  sets: number;
  reps: number;
  restSeconds: number;
  notes?: string;
}

export async function createCustomWeeklySchedule(
  data: CreateCustomScheduleRequest
) {
  return apiClient.post("/workout-schedules/custom-week", data);
}

export async function getWeekSchedule(weekNumber: number) {
  return apiClient.get(`/workout-schedules/week/${weekNumber}`);
}
```

### 6.2 UI Components (Suggested)

**A. WeeklyScheduleBuilder** - Main component

- Week selector
- Add/remove sessions
- Session list view

**B. SessionEditor** - Per session

- Session name input
- Exercise selector (from ExerciseLibrary)
- Exercise list with sets/reps/rest inputs
- Drag-to-reorder exercises

**C. ExerciseCard** - Individual exercise

- Exercise info (name, muscle, video)
- Sets/reps/rest inputs
- Remove button

---

## Example API Usage

### Create Custom Week Schedule

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
      "exercises": [
        {
          "exerciseId": "uuid-deadlift",
          "sets": 5,
          "reps": 5,
          "restSeconds": 120
        }
      ]
    }
  ]
}
```

### Response

```json
{
  "success": true,
  "message": "Successfully created weekly schedule",
  "data": {
    "weekNumber": 1,
    "totalSessions": 2,
    "sessions": [
      {
        "scheduleId": "uuid",
        "weekNumber": 1,
        "sessionNumber": 1,
        "sessionName": "Push Day",
        "status": "planned",
        "exercises": [
          {
            "id": "uuid",
            "exerciseTitle": "Bench Press",
            "sets": 4,
            "reps": 8,
            "restSeconds": 90,
            "estimatedCaloriesBurned": 120
          }
        ],
        "totalDurationMin": 45
      }
    ]
  }
}
```

---

## Implementation Order

1. ✅ **Database:** Create ScheduledExercise model
2. ✅ **DTOs:** Create request/response DTOs
3. ✅ **Service:** Implement CreateCustomWeeklySchedule
4. ✅ **Controller:** Add POST /custom-week endpoint
5. ✅ **Service:** Implement GetWeekScheduleWithExercises
6. ✅ **Controller:** Add GET /week/{weekNumber}
7. ✅ **Service:** Implement update/add/remove methods
8. ✅ **Controller:** Add PUT/POST/DELETE endpoints
9. ✅ **Migration:** Apply database migration
10. ✅ **Frontend:** Create API client functions
11. ✅ **Frontend:** Build UI components

---

## Benefits

✅ **Full Customization:** Users control everything
✅ **Flexible:** Support any workout style
✅ **Scalable:** Easy to add features later
✅ **Clear API:** REST-ful design
✅ **Easy UI:** Simple form-based creation
✅ **Multiple Exercises:** No limits per session

---

## Next Steps

Would you like me to:

1. Start implementing Phase 1 (Models)?
2. Create all DTOs first?
3. Implement the entire backend flow?
4. Focus on specific endpoint?
