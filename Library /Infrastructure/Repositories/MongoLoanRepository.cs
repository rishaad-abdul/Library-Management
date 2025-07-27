using Library.Domain.Entities;
using Library.Domain.Interfaces;
using Library.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Library.Infrastructure.Repositories;

public class MongoLoanRepository : ILoanRepository
{
    private readonly IMongoCollection<Loan> _loans;

    public MongoLoanRepository(IOptions<MongoDbSettings> settings, IMongoClient mongoClient)
    {
        var db = mongoClient.GetDatabase(settings.Value.DatabaseName);
        _loans = db.GetCollection<Loan>(settings.Value.LoanCollectionName);
    }

    public IEnumerable<Loan> GetAll()
    {
        return _loans.Find(_ => true).ToList();
    }

    public IEnumerable<Loan> GetByStudentId(string? studentId)
    {
        return _loans.Find(l => l.UserId == studentId).ToList();
    }

    public IEnumerable<Loan> GetLoansByBookId(int bookId)
    {
        return _loans.Find(l => l.BookId == bookId).ToList();
    }

    public void Add(Loan loan)
    {
        var maxId = _loans.Find(_ => true)
            .SortByDescending(l => l.LoanId)
            .Limit(1)
            .FirstOrDefault()?.LoanId ?? 0;

        loan.LoanId = maxId + 1;
        _loans.InsertOne(loan);
    }

    public void Update(Loan loan)
    {
        _loans.ReplaceOne(l => l.LoanId == loan.LoanId, loan);
    }

    public void Delete(int id)
    {
        _loans.DeleteOne(l => l.LoanId == id);
    }

    public void DeleteStudentById(string studentId)
    {
        _loans.DeleteMany(l => l.StudentId == studentId);
    }

    public void MarkCleared(int id)
    {
        var update = Builders<Loan>.Update.Set(l => l.IsCleared, true);
        _loans.UpdateOne(l => l.LoanId == id, update);
    }

    public void MarkPending(int id)
    {
        var update = Builders<Loan>.Update.Set(l => l.IsCleared, false);
        _loans.UpdateOne(l => l.LoanId == id, update);
    }
}