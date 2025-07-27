using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace Library.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;

    public AuthController(IConfiguration config)
    {
        _config = config;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        if (request.Username == "admin" && request.Password == "admin123")
        {
            var token = GenerateJwtToken("1", "Admin");
            return Ok(new { token });
        }
        else if (request.Username == "student" && request.Password == "student123")
        {
            var token = GenerateJwtToken("2", "Student");
            return Ok(new { token });
        }

        return Unauthorized("Invalid credentials");
    }

    private string GenerateJwtToken(string userId, string role)
    {
        var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "YourSuperSecretKeyHere123!");
        var issuer = _config["Jwt:Issuer"] ?? "yourapp";

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Role, role)
        };

        var creds = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: null,
            claims: claims,
            expires: DateTime.UtcNow.AddSeconds(5),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public record LoginRequest(string Username, string Password);
