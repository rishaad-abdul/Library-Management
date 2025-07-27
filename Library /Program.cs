using Library.Domain.Interfaces;
using Library.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Library.Application.Services;
using Library.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

// Add JWT config 
var jwtKey = builder.Configuration["Jwt:Key"] ?? "YourSuperSecretKeyHere123!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "yourapp";

builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));

builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<MongoDbSettings>>().Value;
    return new MongoClient(settings.ConnectionString);
});

// Register Repositories
builder.Services.AddScoped<IBookRepository, MongoBookRepository>();
builder.Services.AddScoped<ILoanRepository, MongoLoanRepository>();
builder.Services.AddScoped<IStudentRepository, MongoStudentRepository>();
builder.Services.AddScoped<IAccountRepository, InMemoryAccountRepository>();

// Register Services
builder.Services.AddScoped<IBookService, BookService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<ILoansService, LoansService>();



// Add Controllers
builder.Services.AddControllers();

// Add CORS for React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy => policy.WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

// ✅ Add Authentication + JWT Bearer
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Middleware Order Matters
app.UseCors("AllowReact");

// ✅ Custom demo token middleware BEFORE authentication
app.Use(async (context, next) =>
{
    var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

    if (token == "demo-admin-token" || token == "demo-student-token")
    {
        var claims = new[]
        {
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Name, "Demo User"),
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, token == "demo-admin-token" ? "admin" : "student")
        };
        var identity = new System.Security.Claims.ClaimsIdentity(claims, "demo");
        context.User = new System.Security.Claims.ClaimsPrincipal(identity);
    }

    await next();
});

app.UseAuthentication();  // ✅ Must come after custom middleware
app.UseAuthorization();

app.MapControllers();
app.Run();
