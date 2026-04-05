import React, { useEffect, useState } from 'react';
import { Box, Stack, Text, Button, Grid, GridItem } from '@chakra-ui/react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { constructionService } from '../../../services/constructionService';
import { mapMaterialResponse, type Material } from '../../../types/construction';
import CreateEditMaterialModal from './CreateEditMaterialModal';

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

const MaterialRow: React.FC<{
  material: Material;
  onEdit: (material: Material) => void;
  onDelete: (id: string) => void;
}> = ({ material, onEdit, onDelete }) => {
  return (
    <Box
      bg="gray.900"
      borderColor="gray.800"
      borderWidth="1px"
      rounded="lg"
      p={3}
      _hover={{ bg: 'gray.800' }}
    >
      <Grid templateColumns="repeat(12, 1fr)" gap={2} alignItems="center">
        <GridItem colSpan={2}>
          <Text color="white" fontWeight="medium" fontSize="sm">
            {formatDate(material.materialDate)}
          </Text>
          {material.projectName && (
            <Text color="gray.400" fontSize="xs">
              {material.projectName}
            </Text>
          )}
        </GridItem>
        <GridItem colSpan={3}>
          <Text color="white" fontSize="sm">
            {material.material || '-'}
          </Text>
          {material.materialType && (
            <Text color="gray.400" fontSize="xs">
              Type: {material.materialType}
            </Text>
          )}
        </GridItem>
        <GridItem colSpan={2}>
          <Text color="gray.300" fontSize="sm">
            {material.quantity} {material.unit || ''}
          </Text>
          <Text color="gray.400" fontSize="xs">
            @ {formatCurrency(material.pricePerUnit)}
          </Text>
        </GridItem>
        <GridItem colSpan={2}>
          <Text color="gray.300" fontSize="sm">
            {material.supplier || '-'}
          </Text>
        </GridItem>
        <GridItem colSpan={2}>
          <Text color="white" fontWeight="semibold" fontSize="sm">
            {formatCurrency(material.totalAmount)}
          </Text>
          {material.paymentStatus && (
            <Text color="gray.400" fontSize="xs">
              {material.paymentStatus}
            </Text>
          )}
        </GridItem>
        <GridItem colSpan={1}>
          <Box display="inline-flex" gap={1.5} justifyContent="flex-end" w="full">
            <Box
              as="button"
              onClick={() => onEdit(material)}
              title="Edit"
              p={1.5}
              _hover={{ bg: 'gray.700', color: 'blue.300' }}
              rounded="full"
              color="blue.400"
              cursor="pointer"
            >
              <Edit size={16} />
            </Box>
            <Box
              as="button"
              onClick={() => onDelete(material.id)}
              title="Delete"
              p={1.5}
              _hover={{ bg: 'gray.700', color: 'red.300' }}
              rounded="full"
              color="red.400"
              cursor="pointer"
            >
              <Trash2 size={16} />
            </Box>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};

const Materials: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{
    open: boolean;
    material: Material | null;
  }>({ open: false, material: null });

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await constructionService.getAllMaterials();
      const mappedMaterials = data.map(mapMaterialResponse);
      setMaterials(mappedMaterials);
    } catch (err: any) {
      setError(err?.message || 'Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalState({ open: true, material: null });
  };

  const handleEdit = (material: Material) => {
    setModalState({ open: true, material });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material entry?')) return;

    try {
      await constructionService.deleteMaterial(Number(id));
      await loadMaterials();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete material');
    }
  };

  const handleModalClose = () => {
    setModalState({ open: false, material: null });
  };

  const handleSuccess = () => {
    loadMaterials();
  };

  return (
    <Box p={6}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Box>
          <Text as="h1" fontSize="xl" fontWeight="bold" color="white" mb={1}>
            Materials
          </Text>
          <Text color="gray.400" fontSize="xs">
            Manage construction materials
          </Text>
        </Box>
        <Button
          onClick={handleCreate}
          bg="red.500"
          color="white"
          _hover={{ bg: 'red.600' }}
        >
          <Plus size={20} style={{ marginRight: '8px' }} />
          Add Material
        </Button>
      </Box>

      {error && (
        <Box bg="red.900" borderColor="red.700" borderWidth="1px" p={3} rounded="md" mb={4}>
          <Text color="red.200" fontSize="sm">
            {error}
          </Text>
        </Box>
      )}

      {/* Header */}
      <Box bg="gray.800" borderColor="gray.700" borderWidth="1px" rounded="lg" p={3} mb={2}>
        <Grid templateColumns="repeat(12, 1fr)" gap={2}>
          <GridItem colSpan={2}>
            <Text color="gray.400" fontSize="xs" fontWeight="semibold">
              DATE / PROJECT
            </Text>
          </GridItem>
          <GridItem colSpan={3}>
            <Text color="gray.400" fontSize="xs" fontWeight="semibold">
              MATERIAL
            </Text>
          </GridItem>
          <GridItem colSpan={2}>
            <Text color="gray.400" fontSize="xs" fontWeight="semibold">
              QTY / PRICE
            </Text>
          </GridItem>
          <GridItem colSpan={2}>
            <Text color="gray.400" fontSize="xs" fontWeight="semibold">
              SUPPLIER
            </Text>
          </GridItem>
          <GridItem colSpan={2}>
            <Text color="gray.400" fontSize="xs" fontWeight="semibold">
              TOTAL / STATUS
            </Text>
          </GridItem>
          <GridItem colSpan={1}>
            <Text color="gray.400" fontSize="xs" fontWeight="semibold" textAlign="right">
              ACTIONS
            </Text>
          </GridItem>
        </Grid>
      </Box>

      {loading ? (
        <Box textAlign="center" py={8}>
          <Text color="gray.400">Loading materials...</Text>
        </Box>
      ) : materials.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Text color="gray.400">No materials found. Add your first material entry!</Text>
        </Box>
      ) : (
        <Stack gap={2}>
          {materials.map((material) => (
            <MaterialRow
              key={material.id}
              material={material}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </Stack>
      )}

      <CreateEditMaterialModal
        isOpen={modalState.open}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
        material={modalState.material}
      />
    </Box>
  );
};

export default Materials;
