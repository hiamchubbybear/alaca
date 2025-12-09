using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Interface;
using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Api.Util;
using Microsoft.EntityFrameworkCore;

namespace fitlife_planner_back_end.Application.Services;

public class BMIService
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<BMIService> _logger;
    private readonly UserContext _userContext;
    private readonly BMIUtil _bmiUtil;


    public BMIService(AppDbContext dbContext, ILogger<BMIService> logger, BMIUtil bmiUtil, UserContext userContext)
    {
        _dbContext = dbContext;
        _logger = logger;
        _bmiUtil = bmiUtil;
        _userContext = userContext;
    }

    public async Task<CreateBMIResponseDto> CreateBMIRecord(CreateBMIRecordRequestDto requestDto)
    {
        try
        {
            var userId = _userContext.User.userId;
            var profileId = _userContext.User.profileId;
            _logger.LogInformation("Nhận dữ liệu BMI: chiều cao={Height}, cân nặng={Weight}",
                requestDto.HeightCm, requestDto.WeightKg);

            if (requestDto.HeightCm <= 0 || requestDto.WeightKg <= 0)
                throw new InvalidDataException("Chiều cao và cân nặng phải là số dương");

            double bmi = _bmiUtil.CalculateBMI(requestDto.HeightCm, requestDto.WeightKg);

            var goalPlan = _bmiUtil.GetGoalPlanByBmi(bmi);
            if (goalPlan == null)
                throw new Exception("Không tìm thấy kế hoạch BMI phù hợp");

            var profile = await _dbContext.Profiles
                .FirstOrDefaultAsync(p => p.ProfileId == profileId);
            if (profile == null)
                throw new Exception("Không tìm thấy hồ sơ. Không thể tạo bản ghi BMI.");
            if (profile.UserId != userId)
                throw new Exception("ID người dùng không khớp");

            // Set tất cả BMI records cũ về IsCurrent = false
            var oldRecords = await _dbContext.BmiRecords
                .Where(b => b.ProfileId == profileId && b.IsCurrent == true)
                .ToListAsync();

            if (oldRecords.Any())
            {
                _logger.LogInformation("Đánh dấu {Count} BMI records cũ về IsCurrent = false", oldRecords.Count);
                foreach (var oldRecord in oldRecords)
                {
                    oldRecord.IsCurrent = false;
                }
            }

            // Tạo BMI record mới với IsCurrent = true
            var record = new BMIRecord(
                profileId: profileId,
                heightCm: requestDto.HeightCm,
                weightKg: requestDto.WeightKg,
                bmi: bmi,
                assessment: goalPlan.Assessment,
                isCurrent: true,
                isComplete: false
            );

            _dbContext.BmiRecords.Add(record);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Đã tạo BMI record mới với ID {RecordId}, BMI = {BMI}",
                record.BmiRecordId, record.BMI);

            return new CreateBMIResponseDto(
                bmi: record.BMI,
                bmiRecordId: record.BmiRecordId,
                assessment: goalPlan.Assessment
            );
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Tạo bản ghi BMI thất bại");
            throw;
        }
    }


    public async Task<ChoosePlanResponseDto> ChoosePlan(ChoosePlanRequestDto request)
    {
        Guid userId = _userContext.User.userId;
        var profileId = _userContext.User.profileId;
        _logger.LogInformation("Người dùng ID {} chọn kế hoạch", userId);
        var record =
            await _dbContext.BmiRecords.FirstOrDefaultAsync(r => r.ProfileId == profileId && r.IsCurrent == true);
        if (record == null) throw new KeyNotFoundException("Không tìm thấy bản ghi BMI");
        record.PracticeLevel = request.PracticeLevel;
        record.ActivityFactor = request.ActivityFactor;
        var goalPlan = _bmiUtil.GetGoalPlanByBmi(record.BMI);
        double tdee = _bmiUtil.CalculateDailyCalories(record.WeightKg, record.HeightCm, record.ActivityFactor,
            goalPlan.WeeklyTargetKg);
        var nutrition = _bmiUtil.MapCaloriesToMacros(tdee, record.BMI);
        record.Goal = new Dictionary<string, object>
        {
            { "plan", goalPlan },
            { "nutrition", nutrition },
            { "tdee", tdee }
        };
        await _dbContext.SaveChangesAsync();
        return new ChoosePlanResponseDto
        {
            BmiRecordId = record.BmiRecordId,
            DailyCalories = tdee,
            GoalPlan = goalPlan,
            Nutrition = nutrition,
            PracticeLevel = request.PracticeLevel,
            ActivityFactor = request.ActivityFactor
        };
    }

    public async Task<List<GetBmiResponseDto>> GetBMIsByUserId()
    {
        try
        {
            var userId = _userContext.User.userId;
            var profileId = _userContext.User.profileId;

            _logger.LogInformation("Lấy BMI records cho người dùng ID {UserId}", userId);

            // Lấy tất cả BMI records của user, sắp xếp theo thời gian mới nhất
            var bmiRecords = await _dbContext.BmiRecords
                .Where(b => b.ProfileId == profileId && b.IsCurrent == true && b.IsComplete == false)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            if (bmiRecords == null || !bmiRecords.Any())
            {
                _logger.LogWarning("Người dùng ID {UserId} chưa có BMI record nào", userId);
                throw new KeyNotFoundException(
                    "Bạn chưa có bản ghi BMI nào. Vui lòng nhập chiều cao và cân nặng để bắt đầu tính toán BMI.");
            }

            // Map sang DTO với đầy đủ thông tin
            var result = bmiRecords.Select(record => new GetBmiResponseDto
            {
                BmiRecordId = record.BmiRecordId,
                ProfileId = record.ProfileId,
                HeightCm = record.HeightCm,
                WeightKg = record.WeightKg,
                BMI = record.BMI,
                Assessment = record.Assessment,
                Goal = record.Goal,
                PracticeLevel = record.PracticeLevel.ToString(),
                ActivityFactor = record.ActivityFactor,
                IsCurrent = record.IsCurrent,
                IsComplete = record.IsComplete,
                RecordedAt = record.CreatedAt
            }).ToList();

            _logger.LogInformation("Tìm thấy {Count} BMI records cho người dùng ID {UserId}", result.Count, userId);

            return result;
        }
        catch (KeyNotFoundException)
        {
            throw; // Re-throw để controller có thể handle message
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Lỗi khi lấy BMI records");
            throw new Exception("Có lỗi xảy ra khi lấy dữ liệu BMI. Vui lòng thử lại sau.");
        }
    }
}