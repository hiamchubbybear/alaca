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

### 1. Register

**POST** `/account/register`

**Request:**

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "phoneNumber": "0123456789"
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

---

### 2. Login

**POST** `/account/login`

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
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "userId": "uuid",
    "profileId": "uuid",
    "email": "john@example.com",
    "role": "User"
  },
  "statusCode": 200
}
```

**Save the `accessToken` for subsequent requests!**

---

## Profile Management

### 3. Get My Profile

**GET** `/profile/me`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "profileId": "uuid",
    "userId": "uuid",
    "displayName": "John Doe",
    "avatarUrl": "https://...",
    "birthDate": "1990-01-01T00:00:00Z",
    "gender": "Male",
    "bio": "Fitness enthusiast"
  }
}
```

---

### 4. Update Profile

**PUT** `/profile/update`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Request:**

```json
{
  "displayName": "John Doe Updated",
  "avatarUrl": "https://new-avatar.jpg",
  "birthDate": "1990-01-01",
  "gender": "Male",
  "bio": "Updated bio"
}
```

---

## Food Items & Nutrition

### 5. Get All Food Items

**GET** `/food-items`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Chicken Breast",
      "servingSize": "100g",
      "servingAmount": 1,
      "caloriesKcal": 165,
      "proteinG": 31,
      "carbsG": 0,
      "fatG": 3.6,
      "fiberG": 0,
      "sodiumMg": 74,
      "micronutrients": "{...}",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### 6. Create Food Item (Admin Only)

**POST** `/food-items`

**Headers:**

```
Authorization: Bearer {admin_access_token}
```

**Request:**

```json
{
  "name": "Banana",
  "servingSize": "1 medium",
  "servingAmount": 1,
  "caloriesKcal": 105,
  "proteinG": 1.3,
  "carbsG": 27,
  "fatG": 0.4,
  "fiberG": 3.1,
  "sodiumMg": 1,
  "micronutrients": "{\"potassium\": 422}"
}
```

---

### 7. Get My Nutrition Plans

**GET** `/nutrition-plans/me`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "ownerUserId": "uuid",
      "title": "Bulking Plan",
      "description": "High calorie plan for muscle gain",
      "caloriesTargetKcal": 3000,
      "macros": "{\"protein\": 200, \"carbs\": 350, \"fat\": 80}",
      "startDate": "2024-01-01",
      "endDate": "2024-03-01",
      "visibility": "private",
      "createdAt": "2024-01-01T00:00:00Z",
      "items": [
        {
          "id": "uuid",
          "mealTime": "breakfast",
          "foodItemId": "uuid",
          "foodItemName": "Oatmeal",
          "servingCount": 2,
          "notes": "With milk"
        }
      ]
    }
  ]
}
```

---

### 8. Create Nutrition Plan

**POST** `/nutrition-plans`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Request:**

```json
{
  "title": "My Cutting Plan",
  "description": "Low calorie plan for fat loss",
  "caloriesTargetKcal": 2000,
  "macros": "{\"protein\": 150, \"carbs\": 150, \"fat\": 60}",
  "startDate": "2024-01-01",
  "endDate": "2024-03-01",
  "visibility": "private"
}
```

---

### 9. Add Item to Nutrition Plan

**POST** `/nutrition-plans/{planId}/items`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Request:**

```json
{
  "mealTime": "breakfast",
  "foodItemId": "uuid",
  "servingCount": 2,
  "notes": "With almond milk"
}
```

---

## Exercise Library

### 10. Get All Exercises

**GET** `/exercises`

**Query Parameters:**

- `muscleGroup` (optional): Filter by muscle group (e.g., "chest", "back", "legs")

**Headers:**

```
Authorization: Bearer {access_token}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Bench Press",
      "description": "Compound chest exercise",
      "primaryMuscle": "chest",
      "secondaryMuscles": "triceps,shoulders",
      "equipment": "barbell,bench",
      "difficulty": "intermediate",
      "videoUrl": "https://...",
      "images": "[\"url1\", \"url2\"]",
      "tags": ["compound", "strength"],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### 11. Create Exercise (Admin Only)

