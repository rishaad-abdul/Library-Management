import React, { useState, createContext, useContext, useEffect, useRef } from "react";
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import 'antd/dist/reset.css'; 
import { useOutsideClick } from "./hooks/useOutsideClick.js";
// import authFetch from "./Auth/AuthProvider.js";
import Students from './components/students';
// import Dashboard from './components/dashboard';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";

// Auth Context
const AuthContext = createContext({
  user: null,
  role: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Updated authFetch function with better error handling
const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized - token might be expired
    if (response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      window.location.href = '/login';
      throw new Error('Authentication expired');
    }

    return response;
  } catch (error) {
    console.error('Auth fetch error:', error);
    throw error;
  }
};


// Updated AuthProvider with token validation
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper function to check if token is expired
  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  };

  // Helper function to parse JWT token
  const parseJWT = (token) => {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return {};
    }
  };

  useEffect(() => {
    // Check for stored auth data on app load
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedRole && storedToken) {
      // Check if token is expired
      if (isTokenExpired(storedToken)) {
        // Token expired, clear storage
        logout();
      } else {
        // Token is valid, restore user session
        setUser(JSON.parse(storedUser));
        setRole(storedRole);
        setIsAuthenticated(true);
      }
    }
    setLoading(false);
  }, []);
  

  const login = (userData, userRole, token) => {
    // Store user ID separately for API calls
    localStorage.setItem('id', userData.id);
    
    setUser(userData);
    setRole(userRole);
    setIsAuthenticated(true);
    
    // Store in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', userRole);
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
    
    // Clear all localStorage items
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('token');
    localStorage.removeItem('id');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, role } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

// Updated Login Component with proper JWT handling
const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Make API call to your backend
      const response = await fetch('http://localhost:5195/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      
      // Since your backend only returns token, we need to decode it or make another API call
      // Option 1: Decode the JWT token to get user info
      const tokenPayload = parseJWT(data.token);
      
      // Create user object from token payload
      const userData = {
        id: tokenPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
        username: credentials.username, // Use the username from form
        name: credentials.username === 'admin' ? 'Admin User' : 'Student User',
        role: tokenPayload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'].toLowerCase()
      };

      // Login user with extracted data
      login(userData, userData.role, data.token);
      
      // Redirect based on role
      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }

    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to parse JWT token
  const parseJWT = (token) => {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return {};
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Library Management System</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="demo-credentials">
          <p><strong>Demo Credentials:</strong></p>
          <p>Admin: admin / admin123</p>
          <p>Student: student / student123</p>
        </div>
      </div>
    </div>
  );
};

// Unauthorized Component
const Unauthorized = () => {
  const { logout } = useAuth();
  
  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
        <button onClick={logout} className="logout-btn">
          Back to Login
        </button>
      </div>
    </div>
  );
};

