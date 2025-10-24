import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, Heading, Text, Input, Button, chakra } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    mobile: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      alert('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      alert('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      // Import authService at the top of the file
      const { authService } = await import('../../services/authService');
      
      await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        mobile: formData.mobile || undefined
      });
      
      alert('Registration successful! Please sign in with your credentials.');
      navigate('/auth/signin');
    } catch (err: any) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
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
              <Heading size={{ base: 'md', sm: 'lg' }} color="white">Create Account</Heading>
              <Text color="gray.400" fontSize={{ base: 'xs', sm: 'sm' }}>Join Comitte Management</Text>
            </Box>
          </Stack>
        </Box>

        <Box borderTopWidth="1px" borderColor="gray.700" />

        <Box px={{ base: 4, sm: 6 }} pt={{ base: 4, sm: 6 }} pb={{ base: 6, sm: 8 }}>
          <Box as="form" onSubmit={handleSubmit}>
            <Stack gap={4}>
              <Box>
                <Text color="gray.300" fontWeight="medium" mb={2}>Full Name</Text>
                <Input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  bg="gray.800"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.500' }}
                  _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
                  h={11}
                />
              </Box>

              <Box>
                <Text color="gray.300" fontWeight="medium" mb={2}>Username</Text>
                <Input
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleInputChange}
                  bg="gray.800"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.500' }}
                  _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
                  h={11}
                />
              </Box>

              <Box>
                <Text color="gray.300" fontWeight="medium" mb={2}>Email</Text>
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  bg="gray.800"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.500' }}
                  _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
                  h={11}
                />
              </Box>

              <Box>
                <Text color="gray.300" fontWeight="medium" mb={2}>Mobile (Optional)</Text>
                <Input
                  type="tel"
                  name="mobile"
                  placeholder="Enter your mobile number"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  bg="gray.800"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.500' }}
                  _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
                  h={11}
                />
              </Box>
              
              <Box>
                <Text color="gray.300" fontWeight="medium" mb={2}>Password</Text>
                <Input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleInputChange}
                  bg="gray.800"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.500' }}
                  _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
                  h={11}
                />
              </Box>

              <Box>
                <Text color="gray.300" fontWeight="medium" mb={2}>Confirm Password</Text>
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  bg="gray.800"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.500' }}
                  _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
                  h={11}
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
                h={11}
                disabled={!formData.username || !formData.email || !formData.password || !formData.confirmPassword || isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Stack>
          </Box>

          <Box textAlign="center" pt={4} borderTopWidth="1px" borderColor="gray.700" mt={6}>
            <Text color="gray.400" fontSize="sm">
              Already have an account?{' '}
              <chakra.span>
                <RLink to="/auth/signin" color="red.400" _hover={{ color: 'red.300' }} fontWeight="medium">
                  Sign In
                </RLink>
              </chakra.span>
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SignUp;