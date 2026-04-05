import React, { useEffect, useState } from 'react';
import { Box, Stack, Text, Button } from '@chakra-ui/react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { constructionService } from '../../../services/constructionService';
import { mapLabourDetailsResponse, type LabourDetails as LabourDetailsType } from '../../../types/construction';
import CreateEditLabourModal from './CreateEditLabourModal';

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

const formatCurrency = (value?: number) => {
  if (value == null) return '₹0';
  return `₹${value.toLocaleString()}`;
};

const LabourRow: React.FC<{
  labour: LabourDetailsType;
  onEdit: (labour: LabourDetailsType) => void;
  onDelete: (id: string) => void;
}> = ({ labour, onEdit, onDelete }) => {
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
                {formatDate(labour.labourDate)}
              </Text>
              {labour.projectName && (
                <Text color="gray.400" fontSize="xs">
                  {labour.projectName}
                </Text>
              )}
            </Box>
            <Box>
              <Text color="white" fontSize="sm">
                {labour.labourType || 'Labour'}
              </Text>
              {labour.details && (
                <Text color="gray.400" fontSize="xs" lineClamp={1}>
                  {labour.details}
                </Text>
              )}
            </Box>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" gap={3}>
          <Text color="white" fontWeight="semibold" fontSize="sm">
            {formatCurrency(labour.labourAmount)}
          </Text>
          <Box display="inline-flex" gap={1.5}>
            <Box
              as="button"
              onClick={() => onEdit(labour)}
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
              onClick={() => onDelete(labour.id)}
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

const LabourDetails: React.FC = () => {
  const [labourList, setLabourList] = useState<LabourDetailsType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{
    open: boolean;
    labour: LabourDetailsType | null;
  }>({ open: false, labour: null });

  useEffect(() => {
    loadLabourDetails();
  }, []);

  const loadLabourDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await constructionService.getAllLabourDetails();
      const mappedLabour = data.map(mapLabourDetailsResponse);
      setLabourList(mappedLabour);
    } catch (err: any) {
      setError(err?.message || 'Failed to load labour details');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalState({ open: true, labour: null });
  };

  const handleEdit = (labour: LabourDetailsType) => {
    setModalState({ open: true, labour });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this labour entry?')) return;

    try {
      await constructionService.deleteLabourDetails(Number(id));
      await loadLabourDetails();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete labour details');
    }
  };

  const handleModalClose = () => {
    setModalState({ open: false, labour: null });
  };

  const handleSuccess = () => {
    loadLabourDetails();
  };

  return (
    <Box p={6}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Box>
          <Text as="h1" fontSize="xl" fontWeight="bold" color="white" mb={1}>
            Labour Details
          </Text>
          <Text color="gray.400" fontSize="xs">
            Manage labour records
          </Text>
        </Box>
        <Button
          onClick={handleCreate}
          bg="red.500"
          color="white"
          _hover={{ bg: 'red.600' }}
        >
          <Plus size={20} style={{ marginRight: '8px' }} />
          Add Labour
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
          <Text color="gray.400">Loading labour details...</Text>
        </Box>
      ) : labourList.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Text color="gray.400">No labour records found. Add your first entry!</Text>
        </Box>
      ) : (
        <Stack gap={3}>
          {labourList.map((labour) => (
            <LabourRow
              key={labour.id}
              labour={labour}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </Stack>
      )}

      <CreateEditLabourModal
        isOpen={modalState.open}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
        labour={modalState.labour}
      />
    </Box>
  );
};

export default LabourDetails;
