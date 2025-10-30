
using System.Collections.Generic;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("AllowAll");
Dictionary<string, string> dic = new()
{
    { "Hello", "Hello" }
};

app.MapGet("/hello", () =>
    APIResponseWrapper.ApiResponse<Dictionary<string, string>>
        .CreateSuccessResponse(data: dic)
);

app.Run();
