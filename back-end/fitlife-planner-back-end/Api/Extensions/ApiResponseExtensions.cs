using System.Net;
using APIResponseWrapper;
using Microsoft.AspNetCore.Mvc;

namespace fitlife_planner_back_end.Api.Extensions;

/// <summary>
/// Extension methods for converting ApiResponse to IActionResult with proper HTTP status codes
/// </summary>
public static class ApiResponseExtensions
{
    /// <summary>
    /// Converts an ApiResponse to an IActionResult with the appropriate HTTP status code
    /// </summary>
    /// <typeparam name="T">The type of data in the response</typeparam>
    /// <param name="response">The ApiResponse to convert</param>
    /// <returns>An IActionResult with the proper HTTP status code</returns>
    public static IActionResult ToActionResult<T>(this ApiResponse<T> response)
    {
        return response.StatusCode switch
        {
            HttpStatusCode.OK => new OkObjectResult(response),
            HttpStatusCode.Created => new ObjectResult(response) { StatusCode = 201 },
            HttpStatusCode.BadRequest => new BadRequestObjectResult(response),
            HttpStatusCode.Unauthorized => new UnauthorizedObjectResult(response),
            HttpStatusCode.Forbidden => new ObjectResult(response) { StatusCode = 403 },
            HttpStatusCode.NotFound => new NotFoundObjectResult(response),
            HttpStatusCode.Conflict => new ConflictObjectResult(response),
            HttpStatusCode.InternalServerError => new ObjectResult(response) { StatusCode = 500 },
            _ => new ObjectResult(response) { StatusCode = (int)response.StatusCode }
        };
    }
}
