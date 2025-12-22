import React, { useEffect, useState, useRef } from 'react';
import { Box, Stack, Heading, Text, SimpleGrid, Badge, Spinner, DialogRoot, DialogBackdrop, DialogPositioner, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogTitle } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { memberService } from '../services/memberService';
import { committeeService } from '../services/committeeService';
import { bidService } from '../services/bidService';
import { IndianRupee, Calendar, User, Users, Building, FileText, TrendingUp } from 'lucide-react';
import type { CommitteMemberMapResponse } from '../services/authService';
import { mapBidResponse, type Bid } from '../types/bid';

interface DashboardStats {
  totalCommittees: number;
  totalMembers: number;
  totalBids: number;
  recentActivity: Array<{
    id: string;
    type: 'bid' | 'committee' | 'member';
    title: string;
    description: string;
    amount?: number;
    monthlyShare?: number;
    committeeName?: string;
    bidderName?: string;
    bidsRatio?: string;
    timestamp: string;
  }>;
  myCommittees: Array<{
    id: number;
    name: string;
    totalAmount: number;
    monthlyShare?: number;
    fullShare?: number;
    membersCount: number;
    status: string;
    createdDate: string;
    startDate: string;
    bidsRatio?: string;
  }>;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalCommittees: 0,
    totalMembers: 0,
    totalBids: 0,
    recentActivity: [],
    myCommittees: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [membersModal, setMembersModal] = useState<{ open: boolean; title: string; loading: boolean; items: CommitteMemberMapResponse[] }>({ open: false, title: '', loading: false, items: []});
  const [bidsModal, setBidsModal] = useState<{ open: boolean; title: string; loading: boolean; items: Bid[] }>({ open: false, title: '', loading: false, items: []});

  // Prevent duplicate calls
  const loadingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      
      // Prevent duplicate calls when effect runs twice in StrictMode
      if (loadingRef.current || hasLoadedRef.current) return;
      loadingRef.current = true;
      
      setLoading(true);
      setError(null);
      
      try {
        // Get member ID
        let memberId: number | null = null;
        const tryParse = (v: any) => {
          const n = Number(v);
          return Number.isFinite(n) && n > 0 ? n : null;
        };
        
        memberId = tryParse((user as any)?.memberId ?? (user as any)?.memberID ?? (user as any)?.member?.id);
        
        if (!memberId && user.username) {
          try {
            const found = await memberService.searchMembers({ username: user.username });
            if (found?.length) {
              memberId = tryParse(found[0].memberId);
            }
          } catch {}
        }
        
        if (!memberId) {
          memberId = tryParse(user.id);
        }

        if (!memberId) {
          setError('Unable to determine member ID');
          return;
        }

        // Fetch committees and bids data
        const [myCommitteesData, bidsData] = await Promise.all([
          committeeService.getMyCommittees(memberId).catch(() => []),
          bidService.getByMember(memberId).catch(() => [])
        ]);

        // Fetch actual member counts for each committee to ensure accuracy
        const memberCountsMap = new Map<number, number>();
        await Promise.all(
          myCommitteesData.map(async (committee) => {
            try {
              const members = await memberService.getByCommittee(committee.comitteId);
              memberCountsMap.set(committee.comitteId, members.length);
            } catch {
              // Fall back to backend's count if fetch fails
              memberCountsMap.set(committee.comitteId, committee.membersCount || 0);
            }
          })
        );
        
        // Calculate total members across all my committees using actual counts
        const totalMembersCount = Array.from(memberCountsMap.values()).reduce((sum, count) => sum + count, 0);

        // Generate recent activity from committees and bids
        const recentActivity: Array<{
          id: string;
          type: 'bid' | 'committee' | 'member';
          title: string;
          description: string;
          amount?: number;
          monthlyShare?: number;
          committeeName?: string;
          bidderName?: string;
          bidsRatio?: string;
          timestamp: string;
          date: Date;
        }> = [];
        
        // Add committee activities
        myCommitteesData.forEach((committee) => {
          if (committee.createdTimestamp) {
            recentActivity.push({
              id: `committee-${committee.comitteId}`,
              type: 'committee',
              title: 'Committee Created',
              description: `New committee "${committee.comitteName || 'Unnamed'}" was created`,
              committeeName: committee.comitteName || 'Unnamed',
              timestamp: committee.createdTimestamp,
              date: new Date(committee.createdTimestamp)
            });
          }
        });

        // Add bid activities with detailed information
        bidsData.forEach((bid) => {
          if (bid.createdTimestamp) {
            const bidder = bid.finalBidderName || 'Unknown bidder';
            const committee = bid.comitteName || `Committee #${bid.comitteId}`;
            const amount = bid.finalBidAmt || 0;
            const monthlyShare = bid.monthlyShare || 0;
            
            // Find matching committee to get bidsRatio
            const matchingCommittee = myCommitteesData.find(c => c.comitteId === bid.comitteId);
            const bidsRatio = matchingCommittee?.bidsRatio ? String(matchingCommittee.bidsRatio) : '';
            
            recentActivity.push({
              id: `bid-${bid.bidId}`,
              type: 'bid',
              title: 'Bid Submitted',
              description: `${bidder} has picked this comitte at loss of ${amount}`,
              amount: amount,
              monthlyShare: monthlyShare,
              committeeName: committee,
              bidderName: bidder,
              bidsRatio: bidsRatio,
              timestamp: bid.createdTimestamp,
              date: new Date(bid.createdTimestamp)
            });
          }
        });

        // Sort by date and take the 5 most recent
        recentActivity.sort((a, b) => b.date.getTime() - a.date.getTime());
        const recentActivities = recentActivity.slice(0, 5).map(({ date, ...activity }) => activity);

        // Process my committees data for display (includes both member and owned)
        const myCommittees = myCommitteesData.slice(0, 5).map(committee => ({
          id: committee.comitteId,
          name: committee.comitteName || 'Unnamed Committee',
          totalAmount: committee.fullAmount || 0,
          monthlyShare: committee.fullShare || undefined,
          fullShare: committee.fullShare || undefined,
          membersCount: memberCountsMap.get(committee.comitteId) || 0,
          status: 'ACTIVE',
          createdDate: committee.createdTimestamp || new Date().toISOString(),
          startDate: committee.startDate || committee.createdTimestamp || new Date().toISOString(),
          bidsRatio: committee.bidsRatio ? String(committee.bidsRatio) : undefined
        }));

        setStats({
          totalCommittees: myCommitteesData.length,
          totalMembers: totalMembersCount,
          totalBids: bidsData.length,
          recentActivity: recentActivities,
          myCommittees: myCommittees
        });

      } catch (err: any) {
        setError(err?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
        loadingRef.current = false;
        hasLoadedRef.current = true;
      }
    };

