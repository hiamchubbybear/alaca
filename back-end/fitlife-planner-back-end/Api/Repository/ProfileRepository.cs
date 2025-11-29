using Microsoft.EntityFrameworkCore;

namespace fitlife_planner_back_end.Api.Repository;

using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Api.Configurations;

public class ProfileRepository : RepositoryBase
{
    public ProfileRepository(AppDbContext context) : base(context)
    {
    }

    public PaginatedList<Profile> GetAllProfile(PaginationParameters paginationParameters)
    {
        var query = FindAll<Profile>()
            .OrderBy(item => item.DisplayName);

        return PaginatedList<Profile>.ToPagedList(
            query,
            paginationParameters.PageNumber,
            paginationParameters.PageSize
        );
    }
}
