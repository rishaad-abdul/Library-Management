import React, { useState, useRef, useEffect } from "react";
import authFetch from '../Auth/AuthProvider';


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
      <style jsx>{`
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
      `}</style>
    </div>
  );
};

export default Dashboard;