// Dashboard Component (Admin/Student versions)
const Dashboard = () => {
  const { role } = useAuth();
  const [stats, setStats] = useState({
    books: 0,
    totalDues: 0,
    activeLoans: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await authFetch("http://localhost:5195/api/dashboard");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      <h2>{role === 'admin' ? 'Admin Dashboard' : 'Student Dashboard'}</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Books</h3>
          <p className="stat-number">{stats.totalBooks}</p>
        </div>
        <div className="stat-card">
          <h3>{role === 'admin' ? 'Total Dues' : 'My Dues'}</h3>
          <p className="stat-number">₹{stats.totalDues}</p>
        </div>
        <div className="stat-card">
          <h3>{role === 'admin' ? 'Active Loans' : 'My Active Loans'}</h3>
          <p className="stat-number">{stats.pendingLoans}</p>
        </div>
      </div>
    </div>
  );
};

// Student Books Component (Read-only view)
const StudentBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await authFetch("http://localhost:5195/api/books");
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Available Books</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Genre</th>
            <th>Domain</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.genre}</td>
              <td>{book.domain}</td>
              <td>Available</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const StudentMyBooks = () => {
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBooks();
  }, []);

  const fetchMyBooks = async () => {
    try {
      const userId = localStorage.getItem("id");
      if (!userId) throw new Error("User ID not found in localStorage");

      const response = await fetch(`http://localhost:5195/api/loans`);
      if (!response.ok) throw new Error("Failed to fetch books");

      const data = await response.json();
      setMyBooks(data);
    } catch (error) {
      console.error("Error fetching my books:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>My Books</h2>
      <table>
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Book Name</th>
            <th>Days</th>
            <th>Amount</th>
            <th>Borrow Date</th>
            <th>Return Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {myBooks.length > 0 ? (
            myBooks.map((book, index) => (
              console.log(book),
              <tr key={book.bookId || index}>
                <td>{book.personName || 'N/A'}</td>
                <td>{book.bookName || 'N/A'}</td>
                <td>{book.days || 'N/A'}</td>
                <td>{book.amount || 'N/A'}</td>
                <td>{new Date(book.fromDate).toLocaleDateString() || 'N/A'}</td>
                <td>{new Date(book.toDate).toLocaleDateString() || 'N/A'}</td>
                <td>
                  {book.isCleared ? 'Cleared' : 'Pending' }
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">You have not borrowed any books.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Books Component
const Books = () => {
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]); // ✅ student list
  const [newBook, setNewBook] = useState({
    title: null,
    author: null,
    genre: null,
    isbn: null,
    domain: null,
  });
  const [editing, setEditing] = useState(null);
  const [showLendForm, setShowLendForm] = useState(null);
  const [lendDetails, setLendDetails] = useState({
    bookId: "",
    studentId: "", // Add this
    personName: "",
    fromDate: "",
    toDate: "",
    pricePerDay: "",
  });

  React.useEffect(() => {
    fetchBooks();
    fetchStudents(); 
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
        userid : userId,
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
        userId: localStorage.getItem('id'),
        bookName: showLendForm.title,
        studentId: lendDetails.studentId, // Add studentId to payload
        personName: lendDetails.personName,
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
        bookId: "",
        studentId: "", // Reset studentId
        personName: "",
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

  const handleStudentSelect = (e) => {
    const selectedStudentId = e.target.value;
    const selectedStudent = students.find(student => student.id.toString() === selectedStudentId);
    
    setLendDetails({
      ...lendDetails,
      studentId: selectedStudentId,
      personName: selectedStudent ? selectedStudent.name : ""
    });
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
            <button onClick={() => { handleDelete(book.bookId) }}>Delete</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="books">
      <h2>Books Management</h2>

      {/* Add/Edit Book Form */}
      <div className="form-section">
        <h3>{editing ? "Edit Book" : "Add New Book"}</h3>
        <form onSubmit={handleBookSubmit} className="book-form">
          <div className="form-row">
            <input
              placeholder="Title"
              name="title"
              value={newBook.title}
              onChange={(e) =>
                setNewBook({ ...newBook, title: e.target.value })
              }
              required
            />
            <input
              placeholder="Author"
              name="author"
              value={newBook.author}
              onChange={(e) =>
                setNewBook({ ...newBook, author: e.target.value })
              }
            />
            <input
              placeholder="Genre"
              name="genre"
              value={newBook.genre}
              onChange={(e) =>
                setNewBook({ ...newBook, genre: e.target.value })
              }
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
              onChange={(e) =>
                setNewBook({ ...newBook, domain: e.target.value })
              }
            />
          </div>
          <div className="form-buttons">
            <button type="submit">
              {editing ? "Update Book" : "Add Book"}
            </button>
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
            <select
              value={lendDetails.studentId}
              onChange={handleStudentSelect} // Use the new handler
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
              placeholder="Person Name"
              value={lendDetails.personName}
              onChange={(e) =>
                setLendDetails({ ...lendDetails, personName: e.target.value })
              }
              readOnly // Make it read-only since it's populated by student selection
              required
            />
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

      {/* Books Table */}
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

// Treasury Component (Admin only )
const Treasury = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await authFetch("http://localhost:5195/api/books");
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
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
            <button onClick={() => { /* Handle edit */ }}>Edit</button>
            <button onClick={() => {handleDelete(book.id); }}>Delete</button>
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="treasury">
      <h2>Treasury - All Books</h2>
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

// Loans Component
const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLendForm, setShowLendForm] = useState(null);
  const [lendDetails, setLendDetails] = useState({
    personName: "",
    fromDate: "",
    toDate: "",
    pricePerDay: "",
  });


  React.useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await fetch("http://localhost:5195/api/loans");
      const data = await response.json();
      setLoans(data);
    } catch (error) {
      console.error("Error fetching loans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearDue = async (id) => {
    try {
      await fetch(`http://localhost:5195/api/loans/${id}/clear`, {
        method: "POST",
      });
      fetchLoans();
    } catch (error) {
      console.error("Error clearing due:", error);
    }
  };

  const handleMarkPendingDue = async (id) => {
    try {
      await fetch(`http://localhost:5195/api/loans/${id}/mark-pending`, {
        method: "POST",
      });
      fetchLoans();
    } catch (error) {
      console.error("Error marking due:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this loan?")) {
      try {
        await fetch(`http://localhost:5195/api/loans/${id}`, {
          method: "DELETE",
        });
        fetchLoans();
      } catch (error) {
        console.error("Error deleting loan:", error);
      }
    }
  };

  const ActionMenu = ({ loan }) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef();
  
    useOutsideClick(menuRef, () => {
      setShowMenu(false);
    });
  
    return (
      <div className="action-menu" ref={menuRef}>
        <button className="menu-trigger" onClick={() => setShowMenu(!showMenu)}>
          ⋮
        </button>
        {showMenu && (
          <div className="menu-dropdown">
            {loan.isCleared ? (
              <button onClick={() => handleMarkPendingDue(loan.loanId)}>Mark Pending</button>
            ) : (
              <button onClick={() => handleClearDue(loan.loanId)}>Clear Due</button>
            )}
            <button onClick={() => handleDelete(loan.loanId)}>Delete</button>
          </div>
        )}
      </div>
    );    
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="loans">
      <h2>Loans - Pending Returns</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Person Name</th>
              <th>Book Name</th>
              <th>Days</th>
              <th>Amount</th>
              <th>From Date</th>
              <th>To Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td>{loan.personName}</td>
                <td>{loan.bookName}</td>
                <td>{loan.days}</td>
                <td>₹{loan.amount}</td>
                <td>{new Date(loan.fromDate).toLocaleDateString()}</td>
                <td>{new Date(loan.toDate).toLocaleDateString()}</td>
                <td>{loan.isCleared ? 'Cleared' : 'Pending'}</td>
                <td>
                  <ActionMenu loan={loan} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {showLendForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Loan for "{showLendForm.bookName}"</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const updatedLoan = {
                    loanId: showLendForm.loanId,
                    userId: localStorage.getItem('id'),
                    personName: lendDetails.personName,
                    fromDate: lendDetails.fromDate,
                    toDate: lendDetails.toDate,
                    pricePerDay: parseFloat(lendDetails.pricePerDay),
                  };

                  await fetch(`http://localhost:5195/api/loans/${showLendForm.loanId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedLoan),
                  });
                  alert("Loan updated successfully!");
                  setShowLendForm(null);
                  fetchLoans();
                } catch (err) {
                  console.error("Error updating loan:", err);
                }
              }}
              className="lend-form">
              <input
                placeholder="Person Name"
                value={lendDetails.personName}
                onChange={(e) =>
                  setLendDetails({ ...lendDetails, personName: e.target.value })
                }
                required
              />
              <DatePicker
                style={{ width: "100%" }}
                value={lendDetails.fromDate ? dayjs(lendDetails.fromDate) : null}
                onChange={(date, dateString) =>
                  setLendDetails({ ...lendDetails, fromDate: dateString })
                }
                required
              />

              <DatePicker
                style={{ width: "100%" }}
                value={lendDetails.toDate ? dayjs(lendDetails.toDate) : null}
                onChange={(date, dateString) =>
                  setLendDetails({ ...lendDetails, toDate: dateString })
                }
                required
              />
              <input
                type="number"
                value={lendDetails.pricePerDay}
                onChange={(e) =>
                  setLendDetails({ ...lendDetails, pricePerDay: e.target.value })
                }
                required
              />
              <div className="form-buttons">
                <button type="submit">Update Loan</button>
                <button type="button" onClick={() => setShowLendForm(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};

// Account Component (works for both roles)
const Account = () => {
  const { user, role } = useAuth();
  const [account, setAccount] = useState({
    name: user?.name || "",
    email: user?.email || "",
    mobile: "",
    department: "",
    dateOfBirth: "",
    studentId: user?.studentId || "",
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await authFetch("http://localhost:5195/api/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(account),
      });
      setEditing(false);
      alert("Account updated successfully!");
    } catch (error) {
      console.error("Error updating account:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account">
      <h2>Account Details</h2>
      <div className="account-form">
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            value={account.name}
            onChange={(e) => setAccount({ ...account, name: e.target.value })}
            disabled={!editing}
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={account.email}
            onChange={(e) => setAccount({ ...account, email: e.target.value })}
            disabled={!editing}
          />
        </div>
        {role === 'student' && (
          <div className="form-group">
            <label>Student ID:</label>
            <input
              type="text"
              value={account.studentId}
              disabled={true}
            />
          </div>
        )}
        <div className="form-group">
          <label>Mobile:</label>
          <input
            type="tel"
            value={account.mobile}
            onChange={(e) => setAccount({ ...account, mobile: e.target.value })}
            disabled={!editing}
          />
        </div>
        <div className="form-group">
          <label>Department:</label>
          <input
            type="text"
            value={account.department}
            onChange={(e) => setAccount({ ...account, department: e.target.value })}
            disabled={!editing}
          />
        </div>
        <div className="form-group">
          <label>Date of Birth:</label>
          <input
            type="date"
            value={account.dateOfBirth}
            onChange={(e) => setAccount({ ...account, dateOfBirth: e.target.value })}
            disabled={!editing}
          />
        </div>
        <div className="form-buttons">
          {editing ? (
            <>
              <button onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setEditing(false)}>Cancel</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)}>Edit Details</button>
          )}
        </div>
      </div>
    </div>
  );
};

// Navigation Items by Role
const getNavigationItems = (role) => {
  if (role === 'admin') {
    return [
      { name: 'Dashboard', path: '/admin/dashboard' },
      { name: 'Treasury', path: '/admin/treasury' },
      { name: 'Loans', path: '/admin/loans' },
      { name: 'Books', path: '/admin/books' },
      { name: 'Students', path: '/admin/students' },
      { name: 'Account', path: '/admin/account' },
    ];
  } else {
    return [
      { name: 'Dashboard', path: '/student/dashboard' },
      { name: 'Available Books', path: '/student/books' },
      { name: 'My Books', path: '/student/my-books' },
      // { name: 'Pending Requests', path: '/student/pending' },
      { name: 'Account', path: '/student/account' },
    ];
  }
};

// Sidebar Component
const Sidebar = () => {
  const { role, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = getNavigationItems(role);
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Library System</h3>
        <div className="user-info">
          <p>{user?.name}</p>
          <span className="user-role">{role?.toUpperCase()}</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navigationItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={isActive(item.path) ? 'active' : ''}
          >
            {item.name}
          </Link>
        ))}
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </nav>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div className="app">
                <Sidebar />
                <div className="main-content">
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="treasury" element={<Treasury />} />
                    <Route path="loans" element={<Loans />} />
                    <Route path="books" element={<Books />} />
                    <Route path="students" element={<Students />} />
                    <Route path="account" element={<Account />} />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          } />

          {/* Student Routes */}
          <Route path="/student/*" element={
            <ProtectedRoute allowedRoles={['student']}>
              <div className="app">
                <Sidebar />
                <div className="main-content">
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="books" element={<StudentBooks />} />
                    <Route path="my-books" element={<StudentMyBooks />} />
                    {/* <Route path="pending" element={<div>Pending Requests (To be implemented)</div>} /> */}
                    <Route path="account" element={<Account />} />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>

        <style jsx>{`
          .app {
            display: flex;
            height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }

          .login-container, .unauthorized-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: #f8f9fa;
          }

          .login-card, .unauthorized-card {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            width: 400px;
            max-width: 90vw;
          }

          .login-card h2, .unauthorized-card h2 {
            text-align: center;
            margin-bottom: 30px;
            color: #2c3e50;
          }

          .login-form .form-group {
            margin-bottom: 20px;
          }

          .login-form label {
            display: block;
            margin-bottom: 5px;
            color: #2c3e50;
            font-weight: 500;
          }

          .login-form input {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
          }

          .login-btn, .logout-btn {
            width: 100%;
            padding: 12px;
            background: #3498db;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
          }

          .login-btn:hover, .logout-btn:hover {
            background: #2980b9;
          }

          .login-btn:disabled {
            background: #bdc3c7;
            cursor: not-allowed;
          }

          .error-message {
            color: #e74c3c;
            margin: 10px 0;
            padding: 10px;
            background: #fadbd8;
            border-radius: 4px;
            text-align: center;
          }

          .demo-credentials {
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 4px;
            font-size: 14px;
          }

          .demo-credentials p {
            margin: 5px 0;
          }

          .sidebar {
            width: 250px;
            background: #2c3e50;
            color: white;
            padding: 0;
          }

          .sidebar-header {
            padding: 20px;
            border-bottom: 1px solid #34495e;
          }

          .sidebar-header h3 {
            margin: 0 0 10px 0;
            font-size: 1.2em;
          }

          .user-info {
            font-size: 0.9em;
          }

          .user-info p {
            margin: 5px 0;
          }

          .user-role {
            background: #3498db;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.8em;
          }

          .sidebar-nav {
            display: flex;
            flex-direction: column;
            padding: 20px 0;
          }

          .sidebar-nav a {
            color: #ecf0f1;
            text-decoration: none;
            padding: 12px 20px;
            display: block;
            transition: background-color 0.3s;
          }

          .sidebar-nav a:hover {
            background: #34495e;
          }

          .sidebar-nav a.active {
            background: #3498db;
          }

          .logout-button {
            background: #e74c3c;
            color: white;
            border: none;
            padding: 12px 20px;
            margin: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            transition: background 0.3s;
          }

          .logout-button:hover {
            background: #c0392b;
          }

          .main-content {
            flex: 1;
            padding: 20px;
            overflow-y: visible; 
            position: relative;  
            background: #f8f9fa;
            padding-bottom: 60px;
          }

          .dashboard h2, .treasury h2, .student-books h2, .student-my-books h2, .account h2 {
            margin-bottom: 20px;
            color: #2c3e50;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }

          .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            text-align: center;
          }

          .stat-card h3 {
            margin: 0 0 10px 0;
            color: #7f8c8d;
            font-size: 0.9em;
          }

          .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #2c3e50;
            margin: 0;
          }

          .table-container {
            background: white;
            border-radius: 8px;
            overflow: visible; 
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          table {
            width: 100%;
            height: 100%;
            border-collapse: collapse;
          }

          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ecf0f1;
          }

          th {
            background: #f8f9fa;
            font-weight: 600;
            color: #2c3e50;
          }

          .status-available {
            background: #d4edda;
            color: #155724;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
          }

          .status-borrowed {
            background: #fff3cd;
            color: #856404;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
          }

          .status-overdue {
            background: #f8d7da;
            color: #721c24;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
          }

          .action-menu {
            position: relative;
          }

          .menu-trigger {
            background: none;
            border: none;
            font-size: 1.2em;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
          }

          .menu-trigger:hover {
            background: #f8f9fa;
          }

          .menu-dropdown {
            position: absolute;
            right: 0;
            top: 100%;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            min-width: 100px;
          }

          .menu-dropdown button {
            // display: block;
            // width: 100%;
            padding: 8px 12px;
            border: none;
            background: none;
            text-align: left;
            cursor: pointer;
          }

          .menu-dropdown button:hover {
            background: #f8f9fa;
          }

          .account-form {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .form-group {
            margin-bottom: 15px;
          }

          .form-group label {
            display: block;
            margin-bottom: 5px;
            color: #2c3e50;
            font-weight: 500;
          }

          .form-group input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
          }

          .form-group input:disabled {
            background: #f8f9fa;
            color: #6c757d;
          }

          form-buttons {
            display: flex;
            gap: 10px;
            margin-top: 20px;
          }

          .form-buttons button {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            cursor: pointer;
          }

          .form-buttons button:first-child {
            background: #28a745;
            color: white;
          }

          .form-buttons button:first-child:hover {
            background: #218838;
          }

          .form-buttons button:last-child {
            background: #6c757d;
            color: white;
          }

          .form-buttons button:last-child:hover {
            background: #5a6268;
          }

          .loading {
            text-align: center;
            font-size: 1.2em;
            color: #2c3e50;
            margin-top: 50px;
          }
        `}</style>
      </Router>
    </AuthProvider>
  );
};

export default App;
