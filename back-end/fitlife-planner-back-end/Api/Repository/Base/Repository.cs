using System.Collections;
using fitlife_planner_back_end.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace fitlife_planner_back_end.Api.Repository;

public abstract class RepositoryBase
{
    protected readonly DbContext _context;

    protected RepositoryBase(DbContext context)
    {
        _context = context;
    }

    protected IQueryable<T> FindAll<T>() where T : class
    {
        return _context.Set<T>().AsNoTracking().AsQueryable();
    }
}