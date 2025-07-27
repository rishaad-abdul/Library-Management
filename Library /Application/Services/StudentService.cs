using Library.Domain.Entities;
using Library.Domain.Interfaces;

namespace Library.Application.Services;

public class StudentService :  IStudentService
{
    private readonly IStudentRepository _studentRepository;
    private readonly ILoanRepository _loanRepository;

    public StudentService(IStudentRepository studentRepository, ILoanRepository loanRepository)
    {
        _studentRepository = studentRepository;
        _loanRepository = loanRepository;
    }

    public IEnumerable<Student> GetAllStudents()
    {
        return _studentRepository.GetAll();
    }

    public Student? GetStudentById(string id)
    {
        return _studentRepository.GetById(id);
    }

    public void AddStudentData(Student student)
    {
        _studentRepository.Add(student);
    }

    public bool UpdateStudentData(string id, Student student)
    {
        if (id != student.Id) return false;

        var existing = _studentRepository.GetById(id);
        if (existing == null) return false;

        _studentRepository.Update(student);
        return true;
    }

    public bool DeleteStudentData(string id)
    {
        var existing = _studentRepository.GetById(id);
        if (existing == null) return false;

        _loanRepository.DeleteStudentById(id);
        _studentRepository.Delete(id);
        return true;
    }
}