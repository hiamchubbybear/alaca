namespace fitlife_planner_back_end.Api.DTOs.Resquests;

public class UpdatePostRequestDto
{
    public string Title  { get; set; }
    public string Content  { get; set; }
    public string Media { get; set; }
    public UpdatePostRequestDto(string  title, string content, string media){
        Title  = title;
        Content = content;
        Media = media;
    }
}