import React, { useEffect, useState } from 'react';
import { Box, Stack, Text } from '@chakra-ui/react';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { memberService } from '../../services/memberService';
import { bidService } from '../../services/bidService';
import { mapBidResponse, type Bid } from '../../types/bid';

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
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resolve member id similar to Committees page
  useEffect(() => {
    const resolveMemberId = async () => {
      if (!user) return;
      const tryParse = (v: any) => {
        const n = Number(v); return Number.isFinite(n) && n > 0 ? n : null;
      };
      const m1 = tryParse((user as any)?.memberId ?? (user as any)?.memberID ?? (user as any)?.member?.id);
      if (m1) return setEffectiveMemberId(m1);
      try {
        if (user.username) {
          const found = await memberService.searchMembers({ username: user.username });
          if (found?.length) {
            const m2 = tryParse(found[0].memberId);
            if (m2) return setEffectiveMemberId(m2);
          }
        }
      } catch {}
      const m3 = tryParse(user.id);
      if (m3) setEffectiveMemberId(m3);
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
      } catch (e: any) {
        setError(e?.message || 'Failed to load bids');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [effectiveMemberId]);

  return (
    <Box p={6}>
      <Text as="h1" fontSize="2xl" fontWeight="bold" color="white" mb={2}>Bids</Text>
      <Text color="gray.400" mb={6}>Bids grouped by committee (ordered by committee number desc)</Text>
      {loading && <Text color="gray.400">Loading bids…</Text>}
      {error && <Text color="red.400">{error}</Text>}
      {/* Grouped by committeeId */}
      <Stack gap={4}>
        {Object.entries(groupedBids).map(([cid, list]) => {
          const cidNum = Number(cid);
          const headerName = list[0]?.committeeName ?? `Committee #${cid}`;
          const isOpen = expanded.has(cidNum);
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
                py={2}
                cursor="pointer"
                _hover={{ bg: 'gray.800' }}
                rounded="md"
                onClick={toggle}
              >
                <Box display="flex" alignItems="center" gap={2} flex="1" minW={0}>
                  <ChevronRight
                    size={16}
                    color="#a3a3a3"
                    style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease' }}
                  />
                  <Text color="white" fontWeight="semibold" lineClamp={1}>{headerName}</Text>
                </Box>
                <Text color="gray.400" fontSize="sm">{list.length} bids</Text>
              </Box>
              {isOpen && (
                <Stack gap={2} mt={2}>
                  {list.map((b) => (
                    <Box
                      key={b.id}
                      display="grid"
                      gridTemplateColumns="36px 12px 110px 12px 1fr 12px 120px"
                      alignItems="center"
                      gap={0}
                      bg="gray.800"
                      rounded="md"
                      px={3}
                      py={2}
                    >
                      {/* Col 1: committee number pill */}
                      <Box bg="gray.700" color="gray.100" px={2} py={0.5} rounded="full" fontSize="xs" textAlign="center">
                        {b.committeeNumber ?? '-'}
                      </Box>
                      {/* Col 2: bullet */}
                      <Text color="gray.500" textAlign="center">•</Text>
                      {/* Col 3: date (ddMonYYYY) */}
                      <Text color="gray.400" fontSize="sm">{formatDateTime(b.bidDate ?? b.createdAt)}</Text>
                      {/* Col 4: bullet */}
                      <Text color="gray.500" textAlign="center">•</Text>
                      {/* Col 5: final bidder name (fallback '-') */}
                      <Text color="gray.300" fontSize="sm" lineClamp={1}>
                        {b.finalBidderName && b.finalBidderName.trim() !== '' ? b.finalBidderName : '-'}
                      </Text>
                      {/* Col 6: bullet */}
                      <Text color="gray.500" textAlign="center">•</Text>
                      {/* Col 7: amount right-aligned */}
                      <Text color="white" fontWeight="semibold" textAlign="right">₹{b.amount}</Text>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          );
        })}
        {!loading && Object.keys(groupedBids).length === 0 && (
          <Text color="gray.500" fontSize="sm">No bids yet.</Text>
        )}
      </Stack>
    </Box>
  );
};

export default Bids;
