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
    [Authorize]
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
    public async Task<ApiResponse<CreatePostResponseDto>> CreatePost(
        [FromBody] CreatePostRequestDto dto)
    {
        try
        {
            var result = await postService.CreatePost(dto);
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

    [HttpDelete("{postId:guid}")]
    [Authorize]
    public async Task<ApiResponse<bool>> DeletePost(Guid postId)
    {
        try
        {
            var result = await postService.DeletePost(postId);
            return new ApiResponse<bool>(
                success: true,
                message: "Successfully delete Post",
                data: result,
                statusCode: HttpStatusCode.OK);
        }
        catch (Exception e)
        {
            return new ApiResponse<bool>(success: false, message: e.Message,
                statusCode: HttpStatusCode.BadRequest);
        }
    }

    [HttpGet("{postId:guid}")]
    [Authorize]
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
    
    
    [HttpPost("{id}/approve")]
    public async Task<ApiResponse<bool>> Approve(Guid id)
    {
        try
        {
            var result = await postService.ApprovePostAsync(id);
            return new ApiResponse<bool>(
                success: true,
                message: "Successfully approve Post",
                data: result,
                statusCode: HttpStatusCode.OK);
        }
        catch (Exception e)
        {
            return new ApiResponse<bool>(success: false, message: e.Message,
                statusCode: HttpStatusCode.BadRequest);
        }
    }

    // --- REJECT ---
    [HttpPost("{id}/reject")]
    public async Task<ApiResponse<bool>> Reject(Guid id)
    {
        try
        {
            var result = await postService.RejectPostAsync(id);
            return new ApiResponse<bool>(
                success: true,
                message: "Successfully reject Post",
                data: result,
                statusCode: HttpStatusCode.OK);
        }
        catch (Exception e)
        {
            return new ApiResponse<bool>(success: false, message: e.Message,
                statusCode: HttpStatusCode.BadRequest);
        }
    }
}