    loadDashboardData();
  }, [user]);

  const openMembers = async (committeeId: number, committeeName: string) => {
    setMembersModal({ open: true, title: `${committeeName} • Members`, loading: true, items: [] });
    try {
      const data = await memberService.getByCommittee(committeeId);
      setMembersModal({ open: true, title: `${committeeName} • Members`, loading: false, items: data });
    } catch (e) {
      setMembersModal({ open: true, title: `${committeeName} • Members`, loading: false, items: [] });
    }
  };

  const openBids = async (committeeId: number, committeeName: string) => {
    setBidsModal({ open: true, title: `${committeeName} • Bids`, loading: true, items: [] });
    try {
      const data = await bidService.getByCommittee(committeeId);
      setBidsModal({ open: true, title: `${committeeName} • Bids`, loading: false, items: data.map(mapBidResponse) });
    } catch (e) {
      setBidsModal({ open: true, title: `${committeeName} • Bids`, loading: false, items: [] });
    }
  };

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

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Box p={6}>
      <Stack gap={{ base: 4, sm: 6 }}>
        <Box>
          <Heading size="lg" color="white" mb={2}>
            Welcome back, {user?.username || 'User'}!
          </Heading>
          <Text color="gray.400" fontSize="sm">
            Committee Management Portal Dashboard
          </Text>
        </Box>

        {loading && (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={12} gap={4}>
            <Spinner size="xl" color="red.500" thickness="4px" speed="0.65s" />
            <Text color="gray.400" fontSize="lg">Loading dashboard data...</Text>
          </Box>
        )}

        {error && (
          <Box bg="red.900" borderColor="red.800" borderWidth="1px" rounded="lg" p={4}>
            <Text color="red.400">{error}</Text>
          </Box>
        )}

        {!loading && !error && (
          <>
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={{ base: 3, sm: 4 }}>
              {/* Committees Tile */}
              <Box as={Link} to="/committees">
                <Box 
                  bg="gray.900" 
                  borderColor="gray.800" 
                  borderWidth="1px" 
                  rounded="lg" 
                  p={4}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ 
                    transform: 'translateY(-2px)', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    borderColor: 'red.500'
                  }}
                >
                  <Box display="flex" alignItems="center" gap={3} mb={3}>
                    <Building size={20} color="#ef4444" />
                    <Text color="white" fontWeight="medium" fontSize="sm">Committees</Text>
                  </Box>
                  <Text color="red.500" fontWeight="bold" fontSize="2xl" mb={0.5}>{stats.totalCommittees}</Text>
                  <Text color="gray.400" fontSize="xs">Your committees</Text>
                </Box>
              </Box>

              {/* Members Tile */}
              <Box as={Link} to="/profile">
                <Box 
                  bg="gray.900" 
                  borderColor="gray.800" 
                  borderWidth="1px" 
                  rounded="lg" 
                  p={4}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ 
                    transform: 'translateY(-2px)', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    borderColor: 'blue.500'
                  }}
                >
                  <Box display="flex" alignItems="center" gap={3} mb={3}>
                    <Users size={20} color="#3b82f6" />
                    <Text color="white" fontWeight="medium" fontSize="sm">Members</Text>
                  </Box>
                  <Text color="blue.400" fontWeight="bold" fontSize="2xl" mb={0.5}>{stats.totalMembers}</Text>
                  <Text color="gray.400" fontSize="xs">Across all committees</Text>
                </Box>
              </Box>

              {/* Bids Tile */}
              <Box as={Link} to="/bids">
                <Box 
                  bg="gray.900" 
                  borderColor="gray.800" 
                  borderWidth="1px" 
                  rounded="lg" 
                  p={4}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ 
                    transform: 'translateY(-2px)', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    borderColor: 'green.500'
                  }}
                >
                  <Box display="flex" alignItems="center" gap={3} mb={3}>
                    <FileText size={20} color="#10b981" />
                    <Text color="white" fontWeight="medium" fontSize="sm">Bids</Text>
                  </Box>
                  <Text color="green.400" fontWeight="bold" fontSize="2xl" mb={0.5}>{stats.totalBids}</Text>
                  <Text color="gray.400" fontSize="xs">Total submissions</Text>
                </Box>
              </Box>

              {/* Activity Tile */}
              <Box as={Link} to="/about">
                <Box 
                  bg="gray.900" 
                  borderColor="gray.800" 
                  borderWidth="1px" 
                  rounded="lg" 
                  p={4}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ 
                    transform: 'translateY(-2px)', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    borderColor: 'purple.500'
                  }}
                >
                  <Box display="flex" alignItems="center" gap={3} mb={3}>
                    <TrendingUp size={20} color="#8b5cf6" />
                    <Text color="white" fontWeight="medium" fontSize="sm">Activity</Text>
                  </Box>
                  <Text color="purple.400" fontWeight="bold" fontSize="2xl" mb={0.5}>{stats.recentActivity.length}</Text>
                  <Text color="gray.400" fontSize="xs">Recent actions</Text>
                </Box>
              </Box>
            </SimpleGrid>

            {/* Four Information Sections */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
              {/* My Committees */}
              <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg">
                <Box px={3} py={2} borderBottomWidth="1px" borderColor="gray.800" display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Text color="white" fontWeight="semibold" fontSize="md">My Committees</Text>
                    <Text color="gray.400" fontSize="xs" mt={0.5}>Committees you're part of</Text>
                  </Box>
                  <Box as={Link} to="/committees" display="flex" alignItems="center" gap={1}>
                    <Text color="blue.400" fontSize="sm" cursor="pointer" _hover={{ textDecoration: "underline" }}>
                      View All
                    </Text>
                    <Text color="blue.400" fontSize="sm">→</Text>
                  </Box>
                </Box>
                <Box px={3} py={2} maxH="300px" overflowY="auto">
                  {stats.myCommittees.length > 0 ? (
                    <Stack gap={2}>
                      {stats.myCommittees.slice(0, 3).map((committee) => (
                        <Box key={committee.id} p={2} bg="gray.800" rounded="md" borderLeft="3px solid" borderColor="blue.400">
                          <Box display="grid" gridTemplateColumns="2fr 1fr 1fr" gap={3} mb={1.5}>
                            {/* Row 1 Column 1: Committee Name */}
                            <Box display="flex" alignItems="center" gap={2}>
                              <Text color="white" fontSize="xs" fontWeight="medium">
                                {committee.name}
                              </Text>
                            </Box>
                            {/* Row 1 Column 2: Full Share */}
                            <Box display="flex" alignItems="center">
                              <Text color="green.400" fontSize="xs" fontWeight="medium">
                                {committee.fullShare ? `₹${committee.fullShare}` : 'N/A'}
                              </Text>
                            </Box>
                            {/* Row 1 Column 3: Full Amount */}
                            <Box display="flex" alignItems="center" justifyContent="flex-start">
                              <Text color="white" fontSize="xs" fontWeight="medium">
                                {formatCurrency(committee.totalAmount)}
                              </Text>
                            </Box>
                          </Box>
                          <Box display="grid" gridTemplateColumns="2fr 1fr 1fr" gap={3}>
                            {/* Row 2 Column 1: Start Date */}
                            <Box>
                              <Text color="gray.500" fontSize="xs" mb={0.5}>Start Date</Text>
                              <Text color="gray.300" fontSize="xs">{formatDate(committee.startDate)}</Text>
                            </Box>
                            {/* Row 2 Column 2: Members Link */}
                            <Box>
                              <Text color="gray.500" fontSize="xs" mb={0.5}>Members</Text>
                              <Box 
                                as="button" 
                                onClick={() => openMembers(committee.id, committee.name)} 
                                title="View Members"
                                display="flex"
                                alignItems="center"
                                gap={1}
                                color="blue.300" 
                                _hover={{ color: 'blue.200', bg: 'gray.700' }} 
                                px={1.5}
                                py={0.5}
                                cursor="pointer" 
                                borderRadius="md"
                                transition="all 0.2s"
                              >
                                <Text fontSize="xs" fontWeight="semibold">
                                  {committee.membersCount}
                                </Text>
                                <Users size={14} />
                              </Box>
                            </Box>
                            {/* Row 2 Column 3: Bids Link */}
                            <Box>
                              <Text color="gray.500" fontSize="xs" mb={0.5}>Bids</Text>
                              <Box 
                                as="button" 
                                onClick={() => openBids(committee.id, committee.name)} 
                                title="View Bids"
                                display="flex"
                                alignItems="center"
                                gap={1}
                                color="blue.300" 
                                _hover={{ color: 'blue.200', bg: 'gray.700' }} 
                                px={1.5}
                                py={0.5}
                                cursor="pointer" 
                                borderRadius="md"
                                transition="all 0.2s"
                              >
                                <Text fontSize="xs" fontWeight="semibold">
                                  {committee.bidsRatio || '0'}
                                </Text>
                                <IndianRupee size={14} />
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Box textAlign="center" py={4}>
                      <Text color="gray.500" fontSize="sm">No committees</Text>
                      <Text color="gray.600" fontSize="xs">Join or create committees</Text>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Recent Bid Activity */}
              <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg">
                <Box px={3} py={2} borderBottomWidth="1px" borderColor="gray.800" display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Text color="white" fontWeight="semibold" fontSize="md">Recent Bid Activity</Text>
                    <Text color="gray.400" fontSize="xs" mt={0.5}>Latest bids from your committees</Text>
                  </Box>
                  <Box as={Link} to="/bids" display="flex" alignItems="center" gap={1}>
                    <Text color="blue.400" fontSize="sm" cursor="pointer" _hover={{ textDecoration: "underline" }}>
                      View All
                    </Text>
                    <Text color="blue.400" fontSize="sm">→</Text>
                  </Box>
                </Box>
                <Box px={3} py={2} maxH="300px" overflowY="auto">
                  {stats.recentActivity.length > 0 ? (
                    <Stack gap={2}>
                      {stats.recentActivity.slice(0, 3).map((activity) => (
                        <Box key={activity.id} p={2} bg="gray.800" rounded="md" borderLeft="3px solid" borderColor="green.400">
                          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                            <Text color="green.400" fontSize="xs" fontWeight="semibold">
                              {activity.committeeName}
                            </Text>
                            <Text color="gray.500" fontSize="xs">
                              {formatRelativeTime(activity.timestamp)}
                            </Text>
                          </Box>
                          <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
                            <Text color="white" fontSize="sm" lineHeight="1.3">
                              <Text as="span" color="blue.300" fontWeight="medium">{activity.bidderName}</Text>
                              <Text as="span"> bid </Text>
                              <Text as="span" color="blue.300" fontWeight="medium">{formatCurrency(activity.amount || 0)}</Text>
                            </Text>
                            {activity.monthlyShare && (
                              <Text color="green.400" fontSize="xs" fontWeight="semibold" whiteSpace="nowrap">
                                ₹{activity.monthlyShare}
                              </Text>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Box textAlign="center" py={4}>
                      <Text color="gray.500" fontSize="sm">No recent activity</Text>
                      <Text color="gray.600" fontSize="xs">Activity will appear here</Text>
                    </Box>
                  )}
                </Box>
              </Box>
            </SimpleGrid>
          </>
        )}
      </Stack>

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
              <Box as="button" onClick={() => setMembersModal(prev => ({ ...prev, open: false }))} px={4} py={2} bg="gray.700" rounded="md" color="white" _hover={{ bg: 'gray.600' }}>Close</Box>
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
              <Box as="button" onClick={() => setBidsModal(prev => ({ ...prev, open: false }))} px={4} py={2} bg="gray.700" rounded="md" color="white" _hover={{ bg: 'gray.600' }}>Close</Box>
            </DialogFooter>
          </DialogContent>
        </DialogPositioner>
      </DialogRoot>
    </Box>
  );
};

export default Dashboard;