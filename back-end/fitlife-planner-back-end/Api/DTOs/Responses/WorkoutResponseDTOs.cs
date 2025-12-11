namespace fitlife_planner_back_end.Api.DTOs.Responses
{
    public class WorkoutExerciseResponseDTO
    {
        public string WorkoutExerciseId { get; set; } = string.Empty;
        public string ExerciseId { get; set; } = string.Empty;
        public string ExerciseName { get; set; } = string.Empty;
        public int Sets { get; set; }
        public int Reps { get; set; }
        public int RestTime { get; set; } // seconds
        public string? VideoUrl { get; set; }
        public string? Instructions { get; set; }
        public int OrderIndex { get; set; }
    }

    public class WorkoutScheduleResponseDTO
    {
        public string WorkoutScheduleId { get; set; } = string.Empty;
        public string WorkoutId { get; set; } = string.Empty;
        public string WorkoutName { get; set; } = string.Empty;
        public DateTime ScheduledDate { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? Notes { get; set; }
        public List<WorkoutExerciseResponseDTO> Exercises { get; set; } = new();
    }

    public class WorkoutStatsResponseDTO
    {
        public int TotalWorkouts { get; set; }
        public int CompletedWorkouts { get; set; }
        public int CurrentStreak { get; set; }
        public int LongestStreak { get; set; }
        public double CompletionRate { get; set; }
    }
}
