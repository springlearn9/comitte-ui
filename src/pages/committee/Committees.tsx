import React, { useEffect, useState } from 'react';
import { Box, Stack, Text, Button, Tabs, DialogRoot, DialogBackdrop, DialogPositioner, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogTitle, Input } from '@chakra-ui/react';
import { Plus, Edit, Trash2, ChevronRight, UserPlus, Users, IndianRupee } from 'lucide-react';
import CreateEditCommitteeModal from './CreateEditCommitteeModal';
import type { CommitteeListItem, Committee } from '../../types/committee';
import { committeeService } from '../../services/committeeService';
import { mapResponseToListItem, mapModalToRequest } from '../../types/committee';
import { useAuth } from '../../hooks/useAuth';
import { memberService } from '../../services/memberService';
import { bidService } from '../../services/bidService';
import { mapBidResponse, type Bid } from '../../types/bid';
import type { MemberResponse, CommitteMemberMapResponse } from '../../services/authService';


// Helpers
const formatDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const mm = months[d.getMonth()];
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}${mm}${yy}`;
};

const formatCurrency = (value?: number | string) => {
  if (value == null) return '';
  if (typeof value === 'string') return value; // already formatted like '₹200000'
  try {
    return `₹${value}`;
  } catch {
    return `₹${value}`;
  }
};

const CommitteeRow: React.FC<{ committee: CommitteeListItem; canManage?: boolean; onEdit?: (committee: CommitteeListItem) => void; onDelete?: (id: string) => void; onShowMembers?: (committee: CommitteeListItem) => void; onShowBids?: (committee: CommitteeListItem) => void; onAddMembers?: (committee: CommitteeListItem) => void; }>=({ committee, canManage=false, onEdit, onDelete, onShowMembers, onShowBids, onAddMembers }) => {
  const rightAmount = committee.monthlyShare != null ? formatCurrency(committee.monthlyShare) : committee.budget;
  const rightDate = formatDate(committee.createdAt);
  const bidsRatio = committee.bidsRatio;
  return (
    <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={3} _hover={{ bg: 'gray.800' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" gap={3}>
        {/* Left: condensed calculated name */}
        <Text color="white" fontWeight="medium" lineClamp={1}>
          {committee.name}
        </Text>
        {/* Right: bidsRatio • date • amount */}
        <Box display="flex" alignItems="center" gap={4}>
          {bidsRatio && (
            <Box bg="gray.700" color="gray.100" px={2} py={0.5} rounded="full" fontSize="xs" minW={6} textAlign="center">
              {bidsRatio}
            </Box>
          )}
          <Text color="gray.400" fontSize="sm">{rightDate}</Text>
          <Text color="white" fontWeight="semibold">{rightAmount}</Text>
          <Box as="button" onClick={() => onShowMembers?.(committee)} title="Members"
               color="blue.300" _hover={{ color: 'blue.200', bg: 'gray.700' }} p={2} cursor="pointer" borderRadius="full">
            <Users size={20} />
          </Box>
          <Box as="button" onClick={() => onShowBids?.(committee)} title="Bids"
               color="blue.300" _hover={{ color: 'blue.200', bg: 'gray.700' }} p={2} cursor="pointer" borderRadius="full">
            <IndianRupee size={20} />
          </Box>
          {canManage && (
            <Box as="button" onClick={() => onAddMembers?.(committee)} title="Add Members"
                 color="green.300" _hover={{ color: 'green.200', bg: 'gray.700' }} p={2} cursor="pointer" borderRadius="full">
              <UserPlus size={20} />
            </Box>
          )}
          {canManage && (
            <Box display="inline-flex" gap={2} ml={2}>
              <Box as="button" onClick={() => onEdit?.(committee)} title="Edit" p={2} _hover={{ bg: 'gray.700', color: 'blue.300' }} rounded="full" color="blue.400" cursor="pointer">
                <Edit size={20} />
              </Box>
              <Box as="button" onClick={() => committee.id && onDelete?.(committee.id)} title="Delete" p={2} _hover={{ bg: 'gray.700', color: 'red.300' }} rounded="full" color="red.400" cursor="pointer">
                <Trash2 size={20} />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const CommitteeGroup: React.FC<{ 
  owner: string; 
  committees: CommitteeListItem[]; 
  isExpanded: boolean; 
  onToggle: () => void;
  onEdit: (committee: CommitteeListItem) => void;
  onDelete: (id: string) => void;
  onShowMembers: (committee: CommitteeListItem) => void;
  onShowBids: (committee: CommitteeListItem) => void;
  onAddMembers?: (committee: CommitteeListItem) => void;
}> = ({ owner, committees, isExpanded, onToggle, onEdit, onDelete, onShowMembers, onShowBids, onAddMembers }) => (
  <Box mb={6} bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={2}>
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      px={2}
      py={2}
      cursor="pointer"
      _hover={{ bg: 'gray.800' }}
      rounded="md"
      onClick={onToggle}
    >
      <Box display="flex" alignItems="center" gap={2} flex="1" minW={0}>
        <ChevronRight
          size={16}
          color="#a3a3a3"
          style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease' }}
        />
        <Text color="white" fontWeight="semibold" lineClamp={1}>{owner}</Text>
      </Box>
      <Text color="gray.400" fontSize="sm">{committees.length} committees</Text>
    </Box>

    {isExpanded && (
      <Stack gap={3} mt={2}>
        {committees.map((committee) => (
          <CommitteeRow
            key={committee.id}
            committee={committee}
            onEdit={onEdit}
            onDelete={onDelete}
            onShowMembers={onShowMembers}
            onShowBids={onShowBids}
            onAddMembers={onAddMembers}
          />
        ))}
      </Stack>
    )}
  </Box>
);

const Committees: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'my-committees' | 'owned-committees'>('my-committees');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null);
  const [memberCommittees, setMemberCommittees] = useState<CommitteeListItem[]>([]);
  const [ownerCommittees, setOwnerCommittees] = useState<CommitteeListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [effectiveMemberId, setEffectiveMemberId] = useState<number>(0);

  // Popups state
  const [membersModal, setMembersModal] = useState<{ open: boolean; title: string; loading: boolean; items: CommitteMemberMapResponse[] }>({ open: false, title: '', loading: false, items: []});
  const [bidsModal, setBidsModal] = useState<{ open: boolean; title: string; loading: boolean; items: Bid[] }>({ open: false, title: '', loading: false, items: []});
  const [addMembersModal, setAddMembersModal] = useState<{ open: boolean; committee: CommitteeListItem | null; searchText: string; loading: boolean; searchResults: MemberResponse[] }>({ open: false, committee: null, searchText: '', loading: false, searchResults: [] });

  // Resolve the memberId/ownerId used by backend; prefer 'memberId' from user, then search by username, then user.id
  useEffect(() => {
    const resolveMemberId = async () => {
      if (!user) return;
      try {
        const tryParseId = (val: any): number | null => {
          const n = Number(val);
          return Number.isFinite(n) && n > 0 ? n : null;
        };

        // Prefer explicit memberId if present on the user payload
        const possibleMemberId = (user as any)?.memberId ?? (user as any)?.memberID ?? (user as any)?.member?.id;
        const m1 = tryParseId(possibleMemberId);
        if (m1) {
          setEffectiveMemberId(m1);
          console.debug('[Committees] Using memberId from user payload:', m1);
          return;
        }

        // Search by username to resolve the backend member id
        if (user.username) {
          const results = await memberService.searchMembers({ username: user.username });
          if (results?.length) {
            const m2 = tryParseId(results[0].memberId);
            if (m2) {
              setEffectiveMemberId(m2);
              console.debug('[Committees] Resolved memberId via search:', m2);
              return;
            }
          }
        }

        // Fallback to auth user id
        const m3 = tryParseId(user.id);
        if (m3) {
          setEffectiveMemberId(m3);
          console.debug('[Committees] Falling back to user.id as memberId:', m3);
          return;
        }

        console.warn('[Committees] Unable to resolve a valid member id from user or search', { user });
      } catch (e) {
        console.warn('Failed to resolve member id via search, falling back to auth id', e);
        const n = Number(user?.id);
        if (Number.isFinite(n) && n > 0) setEffectiveMemberId(n);
      }
    };
    resolveMemberId();
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!Number.isFinite(effectiveMemberId) || effectiveMemberId <= 0) return;
        setLoading(true);
        setError(null);
        const [memberData, ownerData] = await Promise.all([
          committeeService.getByMember(effectiveMemberId),
          committeeService.getByOwner(effectiveMemberId),
        ]);
        const memberItems = memberData.map(mapResponseToListItem);
        const ownerItems = ownerData.map(mapResponseToListItem);
        setMemberCommittees(memberItems);
        setOwnerCommittees(ownerItems);
        // If no member committees but there are owned committees, switch tab for visibility
        if (memberItems.length === 0 && ownerItems.length > 0) {
          setActiveTab('owned-committees');
        }
      } catch (e: any) {
        console.error('Failed to load committees', e);
        setError(e?.message || 'Failed to load committees');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [effectiveMemberId]);

  // const currentUser = String(user?.id ?? '');

  // Group member committees by owner for "My Committees" tab
  const groupedCommittees = memberCommittees.reduce((groups, committee) => {
    const owner = committee.owner || 'Unknown';
    if (!groups[owner]) {
      groups[owner] = [];
    }
    groups[owner].push(committee);
    return groups;
  }, {} as Record<string, CommitteeListItem[]>);

  // Owned committees are loaded separately
  const myOwnedCommittees = ownerCommittees;

  const toggleGroup = (owner: string) => {
    const next = new Set(expandedGroups);
    if (next.has(owner)) next.delete(owner); else next.add(owner);
    setExpandedGroups(next);
  };

  const handleCreateCommittee = () => {
    setModalMode('create');
    setSelectedCommittee(null);
    setIsModalOpen(true);
  };

  const handleEditCommittee = (committee: CommitteeListItem) => {
    const committeeForEdit: Committee = {
      id: committee.id,
      name: committee.name,
      description: committee.description,
      totalAmount: committee.budget?.replace('₹', '') || '',
      monthlyAmount: '',
      duration: '12',
      startDate: committee.createdAt || '',
      location: committee.location || '',
      maxMembers: committee.members || 10,
      category: 'savings',
      rules: '',
    };
    setModalMode('edit');
    setSelectedCommittee(committeeForEdit);
    setIsModalOpen(true);
  };

  const openMembers = async (committee: CommitteeListItem) => {
    setMembersModal({ open: true, title: `${committee.name} • Members`, loading: true, items: [] });
    try {
      const data = await memberService.getByCommittee(Number(committee.id));
      setMembersModal({ open: true, title: `${committee.name} • Members`, loading: false, items: data });
    } catch (e) {
      setMembersModal({ open: true, title: `${committee.name} • Members`, loading: false, items: [] });
    }
  };

  const openBids = async (committee: CommitteeListItem) => {
    setBidsModal({ open: true, title: `${committee.name} • Bids`, loading: true, items: [] });
    try {
      const data = await bidService.getByCommittee(Number(committee.id));
      setBidsModal({ open: true, title: `${committee.name} • Bids`, loading: false, items: data.map(mapBidResponse) });
    } catch (e) {
      setBidsModal({ open: true, title: `${committee.name} • Bids`, loading: false, items: [] });
    }
  };

  const openAddMembers = (committee: CommitteeListItem) => {
    setAddMembersModal({ open: true, committee, searchText: '', loading: false, searchResults: [] });
  };

  const searchMembers = async (searchText: string) => {
    if (!searchText.trim()) {
      setAddMembersModal(prev => ({ ...prev, searchResults: [] }));
      return;
    }
    setAddMembersModal(prev => ({ ...prev, loading: true }));
    try {
      const results = await memberService.searchMembers({
        name: searchText,
        mobile: searchText,
        username: searchText
      });
      setAddMembersModal(prev => ({ ...prev, loading: false, searchResults: results }));
    } catch (e) {
      setAddMembersModal(prev => ({ ...prev, loading: false, searchResults: [] }));
    }
  };

  const attachMember = async (member: MemberResponse) => {
    if (!addMembersModal.committee) return;
    
    const comitteId = Number(addMembersModal.committee.id);
    const memberId = member.memberId;
    
    // Validate the IDs are valid numbers
    if (!Number.isFinite(comitteId) || comitteId <= 0) {
      console.error('Invalid committee ID:', addMembersModal.committee.id);
      alert('Invalid committee ID');
      return;
    }
    
    if (!Number.isFinite(memberId) || memberId <= 0) {
      console.error('Invalid member ID:', memberId);
      alert('Invalid member ID');
      return;
    }
    
    try {
      console.log('Adding member to committee:', {
        comitteId,
        memberId,
        shareCount: 1
      });
      await committeeService.addMember(comitteId, memberId, 1);
      // Close modal and refresh data
      setAddMembersModal({ open: false, committee: null, searchText: '', loading: false, searchResults: [] });
      // Refresh committees data
      const [memberData, ownerData] = await Promise.all([
        committeeService.getByMember(effectiveMemberId),
        committeeService.getByOwner(effectiveMemberId),
      ]);
      setMemberCommittees(memberData.map(mapResponseToListItem));
      setOwnerCommittees(ownerData.map(mapResponseToListItem));
    } catch (e: any) {
      console.error('Failed to add member:', e);
      console.error('Error response:', e.response?.data);
      console.error('Error status:', e.response?.status);
      const errorMessage = e.response?.data?.message || e.message || 'Failed to add member to committee';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleDeleteCommittee = (id: string) => {
    if (window.confirm('Are you sure you want to delete this committee?')) {
      committeeService.delete(Number(id))
        .then(() => {
          setOwnerCommittees(prev => prev.filter(c => c.id !== id));
          setMemberCommittees(prev => prev.filter(c => c.id !== id));
        })
        .catch((e) => {
          console.error('Delete failed', e);
          alert('Failed to delete committee');
        });
    }
  };

  const handleSaveCommittee = async (committeeData: Committee) => {
    const ownerId = effectiveMemberId;
    if (!ownerId) return;
    if (modalMode === 'create') {
      const payload = mapModalToRequest(committeeData, ownerId);
      const created = await committeeService.create(payload);
      const item = mapResponseToListItem(created);
      setOwnerCommittees(prev => [...prev, item]);
    } else if (selectedCommittee?.id) {
      const payload = mapModalToRequest(committeeData, ownerId);
      const updated = await committeeService.update(Number(selectedCommittee.id), payload);
      const item = mapResponseToListItem(updated);
      setOwnerCommittees(prev => prev.map(c => c.id === item.id ? item : c));
      setMemberCommittees(prev => prev.map(c => c.id === item.id ? item : c));
    }
  };

  return (
    <Box p={6}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={6}>
        <Box>
          <Text as="h1" fontSize="2xl" fontWeight="bold" color="white" mb={2}>Committees</Text>
          <Text color="gray.400">Manage and view all committees</Text>
        </Box>
        {/* Button moved to Owned tab header below */}
      </Box>

      {/* Tabs */}
      <Tabs.Root
        value={activeTab}
        onValueChange={(details: { value: string }) =>
          setActiveTab(details.value === 'my-committees' ? 'my-committees' : 'owned-committees')
        }
      >
        <Tabs.List
          mb={4}
          borderBottomWidth="0"
          gap={6}
          position="relative"
        >
          <Tabs.Trigger
            value="my-committees"
            px={3}
            py={2}
            roundedTop="md"
            bg="transparent"
            fontWeight="semibold"
            color="gray.400"
            borderWidth="1px"
            borderColor="transparent"
            borderBottomColor="transparent"
            _hover={{ color: 'gray.300' }}
            css={{
              '&[data-selected]': {
                color: 'white',
                borderColor: 'var(--chakra-colors-gray-700)',
                borderBottomColor: 'transparent',
              },
            }}
          >
            My Committees
          </Tabs.Trigger>
          <Tabs.Trigger
            value="owned-committees"
            px={3}
            py={2}
            roundedTop="md"
            bg="transparent"
            fontWeight="semibold"
            color="gray.400"
            borderWidth="1px"
            borderColor="transparent"
            borderBottomColor="transparent"
            _hover={{ color: 'gray.300' }}
            css={{
              '&[data-selected]': {
                color: 'white',
                borderColor: 'var(--chakra-colors-gray-700)',
                borderBottomColor: 'transparent',
              },
            }}
          >
            Owned Committees
          </Tabs.Trigger>
          {/* No indicator; active tab overlaps bottom border for enclosed style */}
        </Tabs.List>

        {loading && <Text color="gray.400">Loading committees...</Text>}
        {error && <Text color="red.400">{error}</Text>}

        <Tabs.Content value="my-committees" paddingX={0}>
          <Text color="gray.400" mb={4}>
            Committees you are part of, grouped by owner ({Object.keys(groupedCommittees).length} owners)
          </Text>
          {Object.keys(groupedCommittees).length === 0 && !loading && !error && (
            <Text color="gray.500">You're not part of any committees yet.</Text>
          )}
          {Object.entries(groupedCommittees).map(([owner, committees]) => (
            <CommitteeGroup
              key={owner}
              owner={owner}
              committees={committees}
              isExpanded={expandedGroups.has(owner)}
              onToggle={() => toggleGroup(owner)}
              onEdit={handleEditCommittee}
              onDelete={handleDeleteCommittee}
              onShowMembers={openMembers}
              onShowBids={openBids}
              onAddMembers={openAddMembers}
            />
          ))}
        </Tabs.Content>

        <Tabs.Content value="owned-committees" paddingX={0}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
            <Text color="gray.400">
              Committees you own ({myOwnedCommittees.length} committees)
            </Text>
            <Button 
              colorPalette="gray" 
              variant="outline" 
              rounded="full" 
              bg="gray.600" 
              color="white" 
              borderColor="gray.500"
              _hover={{ bg: 'white', color: 'black', borderColor: 'gray.400' }}
              transition="all 0.2s"
              onClick={handleCreateCommittee}
            >
              <Box mr={2} display="inline-flex"><Plus size={16} /></Box>
              Add Committee
            </Button>
          </Box>
          {myOwnedCommittees.length === 0 && !loading && !error && (
            <Text color="gray.500">You don't own any committees yet. Use the "Add Committee" button to create one.</Text>
          )}
          <Stack gap={3}>
            {myOwnedCommittees.map((committee) => (
              <CommitteeRow
                key={committee.id}
                committee={committee}
                canManage
                onEdit={handleEditCommittee}
                onDelete={handleDeleteCommittee}
                onShowMembers={openMembers}
                onShowBids={openBids}
                onAddMembers={openAddMembers}
              />
            ))}
          </Stack>
        </Tabs.Content>
      </Tabs.Root>

      {/* Create/Edit Committee Modal */}
      <CreateEditCommitteeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        onSave={handleSaveCommittee}
        committee={selectedCommittee}
        mode={modalMode}
      />

      {/* Members Modal */}
      <DialogRoot open={membersModal.open} onOpenChange={(d) => !d.open && setMembersModal(prev => ({ ...prev, open: false }))}>
        <DialogBackdrop bg="blackAlpha.700" backdropFilter="auto" backdropBlur="2px" />
        <DialogPositioner inset="0" display="flex" alignItems="center" justifyContent="center" p={{ base: 4, sm: 6 }}>
          <DialogContent bg="gray.900" color="white" maxW="lg" maxH="80dvh" overflowY="auto" borderColor="gray.700" borderWidth="1px" rounded="md">
            <DialogHeader>
              <DialogTitle><Text fontWeight="bold">{membersModal.title}</Text></DialogTitle>
            </DialogHeader>
            <DialogBody>
              {membersModal.loading && <Text color="gray.400">Loading members…</Text>}
              {!membersModal.loading && membersModal.items.length === 0 && (
                <Text color="gray.500" fontSize="sm">No members found.</Text>
              )}
              <Stack gap={2}>
                {membersModal.items.map((m) => (
                  <Box key={m.id} bg="gray.800" rounded="md" px={3} py={2} display="grid" gridTemplateColumns="1fr auto auto" gap={4} alignItems="center">
                    <Text color="white" fontSize="sm">{m.memberName}</Text>
                    <Text color="gray.400" fontSize="sm">{m.memberMobile}</Text>
                    <Text color="gray.400" fontSize="sm">{m.shareCount}</Text>
                  </Box>
                ))}
              </Stack>
            </DialogBody>
            <DialogFooter>
              <Button onClick={() => setMembersModal(prev => ({ ...prev, open: false }))}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </DialogPositioner>
      </DialogRoot>

      {/* Bids Modal */}
      <DialogRoot open={bidsModal.open} onOpenChange={(d) => !d.open && setBidsModal(prev => ({ ...prev, open: false }))}>
        <DialogBackdrop bg="blackAlpha.700" backdropFilter="auto" backdropBlur="2px" />
        <DialogPositioner inset="0" display="flex" alignItems="center" justifyContent="center" p={{ base: 4, sm: 6 }}>
          <DialogContent bg="gray.900" color="white" maxW="2xl" maxH="80dvh" overflowY="auto" borderColor="gray.700" borderWidth="1px" rounded="md">
            <DialogHeader>
              <DialogTitle><Text fontWeight="bold">{bidsModal.title}</Text></DialogTitle>
            </DialogHeader>
            <DialogBody>
              {bidsModal.loading && <Text color="gray.400">Loading bids…</Text>}
              {!bidsModal.loading && bidsModal.items.length === 0 && (
                <Text color="gray.500" fontSize="sm">No bids found.</Text>
              )}
              {!bidsModal.loading && bidsModal.items.length > 0 && (
                <Stack gap={2}>
                  {/* Header row */}
                  <Box
                    display="grid"
                    gridTemplateColumns="36px 110px 1fr 120px 120px"
                    alignItems="center"
                    gap={3}
                    px={3}
                    py={1}
                    borderBottom="1px solid"
                    borderColor="gray.700"
                  >
                    <Text color="gray.500" fontSize="xs" textAlign="center">#</Text>
                    <Text color="gray.500" fontSize="xs">Date</Text>
                    <Text color="gray.500" fontSize="xs">Bidder</Text>
                    <Text color="gray.500" fontSize="xs" textAlign="right">Bid Amount</Text>
                    <Text color="gray.500" fontSize="xs" textAlign="right">Monthly Share</Text>
                  </Box>
                  {bidsModal.items.map((b) => (
                    <Box
                      key={b.id}
                      display="grid"
                      gridTemplateColumns="36px 110px 1fr 120px 120px"
                      alignItems="center"
                      gap={3}
                      bg="gray.800"
                      rounded="md"
                      px={3}
                      py={2}
                    >
                      {/* Col 1: committee number pill */}
                      <Box bg="gray.700" color="gray.100" px={2} py={0.5} rounded="full" fontSize="xs" textAlign="center">
                        {b.committeeNumber ?? '-'}
                      </Box>
                      {/* Col 2: date (ddMonYYYY format) */}
                      <Text color="gray.400" fontSize="sm">
                        {formatDate(b.bidDate || b.createdAt)}
                      </Text>
                      {/* Col 3: final bidder name */}
                      <Text color="gray.300" fontSize="sm" lineClamp={1}>
                        {b.finalBidderName && b.finalBidderName.trim() !== '' ? b.finalBidderName : '-'}
                      </Text>
                      {/* Col 4: bid amount right-aligned */}
                      <Text color="white" fontWeight="semibold" textAlign="right">₹{b.amount}</Text>
                      {/* Col 5: monthly share right-aligned */}
                      <Text color="green.400" fontWeight="semibold" textAlign="right">
                        {b.monthlyShare ? `₹${b.monthlyShare}` : '-'}
                      </Text>
                    </Box>
                  ))}
                </Stack>
              )}
            </DialogBody>
            <DialogFooter>
              <Button onClick={() => setBidsModal(prev => ({ ...prev, open: false }))}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </DialogPositioner>
      </DialogRoot>

      {/* Add Members Modal */}
      <DialogRoot open={addMembersModal.open} onOpenChange={(d) => !d.open && setAddMembersModal(prev => ({ ...prev, open: false }))}>
        <DialogBackdrop bg="blackAlpha.700" backdropFilter="auto" backdropBlur="2px" />
        <DialogPositioner inset="0" display="flex" alignItems="center" justifyContent="center" p={{ base: 4, sm: 6 }}>
          <DialogContent bg="gray.900" color="white" maxW="lg" maxH="80dvh" overflowY="auto" borderColor="gray.700" borderWidth="1px" rounded="md">
            <DialogHeader>
              <DialogTitle><Text fontWeight="bold">Add Members to {addMembersModal.committee?.name}</Text></DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Stack gap={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Search Members</Text>
                  <Input
                    placeholder="Enter name, mobile, or username"
                    value={addMembersModal.searchText}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAddMembersModal(prev => ({ ...prev, searchText: value }));
                      searchMembers(value);
                    }}
                    bg="gray.800"
                    borderColor="gray.700"
                    _placeholder={{ color: 'gray.500' }}
                    _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px #ef4444' }}
                  />
                </Box>
                {addMembersModal.loading && <Text color="gray.400">Searching…</Text>}
                {!addMembersModal.loading && addMembersModal.searchResults.length === 0 && addMembersModal.searchText.trim() && (
                  <Text color="gray.500" fontSize="sm">No members found.</Text>
                )}
                <Stack gap={2} maxH="300px" overflowY="auto">
                  {addMembersModal.searchResults.map((member) => (
                    <Box key={member.memberId} bg="gray.800" rounded="md" px={3} py={2} display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Text color="white" fontSize="sm" fontWeight="medium">{member.name || member.username}</Text>
                        <Text color="gray.400" fontSize="xs">{member.mobile || member.email}</Text>
                      </Box>
                      <Button size="sm" colorPalette="green" onClick={() => attachMember(member)}>
                        Add
                      </Button>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </DialogBody>
            <DialogFooter>
              <Button onClick={() => setAddMembersModal(prev => ({ ...prev, open: false }))}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </DialogPositioner>
      </DialogRoot>
    </Box>
  );
};

export default Committees;