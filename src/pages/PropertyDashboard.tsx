import React, { useEffect, useState } from 'react';
import { Box, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { Building2, Home, TrendingUp, IndianRupee } from 'lucide-react';
import { propertyService } from '../services/propertyService';
import { mapPropertyResponse, type PropertyResponse } from '../types/property';

interface PropertyDashboardStats {
  totalMyListings: number;
  availableCount: number;
  rentCount: number;
  estimatedPortfolioValue: number;
  recentMyListings: PropertyResponse[];
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
  if (value == null) return 'Rs 0';
  return `Rs ${Math.round(value).toLocaleString()}`;
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
          <Text color="gray.400" fontSize="sm" mb={2}>{title}</Text>
          <Text color="white" fontSize="3xl" fontWeight="bold">{value}</Text>
        </Box>
        <Box color={color} opacity={0.8}>{icon}</Box>
      </Box>
    </Box>
  );

  return link ? <Link to={link}>{content}</Link> : content;
};

const PropertyDashboard: React.FC = () => {
  const [stats, setStats] = useState<PropertyDashboardStats>({
    totalMyListings: 0,
    availableCount: 0,
    rentCount: 0,
    estimatedPortfolioValue: 0,
    recentMyListings: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const page = await propertyService.getMyListings(0, 50);
        const listings = page.content || [];

        const availableCount = listings.filter((p) => p.status === 'AVAILABLE').length;
        const rentCount = listings.filter((p) => p.listingType === 'RENT').length;
        const estimatedPortfolioValue = listings.reduce((sum, p) => sum + (p.price || 0), 0);

        setStats({
          totalMyListings: page.totalElements ?? listings.length,
          availableCount,
          rentCount,
          estimatedPortfolioValue,
          recentMyListings: listings.slice(0, 5),
        });
      } catch (err: any) {
        setError(err?.message || 'Failed to load property dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <Box p={6}>
        <Text color="gray.400">Loading property dashboard...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Box bg="red.900" borderColor="red.700" borderWidth="1px" p={4} rounded="md">
          <Text color="red.200">{error}</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Box mb={4}>
        <Text as="h1" fontSize="xl" fontWeight="bold" color="white" mb={1}>Property Dashboard</Text>
        <Text color="gray.400" fontSize="xs">Overview of your property listings and value snapshot</Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6} mb={8}>
        <StatCard
          title="My Listings"
          value={stats.totalMyListings}
          icon={<Building2 size={40} />}
          color="#3b82f6"
          link="/property/listings"
        />
        <StatCard
          title="Available"
          value={stats.availableCount}
          icon={<Home size={40} />}
          color="#10b981"
          link="/property/listings"
        />
        <StatCard
          title="Rent Listings"
          value={stats.rentCount}
          icon={<TrendingUp size={40} />}
          color="#f59e0b"
          link="/property/listings"
        />
        <StatCard
          title="Portfolio Value"
          value={formatCurrency(stats.estimatedPortfolioValue)}
          icon={<IndianRupee size={40} />}
          color="#ef4444"
          link="/property/listings"
        />
      </SimpleGrid>

      <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={6}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Text color="white" fontSize="lg" fontWeight="semibold">Recent My Listings</Text>
          <Link to="/property/listings">
            <Text color="red.400" fontSize="sm" _hover={{ color: 'red.300' }}>View all</Text>
          </Link>
        </Box>

        {stats.recentMyListings.length === 0 ? (
          <Text color="gray.500" fontSize="sm">No listings yet. Create your first property listing.</Text>
        ) : (
          <Stack gap={3}>
            {stats.recentMyListings.map((property) => {
              const listItem = mapPropertyResponse(property);
              return (
                <Box key={property.id} bg="gray.800" borderColor="gray.700" borderWidth="1px" rounded="md" p={3}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" gap={3}>
                    <Box minW={0}>
                      <Text color="white" fontWeight="medium" fontSize="sm" lineClamp={1}>{listItem.title}</Text>
                      <Text color="gray.400" fontSize="xs" lineClamp={1}>{listItem.location}</Text>
                    </Box>
                    <Box textAlign="right">
                      <Text color="white" fontWeight="semibold" fontSize="sm">{formatCurrency(listItem.price)}</Text>
                      <Text color="gray.500" fontSize="xs">{formatDate(listItem.createdAt)}</Text>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default PropertyDashboard;
