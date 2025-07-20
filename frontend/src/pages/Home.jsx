import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      console.log(' Fetched items:', data);
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch items:', err);
      setError('Failed to load items. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Banner Section */}
      <div
        className="position-relative text-center mb-4"
        style={{ maxHeight: 400, height: 400, overflow: 'hidden' }}
      >
        <img
          src="/images/banner-img.jpg"
          alt="Pizza Banner"
          className="w-100"
          style={{ objectFit: 'cover', height: '100%' }}
        />

        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.2))',
            zIndex: 1,
          }}
        ></div>

        <h1
          className="position-absolute top-50 start-50 translate-middle text-white fw-bold"
          style={{
            textShadow: '2px 2px 6px rgba(0,0,0,0.6)',
            fontSize: '2.5rem',
            margin: 0,
            zIndex: 2,
          }}
        >
          VittoPizza Admin Panel
        </h1>
      </div>

      {/* Cards Section */}
      <div className="container mt-4">
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="card h-auto shadow-sm position-relative">
              <img
                src="/images/img-1.jpg"
                className="card-img-top"
                alt="Item Management"
                style={{ maxHeight: 250, objectFit: 'cover' }}
              />
              <Link
                to="/items"
                className="new-btn text-decoration-none position-absolute top-50 start-50 translate-middle d-flex align-items-center justify-content-center text-center px-4 py-2"
                style={{ minWidth: '150px', minHeight: '50px' }}
              >
                Manage Items
              </Link>
              <div className="card-body text-center">
                <h5 className="card-title mx-3">Item Management</h5>
                <p className="card-text">
                  Manage pizzas, drinks, sides and more from the menu.
                </p>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card h-auto shadow-sm position-relative">
              <img
                src="/images/img-2.webp"
                className="card-img-top"
                alt="Invoice Management"
                style={{ maxHeight: 250, objectFit: 'cover' }}
              />
              <Link
                to="/invoices"
                className="new-btn text-decoration-none position-absolute top-50 start-50 translate-middle d-flex align-items-center justify-content-center text-center px-4 py-2"
                style={{ minWidth: '150px', minHeight: '50px' }}
              >
                Manage Invoices
              </Link>

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
    </>
  );
}
