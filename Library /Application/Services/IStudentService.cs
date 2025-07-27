using Library.Domain.Entities;

namespace Library.Application.Services;

public interface IStudentService
{
    IEnumerable<Student> GetAllStudents();
    Student? GetStudentById(string id);
    void AddStudentData(Student student);
    bool UpdateStudentData(string id, Student student);
    bool DeleteStudentData(string id);
}