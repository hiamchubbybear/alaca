using fitlife_planner_back_end.Api.DTOs;

namespace fitlife_planner_back_end.Api.Interface;

public interface IUserContext
{
    UserJwtInfo User { get; }
}
