using Library.Application.Services;
using Library.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Library.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LoansController : ControllerBase
{
    private readonly ILoansService _loansService;

    public LoansController(ILoansService loansService)
    {
        _loansService = loansService;
    }

    [HttpGet("pending")]
    public IActionResult GetPending()
    {
        var pending = _loansService.GetPendingLoans();
        return Ok(pending);
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        var all = _loansService.GetAllLoans();
        return Ok(all);
    }

    [HttpPost]
    public IActionResult AddLoan([FromBody] Loan? loan)
    {
        if (loan == null)
            return BadRequest("Loan data is required.");

        _loansService.CreateLoan(loan);
        return Ok(loan);
    }

    [HttpPut("{id}")]
    public IActionResult Update(int id, [FromBody] Loan? updated)
    {
        if (updated == null)
            return BadRequest("Updated loan data is required.");

        var updatedSuccessfully = _loansService.UpdateLoan(id, updated);

        if (!updatedSuccessfully)
            return NotFound($"Loan with ID {id} not found.");

        return Ok("Loan Details Updated");
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        _loansService.DeleteLoan(id);
        return Ok("Loan Details Deleted");
    }

    [HttpPost("{id}/clear")]
    public IActionResult ClearDue(int id)
    {
        _loansService.MarkClearLoan(id);
        return Ok("Loan Marked Clear Successfully");
    }

    [HttpPost("{id}/mark-pending")]
    public IActionResult MarkPending(int id)
    {
        _loansService.MarkPendingLoan(id);
        return Ok("Loan Marked Pending Successfully");
    }
}