namespace fitlife_planner_back_end.Api.DTOs.Responses;

public class CreateBMIResponseDto
{
    public double BMI { get; set; }
    public Guid BMIRecordID { get; set; }

    public CreateBMIResponseDto()
    {
    }

    public CreateBMIResponseDto(double bmi, Guid bmiRecordId)
    {
        BMI = bmi;
        BMIRecordID = bmiRecordId;
    }
}