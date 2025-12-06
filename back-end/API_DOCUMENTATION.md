# FitLife Planner - API Documentation for Frontend

## Base URL

```
https://alaca.onrender.com
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer {access_token}
```

---

## Table of Contents

1. [Authentication & Account](#authentication--account)
2. [Profile Management](#profile-management)
3. [BMI & Nutrition](#bmi--nutrition)
4. [Food Items](#food-items)
5. [Workouts](#workouts)
6. [Exercise Library](#exercise-library)
7. [Nutrition Plans](#nutrition-plans)
8. [Workout Schedules](#workout-schedules)
9. [Challenges](#challenges)
10. [Progress Tracking](#progress-tracking)
11. [Admin Tools](#admin-tools)
12. [Account Management](#account-management)

---

## Authentication & Account

### Register

**POST** `/account`

**Request:**

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "uuid",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "statusCode": 201
}
```

### Login

**POST** `/auth/login`

**Request:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "userId": "uuid",
    "profileId": "uuid",
    "email": "john@example.com",
    "role": "User"
  },
  "statusCode": 200
}
```

### Get Account Info

**GET** `/account`
**Auth:** Required

**Response:**

```json
{
  "success": true,
  "message": "Successfully retrieved user",
  "data": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "User",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "statusCode": 200
}
```

### Create Admin Account

**POST** `/account/admin`
**Auth:** Admin only

**Request:**

```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "AdminPass@123"
}
```

---

## Profile Management

### Get My Profile

**GET** `/profile`
**Auth:** Required

**Response:**

```json
{
  "success": true,
  "message": "Successfully retrieved profile",
  "data": {
    "profileId": "uuid",
    "userId": "uuid",
    "displayName": "John Doe",
    "avatarUrl": "https://example.com/avatar.jpg",
    "birthDate": "1995-05-15T00:00:00Z",
    "gender": 0,
    "bio": "Fitness enthusiast"
  },
  "statusCode": 200
}
```

### Update Profile

**PUT** `/profile`
**Auth:** Required

**Request:**

```json
{
  "displayName": "John Doe Updated",
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "bio": "Passionate about fitness"
}
```

---

## BMI & Nutrition

### Calculate BMI

**POST** `/bmi/calculate`
**Auth:** Required

**Request:**

```json
{
  "heightCm": 175,
  "weightKg": 70
}
```

**Response:**

```json
{
  "success": true,
  "message": "BMI calculated successfully",
  "data": {
    "bmi": 22.86,
    "assessment": "Normal weight",
    "bmiRecordID": "uuid"
  },
  "statusCode": 200
}
```

### Get My BMI Records

**GET** `/bmi/me`
**Auth:** Required

---

## Food Items

### Get All Food Items (Paginated)

**GET** `/food-items?page={page}&pageSize={pageSize}`
**Auth:** Required

**Query Parameters:**

- `page` (optional, default: 1)
- `pageSize` (optional, default: 20)

**Response:**

```json
{
  "success": true,
  "message": "Successfully retrieved food items",
  "data": {
    "foodItems": [...],
    "total": 120,
    "page": 1,
    "pageSize": 20
  },
  "statusCode": 200
}
```

### Search Food Items

**GET** `/food-items/search?query={query}&page={page}&pageSize={pageSize}`
**Auth:** Required

**Query Parameters:**

- `query` (required): Search term
- `page` (optional, default: 1)
- `pageSize` (optional, default: 20)

### Get Food Item by ID

**GET** `/food-items/{id}`
**Auth:** Required

### Create Food Item

**POST** `/food-items`
**Auth:** Admin only

**Request:**

```json
{
  "name": "Grilled Chicken Breast",
  "servingSize": "100g",
  "servingAmount": 1,
  "caloriesKcal": 165,
  "proteinG": 31,
  "carbsG": 0,
  "fatG": 3.6,
  "fiberG": 0,
  "sodiumMg": 74,
  "micronutrients": "{}"
}
```

### Update Food Item

**PUT** `/food-items/{id}`
**Auth:** Admin only

**Request:**

```json
{
  "name": "Grilled Chicken Breast Updated",
  "servingSize": "150g",
  "caloriesKcal": 248,
  "proteinG": 46.5
}
```

### Delete Food Item

**DELETE** `/food-items/{id}`
**Auth:** Admin only

---

## Workouts

### Get My Workouts (Paginated)

**GET** `/workouts/me?page={page}&pageSize={pageSize}`
**Auth:** Required

**Query Parameters:**

- `page` (optional, default: 1)
- `pageSize` (optional, default: 20)

**Response:**

```json
{
  "success": true,
  "message": "Successfully retrieved workouts",
  "data": {
    "workouts": [...],
    "total": 50,
    "page": 1,
    "pageSize": 20
  },
  "statusCode": 200
}
```

### Get Workout by ID

**GET** `/workouts/{id}`
**Auth:** Required

### Create Workout

**POST** `/workouts`
**Auth:** Required

**Request:**

```json
{
  "title": "Upper Body Strength",
  "description": "Chest and triceps workout",
  "durationMin": 60,
  "intensity": "High"
}
```

### Update Workout

**PUT** `/workouts/{id}`
**Auth:** Required (owner only)

**Request:**

```json
{
  "title": "Upper Body Strength Updated",
  "description": "Enhanced chest and back workout"
}
```

### Duplicate Workout

**POST** `/workouts/{id}/duplicate`
**Auth:** Required

**Response:**

```json
{
  "success": true,
  "message": "Successfully duplicated workout",
  "data": {
    "id": "new-uuid",
    "title": "Upper Body Strength (Copy)",
    "description": "Enhanced chest and back workout"
  },
  "statusCode": 200
}
```

### Delete Workout

**DELETE** `/workouts/{id}`
**Auth:** Required (owner only)

---

## Exercise Library

### Get All Exercises (Paginated)

**GET** `/exercises?muscleGroup={muscleGroup}&page={page}&pageSize={pageSize}`
**Auth:** Required

**Query Parameters:**

- `muscleGroup` (optional): Filter by muscle group
- `page` (optional, default: 1)
- `pageSize` (optional, default: 20)

**Response:**

```json
{
  "success": true,
  "message": "Successfully retrieved exercises",
  "data": {
    "exercises": [...],
    "total": 200,
    "page": 1,
    "pageSize": 20
  },
  "statusCode": 200
}
```

### Search Exercises

**GET** `/exercises/search?query={query}&page={page}&pageSize={pageSize}`
**Auth:** Required

**Query Parameters:**

- `query` (required): Search term
- `page` (optional, default: 1)
- `pageSize` (optional, default: 20)

### Get Exercise by ID

**GET** `/exercises/{id}`
**Auth:** Required

### Create Exercise

**POST** `/exercises`
**Auth:** Admin only

**Request:**

```json
{
  "title": "Bench Press",
  "description": "Compound chest exercise",
  "primaryMuscle": "Chest",
  "secondaryMuscles": "Triceps,Shoulders",
  "equipment": "Barbell",
  "difficulty": "Intermediate",
  "videoUrl": "https://example.com/video.mp4",
  "images": "[]",
  "tags": ["strength", "compound"]
}
```

### Update Exercise

**PUT** `/exercises/{id}`
**Auth:** Admin only

**Request:**

```json
{
  "title": "Bench Press Updated",
  "description": "Compound chest exercise with proper form",
  "difficulty": "Advanced"
}
```

### Delete Exercise

**DELETE** `/exercises/{id}`
**Auth:** Admin only

---

## Nutrition Plans

### Get My Nutrition Plans (Paginated)

**GET** `/nutrition-plans/me?page={page}&pageSize={pageSize}`
**Auth:** Required

**Query Parameters:**

- `page` (optional, default: 1)
- `pageSize` (optional, default: 20)

**Response:**

```json
{
  "success": true,
  "message": "Successfully retrieved nutrition plans",
  "data": {
    "plans": [...],
    "total": 10,
    "page": 1,
    "pageSize": 20
  },
  "statusCode": 200
}
```

### Get Nutrition Plan by ID

**GET** `/nutrition-plans/{id}`
**Auth:** Required

### Create Nutrition Plan

**POST** `/nutrition-plans`
**Auth:** Required

**Request:**

```json
{
  "name": "Bulking Plan",
  "description": "High protein diet for muscle gain",
  "targetCalories": 3000,
  "targetProtein": 200,
  "targetCarbs": 350,
  "targetFat": 80
}
```

### Update Nutrition Plan

**PUT** `/nutrition-plans/{id}`
**Auth:** Required (owner only)

**Request:**

```json
{
  "name": "Bulking Plan Updated",
  "targetCalories": 3200
}
```

### Add Item to Plan

**POST** `/nutrition-plans/{id}/items`
**Auth:** Required (owner only)

**Request:**

```json
{
  "foodItemId": "uuid",
  "mealTime": "Breakfast",
  "servingCount": 2,
  "notes": "With almond milk"
}
```

### Update Plan Item

**PUT** `/nutrition-plans/{planId}/items/{itemId}`
**Auth:** Required (owner only)

**Request:**

```json
{
  "mealTime": "Lunch",
  "servingCount": 1.5,
  "notes": "Updated portion"
}
```

### Remove Plan Item

**DELETE** `/nutrition-plans/{planId}/items/{itemId}`
**Auth:** Required (owner only)

### Get Plan Summary

**GET** `/nutrition-plans/{id}/summary`
**Auth:** Required

**Response:**

```json
{
  "success": true,
  "message": "Successfully retrieved summary",
  "data": {
    "totalCalories": 2500,
    "totalProtein": 150,
    "totalCarbs": 300,
    "totalFat": 70,
    "totalFiber": 35
  },
  "statusCode": 200
}
```

---

## Workout Schedules

### Get My Schedule

**GET** `/workout-schedules/me`
**Auth:** Required

### Get Week Schedule

**GET** `/workout-schedules/week?startDate={startDate}`
**Auth:** Required

**Query Parameters:**

- `startDate` (optional): Start date (defaults to today)

**Response:**

```json
{
  "success": true,
  "message": "Successfully retrieved week schedule",
  "data": [
    {
      "id": "uuid",
      "workoutId": "uuid",
      "workoutTitle": "Upper Body",
      "scheduledDate": "2024-12-06T10:00:00Z",
      "status": "planned"
    }
  ],
  "statusCode": 200
}
```

### Schedule Workout

**POST** `/workout-schedules`
**Auth:** Required

**Request:**

```json
{
  "workoutId": "uuid",
  "scheduledDate": "2024-12-10T10:00:00Z",
  "scheduledTime": "10:00"
}
```

### Reschedule Workout

**PUT** `/workout-schedules/{id}/reschedule`
**Auth:** Required (owner only)

**Request:**

```json
{
  "scheduledDate": "2024-12-11T10:00:00Z"
}
```

### Cancel Schedule

**DELETE** `/workout-schedules/{id}`
**Auth:** Required (owner only)

### Complete Workout

**PUT** `/workout-schedules/{id}/complete`
**Auth:** Required (owner only)

### Skip Workout

**PUT** `/workout-schedules/{id}/skip`
**Auth:** Required (owner only)

---

## Challenges

### Get All Challenges (Paginated)

**GET** `/challenges?page={page}&pageSize={pageSize}`
**Auth:** Required

**Query Parameters:**

- `page` (optional, default: 1)
- `pageSize` (optional, default: 20)

**Response:**

```json
{
  "success": true,
  "message": "Successfully retrieved challenges",
  "data": {
    "challenges": [...],
    "total": 50,
    "page": 1,
    "pageSize": 20
  },
  "statusCode": 200
}
```

### Get Challenge by ID

**GET** `/challenges/{id}`
**Auth:** Required

### Create Challenge

**POST** `/challenges`
**Auth:** Admin only

**Request:**

```json
{
  "title": "30-Day Fitness Challenge",
  "description": "Complete 30 workouts in 30 days",
  "startDate": "2024-12-01T00:00:00Z",
  "endDate": "2024-12-31T00:00:00Z",
  "rules": "Complete at least 30 minutes per workout",
  "reward": "Badge + 100 points"
}
```

### Update Challenge

**PUT** `/challenges/{id}`
**Auth:** Admin only

**Request:**

```json
{
  "title": "30-Day Fitness Challenge Updated",
  "description": "Updated description"
}
```

### Delete Challenge

**DELETE** `/challenges/{id}`
**Auth:** Admin only

### Join Challenge

**POST** `/challenges/{id}/join`
**Auth:** Required

### Leave Challenge

**POST** `/challenges/{id}/leave`
**Auth:** Required

### Get Challenge Leaderboard

**GET** `/challenges/{id}/leaderboard`
**Auth:** Required

**Response:**

```json
{
  "success": true,
  "message": "Successfully retrieved leaderboard",
  "data": [
    {
      "userId": "uuid",
      "username": "johndoe",
      "progress": 85,
      "rank": 1
    }
  ],
  "statusCode": 200
}
```

---

## Progress Tracking

### Get My Progress

**GET** `/progress/me`
**Auth:** Required

### Create Progress Entry

**POST** `/progress`
**Auth:** Required

**Request:**

```json
{
  "date": "2024-12-06T00:00:00Z",
  "weightKg": 72,
  "bodyFatPercentage": 15,
  "notes": "Feeling strong"
}
```

---

## Admin Tools

### Get All Users

**GET** `/admin/users?page={page}&pageSize={pageSize}`
**Auth:** Admin only

**Query Parameters:**

- `page` (optional, default: 1)
- `pageSize` (optional, default: 20)

**Response:**

```json
{
  "success": true,
  "message": "Successfully retrieved users",
  "data": {
    "users": [
      {
        "id": "uuid",
        "username": "johndoe",
        "email": "john@example.com",
        "role": "User",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 150,
    "page": 1,
    "pageSize": 20
  },
  "statusCode": 200
}
```

### Ban User

**PUT** `/admin/users/{id}/ban`
**Auth:** Admin only

**Response:**

```json
{
  "success": true,
  "message": "Successfully banned user",
  "data": true,
  "statusCode": 200
}
```

### Delete User

**DELETE** `/admin/users/{id}`
**Auth:** Admin only

### Get Platform Statistics

**GET** `/admin/stats`
**Auth:** Admin only

**Response:**

```json
{
  "success": true,
  "message": "Successfully retrieved platform stats",
  "data": {
    "totalUsers": 1500,
    "totalWorkouts": 5000,
    "totalChallenges": 50,
    "totalPosts": 3000
  },
  "statusCode": 200
}
```

---

## Account Management

### Update Account

**PUT** `/account`
**Auth:** Required

**Request:**

```json
{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully updated account",
  "data": {
    "id": "uuid",
    "username": "newusername",
    "email": "newemail@example.com",
    "role": "User"
  },
  "statusCode": 200
}
```

### Change Password

**PUT** `/account/password`
**Auth:** Required

**Request:**

```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

### Delete Account

**DELETE** `/account`
**Auth:** Required

---

## Pagination Pattern

All paginated endpoints follow this pattern:

**Request:**

```
GET /endpoint?page=1&pageSize=20
```

**Response:**

```json
{
  "success": true,
  "message": "Success message",
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "pageSize": 20
  },
  "statusCode": 200
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400/401/403/404/500
}
```

**Common Status Codes:**

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Summary

**Total Endpoints:** 60+

**By Category:**

- Authentication & Account: 5
- Profile: 3
- BMI & Nutrition: 3
- Food Items: 6
- Workouts: 6
- Exercise Library: 6
- Nutrition Plans: 8
- Workout Schedules: 6
- Challenges: 7
- Progress: 2
- Admin Tools: 4
- Account Management: 3

**Authorization Levels:**

- Public: 2 endpoints (Register, Login)
- User (Authenticated): 50+ endpoints
- Admin Only: 8 endpoints
