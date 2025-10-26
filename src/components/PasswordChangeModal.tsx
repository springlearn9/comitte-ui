import React, { useState } from 'react';
import { 
  Box, 
  Text, 
  Button, 
  Input, 
  Stack
} from '@chakra-ui/react';
import { Eye, EyeOff, X } from 'lucide-react';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (passwords: { current: string; new: string; confirm: string }) => Promise<void>;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ isOpen, onClose, onSave }) => {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setError('All fields are required');
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setError('New passwords do not match');
      return;
    }

    if (passwords.new.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSave(passwords);
      setPasswords({ current: '', new: '', confirm: '' });
      onClose();
    } catch (error) {
      setError('Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="blackAlpha.700"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="1000"
    >
      <Box
        bg="gray.900"
        borderColor="gray.800"
        borderWidth="1px"
        rounded="lg"
        p={6}
        w="full"
        maxW="md"
        mx={4}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
          <Text fontSize="xl" fontWeight="semibold" color="white">
            Change Password
          </Text>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            color="gray.400"
            _hover={{ color: 'white', bg: 'gray.800' }}
          >
            <X size={20} />
          </Button>
        </Box>

        {error && (
          <Box bg="red.900" borderColor="red.600" borderWidth="1px" rounded="lg" p={3} mb={4}>
            <Text color="red.200" fontSize="sm">{error}</Text>
          </Box>
        )}

        <Stack gap={4}>
          <Box>
            <Text color="white" fontSize="sm" fontWeight="medium" mb={2}>
              Current Password
            </Text>
            <Box position="relative">
              <Input
                type={showPasswords.current ? "text" : "password"}
                placeholder="Enter current password"
                value={passwords.current}
                onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                bg="gray.800"
                borderColor="gray.700"
                color="white"
                _placeholder={{ color: 'gray.500' }}
                _focus={{ borderColor: 'blue.400' }}
                pr={10}
              />
              <Button
                position="absolute"
                right={0}
                top={0}
                h="full"
                variant="ghost"
                size="sm"
                onClick={() => togglePasswordVisibility('current')}
                color="gray.400"
                _hover={{ color: 'white' }}
              >
                {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </Box>
          </Box>

          <Box>
            <Text color="white" fontSize="sm" fontWeight="medium" mb={2}>
              New Password
            </Text>
            <Box position="relative">
              <Input
                type={showPasswords.new ? "text" : "password"}
                placeholder="Enter new password"
                value={passwords.new}
                onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                bg="gray.800"
                borderColor="gray.700"
                color="white"
                _placeholder={{ color: 'gray.500' }}
                _focus={{ borderColor: 'blue.400' }}
                pr={10}
              />
              <Button
                position="absolute"
                right={0}
                top={0}
                h="full"
                variant="ghost"
                size="sm"
                onClick={() => togglePasswordVisibility('new')}
                color="gray.400"
                _hover={{ color: 'white' }}
              >
                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </Box>
          </Box>

          <Box>
            <Text color="white" fontSize="sm" fontWeight="medium" mb={2}>
              Confirm New Password
            </Text>
            <Box position="relative">
              <Input
                type={showPasswords.confirm ? "text" : "password"}
                placeholder="Confirm new password"
                value={passwords.confirm}
                onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                bg="gray.800"
                borderColor="gray.700"
                color="white"
                _placeholder={{ color: 'gray.500' }}
                _focus={{ borderColor: 'blue.400' }}
                pr={10}
              />
              <Button
                position="absolute"
                right={0}
                top={0}
                h="full"
                variant="ghost"
                size="sm"
                onClick={() => togglePasswordVisibility('confirm')}
                color="gray.400"
                _hover={{ color: 'white' }}
              >
                {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </Box>
          </Box>
        </Stack>

        <Box display="flex" justifyContent="flex-end" gap={3} mt={6}>
          <Button
            variant="ghost"
            onClick={onClose}
            color="gray.400"
            _hover={{ color: 'white', bg: 'gray.800' }}
          >
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            bg="blue.600"
            color="white"
            _hover={{ bg: 'blue.500' }}
            loading={isLoading}
            loadingText="Saving..."
            onClick={handleSubmit}
          >
            Change Password
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default PasswordChangeModal;