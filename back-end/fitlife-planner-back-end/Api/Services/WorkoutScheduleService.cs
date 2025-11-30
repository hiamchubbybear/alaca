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

    public async Task<List<GetWorkoutScheduleResponseDTO>> GetMySchedule()
    {
        var userId = _userContext.User.userId;
        var schedules = await _dbContext.WorkoutSchedules
            .Include(s => s.Workout)
            .Where(s => s.UserId == userId)
            .OrderBy(s => s.ScheduledDate)
            .ToListAsync();

        return schedules.Select(s => new GetWorkoutScheduleResponseDTO
        {
            Id = s.Id,
            WorkoutId = s.WorkoutId,
            WorkoutTitle = s.Workout?.Title ?? "",
            ScheduledDate = s.ScheduledDate,
            ScheduledTime = s.ScheduledTime,
            Status = s.Status,
            CompletedAt = s.CompletedAt
        }).ToList();
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
}
