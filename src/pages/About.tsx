import React from 'react';
import { Box, Text, Stack } from '@chakra-ui/react';
import { Info, Users, Target, Award } from 'lucide-react';

const About: React.FC = () => {
  return (
    <Box p={6}>
      <Box mb={6}>
        <Text as="h1" fontSize="2xl" fontWeight="bold" color="white" mb={2}>
          About Comitte
        </Text>
        <Text color="gray.400" fontSize="lg">
          Learn more about our committee management system
        </Text>
      </Box>

      <Stack gap={6}>
        {/* Introduction Card */}
        <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={6}>
          <Box mb={4}>
            <Box display="flex" alignItems="center" gap={3}>
              <Box p={2} bg="red.600" rounded="md">
                <Info size={20} color="white" />
              </Box>
              <Text fontSize="xl" fontWeight="semibold" color="white">
                What is Comitte?
              </Text>
            </Box>
          </Box>
          <Box>
            <Text color="gray.300" lineHeight="tall" mb={4}>
              Comitte is a comprehensive committee management system designed to streamline 
              organizational processes, enhance collaboration, and improve decision-making 
              efficiency. Our platform provides tools for managing committee members, 
              tracking bids, and maintaining transparent governance structures.
            </Text>
            <Text color="gray.300" lineHeight="tall">
              Built with modern technology and user-centric design principles, Comitte 
              empowers organizations to operate more effectively while maintaining 
              accountability and transparency in all committee activities.
            </Text>
          </Box>
        </Box>

        {/* Mission Card */}
        <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={6}>
          <Box mb={4}>
            <Box display="flex" alignItems="center" gap={3}>
              <Box p={2} bg="blue.600" rounded="md">
                <Target size={20} color="white" />
              </Box>
              <Text fontSize="xl" fontWeight="semibold" color="white">
                Our Mission
              </Text>
            </Box>
          </Box>
          <Box>
            <Text color="gray.300" lineHeight="tall">
              To revolutionize committee management by providing intuitive, powerful tools 
              that promote transparency, efficiency, and collaborative decision-making. 
              We believe that well-organized committees are the foundation of successful 
              organizations, and our mission is to make committee management accessible 
              and effective for teams of all sizes.
            </Text>
          </Box>
        </Box>

        {/* Features Grid */}
        <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={6}>
          <Box mb={4}>
            <Box display="flex" alignItems="center" gap={3}>
              <Box p={2} bg="green.600" rounded="md">
                <Award size={20} color="white" />
              </Box>
              <Text fontSize="xl" fontWeight="semibold" color="white">
                Key Features
              </Text>
            </Box>
          </Box>
          <Box>
            <Box display="grid" gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              <Box p={4} bg="gray.800" rounded="lg">
                <Text fontSize="lg" fontWeight="semibold" color="white" mb={2}>
                  Member Management
                </Text>
                <Text color="gray.300" fontSize="sm">
                  Efficiently manage committee members, roles, and permissions with 
                  our intuitive user management system.
                </Text>
              </Box>
              <Box p={4} bg="gray.800" rounded="lg">
                <Text fontSize="lg" fontWeight="semibold" color="white" mb={2}>
                  Bid Tracking
                </Text>
                <Text color="gray.300" fontSize="sm">
                  Track and manage bids with comprehensive status monitoring, 
                  deadline management, and approval workflows.
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Version Info */}
        <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={6}>
          <Box mb={4}>
            <Box display="flex" alignItems="center" gap={3}>
              <Box p={2} bg="purple.600" rounded="md">
                <Users size={20} color="white" />
              </Box>
              <Text fontSize="xl" fontWeight="semibold" color="white">
                System Information
              </Text>
            </Box>
          </Box>
          <Box>
            <Box display="grid" gridTemplateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
              <Box>
                <Text color="gray.400" fontSize="sm" fontWeight="medium">
                  Version
                </Text>
                <Text color="white" fontSize="lg" fontWeight="semibold">
                  2.1.0
                </Text>
              </Box>
              <Box>
                <Text color="gray.400" fontSize="sm" fontWeight="medium">
                  Last Updated
                </Text>
                <Text color="white" fontSize="lg" fontWeight="semibold">
                  October 2024
                </Text>
              </Box>
              <Box>
                <Text color="gray.400" fontSize="sm" fontWeight="medium">
                  Status
                </Text>
                <Text color="green.400" fontSize="lg" fontWeight="semibold">
                  Active
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

export default About;