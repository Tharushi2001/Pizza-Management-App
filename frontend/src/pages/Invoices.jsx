import { useEffect, useState } from 'react';
import InvoiceFormModal from './InvoiceFormModal';
import { BsPrinter, BsPencilSquare, BsTrash } from 'react-icons/bs';

export default function Invoices({ items }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);

  useEffect(() => {
    const fetchInvoicesWithDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('http://localhost:8080/invoices');
        if (!res.ok) throw new Error('Failed to fetch invoices');
        const invoicesData = await res.json();

        if (!Array.isArray(invoicesData)) {
          setInvoices([]);
          setError('Invalid data format');
          return;
        }

        // Fetch detailed items for each invoice
        const detailedInvoices = await Promise.all(
          invoicesData.map(async (inv) => {
            try {
              const detailRes = await fetch(`http://localhost:8080/invoices/${inv.id}`);
              if (!detailRes.ok) throw new Error('Failed to fetch invoice details');
              const detailData = await detailRes.json();
              return { ...inv, items: Array.isArray(detailData.items) ? detailData.items : [] };
            } catch {
              // fallback: no items
              return { ...inv, items: [] };
            }
          })
        );

        setInvoices(detailedInvoices);
      } catch (err) {
        setError(err.message);
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoicesWithDetails();
  }, []);

  const handleInvoiceCreated = (newInvoice) => {
    if (editingInvoice) {
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === newInvoice.id ? newInvoice : inv))
      );
    } else {
      setInvoices((prev) => [...prev, newInvoice]);
    }
    setShowForm(false);
    setEditingInvoice(null);
  };

  const handleEditInvoice = async (invoice) => {
    try {
      const res = await fetch(`http://localhost:8080/invoices/${invoice.id}`);
      if (!res.ok) throw new Error('Failed to fetch invoice details');
      const data = await res.json();

      if (!Array.isArray(data.items)) data.items = [];

      setEditingInvoice(data);
      setShowForm(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;

    try {
      const res = await fetch(`http://localhost:8080/invoices/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete invoice');

      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const safeInvoices = Array.isArray(invoices) ? invoices : [];

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="text-orange">INVOICES</h2>
        <button
          className="new-btn"
          onClick={() => {
            setEditingInvoice(null);
            setShowForm(true);
          }}
        >
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
              <th>Items</th>
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
                  {inv.items && inv.items.length > 0
                    ? inv.items
                        .map((invItem) => {
                          const matchedItem = items.find(
                            (i) => i.id === invItem.item_id
                          );
                          return matchedItem ? matchedItem.name : 'Unknown Item';
                        })
                        .join(', ')
                    : 'No items'}
                </td>
                <td className="d-flex align-items-center gap-3">
                  <button
                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                    onClick={() => window.open(`/invoice/${inv.id}`, '_blank')}
                    title="View / Print"
                  >
                    <BsPrinter />
                  </button>
                  <span
                    role="button"
                    onClick={() => handleEditInvoice(inv)}
                    style={{ cursor: 'pointer' }}
                    title="Edit"
                  >
                    <BsPencilSquare size={20} color="#ffc107" />
                  </span>
                  <span
                    role="button"
                    onClick={() => handleDeleteInvoice(inv.id)}
                    style={{ cursor: 'pointer' }}
                    title="Delete"
                  >
                    <BsTrash size={20} color="#dc3545" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <InvoiceFormModal
          items={items}
          invoice={editingInvoice}
          onClose={() => {
            setShowForm(false);
            setEditingInvoice(null);
          }}
          onSave={handleInvoiceCreated}
        />
      )}
    </div>
  );
}
