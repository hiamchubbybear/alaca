using System.ComponentModel.DataAnnotations;

namespace fitlife_planner_back_end.Api.Models;

public class ExerciseTag
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ExerciseId { get; set; }
    public string Tag { get; set; }

    // Navigation property
    public ExerciseLibrary? Exercise { get; set; }
}
