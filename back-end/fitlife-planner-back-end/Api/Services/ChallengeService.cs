using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Interface;
using fitlife_planner_back_end.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace fitlife_planner_back_end.Api.Services;

public class ChallengeService
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<ChallengeService> _logger;
    private readonly IUserContext _userContext;

    public ChallengeService(AppDbContext dbContext, ILogger<ChallengeService> logger, IUserContext userContext)
    {
        _dbContext = dbContext;
        _logger = logger;
        _userContext = userContext;
    }

    public virtual async Task<object> GetAllChallenges(int page, int pageSize)
    {
        var skip = (page - 1) * pageSize;
        var userId = _userContext.User.userId;
        var query = _dbContext.Challenges
            .Include(c => c.Participants)
            .Where(c => c.EndDate == null || c.EndDate >= DateTime.UtcNow);

        var total = await query.CountAsync();
        var challenges = await query.Skip(skip).Take(pageSize).ToListAsync();

        return new
        {
            challenges = challenges.Select(c => new GetChallengeResponseDTO
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                StartDate = c.StartDate,
                EndDate = c.EndDate,
                CreatedBy = c.CreatedBy,
                Strike = c.Strike,
                Rules = c.Rules,
                Reward = c.Reward,
                ParticipantCount = c.Participants?.Count ?? 0,
                IsParticipating = c.Participants?.Any(p => p.UserId == userId) ?? false,
                CreatedAt = c.CreatedAt
            }),
            total,
            page,
            pageSize
        };
    }

    public virtual async Task<GetChallengeResponseDTO> GetChallengeById(Guid id)
    {
        var userId = _userContext.User.userId;
        var challenge = await _dbContext.Challenges
            .Include(c => c.Participants)
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new Exception("Challenge not found");

        return new GetChallengeResponseDTO
        {
            Id = challenge.Id,
            Title = challenge.Title,
            Description = challenge.Description,
            StartDate = challenge.StartDate,
            EndDate = challenge.EndDate,
            CreatedBy = challenge.CreatedBy,
            Strike = challenge.Strike,
            Rules = challenge.Rules,
            Reward = challenge.Reward,
            ParticipantCount = challenge.Participants?.Count ?? 0,
            IsParticipating = challenge.Participants?.Any(p => p.UserId == userId) ?? false,
            CreatedAt = challenge.CreatedAt
        };
    }

    public virtual async Task<GetChallengeResponseDTO> CreateChallenge(CreateChallengeRequestDTO dto)
    {
        var userId = _userContext.User.userId;
        var challenge = new Challenge
        {
            Title = dto.Title,
            Description = dto.Description,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            CreatedBy = userId,
            Strike = dto.Strike,
            Rules = dto.Rules,
            Reward = dto.Reward
        };

        await _dbContext.Challenges.AddAsync(challenge);
        await _dbContext.SaveChangesAsync();

        return new GetChallengeResponseDTO
        {
            Id = challenge.Id,
            Title = challenge.Title,
            Description = challenge.Description,
            StartDate = challenge.StartDate,
            EndDate = challenge.EndDate,
            CreatedBy = challenge.CreatedBy,
            Strike = challenge.Strike,
            Rules = challenge.Rules,
            Reward = challenge.Reward,
            ParticipantCount = 0,
            IsParticipating = false,
            CreatedAt = challenge.CreatedAt
        };
    }

    public virtual async Task<bool> JoinChallenge(Guid challengeId)
    {
        var userId = _userContext.User.userId;
        var challenge = await _dbContext.Challenges.FindAsync(challengeId)
            ?? throw new Exception("Challenge not found");

        var existing = await _dbContext.ChallengeParticipants
            .AnyAsync(p => p.ChallengeId == challengeId && p.UserId == userId);

        if (existing)
            throw new Exception("Already participating in this challenge");

        var participant = new ChallengeParticipant
        {
            ChallengeId = challengeId,
            UserId = userId,
            Status = "active"
        };

        await _dbContext.ChallengeParticipants.AddAsync(participant);
        await _dbContext.SaveChangesAsync();
        return true;
    }

    public virtual async Task<bool> UpdateChallengeProgress(Guid challengeId, UpdateChallengeProgressRequestDTO dto)
    {
        var userId = _userContext.User.userId;
        var participant = await _dbContext.ChallengeParticipants
            .FirstOrDefaultAsync(p => p.ChallengeId == challengeId && p.UserId == userId)
            ?? throw new Exception("You are not participating in this challenge");

        participant.Progress = dto.Progress;
        await _dbContext.SaveChangesAsync();
        return true;
    }

    public virtual async Task<GetChallengeResponseDTO> UpdateChallenge(Guid id, UpdateChallengeRequestDTO dto)
    {
        var challenge = await _dbContext.Challenges
            .Include(c => c.Participants)
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new Exception("Challenge not found");

        // Update only provided fields
        if (dto.Title != null) challenge.Title = dto.Title;
        if (dto.Description != null) challenge.Description = dto.Description;
        if (dto.StartDate.HasValue) challenge.StartDate = dto.StartDate;
        if (dto.EndDate.HasValue) challenge.EndDate = dto.EndDate;
        if (dto.Strike.HasValue) challenge.Strike = dto.Strike;
        if (dto.Rules != null) challenge.Rules = dto.Rules;
        if (dto.Reward != null) challenge.Reward = dto.Reward;

        challenge.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        var userId = _userContext.User.userId;
        return new GetChallengeResponseDTO
        {
            Id = challenge.Id,
            Title = challenge.Title,
            Description = challenge.Description,
            StartDate = challenge.StartDate,
            EndDate = challenge.EndDate,
            CreatedBy = challenge.CreatedBy,
            Strike = challenge.Strike,
            Rules = challenge.Rules,
            Reward = challenge.Reward,
            ParticipantCount = challenge.Participants?.Count ?? 0,
            IsParticipating = challenge.Participants?.Any(p => p.UserId == userId) ?? false,
            CreatedAt = challenge.CreatedAt
        };
    }

    public virtual async Task<bool> DeleteChallenge(Guid id)
    {
        var challenge = await _dbContext.Challenges.FindAsync(id)
            ?? throw new Exception("Challenge not found");

        // Remove all participants first
        var participants = await _dbContext.ChallengeParticipants
            .Where(p => p.ChallengeId == id)
            .ToListAsync();

        _dbContext.ChallengeParticipants.RemoveRange(participants);
        _dbContext.Challenges.Remove(challenge);

        await _dbContext.SaveChangesAsync();
        return true;
    }

    public virtual async Task<bool> LeaveChallenge(Guid challengeId)
    {
        var userId = _userContext.User.userId;
        var participant = await _dbContext.ChallengeParticipants
            .FirstOrDefaultAsync(p => p.ChallengeId == challengeId && p.UserId == userId)
            ?? throw new Exception("You are not participating in this challenge");

        _dbContext.ChallengeParticipants.Remove(participant);
        await _dbContext.SaveChangesAsync();
        return true;
    }

    public virtual async Task<List<ChallengeLeaderboardDTO>> GetChallengeLeaderboard(Guid challengeId)
    {
        var challenge = await _dbContext.Challenges.FindAsync(challengeId)
            ?? throw new Exception("Challenge not found");

        var participants = await _dbContext.ChallengeParticipants
            .Include(p => p.User)
                .ThenInclude(u => u.Profile)
            .Where(p => p.ChallengeId == challengeId)
            .OrderByDescending(p => p.Progress)
            .ThenBy(p => p.JoinedAt)
            .ToListAsync();

        var leaderboard = new List<ChallengeLeaderboardDTO>();
        int rank = 1;

        foreach (var participant in participants)
        {
            // Parse progress from string (JSON) to double, default to 0 if parsing fails
            double progress = 0;
            if (!string.IsNullOrEmpty(participant.Progress))
            {
                double.TryParse(participant.Progress, out progress);
            }

            leaderboard.Add(new ChallengeLeaderboardDTO
            {
                Rank = rank++,
                UserId = participant.UserId,
                Username = participant.User?.Username ?? "Unknown",
                AvatarUrl = participant.User?.Profile?.AvatarUrl,
                Progress = progress,
                CompletedAt = progress >= 100 ? participant.UpdatedAt : null,
                Status = participant.Status
            });
        }

        return leaderboard;
    }
}