**POST** `/exercises`

**Headers:**

```
Authorization: Bearer {admin_access_token}
```

**Request:**

```json
{
  "title": "Squat",
  "description": "Compound leg exercise",
  "primaryMuscle": "legs",
  "secondaryMuscles": "glutes,core",
  "equipment": "barbell,rack",
  "difficulty": "intermediate",
  "videoUrl": "https://youtube.com/...",
  "images": "[\"url1\"]",
  "tags": ["compound", "strength", "legs"]
}
```

---

## Workouts

### 12. Get My Workouts

**GET** `/workouts/me`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "ownerUserId": "uuid",
      "title": "Push Day",
      "description": "Chest, shoulders, triceps",
      "durationMin": 60,
      "intensity": "high",
      "createdAt": "2024-01-01T00:00:00Z",
      "exercises": [
        {
          "id": "uuid",
          "exerciseId": "uuid",
          "exerciseTitle": "Bench Press",
          "orderIndex": 1,
          "sets": 4,
          "reps": "8-10",
          "restSeconds": 90,
          "tempo": "2-0-2-0",
          "notes": "Focus on form"
        }
      ]
    }
  ]
}
```

---

### 13. Create Workout

**POST** `/workouts`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Request:**

```json
{
  "title": "Pull Day",
  "description": "Back and biceps workout",
  "durationMin": 60,
  "intensity": "medium",
  "exercises": [
    {
      "exerciseId": "uuid",
      "orderIndex": 1,
      "sets": 4,
      "reps": "8-12",
      "restSeconds": 60,
      "tempo": "2-1-2-0",
      "notes": "Pull-ups to failure"
    }
  ]
}
```

---

## Workout Scheduling

### 14. Get My Schedule

**GET** `/workout-schedules/me`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "workoutId": "uuid",
      "workoutTitle": "Push Day",
      "scheduledDate": "2024-01-15",
      "scheduledTime": "18:00:00",
      "status": "planned",
      "completedAt": null
    }
  ]
}
```

---

### 15. Schedule Workout

**POST** `/workout-schedules`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Request:**

```json
{
  "workoutId": "uuid",
  "scheduledDate": "2024-01-15",
  "scheduledTime": "18:00:00"
}
```

---

### 16. Complete Workout

**PUT** `/workout-schedules/{scheduleId}/complete`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "completed",
    "completedAt": "2024-01-15T18:45:00Z"
  }
}
```

---

## Progress Tracking

### 17. Get My Progress

**GET** `/progress/me`

**Query Parameters:**

- `type` (optional): Filter by type ("weight", "bmi", "photo", "measurements", "notes")

**Headers:**

```
Authorization: Bearer {access_token}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "weight",
      "recordedAt": "2024-01-15T08:00:00Z",
      "numericValue": 75.5,
      "textValue": null,
      "photoUrl": null,
      "createdAt": "2024-01-15T08:00:00Z"
    }
  ]
}
```

---

### 18. Create Progress Entry

**POST** `/progress`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Request (Weight):**

```json
{
  "type": "weight",
  "numericValue": 75.5,
  "recordedAt": "2024-01-15T08:00:00Z"
}
```

**Request (Photo):**

```json
{
  "type": "photo",
  "photoUrl": "https://storage.../progress-photo.jpg",
  "textValue": "Front view"
}
```

---

## Challenges

### 19. Get All Challenges

**GET** `/challenges`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "30-Day Plank Challenge",
      "description": "Increase plank time daily",
      "startDate": "2024-01-01",
      "endDate": "2024-01-30",
      "createdBy": "uuid",
      "strike": 0,
      "rules": "{\"dailyGoal\": \"60 seconds\"}",
      "reward": "{\"badge\": \"Plank Master\"}",
      "participantCount": 150,
      "isParticipating": false,
      "createdAt": "2023-12-25T00:00:00Z"
    }
  ]
}
```

