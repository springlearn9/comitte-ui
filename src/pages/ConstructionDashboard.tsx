import React, { useEffect, useState } from 'react';
import { Box, Stack, Heading, Text, SimpleGrid, Spinner, Grid, GridItem } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { constructionService } from '../services/constructionService';
import { Building, Package, Users, CreditCard } from 'lucide-react';
import type { ProjectResponse, MaterialResponse, LabourDetailsResponse, PaymentDetailsResponse } from '../types/construction';

interface DashboardStats {
  totalProjects: number;
  totalMaterials: number;
  totalLabour: number;
  totalPayments: number;
  recentProjects: ProjectResponse[];
  recentMaterials: MaterialResponse[];
  recentLabour: LabourDetailsResponse[];
  recentPayments: PaymentDetailsResponse[];
}

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

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  link?: string;
}> = ({ title, value, icon, color, link }) => {
  const content = (
    <Box
      bg="gray.900"
      borderColor="gray.800"
      borderWidth="1px"
      rounded="lg"
      p={6}
      _hover={{ bg: 'gray.800', borderColor: color }}
      transition="all 0.2s"
      cursor={link ? 'pointer' : 'default'}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Text color="gray.400" fontSize="sm" mb={2}>
            {title}
          </Text>
          <Text color="white" fontSize="3xl" fontWeight="bold">
            {value}
          </Text>
        </Box>
        <Box color={color} opacity={0.8}>
          {icon}
        </Box>
      </Box>
    </Box>
  );

  return link ? <Link to={link}>{content}</Link> : content;
};

const ConstructionDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalMaterials: 0,
    totalLabour: 0,
    totalPayments: 0,
    recentProjects: [],
    recentMaterials: [],
    recentLabour: [],
    recentPayments: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [projects, materials, labour, payments] = await Promise.all([
        constructionService.getAllProjects().catch(() => []),
        constructionService.getAllMaterials().catch(() => []),
        constructionService.getAllLabourDetails().catch(() => []),
        constructionService.getAllPaymentDetails().catch(() => []),
      ]);

      // Sort by created timestamp descending and take first 5
      const sortByDate = (a: any, b: any) => {
        const dateA = new Date(a.createdTimestamp || 0).getTime();
        const dateB = new Date(b.createdTimestamp || 0).getTime();
        return dateB - dateA;
      };

      setStats({
        totalProjects: projects.length,
        totalMaterials: materials.length,
        totalLabour: labour.length,
        totalPayments: payments.length,
        recentProjects: projects.sort(sortByDate).slice(0, 5),
        recentMaterials: materials.sort(sortByDate).slice(0, 5),
        recentLabour: labour.sort(sortByDate).slice(0, 5),
        recentPayments: payments.sort(sortByDate).slice(0, 5),
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <Spinner size="xl" color="red.500" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box bg="red.900" borderColor="red.700" borderWidth="1px" p={4} rounded="md">
        <Text color="red.200">{error}</Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Box mb={4}>
        <Text as="h1" fontSize="xl" fontWeight="bold" color="white" mb={1}>
          Construction Dashboard
        </Text>
        <Text color="gray.400" fontSize="xs">Overview of your construction projects and activities</Text>
      </Box>

      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6} mb={8}>
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={<Building size={40} />}
          color="#3b82f6"
          link="/construction/projects"
        />
        <StatCard
          title="Materials"
          value={stats.totalMaterials}
          icon={<Package size={40} />}
          color="#8b5cf6"
          link="/construction/materials"
        />
        <StatCard
          title="Labour Records"
          value={stats.totalLabour}
          icon={<Users size={40} />}
          color="#10b981"
          link="/construction/labour"
        />
        <StatCard
          title="Payments"
          value={stats.totalPayments}
          icon={<CreditCard size={40} />}
          color="#f59e0b"
          link="/construction/payments"
        />
      </SimpleGrid>

      {/* Recent Activity Grid */}
      <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
        {/* Recent Projects */}
        <GridItem>
          <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={6}>
            <Box display="flex" alignItems="center" mb={4}>
              <Building size={20} color="#3b82f6" />
              <Text color="white" fontSize="lg" fontWeight="semibold" ml={2}>
                Recent Projects
              </Text>
            </Box>
            {stats.recentProjects.length === 0 ? (
              <Text color="gray.500" fontSize="sm">
                No projects yet
              </Text>
            ) : (
              <Stack gap={3}>
                {stats.recentProjects.map((project) => (
                  <Box key={project.projectId} pb={3} borderBottom="1px" borderColor="gray.800">
                    <Text color="white" fontSize="sm" fontWeight="medium">
                      {project.name}
                    </Text>
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Text color="gray.400" fontSize="xs">
                        {project.details || 'No details'}
                      </Text>
                      <Text color="gray.500" fontSize="xs">
                        {formatDate(project.createdTimestamp)}
                      </Text>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </GridItem>

        {/* Recent Materials */}
        <GridItem>
          <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={6}>
            <Box display="flex" alignItems="center" mb={4}>
              <Package size={20} color="#8b5cf6" />
              <Text color="white" fontSize="lg" fontWeight="semibold" ml={2}>
                Recent Materials
              </Text>
            </Box>
            {stats.recentMaterials.length === 0 ? (
              <Text color="gray.500" fontSize="sm">
                No materials yet
              </Text>
            ) : (
              <Stack gap={3}>
                {stats.recentMaterials.map((material) => (
                  <Box key={material.materialId} pb={3} borderBottom="1px" borderColor="gray.800">
                    <Text color="white" fontSize="sm" fontWeight="medium">
                      {material.material || 'Material'}
                    </Text>
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Text color="gray.400" fontSize="xs">
                        {material.projectName} • {material.quantity} {material.unit}
                      </Text>
                      <Text color="gray.500" fontSize="xs">
                        {formatCurrency(material.totalAmount)}
                      </Text>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </GridItem>

        {/* Recent Labour */}
        <GridItem>
          <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={6}>
            <Box display="flex" alignItems="center" mb={4}>
              <Users size={20} color="#10b981" />
              <Text color="white" fontSize="lg" fontWeight="semibold" ml={2}>
                Recent Labour
              </Text>
            </Box>
            {stats.recentLabour.length === 0 ? (
              <Text color="gray.500" fontSize="sm">
                No labour records yet
              </Text>
            ) : (
              <Stack gap={3}>
                {stats.recentLabour.map((labour) => (
                  <Box key={labour.id} pb={3} borderBottom="1px" borderColor="gray.800">
                    <Text color="white" fontSize="sm" fontWeight="medium">
                      {labour.labourType || 'Labour'}
                    </Text>
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Text color="gray.400" fontSize="xs">
                        {labour.projectName} • {formatDate(labour.labourDate)}
                      </Text>
                      <Text color="gray.500" fontSize="xs">
                        {formatCurrency(labour.labourAmount)}
                      </Text>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </GridItem>

        {/* Recent Payments */}
        <GridItem>
          <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={6}>
            <Box display="flex" alignItems="center" mb={4}>
              <CreditCard size={20} color="#f59e0b" />
              <Text color="white" fontSize="lg" fontWeight="semibold" ml={2}>
                Recent Payments
              </Text>
            </Box>
            {stats.recentPayments.length === 0 ? (
              <Text color="gray.500" fontSize="sm">
                No payment records yet
              </Text>
            ) : (
              <Stack gap={3}>
                {stats.recentPayments.map((payment) => (
                  <Box key={payment.paymentId} pb={3} borderBottom="1px" borderColor="gray.800">
                    <Text color="white" fontSize="sm" fontWeight="medium">
                      {payment.paymentType || 'Payment'}
                    </Text>
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Text color="gray.400" fontSize="xs">
                        {payment.projectName} • {payment.receiverDetails}
                      </Text>
                      <Text color="gray.500" fontSize="xs">
                        {formatDate(payment.paymentDate)}
                      </Text>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default ConstructionDashboard;
