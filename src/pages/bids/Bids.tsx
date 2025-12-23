import React, { useEffect, useState } from 'react';
import { Box, Stack, Text, Button } from '@chakra-ui/react';
import { ChevronRight, Plus, Edit } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { memberService } from '../../services/memberService';
import { bidService } from '../../services/bidService';
import { committeeService } from '../../services/committeeService';
import { mapBidResponse, type Bid } from '../../types/bid';
import CreateBidModal from './CreateBidModal';
import EditBidModal from './EditBidModal';

const formatDateTime = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const mm = months[d.getMonth()];
  const yyyy = d.getFullYear();
  // Only date in ddMonYYYY format, no time
  return `${dd}${mm}${yyyy}`;
};

const Bids: React.FC = () => {
  const { user } = useAuth();
  const [effectiveMemberId, setEffectiveMemberId] = useState<number>(0);
  // Grouped bids by committeeId
  const [groupedBids, setGroupedBids] = useState<Record<number, Bid[]>>({});
  // Track committee ownership (committeeId -> ownerId)
  const [committeeOwners, setCommitteeOwners] = useState<Record<number, number>>({});
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createBidModal, setCreateBidModal] = useState<{ open: boolean; committeeId?: number; committeeName?: string }>({ open: false });
  const [editBidModal, setEditBidModal] = useState<{ open: boolean; bid: Bid | null }>({ open: false, bid: null });

  // Resolve member id - user.id is already set to memberId from login
  useEffect(() => {
    const resolveMemberId = async () => {
      if (!user) return;
      const tryParse = (v: any) => {
        const n = Number(v); return Number.isFinite(n) && n > 0 ? n : null;
      };
      // User.id is already set to memberId from login response
      const memberId = tryParse(user.id);
      if (memberId) setEffectiveMemberId(memberId);
    };
    resolveMemberId();
  }, [user]);

  // Load bids directly for the member
  useEffect(() => {
    const load = async () => {
      if (!Number.isFinite(effectiveMemberId) || effectiveMemberId <= 0) return;
      setLoading(true); setError(null);
      try {
        const bidsData = await bidService.getByMember(effectiveMemberId);
        const bids = bidsData.map(mapBidResponse);
        
        // Group by committeeId and order within group by committeeNumber desc
        const grouped: Record<number, Bid[]> = {};
        bids.forEach((bid) => {
          const cid = bid.committeeId;
          if (!grouped[cid]) grouped[cid] = [];
          grouped[cid].push(bid);
        });
        Object.values(grouped).forEach(list => {
          list.sort((a, b) => (b.committeeNumber ?? -Infinity) - (a.committeeNumber ?? -Infinity));
        });
        setGroupedBids(grouped);
        
        // Extract owner information from bid data (no additional API calls needed)
        const owners: Record<number, number> = {};
        bids.forEach((bid) => {
          if (bid.ownerId !== undefined) {
            owners[bid.committeeId] = bid.ownerId;
          }
        });
        setCommitteeOwners(owners);
      } catch (e: any) {
        setError(e?.message || 'Failed to load bids');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [effectiveMemberId]);

  const handleCreateBid = (committeeId?: number, committeeName?: string) => {
    setCreateBidModal({ open: true, committeeId, committeeName });
  };

  const handleEditBid = (bid: Bid) => {
    setEditBidModal({ open: true, bid });
  };

  const handleBidCreated = () => {
    // Reload bids after successful creation
    const load = async () => {
      if (!Number.isFinite(effectiveMemberId) || effectiveMemberId <= 0) return;
      try {
        const bidsData = await bidService.getByMember(effectiveMemberId);
        const bids = bidsData.map(mapBidResponse);
        
        const grouped: Record<number, Bid[]> = {};
        bids.forEach((bid) => {
          const cid = bid.committeeId;
          if (!grouped[cid]) grouped[cid] = [];
          grouped[cid].push(bid);
        });
        Object.values(grouped).forEach(list => {
          list.sort((a, b) => (b.committeeNumber ?? -Infinity) - (a.committeeNumber ?? -Infinity));
        });
        setGroupedBids(grouped);
        
        // Extract owner information from bid data
        const owners: Record<number, number> = {};
        bids.forEach((bid) => {
          if (bid.ownerId !== undefined) {
            owners[bid.committeeId] = bid.ownerId;
          }
        });
        setCommitteeOwners(owners);
      } catch (e: any) {
        setError(e?.message || 'Failed to reload bids');
      }
    };
    load();
  };

  return (
    <Box p={4}>
      <Box mb={2}>
        <Text as="h1" fontSize="xl" fontWeight="bold" color="white">Bids</Text>
      </Box>
      <Text color="gray.400" mb={3} fontSize="xs">Bids grouped by committee with bid amounts and monthly shares (ordered by committee number desc)</Text>
      {loading && <Text color="gray.400" fontSize="xs">Loading bids…</Text>}
      {error && <Text color="red.400" fontSize="xs">{error}</Text>}
      {/* Grouped by committeeId */}
      <Stack gap={3}>
        {Object.entries(groupedBids).map(([cid, list]) => {
          const cidNum = Number(cid);
          const headerName = list[0]?.committeeName ?? `Committee #${cid}`;
          const isOpen = expanded.has(cidNum);
          const isOwner = committeeOwners[cidNum] === effectiveMemberId;
          const toggle = () => {
            const next = new Set(expanded);
            if (next.has(cidNum)) next.delete(cidNum); else next.add(cidNum);
            setExpanded(next);
          };
          return (
            <Box key={cid} bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={2}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                px={2}
                py={1.5}
                cursor="pointer"
                _hover={{ bg: 'gray.800' }}
                rounded="md"
                onClick={toggle}
              >
                <Box display="flex" alignItems="center" gap={2} flex="1" minW={0}>
                  <ChevronRight
                    size={14}
                    color="#a3a3a3"
                    style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease' }}
                  />
                  <Text color="white" fontWeight="semibold" fontSize="sm" lineClamp={1}>{headerName}</Text>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <Text color="gray.400" fontSize="xs">{list.length} bids</Text>
                  {isOwner && (
                    <Button
                      size="xs"
                      colorPalette="gray"
                      variant="outline"
                      rounded="full"
                      bg="gray.600"
                      color="white"
                      borderColor="gray.500"
                      _hover={{ bg: 'white', color: 'black', borderColor: 'gray.400' }}
                      transition="all 0.2s"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateBid(cidNum, headerName);
                      }}
                    >
                      <Plus size={12} style={{ marginRight: '4px' }} />
                      Add Bid
                    </Button>
                  )}
                </Box>
              </Box>
              {isOpen && (
                <Stack gap={1.5} mt={1.5}>
                  {/* Header row */}
                  <Box
                    display="grid"
                    gridTemplateColumns="36px 110px 1fr 120px 120px 60px"
                    alignItems="center"
                    gap={2}
                  px={2}
                  py={0.5}
                  borderBottom="1px solid"
                  borderColor="gray.700"
                >
                  <Text color="gray.500" fontSize="2xs" textAlign="center">#</Text>
                  <Text color="gray.500" fontSize="2xs">Date</Text>
                  <Text color="gray.500" fontSize="2xs">Bidder</Text>
                  <Text color="gray.500" fontSize="2xs" textAlign="right">Bid Amount</Text>
                  <Text color="gray.500" fontSize="2xs" textAlign="right">Monthly Share</Text>
                  <Text color="gray.500" fontSize="2xs" textAlign="center">Actions</Text>
                  </Box>
                  {list.map((b) => (
                    <Box
                      key={b.id}
                      display="grid"
                      gridTemplateColumns="36px 110px 1fr 120px 120px 60px"
                      alignItems="center"
                      gap={2}
                      bg="gray.800"
                      rounded="md"
                      px={2}
                      py={1.5}
                    >
                      {/* Col 1: committee number pill */}
                      <Box bg="gray.700" color="gray.100" px={1.5} py={0.5} rounded="full" fontSize="2xs" textAlign="center">
                        {b.committeeNumber ?? '-'}
                      </Box>
                      {/* Col 2: date (ddMonYYYY) */}
                      <Text color="gray.400" fontSize="xs">{formatDateTime(b.bidDate ?? b.createdAt)}</Text>
                      {/* Col 3: final bidder name (fallback '-') */}
                      <Text color="gray.300" fontSize="xs" lineClamp={1}>
                        {b.finalBidderName && b.finalBidderName.trim() !== '' ? b.finalBidderName : '-'}
                      </Text>
                      {/* Col 4: amount right-aligned */}
                      <Text color="white" fontWeight="semibold" fontSize="xs" textAlign="right">₹{b.amount}</Text>
                      {/* Col 5: monthly share right-aligned */}
                      <Text color="green.400" fontWeight="semibold" fontSize="xs" textAlign="right">
                        {b.monthlyShare ? `₹${b.monthlyShare}` : '-'}
                      </Text>
                      {/* Col 6: edit action */}
                      <Box display="flex" justifyContent="center">
                        {isOwner && (
                          <Box 
                            as="button" 
                            onClick={() => handleEditBid(b)} 
                            title="Edit Bid"
                            color="blue.300" 
                            _hover={{ color: 'blue.200', bg: 'gray.700' }} 
                            p={1.5} 
                            cursor="pointer" 
                            borderRadius="full"
                          >
                            <Edit size={14} />
                          </Box>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          );
        })}
        {!loading && Object.keys(groupedBids).length === 0 && (
          <Text color="gray.500" fontSize="xs">No bids yet.</Text>
        )}
      </Stack>

      {/* Create Bid Modal */}
      <CreateBidModal
        isOpen={createBidModal.open}
        onClose={() => setCreateBidModal({ open: false })}
        onSuccess={handleBidCreated}
        committeeId={createBidModal.committeeId}
        committeeName={createBidModal.committeeName}
      />

      {/* Edit Bid Modal */}
      <EditBidModal
        isOpen={editBidModal.open}
        onClose={() => setEditBidModal({ open: false, bid: null })}
        onSuccess={handleBidCreated}
        bid={editBidModal.bid}
      />
    </Box>
  );
};

export default Bids;
