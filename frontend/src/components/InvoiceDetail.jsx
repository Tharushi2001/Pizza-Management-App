import { useEffect, useState, useRef } from 'react';

export default function InvoiceDetail({ invoiceId }) {
  const [invoice, setInvoice] = useState(null);
  const [items, setItems] = useState([]);  // all items data with names
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    fetchData();
  }, [invoiceId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch invoice
      const resInvoice = await fetch(`http://localhost:8080/invoices/${invoiceId}`);
      if (!resInvoice.ok) throw new Error('Failed to fetch invoice');
      const invoiceData = await resInvoice.json();

      // Fetch all items (so we can get item names)
      const resItems = await fetch('http://localhost:8080/items'); // Adjust URL if needed
      if (!resItems.ok) throw new Error('Failed to fetch items');
      const itemsData = await resItems.json();

      setInvoice(invoiceData);
      setItems(itemsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getItemName = (item_id) => {
    const found = items.find((item) => item.id === item_id);
    return found ? found.name : `Item #${item_id}`;
  };

  const handlePrint = () => {
    if (!printRef.current) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${invoice.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2, h4 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            .total { text-align: right; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          ${printRef.current.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  if (loading) return <p>Loading invoice...</p>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!invoice) return <p>Invoice not found</p>;

  return (
    <div className="container mt-4 d-flex justify-content-center">
      <div
        ref={printRef}
        className="p-5 bg-white shadow"
        style={{
          border: '1px solid #ccc',
          maxWidth: '800px',
          width: '100%',
          backgroundColor: 'white',
        }}
      >
        <h2 className="text-center text-orange mb-4">INVOICE</h2>
        <p><strong>Customer:</strong> {invoice.customer_name}</p>
        <p><strong>Tax:</strong> Rs. {invoice.tax.toFixed(2)}</p>

        <table className="table table-bordered invoice-table mt-4">
          <thead className="table-light">
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
                  <td>{getItemName(item.item_id)}</td>  {/* Show name here */}
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

        <h4 className="text-end text-blue mt-4">Total: Rs. {invoice.total.toFixed(2)}</h4>

        <div className="text-center mt-4">
          <button className="print-btn" onClick={handlePrint}>
            Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
