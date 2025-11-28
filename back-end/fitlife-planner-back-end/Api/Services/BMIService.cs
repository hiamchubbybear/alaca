using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Interface;
using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Api.Util;

namespace fitlife_planner_back_end.Application.Services;

public class BMIService
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<BMIService> _logger;
    private readonly IUserContext _userContext;

    private static readonly List<BmiPlanRange> _plans = new()
    {
        new()
        {
            Min = float.MinValue, Max = 16f,
            Plan = new BMIGoalPlan
                { PlanId = 1, Goal = "Underweight - Severe", WeeklyTargetKg = 0.5f, ExercisePerWeek = 2 }
        },
        new()
        {
            Min = 16f, Max = 17f,
            Plan = new BMIGoalPlan
                { PlanId = 2, Goal = "Underweight - Moderate", WeeklyTargetKg = 0.4f, ExercisePerWeek = 2 }
        },
        new()
        {
            Min = 17f, Max = 18f,
            Plan = new BMIGoalPlan
                { PlanId = 3, Goal = "Underweight - Mild", WeeklyTargetKg = 0.3f, ExercisePerWeek = 2 }
        },
        new()
        {
            Min = 18f, Max = 18.5f,
            Plan = new BMIGoalPlan
                { PlanId = 4, Goal = "Underweight - Slight", WeeklyTargetKg = 0.25f, ExercisePerWeek = 2 }
        },
        new()
        {
            Min = 18.5f, Max = 19.5f,
            Plan = new BMIGoalPlan { PlanId = 5, Goal = "Normal - Low", WeeklyTargetKg = 0f, ExercisePerWeek = 3 }
        },
        new()
        {
            Min = 19.5f, Max = 21f,
            Plan = new BMIGoalPlan { PlanId = 6, Goal = "Normal - Mid", WeeklyTargetKg = 0f, ExercisePerWeek = 3 }
        },
        new()
        {
            Min = 21f, Max = 23f,
            Plan = new BMIGoalPlan { PlanId = 7, Goal = "Normal - High", WeeklyTargetKg = 0f, ExercisePerWeek = 3 }
        },
        new()
        {
            Min = 23f, Max = 25f,
            Plan = new BMIGoalPlan { PlanId = 8, Goal = "Normal - Top", WeeklyTargetKg = 0f, ExercisePerWeek = 3 }
        },
        new()
        {
            Min = 25f, Max = 27f,
            Plan = new BMIGoalPlan
                { PlanId = 9, Goal = "Overweight - Low", WeeklyTargetKg = -0.25f, ExercisePerWeek = 4 }
        },
        new()
        {
            Min = 27f, Max = 29f,
            Plan = new BMIGoalPlan
                { PlanId = 10, Goal = "Overweight - Mid", WeeklyTargetKg = -0.4f, ExercisePerWeek = 4 }
        },
        new()
        {
            Min = 29f, Max = 30f,
            Plan = new BMIGoalPlan
                { PlanId = 11, Goal = "Overweight - High", WeeklyTargetKg = -0.5f, ExercisePerWeek = 4 }
        },
        new()
        {
            Min = 30f, Max = 32f,
            Plan = new BMIGoalPlan { PlanId = 12, Goal = "Obese - Low", WeeklyTargetKg = -0.5f, ExercisePerWeek = 5 }
        },
        new()
        {
            Min = 32f, Max = 35f,
            Plan = new BMIGoalPlan { PlanId = 13, Goal = "Obese - Mid", WeeklyTargetKg = -0.75f, ExercisePerWeek = 5 }
        },
        new()
        {
            Min = 35f, Max = float.MaxValue,
            Plan = new BMIGoalPlan { PlanId = 14, Goal = "Obese - High", WeeklyTargetKg = -1f, ExercisePerWeek = 6 }
        },
    };

    public BMIService(AppDbContext dbContext, ILogger<BMIService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public CreateBMIResponseDto CreateBMIRecord(CreateBMIRecordRequestDto requestDto)
    {
        Guid _userId = _userContext.User.userId;
        double height = requestDto.HeightCm;
        double weight = requestDto.WeightKg;
        if (weight <= 0 || height <= 0)
            throw new InvalidDataException("Height and weight must be positive");

        double _bmi = CalculateBMI(height, weight);
        BMIRecord record = new BMIRecord(
            userId: _userId,
            heightCm: height,
            weightKg: weight,
            bmi: _bmi,
            isCurrent: true,
            isComplete: false
        );
        BMIRecord bmiRecord = _dbContext.BmiRecords.Add(record).Entity;
        CreateBMIResponseDto response = new CreateBMIResponseDto(bmi: bmiRecord.BMI, bmiRecord.Id);
        return response;
    }

    public ChoosePlanResponseDto ChoosePlan(ChoosePlanRequestDto request)
    {
        Guid userId = _userContext.User.userId;
        var record = _dbContext.BmiRecords.FirstOrDefault(r => r.UserId == userId && r.IsCurrent == true);
        if (record == null) throw new KeyNotFoundException("BMI record not found");
        record.PraticeLevel = request.PracticeLevel;
        record.ActivityFactor = request.ActivityFactor;
        var goalPlan = GetGoalPlanByBmi(record.BMI);
        double tdee = CalculateDailyCalories(record.WeightKg, record.HeightCm, record.ActivityFactor,
            goalPlan.WeeklyTargetKg);
        var nutrition = MapCaloriesToMacros(tdee, record.BMI);
        record.Goal = new Dictionary<string, object>
        {
            { "plan", goalPlan },
            { "nutrition", nutrition },
            { "tdee", tdee }
        };
        _dbContext.SaveChanges();
        return new ChoosePlanResponseDto
        {
            BmiRecordId = record.Id,
            DailyCalories = tdee,
            GoalPlan = goalPlan,
            Nutrition = nutrition,
            PracticeLevel = request.PracticeLevel,
            ActivityFactor = request.ActivityFactor
        };
    }

    private MacroNutrition MapCaloriesToMacros(double calories, double bmi)
    {
        (double c, double p, double f) macro = bmi switch
        {
            < 16f => (0.65, 0.20, 0.15),
            >= 16f and < 17f => (0.62, 0.20, 0.18),
            >= 17f and < 18f => (0.60, 0.20, 0.20),
            >= 18f and < 18.5f => (0.58, 0.20, 0.22),
            >= 18.5f and < 19.5f => (0.55, 0.20, 0.25),
            >= 19.5f and < 21f => (0.53, 0.20, 0.27),
            >= 21f and < 23f => (0.50, 0.22, 0.28),
            >= 23f and < 25f => (0.47, 0.23, 0.30),
            >= 25f and < 27f => (0.45, 0.25, 0.30),
            >= 27f and < 29f => (0.42, 0.26, 0.32),
            >= 29f and < 30f => (0.40, 0.28, 0.32),
            >= 30f and < 32f => (0.38, 0.30, 0.32),
            >= 32f and < 35f => (0.35, 0.30, 0.35),
            _ => (0.32, 0.33, 0.35),
        };

        return new MacroNutrition
        {
            Calories = calories,
            Carbs = (calories * macro.c) / 4,
            Protein = (calories * macro.p) / 4,
            Fat = (calories * macro.f) / 9
        };
    }


    public double CalculateDailyCalories(double weightKg, double heightCm, double activityFactor, double weeklyTargetKg)
    {
        double bmr = 10 * weightKg + 6.25 * heightCm - 5 * 25 + 5;
        double tdee = bmr * activityFactor;
        double dailyCalorieAdjustment = (weeklyTargetKg * 7700) / 7;
        return tdee + dailyCalorieAdjustment;
    }

    public double CalculateBMI(double height, double weight)
    {
        return weight / (height * height);
    }

    public BMIGoalPlan GetGoalPlanByBmi(double bmi)
    {
        return _plans.First(p => bmi >= p.Min && bmi < p.Max).Plan;
    }
}