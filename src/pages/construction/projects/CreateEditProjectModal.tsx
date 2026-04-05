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
} from '@chakra-ui/react';
import type { ProjectRequest, Project } from '../../../types/construction';
import { constructionService } from '../../../services/constructionService';

interface CreateEditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project?: Project | null;
}

const CreateEditProjectModal: React.FC<CreateEditProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  project,
}) => {
  const [formData, setFormData] = useState<ProjectRequest>({
    name: '',
    details: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        details: project.details || '',
      });
    } else {
      setFormData({
        name: '',
        details: '',
      });
    }
    setError(null);
  }, [project, isOpen]);

  const handleInputChange = (field: keyof ProjectRequest, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setError(null);

    if (!formData.name?.trim()) {
      setError('Project name is required');
      return;
    }

    setLoading(true);
    try {
      if (project) {
        await constructionService.updateProject(Number(project.id), formData);
      } else {
        await constructionService.createProject(formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save project');
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
              {project ? 'Edit Project' : 'Create New Project'}
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

              <Box>
                <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">
                  Project Name *
                </Text>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter project name"
                  bg="gray.800"
                  borderColor="gray.700"
                  color="white"
                  _placeholder={{ color: 'gray.500' }}
                  _hover={{ borderColor: 'gray.600' }}
                  _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
                />
              </Box>

              <Box>
                <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">
                  Details
                </Text>
                <Textarea
                  value={formData.details}
                  onChange={(e) => handleInputChange('details', e.target.value)}
                  placeholder="Enter project details"
                  bg="gray.800"
                  borderColor="gray.700"
                  color="white"
                  _placeholder={{ color: 'gray.500' }}
                  _hover={{ borderColor: 'gray.600' }}
                  _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
                  rows={4}
                />
              </Box>
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
              loadingText={project ? 'Updating...' : 'Creating...'}
            >
              {project ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
};

export default CreateEditProjectModal;
