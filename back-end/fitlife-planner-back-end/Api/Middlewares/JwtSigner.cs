using System.Runtime.InteropServices.JavaScript;
using System.Security.Cryptography;
using JWT;
using JWT.Algorithms;
using JWT.Serializers;

namespace fitlife_planner_back_end.Api.Middlewares;

public class JwtSigner
{
    private static readonly long TOKEN_TIME_LIVE = 60 * 60 * 24;

    // private static readonly string SIGNER_KEY = Environment.GetEnvironmentVariable("SIGNER_KEY");
    private static readonly string SIGNER_KEY =
        "1/3pvho0/tHL9NElGz4OcrSdsbC10OB5iMHAmn3hOH+YnhFgpNsmbl/8i5REO3DTd6zsiwLu2pjr7UukdVA5Tw==";

    private readonly ILogger _logger;

    public JwtSigner(ILogger<JwtSigner> logger)
    {
        _logger = logger;
    }

    public string GenerateToken(AuthenticationDTO authenticationDto)
    {
        try
        {
            var payload = new Dictionary<String, Object>(
            );
            RSA certificate = RSA.Create();
            IJwtAlgorithm algorithm = new RS512Algorithm(certificate);
            IJsonSerializer serializer = new JsonNetSerializer();
            IBase64UrlEncoder urlEncoder = new JwtBase64UrlEncoder();
            IJwtEncoder encoder = new JwtEncoder(algorithm, serializer, urlEncoder);
            String key = SIGNER_KEY;
            var token = encoder.Encode(payload, key);
            return token;
        }
        catch (Exception e)
        {
            _logger.LogError("[JwtSigner_Error] {}", e.Message);
            throw;
        }
    }

    public string RefreshToken(AuthenticationDTO authenticationDto)
    {
        try
        {
            var payload = new Dictionary<String, Object>(
            );
            RSA certificate = RSA.Create();
            IJwtAlgorithm algorithm = new RS512Algorithm(certificate);
            IJsonSerializer serializer = new JsonNetSerializer();
            IBase64UrlEncoder urlEncoder = new JwtBase64UrlEncoder();
            IJwtEncoder encoder = new JwtEncoder(algorithm, serializer, urlEncoder);
            String key = SIGNER_KEY;
            var token = encoder.Encode(payload, key);
            return token;
        }
        catch (Exception e)
        {
            _logger.LogError("[JwtSigner_Error] {}", e.Message);
            throw;
        }
    }s
}

public record class AuthenticationDTO
{
    private string username;
    private string email;
}