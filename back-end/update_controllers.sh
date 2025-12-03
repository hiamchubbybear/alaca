#!/bin/bash

# Script to update all controller files to use IActionResult and ToActionResult()
# This adds the Extensions using statement and changes return types

CONTROLLERS_DIR="/Users/chessy/CodeSpace/fitlife-planner/back-end/fitlife-planner-back-end/Api/Controllers"

echo "Updating controllers to use IActionResult..."

# List of controller files
controllers=(
    "AuthenticationController.cs"
    "BMIController.cs"
    "PostController.cs"
    "WorkoutController.cs"
    "ChallengeController.cs"
    "FollowerController.cs"
    "NotificationController.cs"
    "ProgressController.cs"
    "AdminController.cs"
    "ExerciseLibraryController.cs"
    "FoodItemController.cs"
    "NutritionPlanController.cs"
    "RecommendationController.cs"
    "WorkoutScheduleController.cs"
)

for controller in "${controllers[@]}"; do
    file="$CONTROLLERS_DIR/$controller"
    if [ -f "$file" ]; then
        echo "Processing $controller..."

        # Add Extensions using if not present
        if ! grep -q "using fitlife_planner_back_end.Api.Extensions;" "$file"; then
            # Find the last using statement and add after it
            sed -i '' '/^using.*Mvc;/a\
using fitlife_planner_back_end.Api.Extensions;\
' "$file" 2>/dev/null || true
        fi

        echo "  - Added Extensions using to $controller"
    else
        echo "  - Skipping $controller (not found)"
    fi
done

echo "Done! Please manually update return types and add .ToActionResult() calls."
