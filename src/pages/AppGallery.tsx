import React, { useState } from 'react';
import { 
  Box, 
  Text, 
  Button, 
  Input, 
  Badge
} from '@chakra-ui/react';
import { 
  Download, 
  ExternalLink, 
  Search, 
  Smartphone, 
  Monitor, 
  Tablet,
  Star,
  Calendar,
  Users,
  Shield,
  Zap,
  Database
} from 'lucide-react';

interface AppItem {
  id: string;
  name: string;
  description: string;
  version: string;
  platform: 'web' | 'mobile' | 'desktop' | 'all';
  category: string;
  rating: number;
  downloads: string;
  releaseDate: string;
  features: string[];
  status: 'stable' | 'beta' | 'alpha';
}

const AppGallery: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  const apps: AppItem[] = [
    {
      id: '1',
      name: 'Comitte Mobile',
      description: 'Full-featured mobile application for committee management on the go. Access all your committee data, manage bids, and stay connected with your team from anywhere.',
      version: '2.1.0',
      platform: 'mobile',
      category: 'productivity',
      rating: 4.8,
      downloads: '50K+',
      releaseDate: '2024-01-15',
      features: ['Offline Mode', 'Push Notifications', 'Biometric Security', 'Real-time Sync'],
      status: 'stable'
    },
    {
      id: '2',
      name: 'Comitte Desktop',
      description: 'Native desktop application with advanced features for power users. Enhanced performance, offline capabilities, and integrated reporting tools.',
      version: '1.5.2',
      platform: 'desktop',
      category: 'productivity',
      rating: 4.6,
      downloads: '25K+',
      releaseDate: '2024-02-01',
      features: ['Advanced Analytics', 'Bulk Operations', 'Export Tools', 'Custom Themes'],
      status: 'stable'
    },
    {
      id: '3',
      name: 'Comitte Analytics',
      description: 'Comprehensive analytics and reporting module for deep insights into committee performance, bid trends, and member engagement.',
      version: '1.0.0-beta',
      platform: 'web',
      category: 'analytics',
      rating: 4.3,
      downloads: '10K+',
      releaseDate: '2024-03-10',
      features: ['Custom Dashboards', 'Automated Reports', 'Data Visualization', 'Trend Analysis'],
      status: 'beta'
    },
    {
      id: '4',
      name: 'API Integration Kit',
      description: 'Developer tools and SDK for integrating Comitte functionality into third-party applications. Complete API documentation and code samples.',
      version: '0.9.0-alpha',
      platform: 'all',
      category: 'developer',
      rating: 4.1,
      downloads: '5K+',
      releaseDate: '2024-03-25',
      features: ['REST API', 'WebSocket Support', 'SDK Libraries', 'Code Examples'],
      status: 'alpha'
    },
    {
      id: '5',
      name: 'Comitte Security Suite',
      description: 'Enhanced security module with advanced authentication, audit logging, and compliance tools for enterprise environments.',
      version: '1.2.1',
      platform: 'web',
      category: 'security',
      rating: 4.9,
      downloads: '15K+',
      releaseDate: '2024-01-30',
      features: ['2FA', 'Audit Logs', 'Role-based Access', 'Compliance Reports'],
      status: 'stable'
    },
    {
      id: '6',
      name: 'Workflow Automation',
      description: 'Automate repetitive tasks and create custom workflows for bid processing, member onboarding, and committee operations.',
      version: '1.1.0',
      platform: 'web',
      category: 'automation',
      rating: 4.4,
      downloads: '12K+',
      releaseDate: '2024-02-15',
      features: ['Custom Workflows', 'Email Automation', 'Scheduled Tasks', 'Integration Hub'],
      status: 'stable'
    }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'analytics', label: 'Analytics' },
    { value: 'developer', label: 'Developer Tools' },
    { value: 'security', label: 'Security' },
    { value: 'automation', label: 'Automation' }
  ];

  const platforms = [
    { value: 'all', label: 'All Platforms' },
    { value: 'web', label: 'Web' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'desktop', label: 'Desktop' }
  ];

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    const matchesPlatform = selectedPlatform === 'all' || app.platform === selectedPlatform || app.platform === 'all';
    
    return matchesSearch && matchesCategory && matchesPlatform;
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'mobile': return <Smartphone size={16} />;
      case 'desktop': return <Monitor size={16} />;
      case 'web': return <Monitor size={16} />;
      case 'all': return <Tablet size={16} />;
      default: return <Monitor size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'green';
      case 'beta': return 'yellow';
      case 'alpha': return 'red';
      default: return 'gray';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'productivity': return <Users size={16} />;
      case 'analytics': return <Database size={16} />;
      case 'developer': return <Zap size={16} />;
      case 'security': return <Shield size={16} />;
      case 'automation': return <Zap size={16} />;
      default: return <Users size={16} />;
    }
  };

  return (
    <Box p={6}>
      <Box mb={6}>
        <Text as="h1" fontSize="2xl" fontWeight="bold" color="white" mb={2}>
          App Gallery
        </Text>
        <Text color="gray.400" fontSize="lg">
          Explore and download Comitte applications and extensions
        </Text>
      </Box>

      {/* Filters */}
      <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={4} mb={6}>
        <Box display="grid" gridTemplateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
          <Box>
            <Text color="white" fontSize="sm" fontWeight="medium" mb={2}>
              Search Apps
            </Text>
            <Box position="relative">
              <Input
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="gray.800"
                borderColor="gray.700"
                color="white"
                _placeholder={{ color: 'gray.500' }}
                _focus={{ borderColor: 'blue.400' }}
                pl={10}
              />
              <Box position="absolute" left={3} top="50%" transform="translateY(-50%)">
                <Search size={16} color="#6b7280" />
              </Box>
            </Box>
          </Box>

          <Box>
            <Text color="white" fontSize="sm" fontWeight="medium" mb={2}>
              Category
            </Text>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '6px',
                color: 'white',
                fontSize: '14px'
              }}
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </Box>

          <Box>
            <Text color="white" fontSize="sm" fontWeight="medium" mb={2}>
              Platform
            </Text>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '6px',
                color: 'white',
                fontSize: '14px'
              }}
            >
              {platforms.map((platform) => (
                <option key={platform.value} value={platform.value}>
                  {platform.label}
                </option>
              ))}
            </select>
          </Box>
        </Box>
      </Box>

      {/* Results Count */}
      <Box mb={4}>
        <Text color="gray.400" fontSize="sm">
          Found {filteredApps.length} app{filteredApps.length !== 1 ? 's' : ''}
        </Text>
      </Box>

      {/* Apps Grid */}
      <Box display="grid" gridTemplateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
        {filteredApps.map((app) => (
          <Box key={app.id} bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={6}>
            {/* Header */}
            <Box mb={4}>
              <Box display="flex" alignItems="start" justifyContent="space-between" mb={3}>
                <Box>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Text fontSize="xl" fontWeight="semibold" color="white">
                      {app.name}
                    </Text>
                    <Badge colorScheme={getStatusColor(app.status)} size="sm">
                      {app.status.toUpperCase()}
                    </Badge>
                  </Box>
                  <Box display="flex" alignItems="center" gap={4} color="gray.400" fontSize="sm">
                    <Box display="flex" alignItems="center" gap={1}>
                      {getPlatformIcon(app.platform)}
                      <Text>{app.platform === 'all' ? 'All Platforms' : app.platform}</Text>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Star size={14} fill="#fbbf24" color="#fbbf24" />
                      <Text>{app.rating}</Text>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Download size={14} />
                      <Text>{app.downloads}</Text>
                    </Box>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={1} color="gray.400" fontSize="sm">
                  {getCategoryIcon(app.category)}
                </Box>
              </Box>
              
              <Text color="gray.300" fontSize="sm" lineHeight="tall">
                {app.description}
              </Text>
            </Box>

            {/* Features */}
            <Box mb={4}>
              <Text color="white" fontSize="sm" fontWeight="medium" mb={2}>
                Key Features
              </Text>
              <Box display="flex" flexWrap="wrap" gap={2}>
                {app.features.map((feature) => (
                  <Badge key={feature} variant="outline" colorScheme="gray" size="sm">
                    {feature}
                  </Badge>
                ))}
              </Box>
            </Box>

            {/* Footer */}
            <Box display="flex" alignItems="center" justifyContent="space-between" pt={4} borderTop="1px solid" borderColor="gray.800">
              <Box>
                <Text color="gray.400" fontSize="xs">
                  Version {app.version}
                </Text>
                <Box display="flex" alignItems="center" gap={1} color="gray.400" fontSize="xs">
                  <Calendar size={12} />
                  <Text>{new Date(app.releaseDate).toLocaleDateString()}</Text>
                </Box>
              </Box>
              <Box display="flex" gap={2}>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="gray"
                  bg="gray.600"
                  color="white"
                  borderColor="gray.500"
                  _hover={{ bg: 'white', color: 'black', borderColor: 'gray.400' }}
                  transition="all 0.2s"
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <ExternalLink size={14} />
                    Details
                  </Box>
                </Button>
                <Button
                  size="sm"
                  colorScheme="blue"
                  bg="blue.600"
                  color="white"
                  _hover={{ bg: 'blue.500' }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Download size={14} />
                    Download
                  </Box>
                </Button>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      {filteredApps.length === 0 && (
        <Box textAlign="center" py={12}>
          <Text color="gray.400" fontSize="lg">
            No apps found matching your criteria
          </Text>
          <Text color="gray.500" fontSize="sm" mt={2}>
            Try adjusting your search terms or filters
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default AppGallery;