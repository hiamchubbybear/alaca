namespace fitlife_planner_back_end.Api.DTOs.Resquests;

public class CreateBMIRecordRequestDto
{
    public double HeightCm { get; set; }
    public double WeightKg { get; set;}

    public CreateBMIRecordRequestDto(double heightCm, double weightKg)
    {
        HeightCm = heightCm;
        WeightKg = weightKg;
    }

    public CreateBMIRecordRequestDto()
    {
    }
}
