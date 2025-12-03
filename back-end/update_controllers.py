#!/usr/bin/env python3
"""
Script to automatically update controller methods to use IActionResult and ToActionResult()
"""

import re
import os

CONTROLLERS_DIR = "/Users/chessy/CodeSpace/fitlife-planner/back-end/fitlife-planner-back-end/Api/Controllers"

# Controllers to update (excluding already updated ones)
CONTROLLERS = [
    "PostController.cs",
    "BMIController.cs",
    "WorkoutController.cs",
    "ChallengeController.cs",
    "FollowerController.cs",
    "NotificationController.cs",
    "ProgressController.cs",
    "AdminController.cs",
    "ExerciseLibraryController.cs",
    "FoodItemController.cs",
    "NutritionPlanController.cs",
    "RecommendationController.cs",
    "WorkoutScheduleController.cs"
]

def update_controller(filepath):
    """Update a single controller file"""
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content

    # Pattern 1: Change return type from Task<ApiResponse<T>> to Task<IActionResult>
    content = re.sub(
        r'public async Task<ApiResponse<([^>]+(?:<[^>]+>)?)>> ',
        r'public async Task<IActionResult> ',
        content
    )

    # Pattern 2: Change direct returns to use ToActionResult()
    # Match: return new ApiResponse<...>(...);
    # Replace with: var response = new ApiResponse<...>(...); return response.ToActionResult();

    def replace_return(match):
        indent = match.group(1)
        api_response = match.group(2)
        # Check if this is already wrapped
        if 'ToActionResult()' in api_response:
            return match.group(0)
        return f'{indent}var response = {api_response};\n{indent}return response.ToActionResult();'

    content = re.sub(
        r'(\s+)return (new ApiResponse<[^;]+\);)',
        replace_return,
        content
    )

    # Only write if changed
    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        return True
    return False

def main():
    updated_count = 0
    for controller in CONTROLLERS:
        filepath = os.path.join(CONTROLLERS_DIR, controller)
        if os.path.exists(filepath):
            print(f"Processing {controller}...")
            if update_controller(filepath):
                updated_count += 1
                print(f"  ✓ Updated {controller}")
            else:
                print(f"  - No changes needed for {controller}")
        else:
            print(f"  ✗ File not found: {controller}")

    print(f"\nCompleted! Updated {updated_count} controllers.")

if __name__ == "__main__":
    main()
