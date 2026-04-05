import React, { useEffect, useState } from 'react';
import { Box, Stack, Text, Button } from '@chakra-ui/react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { constructionService } from '../../../services/constructionService';
import { mapProjectResponse, type Project } from '../../../types/construction';
import CreateEditProjectModal from './CreateEditProjectModal';

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

const ProjectRow: React.FC<{
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}> = ({ project, onEdit, onDelete }) => {
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
          <Text color="white" fontWeight="medium" fontSize="sm" mb={1}>
            {project.name}
          </Text>
          {project.details && (
            <Text color="gray.400" fontSize="xs" lineClamp={1}>
              {project.details}
            </Text>
          )}
        </Box>
        <Box display="flex" alignItems="center" gap={3}>
          <Text color="gray.400" fontSize="xs">
            {formatDate(project.createdAt)}
          </Text>
          <Box display="inline-flex" gap={1.5}>
            <Box
              as="button"
              onClick={() => onEdit(project)}
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
              onClick={() => onDelete(project.id)}
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

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{
    open: boolean;
    project: Project | null;
  }>({ open: false, project: null });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await constructionService.getAllProjects();
      const mappedProjects = data.map(mapProjectResponse);
      setProjects(mappedProjects);
    } catch (err: any) {
      setError(err?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalState({ open: true, project: null });
  };

  const handleEdit = (project: Project) => {
    setModalState({ open: true, project });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await constructionService.deleteProject(Number(id));
      await loadProjects();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete project');
    }
  };

  const handleModalClose = () => {
    setModalState({ open: false, project: null });
  };

  const handleSuccess = () => {
    loadProjects();
  };

  return (
    <Box p={6}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Box>
          <Text as="h1" fontSize="xl" fontWeight="bold" color="white" mb={1}>
            Projects
          </Text>
          <Text color="gray.400" fontSize="xs">
            Manage construction projects
          </Text>
        </Box>
        <Button
          onClick={handleCreate}
          bg="red.500"
          color="white"
          _hover={{ bg: 'red.600' }}
        >
          <Plus size={20} style={{ marginRight: '8px' }} />
          New Project
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
          <Text color="gray.400">Loading projects...</Text>
        </Box>
      ) : projects.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Text color="gray.400">No projects found. Create your first project!</Text>
        </Box>
      ) : (
        <Stack gap={3}>
          {projects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </Stack>
      )}

      <CreateEditProjectModal
        isOpen={modalState.open}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
        project={modalState.project}
      />
    </Box>
  );
};

export default Projects;
