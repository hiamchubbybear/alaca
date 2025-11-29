using System.Collections;
using fitlife_planner_back_end.Api.Models;

namespace fitlife_planner_back_end.Api.Repository;

public class Repository
{
    public IEnumerable GetAllProfile(PaginationParameters paginationParameters)
    {
        return FindAll()
            .OrderBy(item => item.Name)
            .Skip((paginationParameters.PageNumber - 1) * paginationParameters.PageSize)
            .Take(paginationParameters.PageSize)
            .ToList();
    }
}