# Workout Player - Design Specification

## Overview

Interactive workout player that guides users through their training session with video demonstrations, timers, and rep tracking.

## User Flow

### 1. Initial Load

- Fetch latest workout schedule
- Display first exercise with YouTube video
- Show exercise details (name, sets, reps, rest time)

### 2. Workout Execution

```
START
  ↓
Load Exercise Video
  ↓
User clicks "Bắt đầu tập" → Video plays
  ↓
User completes 1 rep → Click "Hoàn thành rep"
  ↓
REST TIMER starts (countdown from rest time)
  ↓
Rest timer ends → Video plays again for next rep
  ↓
Repeat until all reps completed
  ↓
Move to next exercise
  ↓
END (All exercises completed)
```

### 3. Timer Rules

- **Set Time Limit**: 3 minutes maximum per set
- **Rest Time**: Configurable per exercise (default 30-60s)
- **Auto-play**: Video auto-plays after rest time
- **Manual Skip**: User can skip rest time

## UI Layout

### Top Section - Timer & Controls

```
┌─────────────────────────────────────┐
│  Close                      07:58   │
│                                     │
│         ┌─────────────┐             │
│         │   31:47     │             │
│         │  60 min     │  ← Circular │
│         └─────────────┘     Timer   │
│                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │ Pause│ │ Skip │ │ Stop │        │
│  └──────┘ └──────┘ └──────┘        │
│                                     │
│  Rep: 8/12  |  Set: 2/3             │
└─────────────────────────────────────┘
```

### Bottom Section - Video Player

```
┌─────────────────────────────────────┐
│                                     │
│     YouTube Video Embed             │
│     (16:9 aspect ratio)             │
│                                     │
│  Exercise: Push-ups                 │
│  Reps: 12  |  Rest: 45s             │
└─────────────────────────────────────┘
```

## Component Structure

### WorkoutPlayer.tsx

```typescript
- State:
  - currentExercise
  - currentSet
  - currentRep
  - isResting
  - restTimeRemaining
  - setTimeRemaining
  - isPlaying
  - workoutData

- Functions:
  - loadLatestWorkout()
  - startExercise()
  - completeRep()
  - startRestTimer()
  - skipRest()
  - nextExercise()
  - endWorkout()
```

## Features

### 1. Timer Display

- **Circular progress** showing time remaining
- **Digital time** (MM:SS format)
- **Color coding**:
  - Purple: Active workout
  - Orange: Rest time
  - Red: Time running out (<10s)

### 2. Control Buttons

- **Bắt đầu tập** (Start): Play video, start set timer
- **Hoàn thành rep** (Complete Rep): Mark rep done, start rest
- **Bỏ qua nghỉ** (Skip Rest): End rest early
- **Tạm dừng** (Pause): Pause timers
- **Kết thúc** (End): Exit workout

### 3. Progress Tracking

- Current rep / Total reps
- Current set / Total sets
- Exercise name
- Next exercise preview

### 4. YouTube Integration

- Embed video using YouTube iframe API
- Auto-play on rep start
- Pause during rest
- Loop video for multiple reps

## State Machine

### States

1. **IDLE**: Waiting to start
2. **ACTIVE**: User performing exercise (video playing)
3. **RESTING**: Rest timer counting down
4. **COMPLETED**: Exercise finished

### Transitions

```
IDLE → (Start) → ACTIVE
ACTIVE → (Complete Rep) → RESTING
RESTING → (Timer End) → ACTIVE
RESTING → (Skip) → ACTIVE
ACTIVE → (All Reps Done) → COMPLETED
COMPLETED → (Next Exercise) → IDLE
```

## Data Structure

### Workout Session

```typescript
{
  id: string
  date: string
  exercises: [
    {
      id: string
      name: string
      videoUrl: string  // YouTube URL
      sets: number
      reps: number
      restTime: number  // seconds
      duration: number  // seconds per set (max 180)
    }
  ]
}
```

## Design System

### Colors

- **Primary**: Purple gradient (#667eea → #764ba2)
- **Rest**: Orange (#f59e0b)
- **Warning**: Red (#ef4444)
- **Success**: Green (#10b981)

### Typography

- **Timer**: 48px, bold
- **Exercise Name**: 24px, bold
- **Stats**: 16px, medium

### Spacing

- Container: max-width 800px
- Padding: 2rem
- Gap: 1.5rem

## API Integration

### Endpoints Needed

- `GET /workouts/latest` - Get latest workout schedule
- `POST /workouts/{id}/complete` - Mark workout completed
- `POST /workouts/{id}/exercises/{exerciseId}/log` - Log exercise completion

## Future Enhancements

1. Voice commands ("Next rep", "Skip rest")
2. Heart rate monitoring
3. Form check with camera
4. Social sharing
5. Workout history & analytics
6. Custom rest times
7. Background music
8. Offline mode

---

**Status**: Design Complete
**Next**: Implementation
**Priority**: High
