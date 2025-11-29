namespace fitlife_planner_back_end.Api.DTOs.Responses;

public class UpdatePostResponseDto
{
    public string Title  { get; set; }
    public string Content  { get; set; }
    public string Media { get; set; }
    public UpdatePostResponseDto(string  title, string content, string media){
        Title  = title;
        Content = content;
        Media = media;
    }
}