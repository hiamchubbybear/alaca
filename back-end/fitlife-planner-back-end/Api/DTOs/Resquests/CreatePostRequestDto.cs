namespace fitlife_planner_back_end.Api.DTOs.Resquests;

public class CreatePostRequestDto
{
    public string Title { get; set; }
    public string Content { get; set; }
    public string Media { get; set; }
    
    public CreatePostRequestDto(String title, String content, String media){
        Title = title;
        Content = content;
        Media = media;
    }
      
}