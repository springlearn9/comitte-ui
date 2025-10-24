import React, { useState, useEffect } from 'react';
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
import type { BidRequest, Bid } from '../../types/bid';
import { bidService } from '../../services/bidService';
import { memberService } from '../../services/memberService';
import type { CommitteMemberMapResponse } from '../../services/authService';

interface EditBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bid: Bid | null;
}

const EditBidModal: React.FC<EditBidModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  bid
}) => {
  const [formData, setFormData] = useState<Partial<BidRequest>>({
    comitteId: undefined,
    finalBidder: undefined,
    finalBidAmt: undefined,
    bidDate: new Date().toISOString(),
    receiversList: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [committeeMembers, setCommitteeMembers] = useState<CommitteMemberMapResponse[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Update formData when bid changes
  useEffect(() => {
    if (bid) {
      setFormData({
        comitteId: bid.committeeId,
        finalBidder: bid.finalBidderId,
        finalBidAmt: bid.amount,
        bidDate: bid.bidDate || new Date().toISOString(),
        receiversList: bid.receiversList as number[] || []
      });
    }
  }, [bid]);

  // Fetch committee members when modal opens
  useEffect(() => {
    const fetchMembers = async () => {
      if (!isOpen || !bid?.committeeId) return;
      
      setLoadingMembers(true);
      try {
        const members = await memberService.getByCommittee(bid.committeeId);
        setCommitteeMembers(members);
      } catch (err) {
        console.error('Failed to fetch committee members:', err);
        setCommitteeMembers([]);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [isOpen, bid?.committeeId]);

  const handleInputChange = (field: keyof BidRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bid?.id) return;

    setLoading(true);
    setError(null);

    try {
      const bidRequest: BidRequest = {
        comitteId: formData.comitteId!,
        finalBidder: formData.finalBidder,
        finalBidAmt: formData.finalBidAmt,
        bidDate: formData.bidDate,
        receiversList: formData.receiversList || []
      };

      await bidService.updateBid(bid.id, bidRequest);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to update bid');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!bid) return null;

  return (
    <DialogRoot open={isOpen} onOpenChange={(d) => !d.open && handleClose()}>
      <DialogBackdrop bg="blackAlpha.700" backdropFilter="auto" backdropBlur="2px" />
      <DialogPositioner inset="0" display="flex" alignItems="center" justifyContent="center" p={{ base: 4, sm: 6 }}>
        <DialogContent bg="gray.900" color="white" maxW="lg" maxH="80dvh" overflowY="auto" borderColor="gray.700" borderWidth="1px" rounded="md">
          <DialogHeader>
            <DialogTitle>
              <Text fontWeight="bold">Edit Bid</Text>
              {bid.committeeName && (
                <Text fontSize="sm" color="gray.400" mt={1}>
                  Committee: {bid.committeeName}
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
                    Final Bidder ID
                  </Text>
                  <Box position="relative">
                    <select
                      value={formData.finalBidder || ''}
                      onChange={(e) => handleInputChange('finalBidder', e.target.value ? Number(e.target.value) : undefined)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        backgroundColor: '#1a202c',
                        border: '1px solid #4a5568',
                        borderRadius: '6px',
                        color: 'white',
                        fontSize: '14px',
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,<svg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 4 5\\"><path fill=\\"white\\" d=\\"M2 0L0 2h4zm0 5L0 3h4z\\"/></svg>")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 8px center',
                        backgroundSize: '12px'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3182ce'}
                      onBlur={(e) => e.target.style.borderColor = '#4a5568'}
                    >
                      <option value="">Select final bidder</option>
                      {loadingMembers ? (
                        <option value="" disabled>Loading members...</option>
                      ) : committeeMembers.length === 0 ? (
                        <option value="" disabled>No members found</option>
                      ) : (
                        committeeMembers.map((member) => (
                          <option key={member.memberId} value={member.memberId}>
                            {member.memberName} (ID: {member.memberId})
                          </option>
                        ))
                      )}
                    </select>
                  </Box>
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
                    Bid Date
                  </Text>
                  <Input
                    type="date"
                    value={formData.bidDate ? formData.bidDate.slice(0, 10) : ''}
                    onChange={(e) => {
                      const dateValue = e.target.value;
                      if (dateValue) {
                        // Convert date to ISO string with current time
                        const date = new Date(dateValue + 'T00:00:00');
                        handleInputChange('bidDate', date.toISOString());
                      } else {
                        handleInputChange('bidDate', undefined);
                      }
                    }}
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
                disabled={!formData.finalBidder || !formData.finalBidAmt || loading}
              >
                {loading ? 'Updating...' : 'Update Bid'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
};

export default EditBidModal;