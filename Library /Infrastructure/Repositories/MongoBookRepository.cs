using Library.Domain.Entities;
using Library.Domain.Interfaces;
using Library.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Library.Infrastructure.Repositories
{
    public class MongoBookRepository : IBookRepository
    {
        private readonly IMongoCollection<Book> _books;

        public MongoBookRepository(IOptions<MongoDbSettings> settings, IMongoClient mongoClient)
        {
            var db = mongoClient.GetDatabase(settings.Value.DatabaseName);
            _books = db.GetCollection<Book>(settings.Value.BookCollectionName);
        }

        public IEnumerable<Book> GetAll()
        {
            return _books.Find(_ => true).ToList();
        }

        public Book? GetBookById(int id)
        {
            return _books.Find(b => b.BookId == id).FirstOrDefault();
        }

        public IEnumerable<Book> GetBooksForId(string userId)
        {
            return _books.Find(b => b.UserId == userId).ToList();
        }

        public Book Add(Book book)
        {
            var maxBookId = _books.Find(_ => true)
                .SortByDescending(b => b.BookId)
                .Limit(1)
                .FirstOrDefault()?.BookId ?? 0;

            book.BookId = maxBookId + 1;
            _books.InsertOne(book);

            return book; // This will now have MongoId set by Mongo
        }


        public void Update(Book book)
        {
            _books.ReplaceOne(b => b.BookId == book.BookId, book);
        }

        public void Delete(int id)
        {
            _books.DeleteOne(b => b.BookId == id);
        }
    }
}
