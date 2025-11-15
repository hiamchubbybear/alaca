using fitlife_planner_back_end.Api.Configurations;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using fitlife_planner_back_end.Api.Mapper;
using fitlife_planner_back_end.Api.Middlewares;
using fitlife_planner_back_end.Application.Services;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddCors();


builder.Services.AddControllers()
    .AddJsonOptions(opt =>
        opt.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    );



builder.Services.AddScoped<JwtSigner>().AddScoped<UserService>().AddScoped<AuthenticationService>().AddScoped<Mapping>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


var connString = "Server=127.0.0.1;Port=3306;Database=alaca;User=root;Password=12345678;";
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connString, ServerVersion.AutoDetect(connString))
);

var app = builder.Build();


using (var scope = app.Services.CreateScope())
{
    scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.Migrate();
}


app.UseCors(p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1"));
}

app.MapControllers();

app.Run();