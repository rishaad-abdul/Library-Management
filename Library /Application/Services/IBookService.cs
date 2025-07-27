using Library.Domain.Entities;

namespace Library.Application.Services;

public interface IBookService
{
    Book AddBook(Book book);
    IEnumerable<Book> GetAllBooks();
    Book? GetBookDetailsById(int id);
    bool UpdateBook(int id, Book book);
    bool DeleteBook(int id);
}