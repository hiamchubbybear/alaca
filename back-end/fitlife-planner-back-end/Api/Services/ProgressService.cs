using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Interface;
using fitlife_planner_back_end.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace fitlife_planner_back_end.Api.Services;

public class ProgressService
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<ProgressService> _logger;
    private readonly IUserContext _userContext;

    public ProgressService(AppDbContext dbContext, ILogger<ProgressService> logger, IUserContext userContext)
    {
        _dbContext = dbContext;
        _logger = logger;
        _userContext = userContext;
    }

    public virtual async Task<List<GetProgressEntryResponseDTO>> GetMyProgress(string? type = null)
    {
        var userId = _userContext.User.userId;
        var query = _dbContext.ProgressEntries.Where(p => p.UserId == userId);

        if (!string.IsNullOrEmpty(type))
        {
            query = query.Where(p => p.Type == type);
        }

        var entries = await query.OrderByDescending(p => p.RecordedAt).ToListAsync();

        return entries.Select(e => new GetProgressEntryResponseDTO
        {
            Id = e.Id,
            Type = e.Type,
            RecordedAt = e.RecordedAt,
            NumericValue = e.NumericValue,
            TextValue = e.TextValue,
            PhotoUrl = e.PhotoUrl,
            CreatedAt = e.CreatedAt
        }).ToList();
    }

    public virtual async Task<GetProgressEntryResponseDTO> CreateProgressEntry(CreateProgressEntryRequestDTO dto)
    {
        var userId = _userContext.User.userId;
        var entry = new ProgressEntry
        {
            UserId = userId,
            Type = dto.Type,
            RecordedAt = dto.RecordedAt ?? DateTime.UtcNow,
            NumericValue = dto.NumericValue,
            TextValue = dto.TextValue,
            PhotoUrl = dto.PhotoUrl
        };

        await _dbContext.ProgressEntries.AddAsync(entry);
        await _dbContext.SaveChangesAsync();

        return new GetProgressEntryResponseDTO
        {
            Id = entry.Id,
            Type = entry.Type,
            RecordedAt = entry.RecordedAt,
            NumericValue = entry.NumericValue,
            TextValue = entry.TextValue,
            PhotoUrl = entry.PhotoUrl,
            CreatedAt = entry.CreatedAt
        };
    }

    public virtual async Task<bool> DeleteProgressEntry(Guid id)
    {
        var userId = _userContext.User.userId;
        var entry = await _dbContext.ProgressEntries.FindAsync(id)
            ?? throw new Exception("Progress entry not found");

        if (entry.UserId != userId)
            throw new UnauthorizedAccessException("This is not your progress entry");

        _dbContext.ProgressEntries.Remove(entry);
        await _dbContext.SaveChangesAsync();
        return true;
    }
}
