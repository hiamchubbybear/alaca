using fitlife_planner_back_end.Api.Models;

namespace fitlife_planner_back_end.Api.DTOs.Responses;

public class CreateBMIResponseDto
{
    public double BMI { get; set; }
    public Guid BMIRecordID { get; set; }
    public string Assessment { get; set; }

    public CreateBMIResponseDto()
    {
    }

    public CreateBMIResponseDto(double bmi, Guid bmiRecordId, string assessment)
    {
        BMI = bmi;
        BMIRecordID = bmiRecordId;
        Assessment = assessment;
    }
}