---

### 20. Join Challenge

**POST** `/challenges/{challengeId}/join`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Response:**

```json
{
  "success": true,
  "data": true,
  "message": "Successfully joined challenge"
}
```

---

### 21. Update Challenge Progress

**PUT** `/challenges/{challengeId}/progress`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Request:**

```json
{
  "progress": "{\"day\": 5, \"completed\": true, \"time\": 65}"
}
```

---

## Notifications

### 22. Get My Notifications

**GET** `/notifications/me`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Workout Reminder",
      "body": "Time for your Push Day workout!",
      "type": "workout_reminder",
      "data": "{\"workoutId\": \"uuid\"}",
      "isRead": false,
      "createdAt": "2024-01-15T17:45:00Z",
      "readAt": null
    }
  ]
}
```

---

### 23. Mark Notification as Read

**PUT** `/notifications/{notificationId}/read`

**Headers:**

```
Authorization: Bearer {access_token}
```

---

### 24. Mark All Notifications as Read

**PUT** `/notifications/read-all`

**Headers:**

```
Authorization: Bearer {access_token}
```

---

## Posts (Social Features)

### 25. Get All Posts

**GET** `/post/all`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Query Parameters:**

- `pageNumber` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 10)

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "postId": "uuid",
        "profileId": "uuid",
        "userId": "uuid",
        "username": "johndoe",
        "avatarUrl": "https://...",
        "title": "My Fitness Journey",
        "content": "Just completed my first month!",
        "media": "https://storage.../post-image.jpg",
        "likeCount": 15,
        "upvoteCount": 25,
        "downvoteCount": 3,
        "commentCount": 8,
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalPages": 5,
    "totalCount": 50
  }
}
```

---

### 26. Get My Posts

**GET** `/post`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Response:** Same format as Get All Posts

---

### 27. Create Post

**POST** `/post`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Request:**

```json
{
  "title": "My Fitness Journey",
  "content": "Just completed my first month!",
  "media": "https://storage.../post-image.jpg"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully created Post",
  "data": {
    "postId": "uuid",
    "profileId": "uuid",
    "title": "My Fitness Journey",
    "content": "Just completed my first month!",
    "media": "https://storage.../post-image.jpg",
    "likeCount": 0,
    "commentCount": 0,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  },
  "statusCode": 201
}
```

---

### 28. Vote on Post (Upvote/Downvote)

**POST** `/post/{postId}/vote`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Request:**

```json
{
  "voteType": 1
}
```

**Vote Types:**

- `1` = Upvote
- `-1` = Downvote

**Response:**

```json
{
  "success": true,
  "message": "Successfully voted on post",
  "data": true,
  "statusCode": 200
}
```

**Notes:**

- If user already voted with the same type, nothing happens
- If user voted with different type, the vote is updated
- Vote counts are automatically updated

---

### 29. Remove Vote from Post

**DELETE** `/post/{postId}/vote`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully removed vote",
  "data": true,
  "statusCode": 200
}
```

---

### 30. Delete Post

**DELETE** `/post/{postId}`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully delete Post",
  "data": true,
  "statusCode": 200
}
```

---

## Admin Endpoints

### 31. Create Admin Account

**POST** `/account/admin`

**CORS Restriction:** Only accessible from localhost (ports 3000, 5173, 5174)

**Request:**

```json
{
  "username": "admin",
  "email": "admin@fitlife.com",
  "password": "SecureAdminPass@123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully created admin user",
  "data": {
    "username": "admin",
    "email": "admin@fitlife.com",
    "password": "SecureAdminPass@123"
  },
  "statusCode": 201
}
```

**Notes:**

