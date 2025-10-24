import React, { useMemo, useState } from 'react';
import {
  Box,
  Stack,
  Text,
  Input,
  Button,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
  TooltipArrow,
  TooltipPositioner,
  DialogRoot,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
} from '@chakra-ui/react';
import { Info } from 'lucide-react';
import type { Committee } from '../../types/committee';

interface CreateEditCommitteeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (committee: Committee) => void;
  committee?: Committee | null;
  mode: 'create' | 'edit';
}

const CreateEditCommitteeModal: React.FC<CreateEditCommitteeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  committee,
  mode,
}) => {
  console.log('Modal props:', { isOpen, mode, committee });

  const initialForm = useMemo<Committee>(() => ({
    name: committee?.name || '',
    description: committee?.description || '',
    totalAmount: committee?.totalAmount || '',
    monthlyAmount: committee?.monthlyAmount || '',
    duration: committee?.duration || '',
    startDate: committee?.startDate || '',
    location: committee?.location || '',
    maxMembers: committee?.maxMembers || 10,
    category: committee?.category || '',
    rules: committee?.rules || '',
    paymentDateDays: committee?.paymentDateDays || '',
  }), [committee]);

  const [formData, setFormData] = useState<Committee>(initialForm);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync form values when modal opens or when committee changes
  React.useEffect(() => {
    if (isOpen) {
      setFormData(initialForm);
      setErrors({});
    }
  }, [isOpen, initialForm]);

  // Auto-calculate monthlyAmount when totalAmount or maxMembers changes
  React.useEffect(() => {
    const total = Number(formData.totalAmount);
    const members = Number(formData.maxMembers);
    if (Number.isFinite(total) && total > 0 && Number.isFinite(members) && members > 0) {
      const monthly = total / members;
      const display = Number.isInteger(monthly) ? String(monthly) : String(Math.round(monthly));
      if (formData.monthlyAmount !== display) {
        setFormData(prev => ({ ...prev, monthlyAmount: display }));
      }
    } else {
      if (formData.monthlyAmount !== '') {
        setFormData(prev => ({ ...prev, monthlyAmount: '' }));
      }
    }
    // Only react to these two dependencies to avoid loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.totalAmount, formData.maxMembers]);

  // const categories = [...] // reserved for future use

  // const durations = [...] // reserved for future use

  const handleInputChange = (field: keyof Committee, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Committee name is required';
  if (!formData.totalAmount.trim()) newErrors.totalAmount = 'Total amount is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.maxMembers || Number(formData.maxMembers) < 2) newErrors.maxMembers = 'Minimum 2 members required';
    if (!formData.duration) newErrors.duration = 'Due days is required';

    // Validate amounts are positive numbers
    if (formData.totalAmount && isNaN(Number(formData.totalAmount))) {
      newErrors.totalAmount = 'Please enter a valid amount';
    }
    // monthlyAmount is auto-calculated
    if (formData.duration && isNaN(Number(formData.duration))) {
      newErrors.duration = 'Please enter valid number of days';
    }
    if (formData.paymentDateDays && isNaN(Number(formData.paymentDateDays))) {
      newErrors.paymentDateDays = 'Please enter valid number of days';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      await onSave({
        ...formData,
        id: committee?.id || Date.now().toString()
      });
      handleClose();
    } catch (error) {
      console.error('Failed to save committee:', error);
    }
  };

  const handleClose = () => {
    setFormData(initialForm);
    setErrors({});
    onClose();
  };

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(details) => {
        if (!details.open) handleClose();
      }}
    >
  <DialogBackdrop bg="blackAlpha.700" backdropFilter="auto" backdropBlur="2px" />
  <DialogPositioner inset="0" display="flex" alignItems="center" justifyContent="center" p={{ base: 4, sm: 6 }}>
  <DialogContent bg="gray.900" color="white" maxW="2xl" maxH="90dvh" overflowY="auto" borderColor="gray.700" borderWidth="1px" rounded="md" shadow="xl">
        <DialogHeader>
          <DialogTitle>
            <Text fontSize="xl" fontWeight="bold">
              {mode === 'create' ? 'Create New Committee' : 'Edit Committee'}
            </Text>
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Stack gap={4}>
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Committee Name</Text>
              <Input
                placeholder="Enter committee name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                bg="gray.800"
                borderColor="gray.700"
                _placeholder={{ color: 'gray.500' }}
                _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
              />
              {errors.name && (
                <Text color="red.300" fontSize="xs" mt={1}>{errors.name}</Text>
              )}
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Start Date</Text>
              <Input
                type="date"
                placeholder="YYYY-MM-DD"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                bg="gray.800"
                borderColor="gray.700"
                _placeholder={{ color: 'gray.500' }}
                _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
              />
              {errors.startDate && (
                <Text color="red.300" fontSize="xs" mt={1}>{errors.startDate}</Text>
              )}
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Total Amount</Text>
              <Box position="relative">
                <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="gray.400">₹</Box>
                <Input
                  pl={8}
                  placeholder="100000"
                  value={formData.totalAmount}
                  onChange={(e) => handleInputChange('totalAmount', e.target.value)}
                  bg="gray.800"
                  borderColor="gray.700"
                  _placeholder={{ color: 'gray.500' }}
                  _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
                />
              </Box>
              {errors.totalAmount && (
                <Text color="red.300" fontSize="xs" mt={1}>{errors.totalAmount}</Text>
              )}
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Members Count</Text>
              <Input
                type="number"
                placeholder="10"
                value={formData.maxMembers}
                onChange={(e) => handleInputChange('maxMembers', Number(e.target.value))}
                bg="gray.800"
                borderColor="gray.700"
                _placeholder={{ color: 'gray.500' }}
                _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
              />
              {errors.maxMembers && (
                <Text color="red.300" fontSize="xs" mt={1}>{errors.maxMembers}</Text>
              )}
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Monthly Amount</Text>
              <Box position="relative">
                <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="gray.400">₹</Box>
                <Input
                  pl={8}
                  placeholder="7000"
                  value={formData.monthlyAmount}
                  disabled
                  readOnly
                  bg="gray.800"
                  borderColor="gray.700"
                  _placeholder={{ color: 'gray.500' }}
                />
              </Box>
            </Box>

            <Box>
              <Stack direction="row" align="center" mb={2}>
                <Text fontSize="sm" fontWeight="medium">Due In (days)</Text>
                <TooltipRoot openDelay={200} closeDelay={100} interactive>
                  <TooltipTrigger>
                    <Box as="span" color="gray.400" _hover={{ color: 'gray.300' }} cursor="help" aria-label="Due days info">
                      <Info size={14} />
                    </Box>
                  </TooltipTrigger>
                  <TooltipPositioner>
                    <TooltipContent bg="gray.800" color="gray.100" borderColor="gray.700" borderWidth="1px" px={2} py={1} rounded="sm">
                      <TooltipArrow />
                      <Text fontSize="xs">Number of days from the start of each cycle when the due occurs. Example: 30 = a monthly due.</Text>
                    </TooltipContent>
                  </TooltipPositioner>
                </TooltipRoot>
              </Stack>
              <Input
                type="number"
                placeholder="30"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                bg="gray.800"
                borderColor="gray.700"
                _placeholder={{ color: 'gray.500' }}
                _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
              />
              {errors.duration && (
                <Text color="red.300" fontSize="xs" mt={1}>{errors.duration}</Text>
              )}
            </Box>

            <Box>
              <Stack direction="row" align="center" mb={2}>
                <Text fontSize="sm" fontWeight="medium">Payment Date In (days)</Text>
                <TooltipRoot openDelay={200} closeDelay={100} interactive>
                  <TooltipTrigger>
                    <Box as="span" color="gray.400" _hover={{ color: 'gray.300' }} cursor="help" aria-label="Payment date info">
                      <Info size={14} />
                    </Box>
                  </TooltipTrigger>
                  <TooltipPositioner>
                    <TooltipContent bg="gray.800" color="gray.100" borderColor="gray.700" borderWidth="1px" px={2} py={1} rounded="sm">
                      <TooltipArrow />
                      <Text fontSize="xs">Days offset for the expected payment within the cycle (e.g., 5 means payment is expected 5 days after due).</Text>
                    </TooltipContent>
                  </TooltipPositioner>
                </TooltipRoot>
              </Stack>
              <Input
                type="number"
                placeholder="5"
                value={formData.paymentDateDays || ''}
                onChange={(e) => handleInputChange('paymentDateDays', e.target.value)}
                bg="gray.800"
                borderColor="gray.700"
                _placeholder={{ color: 'gray.500' }}
                _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
              />
              {errors.paymentDateDays && (
                <Text color="red.300" fontSize="xs" mt={1}>{errors.paymentDateDays}</Text>
              )}
            </Box>
          </Stack>
        </DialogBody>
        <DialogFooter>
          <Stack direction="row" gap={3} w="full" justify="flex-end">
            <Button
              variant="outline"
              colorPalette="gray"
              rounded="full"
              bg="gray.700"
              color="gray.300"
              borderColor="gray.600"
              _hover={{ bg: 'gray.600', color: 'white', borderColor: 'gray.500' }}
              transition="all 0.2s"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button 
              colorPalette="gray"
              variant="outline"
              rounded="full"
              bg="gray.600"
              color="white"
              borderColor="gray.500"
              _hover={{ bg: 'white', color: 'black', borderColor: 'gray.400' }}
              transition="all 0.2s"
              onClick={handleSave}
            >
              {mode === 'create' ? 'Create Committee' : 'Update Committee'}
            </Button>
          </Stack>
        </DialogFooter>
      </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
};

export default CreateEditCommitteeModal;