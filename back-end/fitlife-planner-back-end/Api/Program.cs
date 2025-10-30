using System.Collections.Generic;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(policy =>
    policy.AllowAnyOrigin()
          .AllowAnyHeader()
          .AllowAnyMethod()
);

app.MapGet("/", () => Results.Ok(new { message = "API is running" }));

app.MapGet("/hello", () =>
    APIResponseWrapper.ApiResponse<Dictionary<string, string>>
        .CreateSuccessResponse(data: new() { { "Hello", "Hello" } })
);

app.Run();
