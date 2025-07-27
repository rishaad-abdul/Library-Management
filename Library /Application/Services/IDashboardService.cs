using Library.Application.DTO_s;

namespace Library.Application.Services;

public interface IDashboardService
{
    DashboardDto GetStudentDashboard(string userId);
    DashboardDto GetAdminDashboard();
}