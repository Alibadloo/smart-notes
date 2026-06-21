using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SmartNotes.API.Data;
using SmartNotes.API.DTOs.Auth;
using SmartNotes.API.Interfaces;
using SmartNotes.API.Models;

namespace SmartNotes.API.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower());
        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return null;

        return new AuthResponseDto
        {
            Token = GenerateToken(user),
            FullName = user.FullName,
            Email = user.Email,
            UserId = user.Id
        };
    }

    public async Task<AuthResponseDto?> RegisterAsync(RegisterDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email.ToLower()))
            return null;

        var user = new User
        {
            Email = dto.Email.ToLower(),
            FullName = dto.FullName,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        await SeedDefaultCategories(user.Id);

        return new AuthResponseDto
        {
            Token = GenerateToken(user),
            FullName = user.FullName,
            Email = user.Email,
            UserId = user.Id
        };
    }

    private async Task SeedDefaultCategories(int userId)
    {
        var defaults = new[]
        {
            new Category { Name = "Work",     Color = "#3B82F6", Icon = "work",   IsDefault = true, UserId = userId },
            new Category { Name = "Personal", Color = "#10B981", Icon = "person", IsDefault = true, UserId = userId },
            new Category { Name = "Study",    Color = "#F59E0B", Icon = "school", IsDefault = true, UserId = userId },
        };
        _db.Categories.AddRange(defaults);
        await _db.SaveChangesAsync();
    }

    private string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _config["Jwt:Key"] ?? "SmartNotes-DefaultSecret-ChangeInProduction-2024!"));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? "SmartNotesAPI",
            audience: _config["Jwt:Audience"] ?? "SmartNotesApp",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
