using Library.Domain.Entities;
using Library.Domain.Interfaces;
using Library.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Library.Infrastructure.Repositories;

public class MongoStudentRepository : IStudentRepository
{
    private readonly IMongoCollection<Student> _students;

    public MongoStudentRepository(IOptions<MongoDbSettings> settings, IMongoClient mongoClient)
    {
        var db = mongoClient.GetDatabase(settings.Value.DatabaseName);       
        _students = db.GetCollection<Student>(settings.Value.StudentCollectionName);
    }

    public IEnumerable<Student> GetAll() =>
        _students.Find(_ => true).ToList();

    public Student? GetById(string id) =>
        _students.Find(s => s.Id == id).FirstOrDefault();

    public void Add(Student student)
    {
        _students.InsertOne(student);
    }

    public void Update(Student student)
    {
        _students.ReplaceOne(s => s.Id == student.Id, student);
    }

    public void Delete(string id)
    {
        _students.DeleteOne(s => s.Id == id);
    }
}