using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.DTOs.Requests;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Interface;
using fitlife_planner_back_end.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace fitlife_planner_back_end.Api.Services;

public class WorkoutService
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<WorkoutService> _logger;
    private readonly IUserContext _userContext;

    public WorkoutService(AppDbContext dbContext, ILogger<WorkoutService> logger, IUserContext userContext)
    {
        _dbContext = dbContext;
        _logger = logger;
        _userContext = userContext;
    }

    public virtual async Task<object> GetMyWorkouts(int page = 1, int pageSize = 20)
    {
        var skip = (page - 1) * pageSize;
        var userId = _userContext.User.userId;
        var query = _dbContext.Workouts
            .Include(w => w.Exercises)
            .ThenInclude(we => we.Exercise)
            .Where(w => w.OwnerUserId == userId);

        var total = await query.CountAsync();
        var workouts = await query.Skip(skip).Take(pageSize).ToListAsync();
        return new { workouts = workouts.Select(w => MapToResponseDTO(w)), total, page, pageSize };
    }

    public virtual async Task<GetWorkoutResponseDTO> GetWorkoutById(Guid id)
    {
        var workout = await _dbContext.Workouts
            .Include(w => w.Exercises)
            .ThenInclude(we => we.Exercise)
            .FirstOrDefaultAsync(w => w.Id == id)
            ?? throw new Exception("Workout not found");

        return MapToResponseDTO(workout);
    }

    public virtual async Task<GetWorkoutResponseDTO> CreateWorkout(CreateWorkoutRequestDTO dto)
    {
        var userId = _userContext.User.userId;
        var workout = new Workout
        {
            OwnerUserId = userId,
            Title = dto.Title,
            Description = dto.Description,
            DurationMin = dto.DurationMin,
            Intensity = dto.Intensity
        };

        await _dbContext.Workouts.AddAsync(workout);
        await _dbContext.SaveChangesAsync();

        // Add exercises
        if (dto.Exercises != null && dto.Exercises.Any())
        {
            foreach (var exerciseDto in dto.Exercises)
            {
                var workoutExercise = new WorkoutExercise
                {
                    WorkoutId = workout.Id,
                    ExerciseId = exerciseDto.ExerciseId,
                    OrderIndex = exerciseDto.OrderIndex,
                    Sets = exerciseDto.Sets,
                    Reps = exerciseDto.Reps,
                    RestSeconds = exerciseDto.RestSeconds,
                    Tempo = exerciseDto.Tempo,
                    Notes = exerciseDto.Notes
                };
                await _dbContext.WorkoutExercises.AddAsync(workoutExercise);
            }
            await _dbContext.SaveChangesAsync();
        }

        // Reload with exercises
        var createdWorkout = await _dbContext.Workouts
            .Include(w => w.Exercises)
            .ThenInclude(we => we.Exercise)
            .FirstAsync(w => w.Id == workout.Id);

        return MapToResponseDTO(createdWorkout);
    }

    public virtual async Task<bool> DeleteWorkout(Guid id)
    {
        var userId = _userContext.User.userId;
        var workout = await _dbContext.Workouts.FindAsync(id)
            ?? throw new Exception("Workout not found");

        if (workout.OwnerUserId != userId)
            throw new UnauthorizedAccessException("You don't own this workout");

        _dbContext.Workouts.Remove(workout);
        await _dbContext.SaveChangesAsync();
        return true;
    }

    private GetWorkoutResponseDTO MapToResponseDTO(Workout workout)
    {
        return new GetWorkoutResponseDTO
        {
            Id = workout.Id,
            OwnerUserId = workout.OwnerUserId,
            Title = workout.Title,
            Description = workout.Description,
            DurationMin = workout.DurationMin,
            Intensity = workout.Intensity,
            VideoUrl = workout.VideoUrl,
            CreatedAt = workout.CreatedAt,
            Exercises = workout.Exercises?.Select(we => new WorkoutExerciseDetailDTO
            {
                Id = we.Id,
                ExerciseId = we.ExerciseId,
                ExerciseTitle = we.Exercise?.Title ?? "",
                ExerciseVideoUrl = we.Exercise?.VideoUrl,
                OrderIndex = we.OrderIndex,
                Sets = we.Sets,
                Reps = we.Reps,
                RestSeconds = we.RestSeconds,
                Tempo = we.Tempo,
                Notes = we.Notes
            }).ToList()
        };
    }

    public virtual async Task<GetWorkoutResponseDTO> UpdateWorkout(Guid id, UpdateWorkoutRequestDTO dto)
    {
        var userId = _userContext.User.userId;
        var workout = await _dbContext.Workouts.Include(w => w.Exercises).ThenInclude(we => we.Exercise).FirstOrDefaultAsync(w => w.Id == id) ?? throw new Exception("Workout not found");
        if (workout.OwnerUserId != userId) throw new UnauthorizedAccessException("You don't own this workout");
        if (dto.Title != null) workout.Title = dto.Title;
        if (dto.Description != null) workout.Description = dto.Description;
        workout.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();
        return MapToResponseDTO(workout);
    }

    public virtual async Task<GetWorkoutResponseDTO> DuplicateWorkout(Guid id)
    {
        var userId = _userContext.User.userId;
        var original = await _dbContext.Workouts.Include(w => w.Exercises).FirstOrDefaultAsync(w => w.Id == id) ?? throw new Exception("Workout not found");
        var newWorkout = new Workout
        {
            OwnerUserId = userId,
            Title = original.Title + " (Copy)",
            Description = original.Description,
            DurationMin = original.DurationMin,
            Intensity = original.Intensity
        };
        await _dbContext.Workouts.AddAsync(newWorkout);
        await _dbContext.SaveChangesAsync();
        if (original.Exercises != null && original.Exercises.Any())
        {
            foreach (var ex in original.Exercises)
            {
                await _dbContext.WorkoutExercises.AddAsync(new WorkoutExercise
                {
                    WorkoutId = newWorkout.Id,
                    ExerciseId = ex.ExerciseId,
                    OrderIndex = ex.OrderIndex,
                    Sets = ex.Sets,
                    Reps = ex.Reps,
                    RestSeconds = ex.RestSeconds,
                    Tempo = ex.Tempo,
                    Notes = ex.Notes
                });
            }
            await _dbContext.SaveChangesAsync();
        }
        var result = await _dbContext.Workouts.Include(w => w.Exercises).ThenInclude(we => we.Exercise).FirstAsync(w => w.Id == newWorkout.Id);
        return MapToResponseDTO(result);
    }

    // ==================== WORKOUT SCHEDULE METHODS ====================

    public virtual async Task<WorkoutScheduleResponseDTO?> GetTodayWorkout()
    {
        var userId = _userContext.User.userId;
        var today = DateTime.UtcNow.Date;

        var schedule = await _dbContext.WorkoutSchedules
            .Include(ws => ws.Workout)
                .ThenInclude(w => w.Exercises)
                    .ThenInclude(we => we.Exercise)
            .Include(ws => ws.ScheduledExercises)
                .ThenInclude(se => se.Exercise)
            .Where(ws => ws.UserId == userId && ws.ScheduledDate.Date == today)
            .OrderByDescending(ws => ws.ScheduledDate)
            .FirstOrDefaultAsync();

        return schedule == null ? null : MapScheduleToResponseDTO(schedule);
    }

    public virtual async Task<WorkoutScheduleResponseDTO?> GetLatestWorkout()
    {
        var userId = _userContext.User.userId;

        var schedule = await _dbContext.WorkoutSchedules
            .Include(ws => ws.Workout)
                .ThenInclude(w => w.Exercises)
                    .ThenInclude(we => we.Exercise)
            .Include(ws => ws.ScheduledExercises)
                .ThenInclude(se => se.Exercise)
            .Where(ws => ws.UserId == userId)
            .OrderByDescending(ws => ws.ScheduledDate)
            .FirstOrDefaultAsync();

        return schedule == null ? null : MapScheduleToResponseDTO(schedule);
    }

    public virtual async Task<WorkoutScheduleResponseDTO?> GetWorkoutSchedule(Guid scheduleId)
    {
        var userId = _userContext.User.userId;

        var schedule = await _dbContext.WorkoutSchedules
            .Include(ws => ws.Workout)
                .ThenInclude(w => w.Exercises)
                    .ThenInclude(we => we.Exercise)
            .Where(ws => ws.Id == scheduleId && ws.UserId == userId)
            .FirstOrDefaultAsync();

        return schedule == null ? null : MapScheduleToResponseDTO(schedule);
    }

    public virtual async Task<bool> CompleteWorkout(CompleteWorkoutRequestDTO request)
    {
        var userId = _userContext.User.userId;

        if (!Guid.TryParse(request.WorkoutScheduleId, out var scheduleId))
        {
            _logger.LogWarning("Invalid workout schedule ID format: {ScheduleId}", request.WorkoutScheduleId);
            return false;
        }

        var schedule = await _dbContext.WorkoutSchedules
            .Where(ws => ws.Id == scheduleId && ws.UserId == userId)
            .FirstOrDefaultAsync();

        if (schedule == null)
        {
            _logger.LogWarning("Workout schedule {ScheduleId} not found for user {UserId}", scheduleId, userId);
            return false;
        }

        schedule.IsCompleted = true;
        schedule.CompletedAt = request.CompletedAt;
        schedule.Notes = request.Notes;

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Workout {ScheduleId} marked as completed for user {UserId}", scheduleId, userId);

        return true;
    }

    public virtual async Task<List<WorkoutScheduleResponseDTO>> GetWorkoutHistory(int page = 1, int pageSize = 10)
    {
        var userId = _userContext.User.userId;

        var schedules = await _dbContext.WorkoutSchedules
            .Include(ws => ws.Workout)
                .ThenInclude(w => w.Exercises)
                    .ThenInclude(we => we.Exercise)
            .Where(ws => ws.UserId == userId)
            .OrderByDescending(ws => ws.ScheduledDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return schedules.Select(MapScheduleToResponseDTO).ToList();
    }

    public virtual async Task<WorkoutStatsResponseDTO> GetWorkoutStats()
    {
        var userId = _userContext.User.userId;

        var schedules = await _dbContext.WorkoutSchedules
            .Where(ws => ws.UserId == userId)
            .OrderBy(ws => ws.ScheduledDate)
            .ToListAsync();

        var totalWorkouts = schedules.Count;
        var completedWorkouts = schedules.Count(ws => ws.IsCompleted);
        var completionRate = totalWorkouts > 0 ? (double)completedWorkouts / totalWorkouts * 100 : 0;

        var currentStreak = CalculateCurrentStreak(schedules);
        var longestStreak = CalculateLongestStreak(schedules);

        return new WorkoutStatsResponseDTO
        {
            TotalWorkouts = totalWorkouts,
            CompletedWorkouts = completedWorkouts,
            CurrentStreak = currentStreak,
            LongestStreak = longestStreak,
            CompletionRate = Math.Round(completionRate, 2)
        };
    }

    private int CalculateCurrentStreak(List<WorkoutSchedule> schedules)
    {
        var today = DateTime.UtcNow.Date;
        var streak = 0;
        var currentDate = today;

        var completedDates = schedules
            .Where(ws => ws.IsCompleted && ws.CompletedAt.HasValue)
            .Select(ws => ws.CompletedAt!.Value.Date)
            .Distinct()
            .OrderByDescending(d => d)
            .ToList();

        foreach (var date in completedDates)
        {
            if (date == currentDate || date == currentDate.AddDays(-1))
            {
                streak++;
                currentDate = date.AddDays(-1);
            }
            else
            {
                break;
            }
        }

        return streak;
    }

    private int CalculateLongestStreak(List<WorkoutSchedule> schedules)
    {
        var completedDates = schedules
            .Where(ws => ws.IsCompleted && ws.CompletedAt.HasValue)
            .Select(ws => ws.CompletedAt!.Value.Date)
            .Distinct()
            .OrderBy(d => d)
            .ToList();

        if (!completedDates.Any())
            return 0;

        int maxStreak = 1;
        int currentStreak = 1;

        for (int i = 1; i < completedDates.Count; i++)
        {
            if ((completedDates[i] - completedDates[i - 1]).Days == 1)
            {
                currentStreak++;
                maxStreak = Math.Max(maxStreak, currentStreak);
            }
            else
            {
                currentStreak = 1;
            }
        }

        return maxStreak;
    }

    private WorkoutScheduleResponseDTO MapScheduleToResponseDTO(WorkoutSchedule schedule)
    {
        // Try to get exercises from Workout first, then from ScheduledExercises
        List<WorkoutExerciseResponseDTO> exercises;

        if (schedule.Workout?.Exercises != null && schedule.Workout.Exercises.Any())
        {
            // Use Workout.Exercises (template)
            exercises = schedule.Workout.Exercises
                .OrderBy(we => we.OrderIndex)
                .Select(we => new WorkoutExerciseResponseDTO
                {
                    WorkoutExerciseId = we.Id.ToString(),
                    ExerciseId = we.ExerciseId.ToString(),
                    ExerciseName = we.Exercise?.Title ?? "Unknown Exercise",
                    Sets = we.Sets,
                    Reps = we.Reps,
                    RestTime = we.RestSeconds,
                    VideoUrl = we.Exercise?.VideoUrl,
                    Instructions = we.Exercise?.Instructions,
                    OrderIndex = we.OrderIndex
                }).ToList();
        }
        else if (schedule.ScheduledExercises != null && schedule.ScheduledExercises.Any())
        {
            // Use ScheduledExercises (actual schedule)
            exercises = schedule.ScheduledExercises
                .OrderBy(se => se.OrderIndex)
                .Select(se => new WorkoutExerciseResponseDTO
                {
                    WorkoutExerciseId = se.Id.ToString(),
                    ExerciseId = se.ExerciseId.ToString(),
                    ExerciseName = se.Exercise?.Title ?? "Unknown Exercise",
                    Sets = se.Sets,
                    Reps = se.Reps,
                    RestTime = se.RestSeconds,
                    VideoUrl = se.Exercise?.VideoUrl,
                    Instructions = se.Exercise?.Instructions,
                    OrderIndex = se.OrderIndex
                }).ToList();
        }
        else
        {
            exercises = new List<WorkoutExerciseResponseDTO>();
        }

        return new WorkoutScheduleResponseDTO
        {
            WorkoutScheduleId = schedule.Id.ToString(),
            WorkoutId = schedule.WorkoutId?.ToString() ?? "",
            WorkoutName = schedule.Workout?.Title ?? schedule.SessionName ?? "Unknown Workout",
            ScheduledDate = schedule.ScheduledDate,
            IsCompleted = schedule.IsCompleted,
            CompletedAt = schedule.CompletedAt,
            Notes = schedule.Notes,
            Exercises = exercises
        };
    }
}
