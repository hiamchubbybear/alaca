using System.Net;
using APIResponseWrapper;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace fitlife_planner_back_end.Api.Controllers;
    
[ApiController]
[Route("post")]
public class PostController(ILogger<ProfileController> logger, PostService postService)
{
    [Authorize]
    [HttpGet]
    public async Task<ApiResponse<GetPostResponseDto>> GetMyPost()
    {
        try
        {
            var postResponse = await postService.GetMyPost();
            return new ApiResponse<GetPostResponseDto>(success: true, message: "Successfully retrieved Posts",
                statusCode: HttpStatusCode.Found, data: postResponse);
        }
        catch (Exception e)
        {
            return new ApiResponse<GetPostResponseDto>(success: true, message: e.Message,
                statusCode: HttpStatusCode.BadRequest);
        }
    }

    

    // [Authorize(Roles = "Admin")]
    [Authorize]
    [HttpGet("all")]
    public async Task<ApiResponse<PaginatedList<Post>>> GetAllPost([FromQuery] PaginationParameters pagination)
    {
        var posts = await postService.GetAllPostsAsync(pagination);

        return await Task.FromResult(new ApiResponse<PaginatedList<Post>>(
            success: true,
            message: "Successfully retrieved posts",
            data: posts,
            statusCode: HttpStatusCode.OK
        ));
    }
   
 
    
    
    [Authorize]
    [HttpGet("all-by-like")]
    public async Task<ApiResponse<PaginatedList<Post>>> GetAllPostByLike([FromQuery] PaginationParameters pagination)
    {
        var posts = await postService.GetAllPostsByLikeAsync(pagination);

        return await Task.FromResult(new ApiResponse<PaginatedList<Post>>(
            success: true,
            message: "Successfully retrieved posts",
            data: posts,
            statusCode: HttpStatusCode.OK
        ));
    }

     
    [HttpPut()]
    public async Task<ApiResponse<UpdatePostResponseDto>> UpdatePost(Guid postId,
        [FromBody] UpdatePostRequestDto dto)
    {
        try
        {
            var result = await postService.UpdatePost(postId, dto);
            return new ApiResponse<UpdatePostResponseDto>(
                success: true,
                message: "Successfully updated Post",
                data: result,
                statusCode: HttpStatusCode.OK);
        }
        catch (Exception e)
        {
            return new ApiResponse<UpdatePostResponseDto>(success: false, message: e.Message,
                statusCode: HttpStatusCode.BadRequest);
        }
    }
    
    [Authorize]
    [HttpPost]
    public async Task<ApiResponse<CreatePostResponseDto>> CreatePost(Guid profileId,
        [FromBody] CreatePostRequestDto dto)
    {
        try
        {
            var result = await postService.CreatePost(dto,profileId);
            return new ApiResponse<CreatePostResponseDto>(
                success: true,
                message: "Successfully create Post",
                data: result,
                statusCode: HttpStatusCode.OK);
        }
        catch (Exception e)
        {
            return new ApiResponse<CreatePostResponseDto>(success: false, message: e.Message,
                statusCode: HttpStatusCode.BadRequest);
        }
    }
    [HttpPut()]
    public async Task<ApiResponse<UpdatePostResponseDto>> DeletePost(Guid postId,
        [FromBody] UpdatePostRequestDto dto)
    {
        try
        {
            var result = await postService.UpdatePost(postId, dto);
            return new ApiResponse<UpdatePostResponseDto>(
                success: true,
                message: "Successfully updated Post",
                data: result,
                statusCode: HttpStatusCode.OK);
        }
        catch (Exception e)
        {
            return new ApiResponse<UpdatePostResponseDto>(success: false, message: e.Message,
                statusCode: HttpStatusCode.BadRequest);
        }
    }
    
    // ================================
    // GET POST BY ID
    // ================================
    [HttpGet("{postId:guid}")]
    public async Task<ApiResponse<GetPostResponseDto>> GetPostById(Guid postId)
    {
        try
        {
            var post = await postService.GetPostById(postId);
            return new ApiResponse<GetPostResponseDto>(success: true, message: "Successfully retrieved Post",
                statusCode: HttpStatusCode.Found, data: post);
        }
        catch (Exception e)
        {
            return new ApiResponse<GetPostResponseDto>(success: true, message: e.Message,
                statusCode: HttpStatusCode.BadRequest);
        }
    }
    
    
    
}
