using Library.Application.DTO_s;
using Library.Domain.Interfaces;

namespace Library.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IBookRepository _bookRepo;
    private readonly ILoanRepository _loanRepo;

    public DashboardService(IBookRepository bookRepo, ILoanRepository loanRepo)
    {
        _bookRepo = bookRepo;
        _loanRepo = loanRepo;
    }

    public DashboardDto GetStudentDashboard(string userId)
    {
        var studentLoans = _loanRepo.GetByStudentId(userId).ToList();
        var totalDues = studentLoans
            .Where(l => !l.IsCleared)
            .Sum(l => l.Days * l.PricePerDay);

        return new DashboardDto
        {
            TotalBooks = studentLoans.Count,
            TotalDues = totalDues,
            PendingLoans = studentLoans.Count(l => !l.IsCleared)
        };
    }

    public DashboardDto GetAdminDashboard()
    {
        var allLoans = _loanRepo.GetAll().ToList();
        var totalBooks = _bookRepo.GetAll().Count();
        var totalDues = allLoans
            .Where(l => !l.IsCleared)
            .Sum(l => l.Days * l.PricePerDay);

        return new DashboardDto
        {
            TotalBooks = totalBooks,
            TotalDues = totalDues,
            PendingLoans = allLoans.Count(l => !l.IsCleared)
        };
    }
}