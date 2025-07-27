using Library.Domain.Entities;

namespace Library.Domain.Interfaces;

public interface ILoanRepository
{
    IEnumerable<Loan> GetAll();
    IEnumerable<Loan> GetByStudentId(string? studentId);
    public IEnumerable<Loan> GetLoansByBookId(int id);
    void Add(Loan loan);
    void Update(Loan loan);
    void Delete(int id);
    void DeleteStudentById(string studentId);
    void MarkCleared(int id);
    void MarkPending(int id);
}