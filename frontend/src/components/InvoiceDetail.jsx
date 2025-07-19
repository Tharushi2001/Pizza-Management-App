import { useEffect, useState, useRef } from 'react';

export default function InvoiceDetail({ invoiceId }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8080/invoices/${invoiceId}`);
      if (!res.ok) throw new Error('Failed to fetch invoice');
      const data = await res.json();
      setInvoice(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  if (loading) return <p>Loading invoice...</p>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!invoice) return <p>Invoice not found</p>;

  return (
    <div className="container mt-4" ref={printRef}>
      <h2>Invoice #{invoice.id}</h2>
      <p><strong>Customer:</strong> {invoice.customer_name}</p>
      <p><strong>Tax:</strong> Rs. {invoice.tax.toFixed(2)}</p>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Price (Rs.)</th>
            <th>Subtotal (Rs.)</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items && invoice.items.length > 0 ? (
            invoice.items.map((item) => (
              <tr key={item.id}>
                <td>{`Item #${item.item_id}`}</td>
                <td>{item.quantity}</td>
                <td>{item.price.toFixed(2)}</td>
                <td>{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No items found</td>
            </tr>
          )}
        </tbody>
      </table>

      <h4>Total: Rs. {invoice.total.toFixed(2)}</h4>

      <button className="btn btn-primary mt-3" onClick={handlePrint}>Print Invoice</button>
    </div>
  );
}
