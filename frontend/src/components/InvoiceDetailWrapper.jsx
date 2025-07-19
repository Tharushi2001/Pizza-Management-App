import { useParams } from 'react-router-dom';
import InvoiceDetail from './InvoiceDetail';

export default function InvoiceDetailWrapper() {
  const { id } = useParams();
  return <InvoiceDetail invoiceId={id} />;
}
