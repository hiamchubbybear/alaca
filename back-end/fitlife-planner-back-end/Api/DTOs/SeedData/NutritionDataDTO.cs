using System.Text.Json.Serialization;

namespace fitlife_planner_back_end.Api.DTOs.SeedData;

public class NutritionDataRoot
{
    [JsonPropertyName("stats")]
    public NutritionStats Stats { get; set; }

    [JsonPropertyName("data")]
    public List<NutritionItem> Data { get; set; }
}

public class NutritionStats
{
    [JsonPropertyName("total")]
    public int Total { get; set; }

    [JsonPropertyName("valid")]
    public int Valid { get; set; }

    [JsonPropertyName("invalid")]
    public int Invalid { get; set; }
}

public class NutritionItem
{
    [JsonPropertyName("file")]
    public string File { get; set; }

    [JsonPropertyName("nutrition")]
    public NutritionInfo Nutrition { get; set; }
}

public class NutritionInfo
{
    [JsonPropertyName("energy")]
    public double Energy { get; set; }

    [JsonPropertyName("protein")]
    public double Protein { get; set; }

    [JsonPropertyName("fat")]
    public double Fat { get; set; }

    [JsonPropertyName("carb")]
    public double Carb { get; set; }
}
