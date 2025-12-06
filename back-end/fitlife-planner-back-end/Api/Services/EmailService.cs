using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace fitlife_planner_back_end.Api.Services;

public class EmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly string _smtpHost;
    private readonly int _smtpPort;
    private readonly string _smtpUser;
    private readonly string _smtpPassword;
    private readonly string _fromName;
    private readonly string _fromEmail;
    private readonly string _frontendUrl;

    public EmailService(ILogger<EmailService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _smtpHost = Environment.GetEnvironmentVariable("SMTP_HOST") ?? "smtp.gmail.com";
        _smtpPort = int.Parse(Environment.GetEnvironmentVariable("SMTP_PORT") ?? "587");
        _smtpUser = Environment.GetEnvironmentVariable("SMTP_USER") ?? "";
        _smtpPassword = Environment.GetEnvironmentVariable("SMTP_PASSWORD") ?? "";
        _fromName = Environment.GetEnvironmentVariable("SMTP_FROM_NAME") ?? "Alaca - FitLife Planner";
        _fromEmail = Environment.GetEnvironmentVariable("SMTP_FROM_EMAIL") ?? _smtpUser;
        _frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:5173";
    }

    public async Task<bool> SendPasswordResetEmail(string toEmail, string username, string resetToken)
    {
        try
        {
            var resetLink = $"{_frontendUrl}/reset-password?token={resetToken}";
            var htmlBody = GetPasswordResetEmailTemplate(username, resetLink);

            await SendEmailAsync(toEmail, "Reset Your Password - Alaca - FitLife Planner", htmlBody);

            _logger.LogInformation("Password reset email sent to {Email}", toEmail);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send password reset email to {Email}", toEmail);
            return false;
        }
    }

    private async Task SendEmailAsync(string to, string subject, string htmlBody)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_fromName, _fromEmail));
        message.To.Add(new MailboxAddress("", to));
        message.Subject = subject;

        var bodyBuilder = new BodyBuilder
        {
            HtmlBody = htmlBody
        };
        message.Body = bodyBuilder.ToMessageBody();

        using var client = new SmtpClient();

        await client.ConnectAsync(_smtpHost, _smtpPort, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(_smtpUser, _smtpPassword);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }

    private string GetPasswordResetEmailTemplate(string username, string resetLink)
    {
        return $@"
<!DOCTYPE html>
<html lang=""vi"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Reset Your Password</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #1a202c;
            background-color: #f7fafc;
        }}

        .container {{
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }}

        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
        }}

        .header h1 {{
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin: 0;
        }}

        .header p {{
            color: #e6e6ff;
            font-size: 14px;
            margin-top: 8px;
        }}

        .content {{
            padding: 40px 30px;
        }}

        .greeting {{
            font-size: 18px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 20px;
        }}

        .message {{
            font-size: 15px;
            color: #4a5568;
            margin-bottom: 30px;
            line-height: 1.8;
        }}

        .button-container {{
            text-align: center;
            margin: 35px 0;
        }}

        .reset-button {{
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }}

        .reset-button:hover {{
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
        }}

        .expiry-notice {{
            background: #fff5f5;
            border-left: 4px solid #fc8181;
            padding: 16px;
            margin: 25px 0;
            border-radius: 4px;
        }}

        .expiry-notice p {{
            color: #c53030;
            font-size: 14px;
            margin: 0;
        }}

        .security-notice {{
            background: #f0fff4;
            border-left: 4px solid #48bb78;
            padding: 16px;
            margin: 25px 0;
            border-radius: 4px;
        }}

        .security-notice p {{
            color: #2f855a;
            font-size: 13px;
            margin: 0;
        }}

        .footer {{
            background: #f7fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }}

        .footer p {{
            color: #718096;
            font-size: 13px;
            margin: 5px 0;
        }}

        .footer a {{
            color: #667eea;
            text-decoration: none;
        }}

        .divider {{
            height: 1px;
            background: #e2e8f0;
            margin: 30px 0;
        }}

        @media only screen and (max-width: 600px) {{
            .container {{
                margin: 20px;
                border-radius: 8px;
            }}

            .header {{
                padding: 30px 20px;
            }}

            .header h1 {{
                font-size: 24px;
            }}

            .content {{
                padding: 30px 20px;
            }}

            .reset-button {{
                padding: 14px 30px;
                font-size: 15px;
            }}
        }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>Reset Your Password</h1>
            <p>Alaca - FitLife Planner</p>
        </div>

        <div class=""content"">
            <p class=""greeting"">Hi {username},</p>

            <p class=""message"">
                We received a request to reset your password for your Alaca - FitLife Planner account.
                Click the button below to create a new password.
            </p>

            <div class=""button-container"">
                <a href=""{resetLink}"" class=""reset-button"">Reset Password</a>
            </div>

            <div class=""expiry-notice"">
                <p><strong>Important:</strong> This link will expire in 15 minutes for security reasons.</p>
            </div>

            <div class=""divider""></div>

            <p class=""message"" style=""font-size: 14px;"">
                If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style=""font-size: 13px; color: #667eea; word-break: break-all; margin-bottom: 20px;"">
                {resetLink}
            </p>

            <div class=""security-notice"">
                <p>
                    <strong>Security Tip:</strong> If you didn't request this password reset,
                    you can safely ignore this email. Your password will remain unchanged.
                </p>
            </div>
        </div>

        <div class=""footer"">
            <p><strong>Alaca - FitLife Planner</strong></p>
            <p>Your personal fitness companion</p>
            <p style=""margin-top: 15px;"">
                Need help? Contact us at <a href=""mailto:support@fitlife.com"">support@fitlife.com</a>
            </p>
            <p style=""margin-top: 10px; font-size: 12px;"">
                © 2024 Alaca - FitLife Planner. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>";
    }
}
