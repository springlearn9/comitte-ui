import React, { useEffect, useState } from 'react';
import { Box, Stack, Text, Button } from '@chakra-ui/react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { constructionService } from '../../../services/constructionService';
import { mapPaymentDetailsResponse, type PaymentDetails } from '../../../types/construction';
import CreateEditPaymentModal from './CreateEditPaymentModal';

const formatDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const mm = months[d.getMonth()];
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}${mm}${yy}`;
};

const PaymentRow: React.FC<{
  payment: PaymentDetails;
  onEdit: (payment: PaymentDetails) => void;
  onDelete: (id: string) => void;
}> = ({ payment, onEdit, onDelete }) => {
  return (
    <Box
      bg="gray.900"
      borderColor="gray.800"
      borderWidth="1px"
      rounded="lg"
      p={3}
      _hover={{ bg: 'gray.800' }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
        <Box flex="1">
          <Box display="flex" gap={4} alignItems="center">
            <Box>
              <Text color="white" fontWeight="medium" fontSize="sm">
                {formatDate(payment.paymentDate)}
              </Text>
              {payment.projectName && (
                <Text color="gray.400" fontSize="xs">
                  {payment.projectName}
                </Text>
              )}
            </Box>
            <Box flex="1">
              <Text color="white" fontSize="sm">
                {payment.paymentType || 'Payment'}
              </Text>
              {payment.receiverDetails && (
                <Text color="gray.400" fontSize="xs">
                  To: {payment.receiverDetails}
                </Text>
              )}
            </Box>
            {payment.details && (
              <Box flex="1">
                <Text color="gray.400" fontSize="xs" lineClamp={1}>
                  {payment.details}
                </Text>
              </Box>
            )}
          </Box>
        </Box>
        <Box display="flex" alignItems="center" gap={3}>
          <Box display="inline-flex" gap={1.5}>
            <Box
              as="button"
              onClick={() => onEdit(payment)}
              title="Edit"
              p={1.5}
              _hover={{ bg: 'gray.700', color: 'blue.300' }}
              rounded="full"
              color="blue.400"
              cursor="pointer"
            >
              <Edit size={18} />
            </Box>
            <Box
              as="button"
              onClick={() => onDelete(payment.id)}
              title="Delete"
              p={1.5}
              _hover={{ bg: 'gray.700', color: 'red.300' }}
              rounded="full"
              color="red.400"
              cursor="pointer"
            >
              <Trash2 size={18} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const PaymentDetailsPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{
    open: boolean;
    payment: PaymentDetails | null;
  }>({ open: false, payment: null });

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await constructionService.getAllPaymentDetails();
      const mappedPayments = data.map(mapPaymentDetailsResponse);
      setPayments(mappedPayments);
    } catch (err: any) {
      setError(err?.message || 'Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalState({ open: true, payment: null });
  };

  const handleEdit = (payment: PaymentDetails) => {
    setModalState({ open: true, payment });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment entry?')) return;

    try {
      await constructionService.deletePaymentDetails(Number(id));
      await loadPayments();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete payment details');
    }
  };

  const handleModalClose = () => {
    setModalState({ open: false, payment: null });
  };

  const handleSuccess = () => {
    loadPayments();
  };

  return (
    <Box p={6}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Box>
          <Text as="h1" fontSize="xl" fontWeight="bold" color="white" mb={1}>
            Payment Details
          </Text>
          <Text color="gray.400" fontSize="xs">
            Manage payment records
          </Text>
        </Box>
        <Button
          onClick={handleCreate}
          bg="red.500"
          color="white"
          _hover={{ bg: 'red.600' }}
        >
          <Plus size={20} style={{ marginRight: '8px' }} />
          Add Payment
        </Button>
      </Box>

      {error && (
        <Box bg="red.900" borderColor="red.700" borderWidth="1px" p={3} rounded="md" mb={4}>
          <Text color="red.200" fontSize="sm">
            {error}
          </Text>
        </Box>
      )}

      {loading ? (
        <Box textAlign="center" py={8}>
          <Text color="gray.400">Loading payment details...</Text>
        </Box>
      ) : payments.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Text color="gray.400">No payment records found. Add your first entry!</Text>
        </Box>
      ) : (
        <Stack gap={3}>
          {payments.map((payment) => (
            <PaymentRow
              key={payment.id}
              payment={payment}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </Stack>
      )}

      <CreateEditPaymentModal
        isOpen={modalState.open}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
        payment={modalState.payment}
      />
    </Box>
  );
};

export default PaymentDetailsPage;
