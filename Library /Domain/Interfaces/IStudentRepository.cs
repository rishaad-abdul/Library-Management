using Library.Domain.Entities;

namespace Library.Domain.Interfaces;

public interface IStudentRepository
{
    IEnumerable<Student> GetAll();
    Student? GetById(string id);
    void Add(Student student);
    void Update(Student student);
    void Delete(string id);
}