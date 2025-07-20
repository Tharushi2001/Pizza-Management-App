import { useState, useEffect } from 'react';
import { Modal, Button, Form, FloatingLabel } from 'react-bootstrap';

export default function ItemFormModal({ initialData, onClose, onSave }) {
  const [values, setValues] = useState({
    id:         '',
    name:       '',
    type:       '',
    price:      '',
    image_url:  '',
  });

  
  useEffect(() => {
    if (initialData) setValues(initialData);
  }, [initialData]);

  const handleChange = (e) =>
    setValues({ ...values, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(values);
  };

  const title = initialData ? 'Edit Item' : 'Add New Item';

  return (
    <Modal show onHide={onClose} backdrop="static" centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {initialData && (
            <FloatingLabel label="ID" className="mb-3">
              <Form.Control value={values.id} disabled readOnly />
            </FloatingLabel>
          )}

          <FloatingLabel label="Name" className="mb-3">
            <Form.Control
              name="name"
              value={values.name}
              onChange={handleChange}
              required
            />
          </FloatingLabel>

          <FloatingLabel label="Type" className="mb-3">
            <Form.Control
              name="type"
              value={values.type}
              onChange={handleChange}
              required
            />
          </FloatingLabel>

          <FloatingLabel label="Price (Rs.)" className="mb-3">
            <Form.Control
              type="number"
              name="price"
              value={values.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </FloatingLabel>

          <FloatingLabel label="Image URL">
            <Form.Control
              name="image_url"
              value={values.image_url}
              onChange={handleChange}
            />
          </FloatingLabel>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
