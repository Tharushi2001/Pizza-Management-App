import { useEffect, useState } from 'react';
import InvoiceFormModal from './InvoiceFormModal'; 

export default function Invoices({ items }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('http://localhost:8080/invoices');
      if (!res.ok) throw new Error('Failed to fetch invoices');
      const data = await res.json();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setInvoices([]);  
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceCreated = (newInvoice) => {
    setInvoices((prev) => [...prev, newInvoice]);
    setShowForm(false);
  };


  const safeInvoices = Array.isArray(invoices) ? invoices : [];

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className='text-orange'>INVOICES</h2>
        <button className="new-btn" onClick={() => setShowForm(true)}>
          + Create New Invoice
        </button>
      </div>

      {loading && <p>Loading invoices...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && safeInvoices.length === 0 && <p>No invoices available.</p>}

      {!loading && safeInvoices.length > 0 && (
        <table className="table table-striped table-bordered">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Customer Name</th>
              <th>Tax (Rs.)</th>
              <th>Total (Rs.)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {safeInvoices.map((inv) => (
              <tr key={inv.id}>
                <td>{inv.id}</td>
                <td>{inv.customer_name}</td>
                <td>{inv.tax.toFixed(2)}</td>
                <td>{inv.total.toFixed(2)}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => window.open(`/invoice/${inv.id}`, '_blank')}
                  >
                    View / Print
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <InvoiceFormModal
          items={items}
          onClose={() => setShowForm(false)}
          onSave={handleInvoiceCreated}
        />
      )}
    </div>
  );
}
