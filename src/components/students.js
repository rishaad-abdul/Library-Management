import React, { useState, useRef, useEffect } from "react";
import { useOutsideClick } from '../hooks/useOutsideClick';
import authFetch from '../App'


// Students Management Component
const Students = () => {
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({
    username: "",
    email: "",
    name: "",
    password: "",
    phoneNumber: "",
    address: "",
  });
  const [editingStudent, setEditingStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch("http://localhost:5195/api/student");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const studentData = {
        username: newStudent.username,
        email: newStudent.email,
        name: newStudent.name,
        password: newStudent.password,
        phoneNumber: newStudent.phoneNumber,
        address: newStudent.address,
        role: "student"
      };

      if (editingStudent) {
        await fetch(`http://localhost:5195/api/student/${editingStudent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...studentData, id: editingStudent.id }),
        });
      } else {
        await fetch("http://localhost:5195/api/student", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(studentData),
        });
        console.log(studentData);
        
      }

      // Reset form
      setNewStudent({ 
        username: "", 
        email: "", 
        name: "", 
        password: "", 
        phoneNumber: "", 
        address: "" 
      });
      setEditingStudent(null);
      setShowAddForm(false);
      fetchStudents();
      alert(editingStudent ? "Student updated successfully!" : "Student added successfully!");
    } catch (error) {
      console.error("Error saving student:", error);
      alert("Error saving student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
      try {
        await fetch(`http://localhost:5195/api/student/${id}`, {
          method: "DELETE",
        });
        fetchStudents();
        alert("Student deleted successfully!");
      } catch (error) {
        console.error("Error deleting student:", error);
        alert("Error deleting student. Please try again.");
      }
    }
  };

  const handleEditStudent = (student) => {
    setNewStudent({
      username: student.username,
      email: student.email,
      name: student.name,
      phoneNumber: student.phoneNumber || "",
      address: student.address || "",
      password: "" // Don't pre-fill password for security
    });
    setEditingStudent(student);
    setShowAddForm(true);
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    setShowAddForm(false);
    setNewStudent({ 
      username: "", 
      email: "", 
      name: "", 
      password: "", 
      phoneNumber: "", 
      address: "" 
    });
  };

  const filteredStudents = students.filter(student =>
    student.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StudentActionMenu = ({ student }) => {
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
                handleEditStudent(student);
                setShowMenu(false);
              }}
            >
              Edit
            </button>
            <button 
              onClick={() => { 
                handleDeleteStudent(student.id);
                setShowMenu(false);
              }}
              className="delete-button"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading && students.length === 0) {
    return <div className="loading">Loading students...</div>;
  }

  return (
    <div className="students-container">
      <div className="students-header">
        <h2>Students</h2>
        <div className="header-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button 
            className="add-student-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : '+ Add Student'}
          </button>
        </div>
      </div>

      {/* Add/Edit Student Form */}
      {showAddForm && (
        <div className="form-section">
          <h3>{editingStudent ? "Edit Student" : "Add New Student"}</h3>
          <form onSubmit={handleStudentSubmit} className="student-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  value={newStudent.username}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, username: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, name: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, email: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={newStudent.phoneNumber}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, phoneNumber: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>
                  {editingStudent ? "New Password (leave blank to keep current)" : "Password *"}
                </label>
                <input
                  type="password"
                  value={newStudent.password}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, password: e.target.value })
                  }
                  required={!editingStudent}
                  disabled={loading}
                />
              </div>

              <div className="form-group full-width">
                <label>Address</label>
                <textarea
                  value={newStudent.address}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, address: e.target.value })
                  }
                  rows="3"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-buttons">
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Saving...' : (editingStudent ? "Update Student" : "Add Student")}
              </button>
              <button 
                type="button" 
                onClick={handleCancelEdit}
                disabled={loading}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Students Count */}
      <div className="students-summary">
        <p>Total Students: <strong>{filteredStudents.length}</strong></p>
        {searchTerm && (
          <p>Showing results for: "<strong>{searchTerm}</strong>"</p>
        )}
      </div>

      {/* Students Table */}
      <div className="table-container">
        {filteredStudents.length === 0 ? (
          <div className="no-data">
            {searchTerm ? 'No students found matching your search.' : 'No students available.'}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <div className="username-cell">
                      <span className="username">{student.username}</span>
                    </div>
                  </td>
                  <td>{student.name || 'N/A'}</td>
                  <td>{student.email || 'N/A'}</td>
                  <td>{student.phoneNumber || 'N/A'}</td>
                  <td>
                    <span className="address-cell">
                      {student.address ? (
                        student.address.length > 30 
                          ? `${student.address.substring(0, 30)}...`
                          : student.address
                      ) : 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className="status-badge active">Active</span>
                  </td>
                  <td>
                    <StudentActionMenu student={student} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        .students-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .students-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .students-header h2 {
          margin: 0;
          color: #333;
          font-size: 24px;
        }

        .header-controls {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .search-container {
          position: relative;
        }

        .search-input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          width: 250px;
          font-size: 14px;
        }

        .search-input:focus {
          outline: none;
          border-color: #007bff;
        }

        .add-student-btn {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: background-color 0.3s;
        }

        .add-student-btn:hover {
          background-color: #0056b3;
        }

        .form-section {
          background: #f8f9fa;
          padding: 25px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #e9ecef;
        }

        .form-section h3 {
          margin: 0 0 20px 0;
          color: #333;
          font-size: 18px;
        }

        .student-form {
          display: flex;
          flex-direction: column;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          margin-bottom: 5px;
          font-weight: 500;
          color: #333;
          font-size: 14px;
        }

        .form-group input,
        .form-group textarea {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          transition: border-color 0.3s;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #007bff;
        }

        .form-group input:disabled,
        .form-group textarea:disabled {
          background-color: #f8f9fa;
          cursor: not-allowed;
        }

        .form-buttons {
          display: flex;
          gap: 10px;
          justify-content: flex-start;
        }

        .submit-btn {
          background-color: #28a745;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: background-color 0.3s;
        }

        .submit-btn:hover:not(:disabled) {
          background-color: #218838;
        }

        .submit-btn:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }

        .cancel-btn {
          background-color: #6c757d;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: background-color 0.3s;
        }

        .cancel-btn:hover:not(:disabled) {
          background-color: #5a6268;
        }

        .students-summary {
          margin-bottom: 15px;
          color: #666;
        }

        .students-summary p {
          margin: 5px 0;
        }

        .table-container {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border: 1px solid #e9ecef;
        }

        .no-data {
          text-align: center;
          padding: 40px;
          color: #666;
          font-size: 16px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }

        th {
          background-color: #f8f9fa;
          font-weight: 600;
          color: #333;
          position: sticky;
          top: 0;
        }

        tr:hover {
          background-color: #f8f9fa;
        }

        .username-cell {
          display: flex;
          align-items: center;
        }

        .username {
          font-weight: 500;
          color: #007bff;
        }

        .address-cell {
          max-width: 200px;
          display: inline-block;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .status-badge.active {
          background-color: #d4edda;
          color: #155724;
        }

        .action-menu {
          position: relative;
        }

        .menu-trigger {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 5px 10px;
          border-radius: 4px;
          transition: background-color 0.3s;
        }

        .menu-trigger:hover {
          background-color: #f0f0f0;
        }

        .menu-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          min-width: 120px;
          z-index: 1000;
        }

        .menu-dropdown button {
          display: block;
          width: 100%;
          padding: 10px 12px;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.3s;
        }

        .menu-dropdown button:hover {
          background-color: #f0f0f0;
        }

        .menu-dropdown button.delete-button:hover {
          background-color: #f8d7da;
          color: #721c24;
        }

        .loading {
          text-align: center;
          padding: 40px;
          font-size: 16px;
          color: #666;
        }

        @media (max-width: 768px) {
          .students-header {
            flex-direction: column;
            align-items: stretch;
          }

          .header-controls {
            justify-content: space-between;
          }

          .search-input {
            width: 100%;
            max-width: 200px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .table-container {
            overflow-x: auto;
          }

          table {
            min-width: 800px;
          }
        }
      `}</style>
    </div>
  );
};

export default Students;