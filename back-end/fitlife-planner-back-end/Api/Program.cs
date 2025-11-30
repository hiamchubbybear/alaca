using System.Security.Claims;
using System.Text;
using fitlife_planner_back_end.Api.Configurations;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using fitlife_planner_back_end.Api.Interface;
using fitlife_planner_back_end.Api.Mapper;
using fitlife_planner_back_end.Api.Middlewares;
using fitlife_planner_back_end.Api.Repository;
using fitlife_planner_back_end.Api.Services;
using fitlife_planner_back_end.Api.Util;
using fitlife_planner_back_end.Application.Services;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;

var builder = WebApplication.CreateBuilder(args);
DotNetEnv.Env.Load();
builder.Services.AddCors();
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        opts.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

var host = Environment.GetEnvironmentVariable("AIVEN_DB_HOST");
var port = Environment.GetEnvironmentVariable("AIVEN_DB_PORT");
var db = Environment.GetEnvironmentVariable("AIVEN_DB_NAME");
var user = Environment.GetEnvironmentVariable("AIVEN_DB_USER");
var pass = Environment.GetEnvironmentVariable("AIVEN_DB_PASSWORD");
var ssl = Environment.GetEnvironmentVariable("AIVEN_DB_SSLMODE");


var jwtKey = builder.Configuration["Jwt:Key"]
             ?? "1/3pvho0/tHL9NElGz4OcrSdsbC10OB5iMHAmn3hOH+YnhFgpNsmbl/8i5REO3DTd6zsiwLu2pjr7UukdVA5Tw==";
builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            NameClaimType = "iss",
        };
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = ctx =>
            {
                var identity = ctx.Principal?.Identity as ClaimsIdentity;
                var userId = ctx.Principal?.FindFirst("iiss")?.Value;
                if (!string.IsNullOrEmpty(userId))
                    identity?.AddClaim(new Claim("userId", userId));
                var profileId = ctx.Principal?.FindFirst("profileId")?.Value;
                if (!string.IsNullOrEmpty(profileId))
                    identity?.AddClaim(new Claim("profileId", profileId));
                var role = ctx.Principal?.FindFirst("role")?.Value;
                if (!string.IsNullOrEmpty(role))
                    identity?.AddClaim(new Claim(ClaimTypes.Role, role));
                var email = ctx.Principal?.FindFirst("email")?.Value;
                if (!string.IsNullOrEmpty(email))
                    identity?.AddClaim(new Claim("email", email));
                var exp = ctx.Principal?.FindFirst("exp")?.Value;
                if (!string.IsNullOrEmpty(exp))
                    identity?.AddClaim(new Claim("tokenExp", exp));
                return Task.CompletedTask;
            }
        };
    });
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUserContext, UserContext>();
builder.Services.AddScoped<JwtSigner>().AddScoped<UserService>().AddScoped<AuthenticationService>()
    .AddScoped<Mapping>().AddScoped<ProfileService>().AddScoped<ProfileRepository>().AddScoped<BMIService>()
    .AddScoped<BMIUtil>().AddScoped<UserContext>()
    .AddScoped<PostService>().AddScoped<PostRepository>()
    .AddScoped<FoodItemService>()
    .AddScoped<NutritionPlanService>()
    .AddScoped<ExerciseLibraryService>()
    .AddScoped<WorkoutService>()
    .AddScoped<WorkoutScheduleService>()
    .AddScoped<ProgressService>()
    .AddScoped<ChallengeService>()
    .AddScoped<NotificationService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
var connString = $"Server={host};Port={port};Database={db};User={user};Password={pass};SslMode={ssl};";
var useInMemory = builder.Configuration.GetValue<bool>("UseInMemoryDatabase");
if (!useInMemory)
{
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseMySql(connString, new MySqlServerVersion(new Version(8, 0, 23)))
    );
}
Console.WriteLine($"Using MySQL connection: {connString}");

var app = builder.Build();
app.UseAuthentication();
app.UseAuthorization();
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        if (dbContext.Database.ProviderName != "Microsoft.EntityFrameworkCore.InMemory")
        {
            // dbContext.Database.Migrate();
        }
    }
    catch (Exception ex)
    {
        // Log error instead of crashing
        Console.WriteLine($"Database initialization error: {ex.Message}");
    }
}

// using var scopeDB = app.Services.CreateScope();
// var db = scopeDB.ServiceProvider.GetRequiredService<AppDbContext>();
// db.Database.EnsureDeleted();
// db.Database.EnsureCreated();


app.UseCors(p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1"));
}

app.MapControllers();
app.Run();

public partial class Program
{
}
