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
            if (profile.UserId != userId)
                throw new Exception("ID người dùng không khớp");
            if (profile == null)
                throw new Exception("Không tìm thấy hồ sơ. Không thể tạo bản ghi BMI.");
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
}
