using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.Models;

namespace fitlife_planner_back_end.Api.Repository;

public class PostRepository : RepositoryBase
{
    public PostRepository(AppDbContext context) : base(context)
    {
    }

    public PaginatedList<Post> GetAllByLike(PaginationParameters paginationParameters)
    {
        var query = FindAll<Post>()
            .OrderBy(item => item.LikeCount);

        return PaginatedList<Post>.ToPagedList(
            query,
            paginationParameters.PageNumber,
            paginationParameters.PageSize
        );
    }

    
    public PaginatedList<Post> GetAll(PaginationParameters paginationParameters)
    {
        var query = FindAll<Post>();
        

        return PaginatedList<Post>.ToPagedList(
            query,
            paginationParameters.PageNumber,
            paginationParameters.PageSize
        );
    }
}