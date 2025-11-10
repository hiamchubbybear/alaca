using APIResponseWrapper;
using Microsoft.AspNetCore.Mvc;

namespace fitlife_planner_back_end.Api.Controllers;

[ApiController]
[Route("auth")]
public class AuthenticationController : ControllerBase
{
    [HttpGet("hello")]
    public ApiResponse<String> hello()
    {
        return ApiResponse<String>.CreateSuccessResponse("Hello World!");
    }
    // Reflection
}