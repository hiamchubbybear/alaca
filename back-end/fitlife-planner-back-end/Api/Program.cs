using System.Security.Claims;
using System.Text;
using fitlife_planner_back_end.Api.Configurations;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using fitlife_planner_back_end.Api.Interface;
using fitlife_planner_back_end.Api.Mapper;
using fitlife_planner_back_end.Api.Middlewares;
using fitlife_planner_back_end.Api.Util;
using fitlife_planner_back_end.Application.Services;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors();
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        opts.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });



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
                var identity = ctx.Principal.Identity as ClaimsIdentity;
                var userId = ctx.Principal.FindFirst("iiss")?.Value;
                if (!string.IsNullOrEmpty(userId))
                    identity?.AddClaim(new Claim("userId", userId));
                var role = ctx.Principal.FindFirst("role")?.Value;
                if (!string.IsNullOrEmpty(role))
                    identity?.AddClaim(new Claim(ClaimTypes.Role, role));
                var email = ctx.Principal.FindFirst("email")?.Value;
                if (!string.IsNullOrEmpty(email))
                    identity?.AddClaim(new Claim("email", email));
                var exp = ctx.Principal.FindFirst("exp")?.Value;
                if (!string.IsNullOrEmpty(exp))
                    identity?.AddClaim(new Claim("tokenExp", exp));
                return Task.CompletedTask;
            }
        };
    });
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUserContext, UserContext>();
builder.Services.AddScoped<JwtSigner>().AddScoped<UserService>().AddScoped<AuthenticationService>()
    .AddScoped<Mapping>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
var connString = "Server=127.0.0.1;Port=3306;Database=alaca;User=root;Password=12345678;";
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connString, ServerVersion.AutoDetect(connString))
);
var app = builder.Build();
app.UseAuthentication();
app.UseAuthorization();
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