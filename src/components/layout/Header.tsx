import React from 'react';
import { Box, Stack, Input, Button, Text } from '@chakra-ui/react';
import { Search, Bell, Settings, LogOut, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {
  const { user, logout, sessionTimeRemaining } = useAuth();

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box as="header" bg="gray.900" borderBottomWidth="1px" borderColor="gray.800" px={4} py={3} backdropFilter="auto" backdropBlur="sm">
      <Box display="flex" alignItems="center" justifyContent="space-between">
        {/* Search */}
        <Box flex="1" maxW="xl" position="relative">
          <Box position="absolute" left={2.5} top="50%" transform="translateY(-50%)" color="gray.400">
            <Search size={16} />
          </Box>
          <Input
            placeholder="Search Comitte..."
            pl={8}
            size="sm"
            bg="gray.800"
            borderColor="gray.700"
            color="white"
            _placeholder={{ color: 'gray.500' }}
            _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
          />
        </Box>

        {/* Right side */}
        <Stack direction="row" align="center" gap={2} ml={3}>
          {/* Session Timer */}
          {user && (
            <Box 
              display="flex" 
              alignItems="center" 
              gap={1.5} 
              px={2.5} 
              py={1.5} 
              bg="gray.800" 
              rounded="md"
              borderWidth="1px"
              borderColor={sessionTimeRemaining <= 15 ? 'orange.500' : 'gray.700'}
            >
              <Clock size={14} color={sessionTimeRemaining <= 15 ? '#f97316' : '#9ca3af'} />
              <Text 
                fontSize="xs" 
                fontWeight="medium" 
                color={sessionTimeRemaining <= 15 ? 'orange.400' : 'gray.400'}
              >
                Session: {formatTime(sessionTimeRemaining)}
              </Text>
            </Box>
          )}

          {/* User Display */}
          <Box display="flex" alignItems="center" gap={2}>
            <Box w={7} h={7} rounded="full" bg="gray.700" borderWidth="2px" borderColor="red.500" display="flex" alignItems="center" justifyContent="center">
              <Text color="white" fontWeight="bold" fontSize="xs">{(user?.username || 'U').charAt(0).toUpperCase()}</Text>
            </Box>
            <Box display={{ base: 'none', sm: 'block' }}>
              <Text color="white" fontSize="xs" fontWeight="medium">{user?.username}</Text>
              <Text color="gray.400" fontSize="2xs">{user?.email}</Text>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Button variant="ghost" size="sm" color="gray.300" _hover={{ color: 'white', bg: 'gray.800' }} aria-label="Notifications">
            <Bell size={16} />
          </Button>
          <Button variant="ghost" size="sm" color="gray.300" _hover={{ color: 'white', bg: 'gray.800' }} aria-label="Settings">
            <Settings size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            color="red.400" 
            _hover={{ color: 'red.300', bg: 'red.500/10' }} 
            aria-label="Logout"
            onClick={logout}
          >
            <LogOut size={16} />
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default Header;