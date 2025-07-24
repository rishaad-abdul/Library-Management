import React, { useState, useEffect, useRef } from "react";
import { useOutsideClick } from "../hooks/useOutsideClick";
import authFetch from "../App";

const Books = () => {
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]); // ✅ student list
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    genre: "",
    isbn: "",
    domain: "",
  });
  const [editing, setEditing] = useState(null);
  const [showLendForm, setShowLendForm] = useState(null);
  const [lendDetails, setLendDetails] = useState({
    studentId: "", // ✅ replaced personName with studentId
    fromDate: "",
    toDate: "",
    pricePerDay: "",
  });

  useEffect(() => {
    fetchBooks();
    fetchStudents(); // ✅ fetch student list
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await fetch("http://localhost:5195/api/books");
      const data = await res.json();
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await authFetch("http://localhost:5195/api/student");
      const data = await res.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem("id");
      const bookData = {
        bookid: editing ? editing.id : 0,
        userid: userId,
        title: newBook.title,
        author: newBook.author,
        genre: newBook.genre,
        isbn: newBook.isbn,
        domain: newBook.domain,
      };

      if (editing) {
        await authFetch(`http://localhost:5195/api/books/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookData),
        });
      } else {
        await authFetch("http://localhost:5195/api/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookData),
        });
      }

      setNewBook({ title: "", author: "", genre: "", isbn: "", domain: "" });
      setEditing(null);
      fetchBooks();
    } catch (error) {
      console.error("Error saving book:", error);
    }
  };

  const handleLendSubmit = async (e) => {
    e.preventDefault();
    try {
      const lendData = {
        bookId: showLendForm.bookId ?? showLendForm.id,
        userId: lendDetails.studentId, // ✅ sending studentId
        bookName: showLendForm.title,
        fromDate: lendDetails.fromDate,
        toDate: lendDetails.toDate,
        pricePerDay: parseFloat(lendDetails.pricePerDay),
      };

      await authFetch("http://localhost:5195/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lendData),
      });

      setLendDetails({
        studentId: "",
        fromDate: "",
        toDate: "",
        pricePerDay: "",
      });
      setShowLendForm(null);
      alert("Lending details added successfully!");
    } catch (error) {
      console.error("Error adding lend details:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await authFetch(`http://localhost:5195/api/books/${id}`, {
          method: "DELETE",
        });
        fetchBooks();
      } catch (error) {
        console.error("Error deleting book:", error);
      }
    }
  };

  const ActionMenu = ({ book }) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef();
    useOutsideClick(menuRef, () => setShowMenu(false));

    return (
      <div className="action-menu" ref={menuRef}>
        <button className="menu-trigger" onClick={() => setShowMenu(!showMenu)}>
          ⋮
        </button>
        {showMenu && (
          <div className="menu-dropdown">
            <button
              onClick={() => {
                setNewBook(book);
                setEditing(book);
                setShowMenu(false);
              }}
            >
              Edit
            </button>
            <button
              onClick={() => {
                setShowLendForm(book);
                setShowMenu(false);
              }}
            >
              Add Lend
            </button>
            <button onClick={() => handleDelete(book.bookId)}>Delete</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="books">
      <h2>Books Management</h2>

      {/* Book Form */}
      <div className="form-section">
        <h3>{editing ? "Edit Book" : "Add New Book"}</h3>
        <form onSubmit={handleBookSubmit} className="book-form">
          <div className="form-row">
            <input
              placeholder="Title"
              name="title"
              value={newBook.title}
              onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
              required
            />
            <input
              placeholder="Author"
              name="author"
              value={newBook.author}
              onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
            />
            <input
              placeholder="Genre"
              name="genre"
              value={newBook.genre}
              onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}
            />
          </div>
          <div className="form-row">
            <input
              placeholder="ISBN"
              name="isbn"
              value={newBook.isbn}
              onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
            />
            <input
              placeholder="Domain"
              name="domain"
              value={newBook.domain}
              onChange={(e) => setNewBook({ ...newBook, domain: e.target.value })}
            />
          </div>
          <div className="form-buttons">
            <button type="submit">{editing ? "Update Book" : "Add Book"}</button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setNewBook({
                    title: "",
                    author: "",
                    genre: "",
                    isbn: "",
                    domain: "",
                  });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lend Form Modal */}
      {showLendForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Lending Details for "{showLendForm.title}"</h3>
            <form onSubmit={handleLendSubmit} className="lend-form">
              {/* ✅ Student Dropdown */}
              <select
                value={lendDetails.studentId}
                onChange={(e) =>
                  setLendDetails({ ...lendDetails, studentId: e.target.value })
                }
                required
              >
                <option value="">-- Select Student --</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.username})
                  </option>
                ))}
              </select>

              <input
                type="date"
                placeholder="From Date"
                value={lendDetails.fromDate}
                onChange={(e) =>
                  setLendDetails({ ...lendDetails, fromDate: e.target.value })
                }
                required
              />
              <input
                type="date"
                placeholder="To Date"
                value={lendDetails.toDate}
                onChange={(e) =>
                  setLendDetails({ ...lendDetails, toDate: e.target.value })
                }
                required
              />
              <input
                type="number"
                placeholder="Price Per Day"
                value={lendDetails.pricePerDay}
                onChange={(e) =>
                  setLendDetails({
                    ...lendDetails,
                    pricePerDay: e.target.value,
                  })
                }
                required
              />
              <div className="form-buttons">
                <button type="submit">Add Lending Details</button>
                <button type="button" onClick={() => setShowLendForm(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Genre</th>
              <th>ISBN</th>
              <th>Domain</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.genre}</td>
                <td>{book.isbn}</td>
                <td>{book.domain}</td>
                <td>
                  <ActionMenu book={book} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Books;
