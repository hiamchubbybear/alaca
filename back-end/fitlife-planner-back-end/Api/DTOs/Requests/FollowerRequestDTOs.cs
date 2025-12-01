using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;

namespace fitlife_planner_back_end.Api.DTOs.Resquests;

public record FollowUserRequestDTO(
    Guid TargetUserId
);

public record UnfollowUserRequestDTO(
    Guid TargetUserId
);
