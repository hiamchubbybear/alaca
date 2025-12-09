using System.ComponentModel.DataAnnotations;

namespace fitlife_planner_back_end.Api.DTOs.Resquests;

public class CreateBMIRecordRequestDto
{
    [Required(ErrorMessage = "HeightCm là bắt buộc")]
    [Range(1, 300, ErrorMessage = "HeightCm phải từ 1 đến 300 cm")]
    public double HeightCm { get; set; }

    [Required(ErrorMessage = "WeightKg là bắt buộc")]
    [Range(1, 500, ErrorMessage = "WeightKg phải từ 1 đến 500 kg")]
    public double WeightKg { get; set;}

    [Required(ErrorMessage = "PracticeLevel là bắt buộc")]
    [RegularExpression("NEWBIE|EASY|MEDIUM|HARD|PRO", ErrorMessage = "PracticeLevel phải là: NEWBIE, EASY, MEDIUM, HARD, hoặc PRO")]
    public string PracticeLevel { get; set; }  // Optional: NEWBIE, EASY, MEDIUM, HARD, PRO

    [Required(ErrorMessage = "ActivityFactor là bắt buộc")]
    [Range(0.1, 3.0, ErrorMessage = "ActivityFactor phải từ 0.1 đến 3.0")]
    public double ActivityFactor { get; set; }  // Optional: 1.2, 1.375, 1.55, 1.725, 1.9

    public CreateBMIRecordRequestDto(double heightCm, double weightKg, string practiceLevel, double activityFactor)
    {
        HeightCm = heightCm;
        WeightKg = weightKg;
        PracticeLevel = practiceLevel;
        ActivityFactor = activityFactor;
    }

    public CreateBMIRecordRequestDto()
    {
    }
}
