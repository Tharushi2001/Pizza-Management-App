import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';


export default function Home() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    console.log("Home mounted – fetching items");
    fetchItems();
  }, []);

  const cleanImageUrl = (url) => (url ? url.replace(/^"+|"+$/g, '').trim() : null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('http://localhost:8080/items');
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();

      console.log('📦 Fetched items:', data);
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch items:', err);
      setError('Failed to load items. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Banner */}
      <img
        src="/images/banner-img.jpg"
        alt="Pizza Banner"
        className="w-100 mb-4"
        style={{ maxHeight: 400, objectFit: 'cover' }}
      />

      {/* Cards Section */}
      <div className="container mt-4">
        {/* g‑4 adds column gutters all round */}
        <div className="row g-4">
          {/* ── Item Management ── */}
          <div className="col-lg-6">
            <div className="card h-auto shadow-sm position-relative">
              <img
                src="/images/img-1.jpg"
                className="card-img-top"
                alt="Item Management"
                style={{ maxHeight: 250, objectFit: 'cover' }}
              />

              {/* Overlay button */}
             <Link
  to="/items"
  className="btn btn-primary position-absolute top-50 start-50 translate-middle"
>
  Manage Items
</Link>


              <div className="card-body text-center">
                <h5 className="card-title">Item Management</h5>
                <p className="card-text">
                  Manage pizzas, drinks, sides and more from the menu.
                </p>
              </div>
            </div>
          </div>

          {/* ── Invoice Management ── */}
          <div className="col-lg-6">
            <div className="card h-auto shadow-sm position-relative">
              <img
                src="/images/img-2.webp"
                className="card-img-top"
                alt="Invoice Management"
                style={{ maxHeight: 250, objectFit: 'cover' }}
              />

              {/* Overlay button */}
              <button
                className="btn btn-primary position-absolute top-50 start-50 translate-middle"
              >
                Manage Invoices
              </button>

              <div className="card-body text-center">
                <h5 className="card-title">Invoice Management</h5>
                <p className="card-text">
                  Generate and track invoices for your orders easily.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
