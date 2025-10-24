import React, { useState } from 'react';
import {
  Box,
  Text,
  Button,
  Input,
  Stack,
  DialogRoot,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle
} from '@chakra-ui/react';
import type { BidRequest } from '../../types/bid';
import { bidService } from '../../services/bidService';

interface CreateBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  committeeId?: number;
  committeeName?: string;
}

const CreateBidModal: React.FC<CreateBidModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  committeeId,
  committeeName
}) => {
  const [formData, setFormData] = useState<Partial<BidRequest>>({
    comitteId: committeeId,
    comitteNumber: undefined,
    finalBidder: undefined,
    finalBidAmt: undefined,
    bidDate: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm format for datetime-local input
    receiversList: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof BidRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.comitteId) {
      setError('Committee ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bidRequest: BidRequest = {
        comitteId: formData.comitteId,
        comitteNumber: formData.comitteNumber,
        finalBidder: formData.finalBidder,
        finalBidAmt: formData.finalBidAmt,
        bidDate: formData.bidDate,
        receiversList: formData.receiversList || []
      };

      await bidService.createBid(bidRequest);
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        comitteId: committeeId,
        comitteNumber: undefined,
        finalBidder: undefined,
        finalBidAmt: undefined,
        bidDate: new Date().toISOString().slice(0, 16),
        receiversList: []
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create bid');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(d) => !d.open && handleClose()}>
      <DialogBackdrop bg="blackAlpha.700" backdropFilter="auto" backdropBlur="2px" />
      <DialogPositioner inset="0" display="flex" alignItems="center" justifyContent="center" p={{ base: 4, sm: 6 }}>
        <DialogContent bg="gray.900" color="white" maxW="lg" maxH="80dvh" overflowY="auto" borderColor="gray.700" borderWidth="1px" rounded="md">
          <DialogHeader>
            <DialogTitle>
              <Text fontWeight="bold">Create New Bid</Text>
              {committeeName && (
                <Text fontSize="sm" color="gray.400" mt={1}>
                  Committee: {committeeName}
                </Text>
              )}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <DialogBody>
              {error && (
                <Box bg="red.500/20" border="1px solid" borderColor="red.500" rounded="md" p={3} mb={4}>
                  <Text color="red.300" fontSize="sm">{error}</Text>
                </Box>
              )}

              <Stack gap={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.300">
                    Committee Number
                  </Text>
                  <Input
                    type="number"
                    placeholder="Enter committee number"
                    value={formData.comitteNumber || ''}
                    onChange={(e) => handleInputChange('comitteNumber', e.target.value ? Number(e.target.value) : undefined)}
                    bg="gray.800"
                    border="1px solid"
                    borderColor="gray.600"
                    _focus={{ borderColor: 'blue.400' }}
                  />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.300">
                    Final Bidder ID
                  </Text>
                  <Input
                    type="number"
                    placeholder="Enter final bidder ID"
                    value={formData.finalBidder || ''}
                    onChange={(e) => handleInputChange('finalBidder', e.target.value ? Number(e.target.value) : undefined)}
                    bg="gray.800"
                    border="1px solid"
                    borderColor="gray.600"
                    _focus={{ borderColor: 'blue.400' }}
                  />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.300">
                    Final Bid Amount (₹)
                  </Text>
                  <Input
                    type="number"
                    placeholder="Enter bid amount"
                    value={formData.finalBidAmt || ''}
                    onChange={(e) => handleInputChange('finalBidAmt', e.target.value ? Number(e.target.value) : undefined)}
                    bg="gray.800"
                    border="1px solid"
                    borderColor="gray.600"
                    _focus={{ borderColor: 'blue.400' }}
                  />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.300">
                    Bid Date & Time
                  </Text>
                  <Input
                    type="datetime-local"
                    value={formData.bidDate || ''}
                    onChange={(e) => handleInputChange('bidDate', e.target.value)}
                    bg="gray.800"
                    border="1px solid"
                    borderColor="gray.600"
                    _focus={{ borderColor: 'blue.400' }}
                  />
                </Box>
              </Stack>
            </DialogBody>

            <DialogFooter gap={3}>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                colorPalette="gray"
                rounded="full"
                bg="gray.700"
                color="gray.300"
                borderColor="gray.600"
                _hover={{ bg: 'gray.600', color: 'white', borderColor: 'gray.500' }}
                transition="all 0.2s"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                colorPalette="gray"
                variant="outline"
                rounded="full"
                bg="gray.600"
                color="white"
                borderColor="gray.500"
                _hover={{ bg: 'white', color: 'black', borderColor: 'gray.400' }}
                transition="all 0.2s"
                disabled={!formData.comitteId}
              >
                {loading ? 'Creating...' : 'Create Bid'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
};

export default CreateBidModal;