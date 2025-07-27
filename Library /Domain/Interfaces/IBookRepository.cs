using Library.Domain.Entities;

namespace Library.Domain.Interfaces;

public interface IBookRepository
{
    IEnumerable<Book> GetAll();
    Book? GetBookById(int id);
    IEnumerable<Book> GetBooksForId(string id);
    Book Add(Book book);
    void Update(Book book);
    void Delete(int id);
}