- This endpoint is protected by CORS policy "AdminOnly"
- Can only be accessed from whitelisted origins
- Creates user with Admin role

---

## BMI Calculator

### 27. Calculate BMI

**POST** `/bmi/calculate`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Request:**

```json
{
  "heightCm": 175,
  "weightKg": 75
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "bmi": 24.49,
    "assessment": "Normal weight",
    "heightCm": 175,
    "weightKg": 75
  }
}
```

---

## Error Responses

All endpoints may return error responses in this format:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

**Common Status Codes:**

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication Flow for Frontend

1. **Register or Login** to get `accessToken`
2. **Store token** in localStorage/sessionStorage:
   ```javascript
   localStorage.setItem("accessToken", response.data.accessToken);
   ```
3. **Include token** in all subsequent requests:
   ```javascript
   headers: {
     'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
     'Content-Type': 'application/json'
   }
   ```
4. **Handle 401 errors** by redirecting to login page

---

## Example Frontend Integration (JavaScript/Axios)

```javascript
// Configure axios instance
const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Usage examples
async function login(email, password) {
  const response = await api.post("/account/login", { email, password });
  localStorage.setItem("accessToken", response.data.data.accessToken);
  return response.data;
}

async function getMyWorkouts() {
  const response = await api.get("/workouts/me");
  return response.data.data;
}

async function createWorkout(workoutData) {
  const response = await api.post("/workouts", workoutData);
  return response.data.data;
}
```

---

## Social Features - Followers

### 28. Follow a User

**POST** `/api/followers/{userId}/follow`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Path Parameters:**

- `userId` - UUID of the user to follow

**Response:**

```json
{
  "success": true,
  "message": "Successfully followed user",
  "data": true,
  "statusCode": 200
}
```

**Error Cases:**

- `400` - Cannot follow yourself
- `404` - User not found
- Already following returns `data: false`

---

### 29. Unfollow a User

**DELETE** `/api/followers/{userId}/unfollow`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Path Parameters:**

- `userId` - UUID of the user to unfollow

**Response:**

```json
{
  "success": true,
  "message": "Successfully unfollowed user",
  "data": true,
  "statusCode": 200
}
```

---

### 30. Get Followers List

**GET** `/api/followers/followers`

Get list of users who follow you (or specified user).

**Headers:**

```
Authorization: Bearer {access_token}
```

**Query Parameters:**

- `userId` (optional) - Get followers of specific user (defaults to current user)
- `page` (optional, default: 1) - Page number
- `pageSize` (optional, default: 20) - Items per page

**Response:**

```json
{
  "success": true,
  "message": "Successfully retrieved followers",
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "followerId": "uuid",
      "username": "johndoe",
      "displayName": "John Doe",
      "avatarUrl": "https://...",
      "followedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "statusCode": 200
}
```

---

### 31. Get Following List

**GET** `/api/followers/following`

Get list of users that you (or specified user) follow.

**Headers:**

```
Authorization: Bearer {access_token}
```

**Query Parameters:**

- `userId` (optional) - Get following list of specific user (defaults to current user)
- `page` (optional, default: 1)
- `pageSize` (optional, default: 20)

**Response:**

```json
{
  "success": true,
  "message": "Successfully retrieved following list",
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "followerId": "uuid",
      "username": "janedoe",
      "displayName": "Jane Doe",
      "avatarUrl": "https://...",
      "followedAt": "2024-01-10T14:20:00Z"
    }
  ],
  "statusCode": 200
}
```

---

### 32. Get Follower Statistics

**GET** `/api/followers/stats`

Get follower/following counts and relationship status.

**Headers:**

```
Authorization: Bearer {access_token}
```

**Query Parameters:**

- `userId` (optional) - Get stats for specific user (defaults to current user)

**Response:**

```json
{
  "success": true,
  "message": "Successfully retrieved follower stats",
  "data": {
    "followersCount": 150,
    "followingCount": 75,
    "isFollowing": true,
    "isFollowedBy": false
  },
  "statusCode": 200
}
```

