namespace fitlife_planner_back_end.Api.Util;

public class PasswordEncoder
{
    public static string EncodePassword(string password) => BCrypt.Net.BCrypt.HashPassword(password);
    public static bool DecodePassword(string password, string rawPassword) => BCrypt.Net.BCrypt.Verify(rawPassword, password);
}