using Library.Domain.Entities;
using Library.Domain.Interfaces;

namespace Library.Application.Services;

public class LoansService :  ILoansService
{
    private readonly ILoanRepository _loanRepository;
    private readonly IBookRepository _bookRepository;

    public LoansService(ILoanRepository loanRepository, IBookRepository bookRepository)
    {
        _loanRepository = loanRepository;
        _bookRepository = bookRepository;
    }
    
    public IEnumerable<Loan> GetPendingLoans()
    {
        return _loanRepository.GetAll().Where(l => !l.IsCleared);
    }

    public IEnumerable<Loan> GetAllLoans()
    {
        return _loanRepository.GetAll();
    }

    public void CreateLoan(Loan loan)
    {
        _loanRepository.Add(loan);
    }

    public bool UpdateLoan(int id, Loan updatedLoan)
    {
        updatedLoan.LoanId = id;
        _loanRepository.Update(updatedLoan);
        
        var book = _bookRepository.GetBookById(updatedLoan.BookId);
        if (book == null) return false;
        _bookRepository.Update(book);
        return true;
    }

    public void DeleteLoan(int id)
    {
        _loanRepository.Delete(id);
    }

    public void MarkClearLoan(int id)
    {
        _loanRepository.MarkCleared(id);
    }

    public void MarkPendingLoan(int id)
    {
        _loanRepository.MarkPending(id);
    }
}