**Fields:**

- `followersCount` - Number of followers
- `followingCount` - Number of users being followed
- `isFollowing` - Whether current user follows the target user
- `isFollowedBy` - Whether target user follows current user

---

### 33. Get Mutual Followers

**GET** `/api/followers/{userId}/mutual`

Get users that both you and the target user follow.

**Headers:**

```
Authorization: Bearer {access_token}
```

**Path Parameters:**

- `userId` - UUID of the user to compare with

**Response:**

```json
{
  "success": true,
  "message": "Successfully retrieved mutual followers",
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "followerId": "uuid",
      "username": "mutualfriend",
      "displayName": "Mutual Friend",
      "avatarUrl": "https://...",
      "followedAt": "2024-01-05T09:15:00Z"
    }
  ],
  "statusCode": 200
}
```

---

### 34. Get Follow Suggestions

**GET** `/api/followers/suggestions`

Get smart follow suggestions based on mutual connections and popularity.

**Headers:**

```
Authorization: Bearer {access_token}
```

**Query Parameters:**

- `limit` (optional, default: 10) - Number of suggestions to return

**Response:**

```json
{
  "success": true,
  "message": "Successfully retrieved follow suggestions",
  "data": [
    {
      "userId": "uuid",
      "username": "fitnessguru",
      "displayName": "Fitness Guru",
      "avatarUrl": "https://...",
      "mutualFollowersCount": 5,
      "suggestionReason": "Followed by 5 people you follow"
    },
    {
      "userId": "uuid",
      "username": "gymrat",
      "displayName": "Gym Rat",
      "avatarUrl": "https://...",
      "mutualFollowersCount": 0,
      "suggestionReason": "Popular in community (250 followers)"
    }
  ],
  "statusCode": 200
}
```

**Algorithm:**

- Prioritizes users followed by people you follow (friends-of-friends)
- Falls back to popular users if not enough suggestions
- Excludes users you already follow

---

## Frontend Integration Examples - Followers

### Follow/Unfollow Button Component

```javascript
async function toggleFollow(userId, isFollowing) {
  try {
    if (isFollowing) {
      await api.delete(`/api/followers/${userId}/unfollow`);
      return false; // Now unfollowed
    } else {
      await api.post(`/api/followers/${userId}/follow`);
      return true; // Now following
    }
  } catch (error) {
    console.error("Follow/unfollow error:", error);
    throw error;
  }
}
```

### Get User Profile with Stats

```javascript
async function getUserProfile(userId) {
  const [profile, stats] = await Promise.all([
    api.get(`/profile/${userId}`),
    api.get(`/api/followers/stats?userId=${userId}`),
  ]);

  return {
    ...profile.data.data,
    ...stats.data.data,
  };
}
```

### Load Follow Suggestions

```javascript
async function loadFollowSuggestions() {
  const response = await api.get("/api/followers/suggestions?limit=10");
  return response.data.data;
}
```

---

## Notes for Frontend Developers

1. **All dates** are in ISO 8601 format (e.g., `2024-01-15T08:00:00Z`)
2. **All IDs** are UUIDs (e.g., `550e8400-e29b-41d4-a716-446655440000`)
3. **JSON fields** (like `macros`, `rules`, `data`) are stored as strings - parse them:
   ```javascript
   const macros = JSON.parse(nutritionPlan.macros);
   ```
4. **Pagination** is available on some endpoints (check specific endpoint docs)
5. **File uploads** should be handled separately (upload to storage, then save URL)
6. **Admin endpoints** require `Role: "Admin"` in the JWT token

---

## Testing with cURL

```bash
# Login
curl -X POST http://localhost:5000/account/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123"}'

# Get workouts (replace TOKEN)
curl -X GET http://localhost:5000/workouts/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Support

For issues or questions, contact the backend team or check the API logs.
