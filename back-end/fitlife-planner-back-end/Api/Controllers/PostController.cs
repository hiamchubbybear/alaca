using System.Net;
using APIResponseWrapper;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using fitlife_planner_back_end.Api.Extensions;


namespace fitlife_planner_back_end.Api.Controllers;

[ApiController]
[Route("post")]
public class PostController(ILogger<ProfileController> logger, PostService postService)
{
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetMyPost()
    {
        try
        {
            var postResponse = await postService.GetMyPost();
            var response = new ApiResponse<GetPostResponseDto>(success: true, message: "Successfully retrieved Posts",
                statusCode: HttpStatusCode.OK, data: postResponse);;

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<GetPostResponseDto>(success: false, message: e.Message,
                statusCode: HttpStatusCode.BadRequest);;

            return response.ToActionResult();
        }
    }


    // [Authorize(Roles = "Admin")]
    [Authorize]
    [HttpGet("all")]
    public async Task<IActionResult> GetAllPost([FromQuery] PaginationParameters pagination)
    {
        var posts = await postService.GetAllPostsAsync(pagination);
        var response = new ApiResponse<PaginatedList<Post>>(
            success: true,
            message: "Successfully retrieved posts",
            data: posts,
            statusCode: HttpStatusCode.OK
        );
        return response.ToActionResult();
    }


    [Authorize]
    [HttpGet("all-by-like")]
    public async Task<IActionResult> GetAllPostByLike([FromQuery] PaginationParameters pagination)
    {
        var posts = await postService.GetAllPostsByLikeAsync(pagination);
        var response = new ApiResponse<PaginatedList<Post>>(
            success: true,
            message: "Successfully retrieved posts",
            data: posts,
            statusCode: HttpStatusCode.OK
        );
        return response.ToActionResult();
    }


    [HttpPut()]
    [Authorize]
    public async Task<IActionResult> UpdatePost(Guid postId,
        [FromBody] UpdatePostRequestDto dto)
    {
        try
        {
            var result = await postService.UpdatePost(postId, dto);
            var response = new ApiResponse<UpdatePostResponseDto>(
                success: true,
                message: "Successfully updated Post",
                data: result,
                statusCode: HttpStatusCode.OK);;

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<UpdatePostResponseDto>(success: false, message: e.Message,
                statusCode: HttpStatusCode.BadRequest);;

            return response.ToActionResult();
        }
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreatePost(
        [FromBody] CreatePostRequestDto dto)
    {
        try
        {
            var result = await postService.CreatePost(dto);
            var response = new ApiResponse<CreatePostResponseDto>(
                success: true,
                message: "Successfully created Post",
                data: result,
                statusCode: HttpStatusCode.Created);;

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<CreatePostResponseDto>(success: false, message: e.Message,
                statusCode: HttpStatusCode.BadRequest);;

            return response.ToActionResult();
        }
    }

    [HttpDelete("{postId:guid}")]
    [Authorize]
    public async Task<IActionResult> DeletePost(Guid postId)
    {
        try
        {
            var result = await postService.DeletePost(postId);
            var response = new ApiResponse<bool>(
                success: true,
                message: "Successfully delete Post",
                data: result,
                statusCode: HttpStatusCode.OK);;

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<bool>(success: false, message: e.Message,
                statusCode: HttpStatusCode.BadRequest);;

            return response.ToActionResult();
        }
    }

    [HttpGet("{postId:guid}")]
    [Authorize]
    public async Task<IActionResult> GetPostById(Guid postId)
    {
        try
        {
            var post = await postService.GetPostById(postId);
            var response = new ApiResponse<GetPostResponseDto>(success: true, message: "Successfully retrieved Post",
                statusCode: HttpStatusCode.OK, data: post);;

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<GetPostResponseDto>(success: false, message: e.Message,
                statusCode: HttpStatusCode.BadRequest);;

            return response.ToActionResult();
        }
    }


    [HttpPost("{id}/approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        try
        {
            var result = await postService.ApprovePostAsync(id);
            var response = new ApiResponse<bool>(
                success: true,
                message: "Successfully approve Post",
                data: result,
                statusCode: HttpStatusCode.OK);;

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<bool>(success: false, message: e.Message,
                statusCode: HttpStatusCode.BadRequest);;

            return response.ToActionResult();
        }
    }

    // --- REJECT ---
    [HttpPost("{id}/reject")]
    public async Task<IActionResult> Reject(Guid id)
    {
        try
        {
            var result = await postService.RejectPostAsync(id);
            var response = new ApiResponse<bool>(
                success: true,
                message: "Successfully reject Post",
                data: result,
                statusCode: HttpStatusCode.OK);;

            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<bool>(success: false, message: e.Message,
                statusCode: HttpStatusCode.BadRequest);;

            return response.ToActionResult();
        }
    }
}
