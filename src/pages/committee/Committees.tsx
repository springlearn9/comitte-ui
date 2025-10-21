import React, { useEffect, useState } from 'react';
import { Box, Stack, Text, Button } from '@chakra-ui/react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import CreateEditCommitteeModal from './CreateEditCommitteeModal';
import type { CommitteeListItem, Committee } from '../../types/committee';
import { committeeService } from '../../services/committeeService';
import { mapResponseToListItem, mapModalToRequest } from '../../types/committee';
import { useAuth } from '../../hooks/useAuth';
import { memberService } from '../../services/memberService';


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

const CommitteeRow: React.FC<{ committee: CommitteeListItem; canManage?: boolean; onEdit?: (committee: CommitteeListItem) => void; onDelete?: (id: string) => void; }>=({ committee, canManage=false, onEdit, onDelete }) => {
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
            <>
              <Box bg="gray.700" color="gray.100" px={2} py={0.5} rounded="full" fontSize="xs" minW={6} textAlign="center">
                {bidsRatio}
              </Box>
              <Text color="gray.500">•</Text>
            </>
          )}
          <Text color="gray.400" fontSize="sm">{rightDate}</Text>
          <Text color="gray.500">•</Text>
          <Text color="white" fontWeight="semibold">{rightAmount}</Text>
          {canManage && (
            <Box display="inline-flex" gap={2} ml={2}>
              <Box as="button" onClick={() => onEdit?.(committee)} title="Edit" p={1} _hover={{ bg: 'gray.700', color: 'blue.300' }} rounded="md" color="blue.400">
                <Edit size={16} />
              </Box>
              <Box as="button" onClick={() => committee.id && onDelete?.(committee.id)} title="Delete" p={1} _hover={{ bg: 'gray.700', color: 'red.300' }} rounded="md" color="red.400">
                <Trash2 size={16} />
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
}> = ({ owner, committees, isExpanded, onToggle, onEdit, onDelete }) => (
  <Box mb={6}>
    <Box
      display="flex"
      alignItems="center"
      gap={3}
      p={3}
      bg="gray.800"
      rounded="lg"
      cursor="pointer"
      _hover={{ bg: 'gray.700' }}
      mb={3}
      onClick={onToggle}
    >
      <Box flex="1">
        <Text color="white" fontWeight="medium">{owner}</Text>
      </Box>
      <Box as="span" bg="gray.700" color="gray.200" px={2} py={0.5} rounded="full" fontSize="xs">
        {committees.length}
      </Box>
    </Box>

    {isExpanded && (
      <Stack gap={3} ml={4}>
        {committees.map((committee) => (
          <CommitteeRow
            key={committee.id}
            committee={committee}
            onEdit={onEdit}
            onDelete={onDelete}
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
            const m2 = tryParseId(results[0].id);
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
        <Button colorPalette="red" onClick={handleCreateCommittee}>
          <Box mr={2} display="inline-flex"><Plus size={16} /></Box>
          Add Committee
        </Button>
      </Box>

      {/* Custom Tab Navigation */}
      <Stack direction="row" gap={2} mb={6}>
        <Button
          variant={activeTab === 'my-committees' ? 'solid' : 'outline'}
          colorPalette="red"
          onClick={() => setActiveTab('my-committees')}
        >
          My Committees
        </Button>
        <Button
          variant={activeTab === 'owned-committees' ? 'solid' : 'outline'}
          colorPalette="red"
          onClick={() => setActiveTab('owned-committees')}
        >
          Owned Committees
        </Button>
      </Stack>

      {/* Tab Content */}
      {loading && (
        <Text color="gray.400">Loading committees...</Text>
      )}
      {error && (
        <Text color="red.400">{error}</Text>
      )}
      {activeTab === 'my-committees' && (
        <Box>
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
            />
          ))}
        </Box>
      )}

      {activeTab === 'owned-committees' && (
        <Box>
          <Text color="gray.400" mb={4}>
            Committees you own ({myOwnedCommittees.length} committees)
          </Text>
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
              />
            ))}
          </Stack>
        </Box>
      )}

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
    </Box>
  );
};

export default Committees;