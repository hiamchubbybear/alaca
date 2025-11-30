using System.Collections;
using System.ComponentModel.DataAnnotations;

namespace fitlife_planner_back_end.Api.Models;

public class BMIRecord
{
    [Key] public Guid BmiRecordId { get; set; } = Guid.NewGuid();
    public Guid ProfileId { get; set; }
    public double HeightCm { get; set; }
    public double WeightKg { get; set; }
    public double BMI { get; set; }
    public string Assessment { get; set; }
    public bool IsCurrent { get; set; } = true;
    public Dictionary<string, object> Goal;
    public bool IsComplete { get; set; }
    public DateTime MeasuredAt { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public double ActivityFactor { get; set; }
    public PracticeLevel PracticeLevel { get; set; }
    public Profile Profile { get; set; }
    public BMIRecord()
    {
    }

    public BMIRecord(Guid profileId, double heightCm, double weightKg, double bmi,
        string assessment, bool isCurrent, bool isComplete, double activityFactor, Dictionary<string, object> goal,
        PracticeLevel practiceLevel)
    {
        Goal = goal;
        ProfileId = profileId;
        HeightCm = heightCm;
        WeightKg = weightKg;
        BMI = bmi;
        Assessment = assessment;
        IsCurrent = isCurrent;
        IsComplete = isComplete;
        ActivityFactor = activityFactor;
        PracticeLevel = practiceLevel;
    }

    public BMIRecord(Guid profileId, double heightCm, double weightKg, double bmi, string assessment, bool isCurrent,
        bool isComplete)
    {
        BmiRecordId = Guid.NewGuid();
        ProfileId = profileId;
        HeightCm = heightCm;
        WeightKg = weightKg;
        BMI = bmi;
        IsCurrent = isCurrent;
        IsComplete = isComplete;
        Assessment = assessment;
    }
}

public enum PracticeLevel
{
    // >1 tieng
    PRO = 0,

    // 45p -> 1tieng
    HARD = 1,

    // 30-45p
    MEDIUM = 2,

    // 15-30p
    EASY = 3,

    // 5-15p
    NEWBIE = 4,
}