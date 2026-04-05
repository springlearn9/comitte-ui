import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Button,
  Input,
  Stack,
  DialogRoot,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  Textarea,
  Grid,
  GridItem,
  Select as ChakraSelect,
  NativeSelectRoot,
  NativeSelectField,
} from '@chakra-ui/react';
import type { MaterialRequest, Material, ProjectResponse } from '../../../types/construction';
import { constructionService } from '../../../services/constructionService';

interface CreateEditMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  material?: Material | null;
  projectId?: number;
}

const CreateEditMaterialModal: React.FC<CreateEditMaterialModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  material,
  projectId,
}) => {
  const [formData, setFormData] = useState<MaterialRequest>({
    projectId: projectId || 0,
    materialDate: new Date().toISOString().split('T')[0],
    details: '',
    material: '',
    materialType: '',
    labour: '',
    labourType: '',
    supplier: '',
    quantity: 0,
    unit: '',
    pricePerUnit: 0,
    amount: 0,
    bhada: 0,
    totalAmount: 0,
    tags: '',
    paymentStatus: '',
    paidDate: '',
    paymentId: undefined,
    paymentDetails: '',
  });
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (material) {
      setFormData({
        projectId: material.projectId,
        materialDate: material.materialDate,
        details: material.details || '',
        material: material.material || '',
        materialType: material.materialType || '',
        labour: material.labour || '',
        labourType: material.labourType || '',
        supplier: material.supplier || '',
        quantity: material.quantity || 0,
        unit: material.unit || '',
        pricePerUnit: material.pricePerUnit || 0,
        amount: material.amount || 0,
        bhada: material.bhada || 0,
        totalAmount: material.totalAmount || 0,
        tags: material.tags || '',
        paymentStatus: material.paymentStatus || '',
        paidDate: material.paidDate || '',
        paymentId: material.paymentId,
        paymentDetails: material.paymentDetails || '',
      });
    } else {
      setFormData({
        projectId: projectId || 0,
        materialDate: new Date().toISOString().split('T')[0],
        details: '',
        material: '',
        materialType: '',
        labour: '',
        labourType: '',
        supplier: '',
        quantity: 0,
        unit: '',
        pricePerUnit: 0,
        amount: 0,
        bhada: 0,
        totalAmount: 0,
        tags: '',
        paymentStatus: '',
        paidDate: '',
        paymentId: undefined,
        paymentDetails: '',
      });
    }
    setError(null);
  }, [material, projectId, isOpen]);

  const loadProjects = async () => {
    try {
      const data = await constructionService.getAllProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const handleInputChange = (field: keyof MaterialRequest, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setError(null);

    if (!formData.projectId || formData.projectId <= 0) {
      setError('Please select a project');
      return;
    }

    if (!formData.materialDate) {
      setError('Material date is required');
      return;
    }

    setLoading(true);
    try {
      if (material) {
        await constructionService.updateMaterial(Number(material.id), formData);
      } else {
        await constructionService.createMaterial(formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save material');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()} size="xl">
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent bg="gray.900" borderColor="gray.800" borderWidth="1px" maxH="90vh" overflowY="auto">
          <DialogHeader>
            <DialogTitle color="white">
              {material ? 'Edit Material' : 'Add New Material'}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Stack gap={4}>
              {error && (
                <Box bg="red.900" borderColor="red.700" borderWidth="1px" p={3} rounded="md">
                  <Text color="red.200" fontSize="sm">
                    {error}
                  </Text>
                </Box>
              )}

              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">
                    Project *
                  </Text>
                  <NativeSelectRoot>
                    <NativeSelectField
                      value={formData.projectId}
                      onChange={(e) => handleInputChange('projectId', Number(e.target.value))}
                      bg="gray.800"
                      borderColor="gray.700"
                      color="white"
                      _hover={{ borderColor: 'gray.600' }}
                      _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
                    >
                      <option value="0">Select project</option>
                      {projects.map((project) => (
                        <option key={project.projectId} value={project.projectId}>
                          {project.name}
                        </option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </GridItem>

                <GridItem>
                  <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">
                    Material Date *
                  </Text>
                  <Input
                    type="date"
                    value={formData.materialDate}
                    onChange={(e) => handleInputChange('materialDate', e.target.value)}
                    bg="gray.800"
                    borderColor="gray.700"
                    color="white"
                    _hover={{ borderColor: 'gray.600' }}
                    _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
                  />
                </GridItem>

                <GridItem>
                  <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">
                    Material
                  </Text>
                  <Input
                    value={formData.material}
                    onChange={(e) => handleInputChange('material', e.target.value)}
                    placeholder="Material name"
                    bg="gray.800"
                    borderColor="gray.700"
                    color="white"
                    _placeholder={{ color: 'gray.500' }}
                    _hover={{ borderColor: 'gray.600' }}
                    _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
                  />
                </GridItem>

                <GridItem>
                  <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">
                    Material Type
                  </Text>
                  <Input
                    value={formData.materialType}
                    onChange={(e) => handleInputChange('materialType', e.target.value)}
                    placeholder="Type"
                    bg="gray.800"
                    borderColor="gray.700"
                    color="white"
                    _placeholder={{ color: 'gray.500' }}
                    _hover={{ borderColor: 'gray.600' }}
                    _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
                  />
                </GridItem>

                <GridItem>
                  <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">
                    Supplier
                  </Text>
                  <Input
                    value={formData.supplier}
                    onChange={(e) => handleInputChange('supplier', e.target.value)}
                    placeholder="Supplier name"
                    bg="gray.800"
                    borderColor="gray.700"
                    color="white"
                    _placeholder={{ color: 'gray.500' }}
                    _hover={{ borderColor: 'gray.600' }}
                    _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
                  />
                </GridItem>

                <GridItem>
                  <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">
                    Quantity
                  </Text>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', Number(e.target.value))}
                    placeholder="0"
                    bg="gray.800"
                    borderColor="gray.700"
                    color="white"
                    _placeholder={{ color: 'gray.500' }}
                    _hover={{ borderColor: 'gray.600' }}
                    _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
                  />
                </GridItem>

                <GridItem>
                  <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">
                    Unit
                  </Text>
                  <Input
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    placeholder="e.g., kg, m, pcs"
                    bg="gray.800"
                    borderColor="gray.700"
                    color="white"
                    _placeholder={{ color: 'gray.500' }}
                    _hover={{ borderColor: 'gray.600' }}
                    _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
                  />
                </GridItem>

                <GridItem>
                  <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">
                    Price Per Unit
                  </Text>
                  <Input
                    type="number"
                    value={formData.pricePerUnit}
                    onChange={(e) => handleInputChange('pricePerUnit', Number(e.target.value))}
                    placeholder="0.00"
                    bg="gray.800"
                    borderColor="gray.700"
                    color="white"
                    _placeholder={{ color: 'gray.500' }}
                    _hover={{ borderColor: 'gray.600' }}
                    _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
                  />
                </GridItem>

                <GridItem>
                  <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">
                    Amount
                  </Text>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', Number(e.target.value))}
                    placeholder="0.00"
                    bg="gray.800"
                    borderColor="gray.700"
                    color="white"
                    _placeholder={{ color: 'gray.500' }}
                    _hover={{ borderColor: 'gray.600' }}
                    _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
                  />
                </GridItem>

                <GridItem>
                  <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">
                    Bhada
                  </Text>
                  <Input
                    type="number"
                    value={formData.bhada}
                    onChange={(e) => handleInputChange('bhada', Number(e.target.value))}
                    placeholder="0.00"
                    bg="gray.800"
                    borderColor="gray.700"
                    color="white"
                    _placeholder={{ color: 'gray.500' }}
                    _hover={{ borderColor: 'gray.600' }}
                    _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
                  />
                </GridItem>

                <GridItem>
                  <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">
                    Total Amount
                  </Text>
                  <Input
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) => handleInputChange('totalAmount', Number(e.target.value))}
                    placeholder="0.00"
                    bg="gray.800"
                    borderColor="gray.700"
                    color="white"
                    _placeholder={{ color: 'gray.500' }}
                    _hover={{ borderColor: 'gray.600' }}
                    _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
                  />
                </GridItem>

                <GridItem>
                  <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">
                    Payment Status
                  </Text>
                  <Input
                    value={formData.paymentStatus}
                    onChange={(e) => handleInputChange('paymentStatus', e.target.value)}
                    placeholder="e.g., Paid, Pending"
                    bg="gray.800"
                    borderColor="gray.700"
                    color="white"
                    _placeholder={{ color: 'gray.500' }}
                    _hover={{ borderColor: 'gray.600' }}
                    _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
                  />
                </GridItem>

                <GridItem colSpan={2}>
                  <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">
                    Details
                  </Text>
                  <Textarea
                    value={formData.details}
                    onChange={(e) => handleInputChange('details', e.target.value)}
                    placeholder="Additional details"
                    bg="gray.800"
                    borderColor="gray.700"
                    color="white"
                    _placeholder={{ color: 'gray.500' }}
                    _hover={{ borderColor: 'gray.600' }}
                    _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
                    rows={3}
                  />
                </GridItem>

                <GridItem>
                  <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">
                    Tags
                  </Text>
                  <Input
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="Comma-separated tags"
                    bg="gray.800"
                    borderColor="gray.700"
                    color="white"
                    _placeholder={{ color: 'gray.500' }}
                    _hover={{ borderColor: 'gray.600' }}
                    _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
                  />
                </GridItem>
              </Grid>
            </Stack>
          </DialogBody>
          <DialogFooter>
            <Button
              onClick={onClose}
              variant="outline"
              colorScheme="gray"
              mr={3}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              bg="red.500"
              color="white"
              _hover={{ bg: 'red.600' }}
              loading={loading}
              loadingText={material ? 'Updating...' : 'Creating...'}
            >
              {material ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
};

export default CreateEditMaterialModal;
