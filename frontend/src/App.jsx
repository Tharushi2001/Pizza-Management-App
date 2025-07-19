import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Item from './pages/Item';
import Invoices from './pages/Invoices';
import InvoiceDetailWrapper from './components/InvoiceDetailWrapper';  // <-- updated import

import { useEffect, useState } from 'react';

export default function App() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/items')
      .then((res) => res.json())
      .then(setItems)
      .catch(console.error);
  }, []);

  return (
    <BrowserRouter>
      <Header />
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/items" element={<Item />} />
          <Route path="/invoices" element={<Invoices items={items} />} />
          <Route path="/invoice/:id" element={<InvoiceDetailWrapper />} />  {/* Use the wrapper here */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}
