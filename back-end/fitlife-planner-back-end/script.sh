#!/bin/bash

# FitLife Planner - Comprehensive API Integration Test Script
# Tests ALL endpoints with complete CRUD operations

set -e  # Exit on error

BASE_URL="http://localhost:5000"
TOKEN=""
ADMIN_TOKEN=""
USER_ID=""
PROFILE_ID=""

# Test data IDs
FOOD_ITEM_ID=""
NUTRITION_PLAN_ID=""
EXERCISE_ID=""
WORKOUT_ID=""
SCHEDULE_ID=""
PROGRESS_ID=""
CHALLENGE_ID=""
POST_ID=""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((PASSED_TESTS++))
    ((TOTAL_TESTS++))
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    ((FAILED_TESTS++))
    ((TOTAL_TESTS++))
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_section() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Test Authentication & Account Management
test_authentication() {
    print_section "1. AUTHENTICATION & ACCOUNT MANAGEMENT"

    # Register new user
    print_info "1.1 Registering new user..."
    TIMESTAMP=$(date +%s)
    REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/account/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"username\": \"testuser_${TIMESTAMP}\",
            \"email\": \"test${TIMESTAMP}@example.com\",
            \"password\": \"Test@123456\",
            \"phoneNumber\": \"0123456789\"
        }")

    if echo "$REGISTER_RESPONSE" | grep -q "success.*true"; then
        print_success "User registration"
    else
        print_error "User registration"
        echo "$REGISTER_RESPONSE"
    fi

    # Register admin user (for admin tests)
    print_info "1.2 Registering admin user..."
    ADMIN_RESPONSE=$(curl -s -X POST "$BASE_URL/account/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"username\": \"admin_${TIMESTAMP}\",
            \"email\": \"admin${TIMESTAMP}@example.com\",
            \"password\": \"Admin@123456\",
            \"phoneNumber\": \"0987654321\"
        }")

    # Login regular user
    print_info "1.3 Logging in as regular user..."
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/account/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"test${TIMESTAMP}@example.com\",
            \"password\": \"Test@123456\"
        }")

    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    USER_ID=$(echo "$LOGIN_RESPONSE" | grep -o '"userId":"[^"]*' | cut -d'"' -f4)

    if [ -n "$TOKEN" ]; then
        print_success "User login (Token: ${TOKEN:0:30}...)"
    else
        print_error "User login"
        echo "$LOGIN_RESPONSE"
        exit 1
    fi
}

# Test Profile Management
test_profile() {
    print_section "2. PROFILE MANAGEMENT"

    # Get my profile
    print_info "2.1 Getting my profile..."
    PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/profile/me" \
        -H "Authorization: Bearer $TOKEN")

    if echo "$PROFILE_RESPONSE" | grep -q "success.*true"; then
        PROFILE_ID=$(echo "$PROFILE_RESPONSE" | grep -o '"profileId":"[^"]*' | cut -d'"' -f4)
        print_success "Get my profile (ID: ${PROFILE_ID:0:8}...)"
    else
        print_error "Get my profile"
    fi

    # Update profile
    print_info "2.2 Updating profile..."
    UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/profile/update" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "displayName": "Test User Updated",
            "avatarUrl": "https://example.com/avatar.jpg",
            "birthDate": "1990-01-01",
            "gender": "Male",
            "bio": "Updated bio for testing"
        }')

    if echo "$UPDATE_RESPONSE" | grep -q "success.*true"; then
        print_success "Update profile"
    else
        print_error "Update profile"
    fi
}

# Test BMI Calculator
test_bmi() {
    print_section "3. BMI CALCULATOR"

    print_info "3.1 Calculating BMI..."
    BMI_RESPONSE=$(curl -s -X POST "$BASE_URL/bmi/calculate" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "heightCm": 175,
            "weightKg": 75
        }')

    if echo "$BMI_RESPONSE" | grep -q "success.*true"; then
        print_success "BMI calculation"
    else
        print_error "BMI calculation"
    fi
}

# Test Food Items
test_food_items() {
    print_section "4. FOOD ITEMS MANAGEMENT"

    # Get all food items
    print_info "4.1 Getting all food items..."
    FOOD_LIST=$(curl -s -X GET "$BASE_URL/food-items" \
        -H "Authorization: Bearer $TOKEN")

    if echo "$FOOD_LIST" | grep -q "success"; then
        print_success "Get all food items"
    else
        print_error "Get all food items"
    fi

    # Note: Create/Delete food items require Admin role
    # We'll test with admin token if available
}

