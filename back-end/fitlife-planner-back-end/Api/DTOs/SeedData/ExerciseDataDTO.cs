using System.Text.Json.Serialization;

namespace fitlife_planner_back_end.Api.DTOs.SeedData;

public class ExerciseDataRoot
{
    [JsonPropertyName("exercises")]
    public List<ExerciseItem> Exercises { get; set; }

    [JsonPropertyName("metadata")]
    public ExerciseMetadata Metadata { get; set; }
}

public class ExerciseItem
{
    [JsonPropertyName("title")]
    public string Title { get; set; }

    [JsonPropertyName("description")]
    public string Description { get; set; }

    [JsonPropertyName("primaryMuscle")]
    public string PrimaryMuscle { get; set; }

    [JsonPropertyName("secondaryMuscles")]
    public List<string> SecondaryMuscles { get; set; }

    [JsonPropertyName("equipment")]
    public List<string> Equipment { get; set; }

    [JsonPropertyName("difficulty")]
    public string Difficulty { get; set; }

    [JsonPropertyName("instructions")]
    public List<string> Instructions { get; set; }

    [JsonPropertyName("videoUrl")]
    public string VideoUrl { get; set; }

    [JsonPropertyName("images")]
    public List<string> Images { get; set; }

    [JsonPropertyName("tags")]
    public List<string> Tags { get; set; }

    [JsonPropertyName("caloriesBurnedPerSet")]
    public int CaloriesBurnedPerSet { get; set; }

    [JsonPropertyName("recommendedSets")]
    public string RecommendedSets { get; set; }

    [JsonPropertyName("recommendedReps")]
    public string RecommendedReps { get; set; }

    [JsonPropertyName("restSeconds")]
    public int RestSeconds { get; set; }
}

public class ExerciseMetadata
{
    [JsonPropertyName("total_exercises")]
    public int TotalExercises { get; set; }

    [JsonPropertyName("note")]
    public string Note { get; set; }
}
