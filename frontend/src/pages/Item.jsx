import { useEffect, useState } from 'react';
import { BsPencilSquare, BsTrash } from 'react-icons/bs';
import ItemFormModal from './ItemFormModal';

export default function Item() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Modal state
  const [showForm, setShowForm]         = useState(false);
  const [editingItem, setEditingItem]   = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8080/items');
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load items. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const upsertItem = async (values) => {
    const isEdit = Boolean(values.id);
    const url = isEdit
      ? `http://localhost:8080/items/${values.id}`
      : 'http://localhost:8080/items';
    const method = isEdit ? 'PUT' : 'POST';

    // Construct a clean payload
    const payload = {
      name: values.name.trim(),
      type: values.type.trim(),
      price: Number(values.price),
      image_url: values.image_url.trim()
    };
    if (isEdit) payload.id = values.id;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || 'Save failed');
    }

    const saved = isEdit ? { ...payload } : await res.json();

    setItems((prev) =>
      isEdit
        ? prev.map((it) => (it.id === saved.id ? saved : it))
        : [...prev, saved]
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;

    try {
      const res = await fetch(`http://localhost:8080/items/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (err) {
      console.error(err);
      alert('Could not delete item. Try again.');
    }
  };

  return (
    <div className="container mt-4">
      {/* Add new button */}
      <div className="d-flex justify-content-end mb-3">
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
        >
          + Add New Item
        </button>
      </div>

      {loading && <p>Loading items...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        items.length === 0 ? (
          <p>No items available.</p>
        ) : (
          <table className="table table-striped table-bordered align-middle">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Price (Rs.)</th>
                <th>Image</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.type}</td>
                  <td>{item.price}</td>
                  <td>
                    {item.image_url ? (
                      <img
                        src={item.image_url.replace(/^"+|"+$/g, '')}
                        alt={item.name}
                        style={{ height: 80, width: 80, objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/placeholder.png';
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          height: 80,
                          width: 80,
                          backgroundColor: '#ccc',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          color: '#666',
                          fontSize: '0.8rem',
                        }}
                      >
                        No Image
                      </div>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      title="Edit"
                      onClick={() => {
                        setEditingItem(item);
                        setShowForm(true);
                      }}
                    >
                      <BsPencilSquare />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      title="Delete"
                      onClick={() => handleDelete(item.id)}
                    >
                      <BsTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}

      {/* Modal */}
      {showForm && (
        <ItemFormModal
          initialData={editingItem}
          onClose={() => setShowForm(false)}
          onSave={async (vals) => {
            try {
              await upsertItem(vals);
              setShowForm(false);
            } catch (e) {
              alert(`Error: ${e.message}`);
            }
          }}
        />
      )}
    </div>
  );
}
