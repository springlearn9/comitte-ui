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
import type { LabourDetailsRequest, LabourDetails, ProjectResponse } from '../../../types/construction';
import { constructionService } from '../../../services/constructionService';

interface CreateEditLabourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  labour?: LabourDetails | null;
  projectId?: number;
}

const CreateEditLabourModal: React.FC<CreateEditLabourModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  labour,
  projectId,
}) => {
  const [formData, setFormData] = useState<LabourDetailsRequest>({
    projectId: projectId || 0,
    labourDate: new Date().toISOString().split('T')[0],
    labourType: '',
    labourAmount: 0,
    details: '',
    tags: '',
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
    if (labour) {
      setFormData({
        projectId: labour.projectId,
        labourDate: labour.labourDate,
        labourType: labour.labourType || '',
        labourAmount: labour.labourAmount || 0,
        details: labour.details || '',
        tags: labour.tags || '',
      });
    } else {
      setFormData({
        projectId: projectId || 0,
        labourDate: new Date().toISOString().split('T')[0],
        labourType: '',
        labourAmount: 0,
        details: '',
        tags: '',
      });
    }
    setError(null);
  }, [labour, projectId, isOpen]);

  const loadProjects = async () => {
    try {
      const data = await constructionService.getAllProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const handleInputChange = (field: keyof LabourDetailsRequest, value: any) => {
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

    if (!formData.labourDate) {
      setError('Labour date is required');
      return;
    }

    setLoading(true);
    try {
      if (labour) {
        await constructionService.updateLabourDetails(Number(labour.id), formData);
      } else {
        await constructionService.createLabourDetails(formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save labour details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()} size="lg">
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent bg="gray.900" borderColor="gray.800" borderWidth="1px">
          <DialogHeader>
            <DialogTitle color="white">
              {labour ? 'Edit Labour Details' : 'Add Labour Details'}
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
                    Labour Date *
                  </Text>
                  <Input
                    type="date"
                    value={formData.labourDate}
                    onChange={(e) => handleInputChange('labourDate', e.target.value)}
                    bg="gray.800"
                    borderColor="gray.700"
                    color="white"
                    _hover={{ borderColor: 'gray.600' }}
                    _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
                  />
                </GridItem>

                <GridItem>
                  <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">
                    Labour Type
                  </Text>
                  <Input
                    value={formData.labourType}
                    onChange={(e) => handleInputChange('labourType', e.target.value)}
                    placeholder="e.g., Skilled, Unskilled"
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
                    Labour Amount
                  </Text>
                  <Input
                    type="number"
                    value={formData.labourAmount}
                    onChange={(e) => handleInputChange('labourAmount', Number(e.target.value))}
                    placeholder="0.00"
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

                <GridItem colSpan={2}>
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
              loadingText={labour ? 'Updating...' : 'Creating...'}
            >
              {labour ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
};

export default CreateEditLabourModal;
