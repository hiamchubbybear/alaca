using System.ComponentModel.DataAnnotations;

namespace fitlife_planner_back_end.Api.Models;

public class FoodItem
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
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
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
