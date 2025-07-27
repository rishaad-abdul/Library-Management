using Library.Domain.Entities;

namespace Library.Application.Services;

public interface ILoansService
{
    IEnumerable<Loan> GetPendingLoans();
    IEnumerable<Loan> GetAllLoans();
    void CreateLoan(Loan loan);
    bool UpdateLoan(int id, Loan loan);
    void DeleteLoan(int id);
    void MarkClearLoan(int id);
    void MarkPendingLoan(int id);
}