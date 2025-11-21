using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Api.Responses;
using fitlife_planner_back_end.Api.Util;
using fitlife_planner_back_end.Application.DTOs;

namespace fitlife_planner_back_end.Application.Services;

public class ProfileService
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<ProfileService> _logger;

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

    public ProfileService(AppDbContext dbContext, ILogger<ProfileService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public CreateBMIResponseDto CreateBMIRecord(CreateBMIRecordRequestDto requestDto)
    {
        Guid _userId = requestDto.UserId;
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

    public ChoosePlanResponseDto chooseBMI(ChoosePlanRequestDto choosePlanRequestDto)
    {
        return null;
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

public class ChoosePlanRequestDto
{
    public PracticeLevel PracticeLevel { get; }
    public double ActivityFactor { get; }
}

public class ChoosePlanResponseDto
{
}