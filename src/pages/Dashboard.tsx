import React from 'react';
import { Box, Stack, Heading, Text, SimpleGrid } from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <Stack gap={{ base: 4, sm: 6 }}>
      <Box>
        <Heading size={{ base: 'lg', sm: 'xl' }} color="white" mb={2}>
          Welcome back, {user?.username || 'User'}!
        </Heading>
        <Text color="gray.400" fontSize={{ base: 'sm', sm: 'md' }}>
          Committee Management Dashboard
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={{ base: 4, sm: 6 }}>
        <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={{ base: 4, sm: 5 }}>
          <Text color="white" fontWeight="semibold" fontSize={{ base: 'md', sm: 'lg' }} mb={2}>Total Committees</Text>
          <Text color="red.500" fontWeight="bold" fontSize={{ base: '2xl', sm: '3xl' }}>12</Text>
          <Text color="gray.400" fontSize={{ base: 'xs', sm: 'sm' }}>Active committees</Text>
        </Box>

        <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={{ base: 4, sm: 5 }}>
          <Text color="white" fontWeight="semibold" fontSize={{ base: 'md', sm: 'lg' }} mb={2}>Total Members</Text>
          <Text color="blue.400" fontWeight="bold" fontSize={{ base: '2xl', sm: '3xl' }}>248</Text>
          <Text color="gray.400" fontSize={{ base: 'xs', sm: 'sm' }}>Registered members</Text>
        </Box>

        <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={{ base: 4, sm: 5 }} gridColumn={{ base: 'auto', sm: 'span 2', lg: 'auto' }}>
          <Text color="white" fontWeight="semibold" fontSize={{ base: 'md', sm: 'lg' }} mb={2}>Pending Bids</Text>
          <Text color="yellow.400" fontWeight="bold" fontSize={{ base: '2xl', sm: '3xl' }}>7</Text>
          <Text color="gray.400" fontSize={{ base: 'xs', sm: 'sm' }}>Awaiting approval</Text>
        </Box>
      </SimpleGrid>

      <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg">
        <Box px={{ base: 4, sm: 5 }} py={{ base: 3, sm: 4 }} borderBottomWidth="1px" borderColor="gray.800">
          <Text color="white" fontWeight="semibold" fontSize={{ base: 'lg', sm: 'xl' }}>Recent Activity</Text>
        </Box>
        <Box px={{ base: 4, sm: 5 }} py={{ base: 3, sm: 4 }}>
          <Stack gap={3}>
            <Box display="flex" alignItems="center" justifyContent="space-between" p={3} bg="gray.800" rounded="md">
              <Box>
                <Text color="white" fontSize={{ base: 'sm', sm: 'md' }}>New member joined: John Doe</Text>
                <Text color="gray.400" fontSize={{ base: 'xs', sm: 'sm' }}>2 hours ago</Text>
              </Box>
            </Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" p={3} bg="gray.800" rounded="md">
              <Box>
                <Text color="white" fontSize={{ base: 'sm', sm: 'md' }}>Bid submitted for Project Alpha</Text>
                <Text color="gray.400" fontSize={{ base: 'xs', sm: 'sm' }}>5 hours ago</Text>
              </Box>
            </Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" p={3} bg="gray.800" rounded="md">
              <Box>
                <Text color="white" fontSize={{ base: 'sm', sm: 'md' }}>Committee meeting scheduled</Text>
                <Text color="gray.400" fontSize={{ base: 'xs', sm: 'sm' }}>1 day ago</Text>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Stack>
  );
};

export default Dashboard;