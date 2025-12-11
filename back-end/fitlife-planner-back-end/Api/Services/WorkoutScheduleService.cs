using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Interface;
using fitlife_planner_back_end.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace fitlife_planner_back_end.Api.Services;

public class WorkoutScheduleService
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<WorkoutScheduleService> _logger;
    private readonly IUserContext _userContext;

    public WorkoutScheduleService(AppDbContext dbContext, ILogger<WorkoutScheduleService> logger, IUserContext userContext)
    {
        _dbContext = dbContext;
        _logger = logger;
        _userContext = userContext;
    }

    public async Task<List<GetScheduleResponseDTO>> GetMySchedule()
    {
        var userId = _userContext.User.userId;
        var schedules = await _dbContext.WorkoutSchedules
            .Include(s => s.Workout)
            .Include(s => s.ScheduledExercises)
                .ThenInclude(se => se.Exercise)
            .Where(s => s.UserId == userId)
            .OrderBy(s => s.ScheduledDate)
            .OrderBy(s => s.ScheduledDate)
            .ToListAsync();

        _logger.LogInformation($"Found {schedules.Count} schedules for user {userId}");

        var response = new List<GetScheduleResponseDTO>();

        foreach (var s in schedules)
        {
            var exerciseDtos = s.ScheduledExercises.Select(se => new ScheduledExerciseDTO
            {
                 Id = se.Id,
                 ExerciseId = se.ExerciseId,
                 ExerciseTitle = se.Exercise?.Title ?? "Unknown Exercise",
                 PrimaryMuscle = se.Exercise?.PrimaryMuscle,
                 Difficulty = se.Exercise?.Difficulty,
                 OrderIndex = se.OrderIndex,
                 Sets = se.Sets,
                 Reps = se.Reps,
                 RestSeconds = se.RestSeconds,
                 Notes = se.Notes,
                 VideoUrl = se.Exercise?.VideoUrl,
                 Images = !string.IsNullOrEmpty(se.Exercise?.Images) && se.Exercise.Images != "[]"
                          ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(se.Exercise.Images)
                          : new List<string>(),
                 CaloriesBurnedPerSet = se.Exercise?.CaloriesBurnedPerSet ?? 0
            }).OrderBy(e => e.OrderIndex).ToList();

            response.Add(new GetScheduleResponseDTO
            {
                ScheduleId = s.Id,
                WeekNumber = s.WeekNumber,
                SessionNumber = s.SessionNumber,
                SessionName = s.SessionName,
                ScheduledDate = s.ScheduledDate,
                ScheduledTime = s.ScheduledTime,
                Status = s.Status,
                CompletedAt = s.CompletedAt,
                Exercises = exerciseDtos
            });
        }

        return response;
    }

    public async Task<GetWorkoutScheduleResponseDTO> ScheduleWorkout(ScheduleWorkoutRequestDTO dto)
    {
        var userId = _userContext.User.userId;
        var workout = await _dbContext.Workouts.FindAsync(dto.WorkoutId)
            ?? throw new Exception("Workout not found");

        var schedule = new WorkoutSchedule
        {
            UserId = userId,
            WorkoutId = dto.WorkoutId,
            ScheduledDate = dto.ScheduledDate,
            ScheduledTime = dto.ScheduledTime,
            Status = "planned"
        };

        await _dbContext.WorkoutSchedules.AddAsync(schedule);
        await _dbContext.SaveChangesAsync();

        return new GetWorkoutScheduleResponseDTO
        {
            Id = schedule.Id,
            WorkoutId = schedule.WorkoutId,
            WorkoutTitle = workout.Title,
            ScheduledDate = schedule.ScheduledDate,
            ScheduledTime = schedule.ScheduledTime,
            Status = schedule.Status,
            CompletedAt = schedule.CompletedAt
        };
    }

    public async Task<GetWorkoutScheduleResponseDTO> CompleteWorkout(Guid scheduleId)
    {
        var userId = _userContext.User.userId;
        var schedule = await _dbContext.WorkoutSchedules
            .Include(s => s.Workout)
            .FirstOrDefaultAsync(s => s.Id == scheduleId)
            ?? throw new Exception("Schedule not found");

        if (schedule.UserId != userId)
            throw new UnauthorizedAccessException("This is not your schedule");

        schedule.Status = "completed";
        schedule.CompletedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        return new GetWorkoutScheduleResponseDTO
        {
            Id = schedule.Id,
            WorkoutId = schedule.WorkoutId,
            WorkoutTitle = schedule.Workout?.Title ?? "",
            ScheduledDate = schedule.ScheduledDate,
            ScheduledTime = schedule.ScheduledTime,
            Status = schedule.Status,
            CompletedAt = schedule.CompletedAt
        };
    }

    public async Task<GetWorkoutScheduleResponseDTO> SkipWorkout(Guid scheduleId)
    {
        var userId = _userContext.User.userId;
        var schedule = await _dbContext.WorkoutSchedules
            .Include(s => s.Workout)
            .FirstOrDefaultAsync(s => s.Id == scheduleId)
            ?? throw new Exception("Schedule not found");

        if (schedule.UserId != userId)
            throw new UnauthorizedAccessException("This is not your schedule");

        schedule.Status = "skipped";
        await _dbContext.SaveChangesAsync();

        return new GetWorkoutScheduleResponseDTO
        {
            Id = schedule.Id,
            WorkoutId = schedule.WorkoutId,
            WorkoutTitle = schedule.Workout?.Title ?? "",
            ScheduledDate = schedule.ScheduledDate,
            ScheduledTime = schedule.ScheduledTime,
            Status = schedule.Status,
            CompletedAt = schedule.CompletedAt
        };
    }

    public virtual async Task<GetWorkoutScheduleResponseDTO> RescheduleWorkout(Guid id, RescheduleWorkoutRequestDTO dto)
    {
        var userId = _userContext.User.userId;
        var schedule = await _dbContext.WorkoutSchedules.Include(s => s.Workout).FirstOrDefaultAsync(s => s.Id == id) ?? throw new Exception("Schedule not found");
        if (schedule.UserId != userId) throw new UnauthorizedAccessException("You don't own this schedule");
        schedule.ScheduledDate = dto.ScheduledDate;
        await _dbContext.SaveChangesAsync();
        return MapToResponseDTO(schedule);
    }

    public virtual async Task<bool> CancelSchedule(Guid id)
    {
        var userId = _userContext.User.userId;
        var schedule = await _dbContext.WorkoutSchedules.FindAsync(id) ?? throw new Exception("Schedule not found");
        if (schedule.UserId != userId) throw new UnauthorizedAccessException("You don't own this schedule");
        _dbContext.WorkoutSchedules.Remove(schedule);
        await _dbContext.SaveChangesAsync();
        return true;
    }

    public virtual async Task<List<GetWorkoutScheduleResponseDTO>> GetWeekSchedule(DateTime? startDate = null)
    {
        var userId = _userContext.User.userId;
        var start = startDate ?? DateTime.UtcNow.Date;
        var end = start.AddDays(7);
        var schedules = await _dbContext.WorkoutSchedules
            .Include(s => s.Workout)
            .Where(s => s.UserId == userId && s.ScheduledDate >= start && s.ScheduledDate < end)
            .OrderBy(s => s.ScheduledDate)
            .ToListAsync();
        return schedules.Select(s => MapToResponseDTO(s)).ToList();
    }

    private GetWorkoutScheduleResponseDTO MapToResponseDTO(WorkoutSchedule s)
    {
        return new GetWorkoutScheduleResponseDTO
        {
            Id = s.Id,
            WorkoutId = s.WorkoutId,
            WorkoutTitle = s.Workout?.Title ?? "",
            ScheduledDate = s.ScheduledDate,
            ScheduledTime = s.ScheduledTime,
            Status = s.Status,
            CompletedAt = s.CompletedAt
        };
    }

    public virtual async Task<List<GetScheduleResponseDTO>> CreateCustomWeeklySchedule(CreateCustomScheduleRequestDTO dto)
    {
        var userId = _userContext.User.userId;
        var schedules = new List<GetScheduleResponseDTO>();

        _logger.LogInformation($"Creating custom schedule for user {userId}. Weeks: {dto.WeekNumber}, Sessions: {dto.Sessions?.Count ?? 0}");

        if (dto.Sessions == null || !dto.Sessions.Any())
        {
            _logger.LogWarning("No sessions provided in payload.");
            return schedules;
        }

        foreach (var sessionDto in dto.Sessions)
        {
            var schedule = new WorkoutSchedule
            {
                UserId = userId,
                WeekNumber = dto.WeekNumber,
                SessionNumber = sessionDto.SessionNumber,
                SessionName = sessionDto.SessionName,
                ScheduledDate = sessionDto.ScheduledDate ?? DateTime.UtcNow,
                Status = "planned",
                ScheduledTime = new TimeSpan(0, 0, 0)
            };

            await _dbContext.WorkoutSchedules.AddAsync(schedule);
            await _dbContext.SaveChangesAsync();

            var scheduledExercises = new List<ScheduledExerciseDTO>();
            int orderIndex = 0;

            foreach (var exerciseDto in sessionDto.Exercises)
            {
                var scheduledExercise = new ScheduledExercise
                {
                    ScheduleId = schedule.Id,
                    ExerciseId = exerciseDto.ExerciseId,
                    Sets = exerciseDto.Sets,
                    Reps = exerciseDto.Reps,
                    RestSeconds = exerciseDto.RestSeconds,
                    Notes = exerciseDto.Notes,
                    OrderIndex = orderIndex++
                };

                await _dbContext.ScheduledExercises.AddAsync(scheduledExercise);

                var exercise = await _dbContext.ExerciseLibrary.FindAsync(exerciseDto.ExerciseId);
                scheduledExercises.Add(new ScheduledExerciseDTO
                {
                    Id = scheduledExercise.Id,
                    ExerciseId = exerciseDto.ExerciseId,
                    ExerciseTitle = exercise?.Title ?? "Unknown Exercise",
                    PrimaryMuscle = exercise?.PrimaryMuscle,
                    Difficulty = exercise?.Difficulty,
                    Sets = exerciseDto.Sets,
                    Reps = exerciseDto.Reps,
                    RestSeconds = exerciseDto.RestSeconds,
                    Notes = exerciseDto.Notes,
                    OrderIndex = scheduledExercise.OrderIndex,
                    CaloriesBurnedPerSet = exercise?.CaloriesBurnedPerSet ?? 0,
                    VideoUrl = exercise?.VideoUrl,
                    Images = !string.IsNullOrEmpty(exercise?.Images) && exercise.Images != "[]"
                             ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(exercise.Images)
                             : new List<string>()
                });
            }
            await _dbContext.SaveChangesAsync();

            schedules.Add(new GetScheduleResponseDTO
            {
                ScheduleId = schedule.Id,
                WeekNumber = schedule.WeekNumber,
                SessionNumber = schedule.SessionNumber,
                SessionName = schedule.SessionName,
                ScheduledDate = schedule.ScheduledDate,
                ScheduledTime = schedule.ScheduledTime,
                Status = schedule.Status,
                CompletedAt = schedule.CompletedAt,
                Exercises = scheduledExercises
            });
        }
        return schedules;
    }
}
