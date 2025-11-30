namespace fitlife_planner_back_end.Api.DTOs.Responses;

public class GetFoodItemResponseDTO
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string? ServingSize { get; set; }
    public int? ServingAmount { get; set; }
    public int? CaloriesKcal { get; set; }
    public decimal? ProteinG { get; set; }
    public decimal? CarbsG { get; set; }
    public decimal? FatG { get; set; }
    public decimal? FiberG { get; set; }
    public int? SodiumMg { get; set; }
    public string? Micronutrients { get; set; }
    public DateTime CreatedAt { get; set; }
}
