using Library.Application.Services;
using Library.Domain.Entities;
using Library.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Library.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentController : ControllerBase
{
    private readonly IStudentService _studentService;

    public StudentController(IStudentService studentService)
    {
        _studentService = studentService;
    }

    // GET: api/student
    [HttpGet]
    public ActionResult<IEnumerable<Student>> GetAll()
    {
        return Ok(_studentService.GetAllStudents());
    }

    // GET: api/student/{id}
    [HttpGet("{id}")]
    public ActionResult<Student> GetById(string id)
    {
        var student = _studentService.GetStudentById(id);
        if (student == null) return NotFound();
        return Ok(student);
    }

    // POST: api/student
    [HttpPost]
    public IActionResult Add(Student student)
    {
        _studentService.AddStudentData(student);
        return Ok(student);
    }

    // PUT: api/student/{id}
    [HttpPut("{id}")]
    public IActionResult Update(string id, Student student)
    {
        if (!_studentService.UpdateStudentData(id, student)) return BadRequest("Mismatched ID");
        return Ok($"Student updated {student}");
    }

    // DELETE: api/student/{id}
    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
        if (!_studentService.DeleteStudentData(id)) return NotFound();
        return Ok("Student deleted");
    }
}