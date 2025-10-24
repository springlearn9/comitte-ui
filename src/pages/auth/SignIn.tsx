import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, Heading, Text, Input, Button, chakra } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const SignIn: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login(username, password);
      alert('Login successful! Welcome to Comitte Management System.');
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const RLink = chakra(RouterLink);

  return (
    <Box minH="100vh" bgGradient="linear(to-br, gray.900, gray.800, black)" px={{ base: 4, sm: 6, lg: 8 }} py={{ base: 4, sm: 6, lg: 8 }} display="flex" alignItems="center" justifyContent="center">
      <Box w="full" maxW={{ base: 'sm', sm: 'md', lg: 'lg' }} bg="gray.800" borderWidth="1px" borderColor="gray.700" rounded="lg" shadow="xl" backdropFilter="auto" backdropBlur="md">
        <Box px={{ base: 4, sm: 6 }} pt={{ base: 6, sm: 8 }} pb={{ base: 4, sm: 6 }}>
          <Stack direction="row" gap={{ base: 3, sm: 4 }} align="center">
            <Box w={{ base: 8, sm: 10 }} h={{ base: 8, sm: 10 }} bg="red.600" rounded="full" display="flex" alignItems="center" justifyContent="center">
              <Text color="white" fontWeight="bold" fontSize={{ base: 'md', sm: 'lg' }}>C</Text>
            </Box>
            <Box>
              <Heading size={{ base: 'md', sm: 'lg' }} color="white">Comitte</Heading>
              <Text color="gray.400" fontSize={{ base: 'xs', sm: 'sm' }}>Management System</Text>
            </Box>
          </Stack>
        </Box>

        <Box borderTopWidth="1px" borderColor="gray.700" />

        <Box px={{ base: 4, sm: 6 }} pt={{ base: 4, sm: 6 }} pb={{ base: 6, sm: 8 }}>
          <Box as="form" onSubmit={handleSubmit}>
            <Stack gap={{ base: 4, sm: 5 }}>
              <Box>
                <Text color="gray.300" fontWeight="medium" mb={2}>Username</Text>
                <Input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  bg="gray.800"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.500' }}
                  _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
                  h={{ base: 11, sm: 12 }}
                />
              </Box>

              <Box>
                <Text color="gray.300" fontWeight="medium" mb={2}>Password</Text>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  bg="gray.800"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.500' }}
                  _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
                  h={{ base: 11, sm: 12 }}
                />
              </Box>

              {error && (
                <Box color="red.300" bg="red.500/10" borderWidth="1px" borderColor="red.500/20" rounded="md" p={3} textAlign="center">
                  {error}
                </Box>
              )}

              <Button
                type="submit"
                colorPalette="gray"
                variant="outline"
                rounded="full"
                bg="gray.600"
                color="white"
                borderColor="gray.500"
                _hover={{ bg: 'white', color: 'black', borderColor: 'gray.400' }}
                transition="all 0.2s"
                w="full"
                h={{ base: 11, sm: 12 }}
                disabled={!username || !password || isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Stack>
          </Box>

          <Stack gap={4} pt={4} borderTopWidth="1px" borderColor="gray.700" mt={6}>
            <Box textAlign="center">
              <RLink to="/auth/forgot-password" color="red.400" _hover={{ color: 'red.300' }} fontSize="sm" fontWeight="medium">
                Forgot Password?
              </RLink>
            </Box>
            <Box textAlign="center">
              <Text color="gray.400" fontSize={{ base: 'xs', sm: 'sm' }}>
                Don't have an account?{' '}
                <RLink to="/auth/signup" color="red.400" _hover={{ color: 'red.300' }} fontWeight="medium">
                  Sign Up
                </RLink>
              </Text>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default SignIn;