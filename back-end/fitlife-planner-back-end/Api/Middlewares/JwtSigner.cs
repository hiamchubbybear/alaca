using System.Runtime.InteropServices.JavaScript;
using System.Security.Cryptography;
using fitlife_planner_back_end.Api.Configurations;
using fitlife_planner_back_end.Api.Models;
using fitlife_planner_back_end.Api.Responses;
using fitlife_planner_back_end.Api.Util;
using fitlife_planner_back_end.Application.DTOs;
using JWT;
using JWT.Algorithms;
using JWT.Serializers;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace fitlife_planner_back_end.Api.Middlewares;

public class JwtSigner
{
    // 24hours
    private static readonly long TOKEN_TIME_LIVE = 24;

    // private static readonly string SIGNER_KEY = Environment.GetEnvironmentVariable("SIGNER_KEY");
    private static readonly string SIGNER_KEY =
        "1/3pvho0/tHL9NElGz4OcrSdsbC10OB5iMHAmn3hOH+YnhFgpNsmbl/8i5REO3DTd6zsiwLu2pjr7UukdVA5Tw==";

    private readonly ILogger<JwtSigner> _logger;
    private readonly AppDbContext _db;

    public JwtSigner(ILogger<JwtSigner> logger, AppDbContext db)
    {
        _logger = logger;
        _db = db;
    }

    public string SignKey(AuthenticationRequestDto authenticationRequestDto)
    {
        try
        {
            long tokenExp = DateTimeOffset.UtcNow.AddSeconds(TOKEN_TIME_LIVE).ToUnixTimeMilliseconds();
            var payload = new Dictionary<String, Object>
            {
                { "iiss", authenticationRequestDto.id },
                { "iss", authenticationRequestDto.username },
                { "email", authenticationRequestDto.email },
                { "exp", tokenExp },
            };
            IJwtAlgorithm algorithm = new HMACSHA256Algorithm();
            IJsonSerializer serializer = new JsonNetSerializer();
            IBase64UrlEncoder urlEncoder = new JwtBase64UrlEncoder();
            IJwtEncoder encoder = new JwtEncoder(algorithm, serializer, urlEncoder);
            String key = SIGNER_KEY;
            string token = encoder.Encode(payload, key);
            _logger.LogInformation("[JwtSigner_SignKey] {}", token);
            return token;
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }
}