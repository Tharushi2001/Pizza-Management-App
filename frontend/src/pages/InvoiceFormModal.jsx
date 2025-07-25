import { useEffect, useState } from 'react';

export default function InvoiceFormModal({ items, invoice, onClose, onSave }) {
  const [customerName, setCustomerName] = useState('');
  const [tax, setTax] = useState(0);
  const [invoiceItems, setInvoiceItems] = useState([]);

  // Initialize form state when invoice prop changes (for edit)
  useEffect(() => {
    if (invoice) {
      setCustomerName(invoice.customer_name || '');
      setTax(invoice.tax || 0);

      if (Array.isArray(invoice.items)) {
        const mappedItems = invoice.items.map((item) => ({
          item_id: item.item_id ?? item.id ?? '',
          quantity: item.quantity || 1,
          price: item.price || 0,
        }));
        setInvoiceItems(mappedItems);
      } else {
        setInvoiceItems([]);
      }
    } else {
      // Clear form for new invoice
      setCustomerName('');
      setTax(0);
      setInvoiceItems([]);
    }
  }, [invoice]);

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { item_id: '', quantity: 1, price: 0 }]);
  };

  const updateInvoiceItem = (index, field, value) => {
    const newItems = [...invoiceItems];
    if (field === 'quantity') {
      const qty = Number(value);
      newItems[index][field] = qty > 0 ? qty : 1;
    } else {
      newItems[index][field] = value;
    }

    // Auto-update price if item_id changes
    if (field === 'item_id') {
      const selectedItem = items.find((i) => i.id === Number(value));
      newItems[index].price = selectedItem ? selectedItem.price : 0;
    }

    setInvoiceItems(newItems);
  };

  const removeInvoiceItem = (index) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const subtotal = invoiceItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const total = subtotal + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerName.trim()) {
      alert('Please enter customer name');
      return;
    }
    if (invoiceItems.length === 0) {
      alert('Add at least one invoice item');
      return;
    }

    const payload = {
      customer_name: customerName.trim(),
      tax: Number(tax),
      total: total,
      items: invoiceItems.map((item) => ({
        item_id: Number(item.item_id),
        quantity: Number(item.quantity),
        price: Number(item.price),
      })),
    };

    // If editing, add id to payload
    if (invoice && invoice.id) {
      payload.id = invoice.id;
    }

    try {
      const method = invoice && invoice.id ? 'PUT' : 'POST';
      const url = invoice && invoice.id
        ? `http://localhost:8080/invoices/${invoice.id}`
        : 'http://localhost:8080/invoices';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to save invoice');
      }

      const data = await res.json();

      // Return new invoice object with id from response if any
      onSave({ id: data.invoice_id || payload.id || 0, ...payload });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="modal-dialog modal-lg" role="document">
        <form className="modal-content" onSubmit={handleSubmit}>
          <div className="modal-header">
            <h5 className="modal-title">
              {invoice && invoice.id ? 'Edit Invoice' : 'Create New Invoice'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Customer Name</label>
              <input
                type="text"
                className="form-control"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>

            <table className="table table-bordered mb-3">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price (Rs.)</th>
                  <th>Subtotal (Rs.)</th>
                  <th>
                    <button
                      type="button"
                      className="btn btn-sm btn-success"
                      onClick={addInvoiceItem}
                    >
                      + Add Item
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoiceItems.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      No items added
                    </td>
                  </tr>
                )}
                {invoiceItems.map((invItem, idx) => (
                  <tr key={idx}>
                    <td>
                      <select
                        className="form-select"
                        value={invItem.item_id}
                        onChange={(e) =>
                          updateInvoiceItem(idx, 'item_id', e.target.value)
                        }
                        required
                      >
                        <option value="">Select item</option>
                        {items.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.type})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        value={invItem.quantity}
                        onChange={(e) =>
                          updateInvoiceItem(idx, 'quantity', e.target.value)
                        }
                        required
                      />
                    </td>
                    <td>{invItem.price.toFixed(2)}</td>
                    <td>{(invItem.price * invItem.quantity).toFixed(2)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => removeInvoiceItem(idx)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mb-3 row">
              <label className="col-sm-2 col-form-label">Tax (Rs.)</label>
              <div className="col-sm-4">
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  step="0.01"
                  value={tax}
                  onChange={(e) => setTax(Number(e.target.value) || 0)}
                />
              </div>
            </div>

            <h5>Total: Rs. {total.toFixed(2)}</h5>
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              Save Invoice
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