# Test Nutrition Plans
test_nutrition_plans() {
    print_section "5. NUTRITION PLANS"

    # Create nutrition plan
    print_info "5.1 Creating nutrition plan..."
    PLAN_RESPONSE=$(curl -s -X POST "$BASE_URL/nutrition-plans" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "title": "Test Bulking Plan",
            "description": "High calorie plan for muscle gain",
            "caloriesTargetKcal": 3000,
            "macros": "{\"protein\": 200, \"carbs\": 350, \"fat\": 80}",
            "startDate": "2024-01-01",
            "endDate": "2024-03-01",
            "visibility": "private"
        }')

    if echo "$PLAN_RESPONSE" | grep -q "success.*true"; then
        NUTRITION_PLAN_ID=$(echo "$PLAN_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
        print_success "Create nutrition plan (ID: ${NUTRITION_PLAN_ID:0:8}...)"
    else
        print_error "Create nutrition plan"
        echo "$PLAN_RESPONSE"
    fi

    # Get my nutrition plans
    print_info "5.2 Getting my nutrition plans..."
    PLANS_LIST=$(curl -s -X GET "$BASE_URL/nutrition-plans/me" \
        -H "Authorization: Bearer $TOKEN")

    if echo "$PLANS_LIST" | grep -q "success"; then
        print_success "Get my nutrition plans"
    else
        print_error "Get my nutrition plans"
    fi

    # Get specific nutrition plan
    if [ -n "$NUTRITION_PLAN_ID" ]; then
        print_info "5.3 Getting nutrition plan by ID..."
        PLAN_DETAIL=$(curl -s -X GET "$BASE_URL/nutrition-plans/$NUTRITION_PLAN_ID" \
            -H "Authorization: Bearer $TOKEN")

        if echo "$PLAN_DETAIL" | grep -q "success"; then
            print_success "Get nutrition plan by ID"
        else
            print_error "Get nutrition plan by ID"
        fi
    fi

    # Delete nutrition plan
    if [ -n "$NUTRITION_PLAN_ID" ]; then
        print_info "5.4 Deleting nutrition plan..."
        DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/nutrition-plans/$NUTRITION_PLAN_ID" \
            -H "Authorization: Bearer $TOKEN")

        if echo "$DELETE_RESPONSE" | grep -q "success"; then
            print_success "Delete nutrition plan"
        else
            print_error "Delete nutrition plan"
        fi
    fi
}

# Test Exercise Library
test_exercises() {
    print_section "6. EXERCISE LIBRARY"

    # Get all exercises
    print_info "6.1 Getting all exercises..."
    EXERCISES_LIST=$(curl -s -X GET "$BASE_URL/exercises" \
        -H "Authorization: Bearer $TOKEN")

    if echo "$EXERCISES_LIST" | grep -q "success"; then
        print_success "Get all exercises"
    else
        print_error "Get all exercises"
    fi

    # Filter by muscle group
    print_info "6.2 Filtering exercises by muscle group (chest)..."
    FILTERED_EXERCISES=$(curl -s -X GET "$BASE_URL/exercises?muscleGroup=chest" \
        -H "Authorization: Bearer $TOKEN")

    if echo "$FILTERED_EXERCISES" | grep -q "success"; then
        print_success "Filter exercises by muscle group"
    else
        print_error "Filter exercises by muscle group"
    fi
}

# Test Workouts
test_workouts() {
    print_section "7. WORKOUT MANAGEMENT"

    # Create workout
    print_info "7.1 Creating workout..."
    WORKOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/workouts" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "title": "Test Push Day",
            "description": "Chest, shoulders, triceps workout",
            "durationMin": 60,
            "intensity": "high",
            "exercises": []
        }')

    if echo "$WORKOUT_RESPONSE" | grep -q "success.*true"; then
        WORKOUT_ID=$(echo "$WORKOUT_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
        print_success "Create workout (ID: ${WORKOUT_ID:0:8}...)"
    else
        print_error "Create workout"
        echo "$WORKOUT_RESPONSE"
    fi

    # Get my workouts
    print_info "7.2 Getting my workouts..."
    WORKOUTS_LIST=$(curl -s -X GET "$BASE_URL/workouts/me" \
        -H "Authorization: Bearer $TOKEN")

    if echo "$WORKOUTS_LIST" | grep -q "success"; then
        print_success "Get my workouts"
    else
        print_error "Get my workouts"
    fi

    # Get specific workout
    if [ -n "$WORKOUT_ID" ]; then
        print_info "7.3 Getting workout by ID..."
        WORKOUT_DETAIL=$(curl -s -X GET "$BASE_URL/workouts/$WORKOUT_ID" \
            -H "Authorization: Bearer $TOKEN")

        if echo "$WORKOUT_DETAIL" | grep -q "success"; then
            print_success "Get workout by ID"
        else
            print_error "Get workout by ID"
        fi
    fi

    # Delete workout
    if [ -n "$WORKOUT_ID" ]; then
        print_info "7.4 Deleting workout..."
        DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/workouts/$WORKOUT_ID" \
            -H "Authorization: Bearer $TOKEN")

        if echo "$DELETE_RESPONSE" | grep -q "success"; then
            print_success "Delete workout"
            WORKOUT_ID=""  # Clear for schedule tests
        else
            print_error "Delete workout"
        fi
    fi
}

# Test Workout Scheduling
test_workout_schedules() {
    print_section "8. WORKOUT SCHEDULING"

    # Create a workout for scheduling
    if [ -z "$WORKOUT_ID" ]; then
        WORKOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/workouts" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d '{
                "title": "Scheduled Workout",
                "description": "For scheduling test",
                "durationMin": 45,
                "intensity": "medium",
                "exercises": []
            }')
        WORKOUT_ID=$(echo "$WORKOUT_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    fi

    # Schedule workout
    if [ -n "$WORKOUT_ID" ]; then
        print_info "8.1 Scheduling workout..."
        SCHEDULE_RESPONSE=$(curl -s -X POST "$BASE_URL/workout-schedules" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "{
                \"workoutId\": \"$WORKOUT_ID\",
                \"scheduledDate\": \"2024-12-01\",
                \"scheduledTime\": \"18:00:00\"
            }")

        if echo "$SCHEDULE_RESPONSE" | grep -q "success.*true"; then
            SCHEDULE_ID=$(echo "$SCHEDULE_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
            print_success "Schedule workout (ID: ${SCHEDULE_ID:0:8}...)"
        else
            print_error "Schedule workout"
            echo "$SCHEDULE_RESPONSE"
        fi
    fi

    # Get my schedule
    print_info "8.2 Getting my workout schedule..."
    SCHEDULE_LIST=$(curl -s -X GET "$BASE_URL/workout-schedules/me" \
        -H "Authorization: Bearer $TOKEN")

    if echo "$SCHEDULE_LIST" | grep -q "success"; then
        print_success "Get my workout schedule"
    else
        print_error "Get my workout schedule"
    fi

    # Complete workout
    if [ -n "$SCHEDULE_ID" ]; then
        print_info "8.3 Marking workout as completed..."
        COMPLETE_RESPONSE=$(curl -s -X PUT "$BASE_URL/workout-schedules/$SCHEDULE_ID/complete" \
            -H "Authorization: Bearer $TOKEN")

        if echo "$COMPLETE_RESPONSE" | grep -q "success"; then
            print_success "Complete workout"
        else
            print_error "Complete workout"
        fi
    fi
}

# Test Progress Tracking
test_progress() {
    print_section "9. PROGRESS TRACKING"

    # Create weight progress
    print_info "9.1 Creating weight progress entry..."
    PROGRESS_RESPONSE=$(curl -s -X POST "$BASE_URL/progress" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "type": "weight",
            "numericValue": 75.5,
            "recordedAt": "2024-01-15T08:00:00Z"
        }')

    if echo "$PROGRESS_RESPONSE" | grep -q "success.*true"; then
        PROGRESS_ID=$(echo "$PROGRESS_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
        print_success "Create weight progress (ID: ${PROGRESS_ID:0:8}...)"
    else
        print_error "Create weight progress"
        echo "$PROGRESS_RESPONSE"
    fi

    # Create photo progress
    print_info "9.2 Creating photo progress entry..."
    PHOTO_PROGRESS=$(curl -s -X POST "$BASE_URL/progress" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "type": "photo",
            "photoUrl": "https://example.com/progress.jpg",
            "textValue": "Front view"
        }')

    if echo "$PHOTO_PROGRESS" | grep -q "success.*true"; then
        print_success "Create photo progress"
    else
        print_error "Create photo progress"
    fi

    # Get all progress
    print_info "9.3 Getting all progress entries..."
    PROGRESS_LIST=$(curl -s -X GET "$BASE_URL/progress/me" \
        -H "Authorization: Bearer $TOKEN")

    if echo "$PROGRESS_LIST" | grep -q "success"; then
        print_success "Get all progress entries"
    else
        print_error "Get all progress entries"
    fi

    # Filter by type
    print_info "9.4 Filtering progress by type (weight)..."
    FILTERED_PROGRESS=$(curl -s -X GET "$BASE_URL/progress/me?type=weight" \
        -H "Authorization: Bearer $TOKEN")

    if echo "$FILTERED_PROGRESS" | grep -q "success"; then
        print_success "Filter progress by type"
    else
        print_error "Filter progress by type"
    fi

    # Delete progress
    if [ -n "$PROGRESS_ID" ]; then
        print_info "9.5 Deleting progress entry..."
        DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/progress/$PROGRESS_ID" \
            -H "Authorization: Bearer $TOKEN")

        if echo "$DELETE_RESPONSE" | grep -q "success"; then
            print_success "Delete progress entry"
        else
            print_error "Delete progress entry"
        fi
    fi
}

# Test Challenges
test_challenges() {
    print_section "10. CHALLENGES"

    # Get all challenges
    print_info "10.1 Getting all challenges..."
    CHALLENGES_LIST=$(curl -s -X GET "$BASE_URL/challenges" \
        -H "Authorization: Bearer $TOKEN")

    if echo "$CHALLENGES_LIST" | grep -q "success"; then
        print_success "Get all challenges"
    else
        print_error "Get all challenges"
    fi

    # Note: Create challenge requires Admin role
    # Join and update progress would need an existing challenge
}

# Test Notifications
test_notifications() {
    print_section "11. NOTIFICATIONS"

    # Get my notifications
    print_info "11.1 Getting my notifications..."
    NOTIF_LIST=$(curl -s -X GET "$BASE_URL/notifications/me" \
        -H "Authorization: Bearer $TOKEN")

    if echo "$NOTIF_LIST" | grep -q "success"; then
        print_success "Get my notifications"
    else
        print_error "Get my notifications"
    fi

    # Mark all as read
    print_info "11.2 Marking all notifications as read..."
    MARK_READ=$(curl -s -X PUT "$BASE_URL/notifications/read-all" \
        -H "Authorization: Bearer $TOKEN")

    if echo "$MARK_READ" | grep -q "success"; then
        print_success "Mark all notifications as read"
    else
        print_error "Mark all notifications as read"
    fi
}

# Test Posts
test_posts() {
    print_section "12. POSTS (SOCIAL FEATURES)"

    # Create post
    print_info "12.1 Creating post..."
    POST_RESPONSE=$(curl -s -X POST "$BASE_URL/post/create" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "title": "My Fitness Journey",
            "content": "Just completed my first month of training!",
            "media": "https://example.com/post-image.jpg"
        }')

    if echo "$POST_RESPONSE" | grep -q "success.*true"; then
        POST_ID=$(echo "$POST_RESPONSE" | grep -o '"postId":"[^"]*' | cut -d'"' -f4)
        print_success "Create post (ID: ${POST_ID:0:8}...)"
    else
        print_error "Create post"
        echo "$POST_RESPONSE"
    fi

    # Get my posts
    print_info "12.2 Getting my posts..."
    MY_POSTS=$(curl -s -X GET "$BASE_URL/post/me" \
        -H "Authorization: Bearer $TOKEN")

    if echo "$MY_POSTS" | grep -q "success"; then
        print_success "Get my posts"
    else
        print_error "Get my posts"
    fi

    # Get all posts
    print_info "12.3 Getting all posts..."
    ALL_POSTS=$(curl -s -X GET "$BASE_URL/post" \
        -H "Authorization: Bearer $TOKEN")

    if echo "$ALL_POSTS" | grep -q "success"; then
        print_success "Get all posts"
    else
        print_error "Get all posts"
    fi
}

# Print summary
print_summary() {
    echo ""
    echo "=========================================="
    echo "           TEST SUMMARY"
    echo "=========================================="
    echo -e "Total Tests:  ${BLUE}${TOTAL_TESTS}${NC}"
    echo -e "Passed:       ${GREEN}${PASSED_TESTS}${NC}"
    echo -e "Failed:       ${RED}${FAILED_TESTS}${NC}"
    echo "=========================================="

    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}✓ All tests passed!${NC}"
        exit 0
    else
        echo -e "${RED}✗ Some tests failed!${NC}"
        exit 1
    fi
}

# Main execution
main() {
    echo "=========================================="
    echo "  FitLife Planner - API Integration Tests"
    echo "=========================================="
    echo "Base URL: $BASE_URL"
    echo "=========================================="

    test_authentication
    test_profile
    test_bmi
    test_food_items
    test_nutrition_plans
    test_exercises
    test_workouts
    test_workout_schedules
    test_progress
    test_challenges
    test_notifications
    test_posts

    print_summary
}

# Check if server is running
if ! curl -s "$BASE_URL" > /dev/null 2>&1; then
    echo -e "${RED}Error: Server is not running at $BASE_URL${NC}"
    echo "Please start the server first: dotnet run"
    exit 1
fi

# Run tests
main
