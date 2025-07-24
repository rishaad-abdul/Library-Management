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
      const response = await fetch("http://localhost:5195/api/loans/pending");
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
            <button onClick={() => handleClearDue(loan.loanId)}>Clear Due</button>
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