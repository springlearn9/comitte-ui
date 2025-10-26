import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  LogOut, 
  Briefcase,
  BarChart3,
  Grid3X3,
  User
} from 'lucide-react';
import { Box, Text } from '@chakra-ui/react';
import { useAuth } from '../../hooks/useAuth';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems: NavItem[] = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: 'Comitte',
      path: '/committees',
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: 'Bids',
      path: '/bids',
    },
    {
      icon: <User className="w-5 h-5" />,
      label: 'Profile Settings',
      path: '/profile',
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: 'About',
      path: '/about',
    },
    {
      icon: <Briefcase className="w-5 h-5" />,
      label: 'Feedback',
      path: '/feedback',
    },
    {
      icon: <Grid3X3 className="w-5 h-5" />,
      label: 'App Gallery',
      path: '/app-gallery',
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box 
      w={{ base: 16, md: 64 }} 
      bg="gray.900" 
      borderRightWidth="1px" 
      borderColor="gray.800" 
      display="flex" 
      flexDirection="column" 
      minH="100vh"
    >
      {/* Logo */}
      <Box p={{ base: 3, md: 6 }} borderBottomWidth="1px" borderColor="gray.800">
        <Link to="/dashboard">
          <Box display="flex" alignItems="center" justifyContent={{ base: 'center', md: 'flex-start' }} gap={3} _hover={{ opacity: 0.8 }}>
            <Box w={8} h={8} bg="red.600" rounded="md" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
              <Text color="white" fontWeight="bold" fontSize="sm">C</Text>
            </Box>
            <Text display={{ base: 'none', md: 'block' }} fontSize="xl" fontWeight="bold" color="white">Comitte</Text>
          </Box>
        </Link>
      </Box>

      {/* Navigation */}
      <Box as="nav" flex="1" py={{ base: 3, md: 6 }}>
        <Box display="flex" flexDirection="column" gap={2} px={{ base: 2, md: 4 }}>
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} title={item.label}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent={{ base: 'center', md: 'flex-start' }}
                gap={3}
                px={{ base: 2, md: 4 }}
                py={3}
                rounded="full"
                transition="all 0.2s"
                bg={isActive(item.path) ? 'gray.700' : 'transparent'}
                color={isActive(item.path) ? 'white' : 'gray.300'}
                _hover={{ color: 'white', bg: isActive(item.path) ? 'gray.700' : 'gray.800' }}
              >
                <Box display="flex" alignItems="center" justifyContent="center" w={5} h={5} flexShrink={0}>
                  {item.icon}
                </Box>
                <Text display={{ base: 'none', md: 'block' }} fontWeight="medium">{item.label}</Text>
              </Box>
            </Link>
          ))}
        </Box>
      </Box>

      {/* Bottom section */}
      <Box p={{ base: 2, md: 4 }} borderTopWidth="1px" borderColor="gray.800">
        <Box
          onClick={logout}
          display="flex"
          alignItems="center"
          justifyContent={{ base: 'center', md: 'flex-start' }}
          gap={3}
          px={{ base: 2, md: 4 }}
          py={3}
          rounded="full"
          color="red.400"
          _hover={{ color: 'red.300', bg: 'red.500/10' }}
          cursor="pointer"
          title="Logout"
        >
          <Box display="flex" alignItems="center" justifyContent="center" w={5} h={5} flexShrink={0}>
            <LogOut className="w-5 h-5" />
          </Box>
          <Text display={{ base: 'none', md: 'block' }} fontWeight="medium">Logout</Text>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;