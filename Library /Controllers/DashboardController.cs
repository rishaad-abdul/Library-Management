using Library.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Library.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet]
    public  IActionResult GetDashboard()
    {
        var userRole = User.FindFirst("role")?.Value ?? "";
        var userId = User.FindFirst("id")?.Value ?? "";

        try
        {
            if (userRole == "Student")
            {
                var studentDashboard = _dashboardService.GetStudentDashboard(userId);
                return Ok(studentDashboard);
            }

            var adminDashboard = _dashboardService.GetAdminDashboard();
            return Ok(adminDashboard);
        }
        catch 
        {
            return StatusCode(500, "An error occurred while retrieving dashboard data");
        }
    }

}