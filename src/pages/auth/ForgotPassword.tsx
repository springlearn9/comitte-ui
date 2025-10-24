import React, { useState } from 'react';
import { Box, Stack, Heading, Text, Input, Button, chakra } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Import authService dynamically
      const { authService } = await import('../../services/authService');
      
      await authService.requestPasswordReset(email);
      setIsEmailSent(true);
      alert('Password reset instructions have been sent to your email.');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send reset email. Please try again.';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const RLink = chakra(RouterLink);

  if (isEmailSent) {
    return (
      <Box minH="100vh" bgGradient="linear(to-br, gray.900, gray.800, black)" px={{ base: 4, sm: 6, lg: 8 }} py={{ base: 4, sm: 6, lg: 8 }} display="flex" alignItems="center" justifyContent="center">
        <Box w="full" maxW={{ base: 'sm', sm: 'md', lg: 'lg' }} bg="gray.800" borderWidth="1px" borderColor="gray.700" rounded="lg" shadow="xl" backdropFilter="auto" backdropBlur="md">
          <Box px={{ base: 4, sm: 6 }} pt={{ base: 6, sm: 8 }} pb={{ base: 4, sm: 6 }}>
            <Stack direction="row" gap={{ base: 3, sm: 4 }} align="center">
              <Box w={{ base: 8, sm: 10 }} h={{ base: 8, sm: 10 }} bg="green.600" rounded="full" display="flex" alignItems="center" justifyContent="center">
                <Text color="white" fontWeight="bold" fontSize={{ base: 'md', sm: 'lg' }}>✓</Text>
              </Box>
              <Box>
                <Heading size={{ base: 'md', sm: 'lg' }} color="white">Email Sent</Heading>
                <Text color="gray.400" fontSize={{ base: 'xs', sm: 'sm' }}>Check your inbox</Text>
              </Box>
            </Stack>
          </Box>

          <Box borderTopWidth="1px" borderColor="gray.700" />

          <Box px={{ base: 4, sm: 6 }} pt={{ base: 4, sm: 6 }} pb={{ base: 6, sm: 8 }}>
            <Stack gap={4} textAlign="center">
              <Text color="gray.300">
                We've sent a password reset link to{' '}
                <Text as="span" color="white" fontWeight="medium">{email}</Text>
              </Text>
              <Text color="gray.400" fontSize={{ base: 'xs', sm: 'sm' }}>
                Please check your email and follow the instructions to reset your password.
              </Text>
              <Box pt={4}>
                <RLink to="/auth/signin">
                  <Button 
                    colorPalette="gray"
                    variant="outline"
                    rounded="full"
                    bg="gray.600"
                    color="white"
                    borderColor="gray.500"
                    _hover={{ bg: 'white', color: 'black', borderColor: 'gray.400' }}
                    transition="all 0.2s"
                    w="full"
                  >
                    Back to Sign In
                  </Button>
                </RLink>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bgGradient="linear(to-br, gray.900, gray.800, black)" px={{ base: 4, sm: 6, lg: 8 }} py={{ base: 4, sm: 6, lg: 8 }} display="flex" alignItems="center" justifyContent="center">
      <Box w="full" maxW={{ base: 'sm', sm: 'md', lg: 'lg' }} bg="gray.800" borderWidth="1px" borderColor="gray.700" rounded="lg" shadow="xl" backdropFilter="auto" backdropBlur="md">
        <Box px={{ base: 4, sm: 6 }} pt={{ base: 6, sm: 8 }} pb={{ base: 4, sm: 6 }}>
          <Stack direction="row" gap={{ base: 3, sm: 4 }} align="center">
            <Box w={{ base: 8, sm: 10 }} h={{ base: 8, sm: 10 }} bg="red.600" rounded="full" display="flex" alignItems="center" justifyContent="center">
              <Text color="white" fontWeight="bold" fontSize={{ base: 'md', sm: 'lg' }}>C</Text>
            </Box>
            <Box>
              <Heading size={{ base: 'md', sm: 'lg' }} color="white">Reset Password</Heading>
              <Text color="gray.400" fontSize={{ base: 'xs', sm: 'sm' }}>Enter your email address</Text>
            </Box>
          </Stack>
        </Box>

        <Box borderTopWidth="1px" borderColor="gray.700" />

        <Box px={{ base: 4, sm: 6 }} pt={{ base: 4, sm: 6 }} pb={{ base: 6, sm: 8 }}>
          <Box as="form" onSubmit={handleSubmit}>
            <Stack gap={4}>
              <Box>
                <Text color="gray.300" fontWeight="medium" mb={2}>Email Address</Text>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  bg="gray.800"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.500' }}
                  _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
                  h={11}
                />
                <Text color="gray.400" fontSize="xs" mt={2}>
                  We'll send you a link to reset your password
                </Text>
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
                disabled={!email || isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </Stack>
          </Box>

          <Box textAlign="center" pt={4} borderTopWidth="1px" borderColor="gray.700" mt={6}>
            <Text color="gray.400" fontSize="sm">
              Remember your password?{' '}
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

export default ForgotPassword;