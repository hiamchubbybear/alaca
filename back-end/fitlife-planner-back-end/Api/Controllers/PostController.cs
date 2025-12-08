using System.Net;
using APIResponseWrapper;
using fitlife_planner_back_end.Api.DTOs.Responses;
using fitlife_planner_back_end.Api.DTOs.Resquests;
using fitlife_planner_back_end.Api.Enums;
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
        var response = new ApiResponse<PaginatedList<GetPostResponseDto>>(
            success: true,
            message: "Successfully retrieved posts",
            data: posts,
            statusCode: HttpStatusCode.OK
        );
        return response.ToActionResult();
    }

    // Public feed - no auth required
    [HttpGet("feed")]
    [Authorize]
    public async Task<IActionResult> GetPublicFeed([FromQuery] PaginationParameters pagination)
    {
        var posts = await postService.GetAllPostsByLikeAsync(pagination);
        var response = new ApiResponse<PaginatedList<GetPostResponseDto>>(
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
        var response = new ApiResponse<PaginatedList<GetPostResponseDto>>(
            success: true,
            message: "Successfully retrieved posts",
            data: posts,
            statusCode: HttpStatusCode.OK
        );
        return response.ToActionResult();
    }

    // --- ADMIN POST MANAGEMENT ---
    [HttpGet("admin/all")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllPostsAdmin([FromQuery] PaginationParameters pagination)
    {
        var posts = await postService.GetAllPostsAsync(pagination);
        var response = new ApiResponse<PaginatedList<GetPostResponseDto>>(
            success: true,
            message: "Successfully retrieved all posts",
            data: posts,
            statusCode: HttpStatusCode.OK
        );
        return response.ToActionResult();
    }

    [HttpDelete("admin/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeletePostAdmin(Guid id)
    {
        try
        {
            var result = await postService.DeletePostAdmin(id);
            var response = new ApiResponse<bool>(
                success: true,
                message: "Successfully deleted post",
                data: result,
                statusCode: HttpStatusCode.OK
            );
            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<bool>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );
            return response.ToActionResult();
        }
    }

    [HttpPut("admin/{id:guid}/hide")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> HidePost(Guid id)
    {
        try
        {
            var result = await postService.HidePost(id);
            var response = new ApiResponse<bool>(
                success: true,
                message: "Successfully hid post",
                data: result,
                statusCode: HttpStatusCode.OK
            );
            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<bool>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );
            return response.ToActionResult();
        }
    }

    [HttpPut("admin/{id:guid}/show")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ShowPost(Guid id)
    {
        try
        {
            var result = await postService.ShowPost(id);
            var response = new ApiResponse<bool>(
                success: true,
                message: "Successfully showed post",
                data: result,
                statusCode: HttpStatusCode.OK
            );
            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<bool>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );
            return response.ToActionResult();
        }
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

    // --- VOTE ENDPOINTS ---
    [HttpPost("{postId:guid}/upvote")]
    [Authorize]
    public async Task<IActionResult> UpvotePost(Guid postId)
    {
        try
        {
            var result = await postService.VoteOnPost(postId, VoteType.Upvote);
            var response = new ApiResponse<bool>(
                success: true,
                message: "Successfully upvoted post",
                data: result,
                statusCode: HttpStatusCode.OK
            );
            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<bool>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );
            return response.ToActionResult();
        }
    }

    [HttpPost("{postId:guid}/downvote")]
    [Authorize]
    public async Task<IActionResult> DownvotePost(Guid postId)
    {
        try
        {
            var result = await postService.VoteOnPost(postId, VoteType.Downvote);
            var response = new ApiResponse<bool>(
                success: true,
                message: "Successfully downvoted post",
                data: result,
                statusCode: HttpStatusCode.OK
            );
            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<bool>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );
            return response.ToActionResult();
        }
    }

    [HttpDelete("{postId:guid}/vote")]
    [Authorize]
    public async Task<IActionResult> RemoveVote(Guid postId)
    {
        try
        {
            var result = await postService.RemoveVote(postId);
            var response = new ApiResponse<bool>(
                success: true,
                message: result ? "Successfully removed vote" : "No vote to remove",
                data: result,
                statusCode: HttpStatusCode.OK
            );
            return response.ToActionResult();
        }
        catch (Exception e)
        {
            var response = new ApiResponse<bool>(
                success: false,
                message: e.Message,
                statusCode: HttpStatusCode.BadRequest
            );
            return response.ToActionResult();
        }
    }
}
