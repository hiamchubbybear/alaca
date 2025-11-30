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

    public virtual async Task<List<GetChallengeResponseDTO>> GetAllChallenges()
    {
        var userId = _userContext.User.userId;
        var challenges = await _dbContext.Challenges
            .Include(c => c.Participants)
            .Where(c => c.EndDate == null || c.EndDate >= DateTime.UtcNow)
            .ToListAsync();

        return challenges.Select(c => new GetChallengeResponseDTO
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
        }).ToList();
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
}
