namespace fitlife_planner_back_end.Application.DTOs;

public class CreateBMIRecordRequestDto
{
    public Guid UserId { get; set; }
    public double HeightCm { get; }
    public double WeightKg { get; }

    public CreateBMIRecordRequestDto(double heightCm, double weightKg, Guid UserId)
    {
        HeightCm = heightCm;
        WeightKg = weightKg;
    }

    public CreateBMIRecordRequestDto()
    {
    }
}