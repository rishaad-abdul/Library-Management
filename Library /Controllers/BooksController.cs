using Library.Application.Services;
using Library.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Library.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly IBookService  _bookService;

    public BooksController(IBookService bookService)
    {
        _bookService = bookService;
    }

    // GET: /api/books
    [HttpGet]
    public IActionResult GetAll() => Ok(_bookService.GetAllBooks());

    // GET: /api/books/{id}
    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var book = _bookService.GetBookDetailsById(id);
        if (book == null) return NotFound();
        return Ok(book);
    }

    // POST: /api/books (Admin only)
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public IActionResult Add(Book book)
    {
        var insertedBook = _bookService.AddBook(book);
        return Ok(insertedBook); // now includes mongoId
    }

    // PUT: /api/books/{id} (Admin only)
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult Update(int id, Book book)
    {
        var updated = _bookService.UpdateBook(id, book);
        if (!updated) return NotFound();
        return NoContent();
    }

    // DELETE: /api/books/{id} (Admin only)
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult Delete(int id)
    {
        var result = _bookService.DeleteBook(id);
        if (!result)
            return NotFound($"No book found with ID {id}");

        return Ok(new 
        {
            Message = "Book deleted along with associated loans."
        });
    }
}
