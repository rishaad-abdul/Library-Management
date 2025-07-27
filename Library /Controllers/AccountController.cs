using Library.Domain.Entities;
using Library.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Library.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Ensure only authenticated users can access
public class AccountController : ControllerBase
{
    private readonly IAccountRepository _repo;

    public AccountController(IAccountRepository repo)
    {
        _repo = repo;
    }

    [HttpGet("me")]
    public IActionResult GetAccount()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdString, out var userId))
            return Unauthorized();

        var account = _repo.GetById(userId);
        if (account == null)
            return NotFound("Account not found.");

        return Ok(account);
    }

    [HttpPut("me")]
    public IActionResult Update(Account updated)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdString, out var userId) || userId != updated.Id)
            return Unauthorized();

        _repo.Update(updated);
        return NoContent();
    }
}