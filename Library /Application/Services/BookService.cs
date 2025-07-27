using Library.Domain.Entities;
using Library.Domain.Interfaces;

namespace Library.Application.Services;

public class BookService : IBookService
{
    private readonly IBookRepository _bookRepository;
    private readonly ILoanRepository _loanRepository;

    public BookService(IBookRepository bookRepository, ILoanRepository loanRepository)
    {
        _bookRepository = bookRepository;
        _loanRepository = loanRepository;
    }

    public Book AddBook(Book book)
    {
        return _bookRepository.Add(book);
    }

    public IEnumerable<Book> GetAllBooks()
    {
        return _bookRepository.GetAll();
    }

    public Book? GetBookDetailsById(int id)
    {
        return _bookRepository.GetBookById(id);
    }

    public bool UpdateBook(int id, Book updatedBook)
    {
        var existingBook = _bookRepository.GetBookById(id);
        if (existingBook == null)
            return false;

        updatedBook.BookId = id;
        _bookRepository.Update(updatedBook);
        return true;
    }

    public bool DeleteBook(int id)
    {
        var book = _bookRepository.GetBookById(id);
        if (book == null)
            return false;

        var loansAssociated = _loanRepository.GetLoansByBookId(id).ToList();
        foreach (var loan in loansAssociated)
        {
            _loanRepository.Delete(loan.LoanId);
        }

        _bookRepository.Delete(book.BookId);
        return true;
    }
}