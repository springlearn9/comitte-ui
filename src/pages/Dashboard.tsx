import React, { useEffect, useState } from 'react';
import { Box, Stack, Heading, Text, SimpleGrid, Badge } from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';
import { memberService } from '../services/memberService';
import { committeeService } from '../services/committeeService';
import { bidService } from '../services/bidService';
import { IndianRupee, Calendar, User } from 'lucide-react';

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
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalCommittees: 0,
    totalMembers: 0,
    totalBids: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      
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
        const [committeesData, bidsData] = await Promise.all([
          committeeService.getByMember(memberId).catch(() => []),
          bidService.getByMember(memberId).catch(() => [])
        ]);

        // Calculate total members across all committees
        let totalMembersCount = 0;
        const memberCounts = await Promise.all(
          committeesData.map(async (committee) => {
            try {
              const members = await memberService.getByCommittee(committee.comitteId);
              return members.length;
            } catch {
              return 0;
            }
          })
        );
        totalMembersCount = memberCounts.reduce((sum, count) => sum + count, 0);

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
        committeesData.forEach((committee) => {
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
            const matchingCommittee = committeesData.find(c => c.comitteId === bid.comitteId);
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

        setStats({
          totalCommittees: committeesData.length,
          totalMembers: totalMembersCount,
          totalBids: bidsData.length,
          recentActivity: recentActivities
        });

      } catch (err: any) {
        setError(err?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

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
          <Heading size={{ base: 'lg', sm: 'xl' }} color="white" mb={2}>
            Welcome back, {user?.username || 'User'}!
          </Heading>
          <Text color="gray.400" fontSize={{ base: 'sm', sm: 'md' }}>
            Committee Management Dashboard
          </Text>
        </Box>

        {loading && (
          <Text color="gray.400">Loading dashboard data...</Text>
        )}

        {error && (
          <Box bg="red.900" borderColor="red.800" borderWidth="1px" rounded="lg" p={4}>
            <Text color="red.400">{error}</Text>
          </Box>
        )}

        {!loading && !error && (
          <>
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={{ base: 4, sm: 6 }}>
              <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={{ base: 4, sm: 5 }}>
                <Text color="white" fontWeight="semibold" fontSize={{ base: 'md', sm: 'lg' }} mb={2}>Total Committees</Text>
                <Text color="red.500" fontWeight="bold" fontSize={{ base: '2xl', sm: '3xl' }}>{stats.totalCommittees}</Text>
                <Text color="gray.400" fontSize={{ base: 'xs', sm: 'sm' }}>Your committees</Text>
              </Box>

              <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={{ base: 4, sm: 5 }}>
                <Text color="white" fontWeight="semibold" fontSize={{ base: 'md', sm: 'lg' }} mb={2}>Total Members</Text>
                <Text color="blue.400" fontWeight="bold" fontSize={{ base: '2xl', sm: '3xl' }}>{stats.totalMembers}</Text>
                <Text color="gray.400" fontSize={{ base: 'xs', sm: 'sm' }}>Across all committees</Text>
              </Box>

              <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={{ base: 4, sm: 5 }} gridColumn={{ base: 'auto', sm: 'span 2', lg: 'auto' }}>
                <Text color="white" fontWeight="semibold" fontSize={{ base: 'md', sm: 'lg' }} mb={2}>Recent Bids</Text>
                <Text color="green.400" fontWeight="bold" fontSize={{ base: '2xl', sm: '3xl' }}>{stats.totalBids}</Text>
                <Text color="gray.400" fontSize={{ base: 'xs', sm: 'sm' }}>Total bid submissions</Text>
              </Box>
            </SimpleGrid>

            <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg">
              <Box px={{ base: 4, sm: 5 }} py={{ base: 3, sm: 4 }} borderBottomWidth="1px" borderColor="gray.800">
                <Text color="white" fontWeight="semibold" fontSize={{ base: 'lg', sm: 'xl' }}>Recent Bid Activity</Text>
                <Text color="gray.400" fontSize="sm" mt={1}>Latest bids from all your committees</Text>
              </Box>
              <Box px={{ base: 4, sm: 5 }} py={{ base: 3, sm: 4 }}>
                {stats.recentActivity.length > 0 ? (
                  <Stack gap={3}>
                    {stats.recentActivity.map((activity) => (
                      <Box key={activity.id} bg="gray.800" rounded="lg" p={4} borderLeft="4px solid" borderColor="green.500">
                        <Box display="flex" alignItems="start" justifyContent="between" gap={3}>
                          <Box flex="1">
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                              <Box display="flex" alignItems="center" gap={2}>
                                <Text color="green.400" fontSize="sm" fontWeight="bold">
                                  {activity.committeeName}
                                </Text>
                              </Box>
                              {activity.bidsRatio && (
                                <Text color="gray.400" fontSize="xs">
                                  ({activity.bidsRatio})
                                </Text>
                              )}
                            </Box>
                            
                            <Text color="white" fontSize={{ base: 'sm', sm: 'md' }} mb={3} lineHeight="1.5">
                              <Text as="span" color="blue.400" fontWeight="bold">{activity.bidderName}</Text>
                              <Text as="span"> picked it at a loss of </Text>
                              <Text as="span" color="blue.400" fontWeight="bold">{formatCurrency(activity.amount || 0)}</Text>
                            </Text>
                            
                            {activity.monthlyShare && (
                              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                                <Box display="flex" alignItems="center" gap={2}>
                                  <Text color="gray.400" fontSize="xs">Monthly Share</Text>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <IndianRupee size={14} color="#ef4444" />
                                    <Text color="red.400" fontSize="md" fontWeight="bold">
                                      {formatCurrency(activity.monthlyShare)}
                                    </Text>
                                  </Box>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Calendar size={12} color="#9ca3af" />
                                  <Text color="gray.400" fontSize="xs">
                                    {formatRelativeTime(activity.timestamp)}
                                  </Text>
                                </Box>
                              </Box>
                            )}
                            {!activity.monthlyShare && (
                              <Box display="flex" alignItems="center" justifyContent="flex-end" gap={2}>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Calendar size={12} color="#9ca3af" />
                                  <Text color="gray.400" fontSize="xs">
                                    {formatRelativeTime(activity.timestamp)}
                                  </Text>
                                </Box>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Box textAlign="center" py={8}>
                    <Text color="gray.500" fontSize="sm" mb={2}>No recent bid activity</Text>
                    <Text color="gray.600" fontSize="xs">Bid activity from your committees will appear here</Text>
                  </Box>
                )}
              </Box>
            </Box>
          </>
        )}
      </Stack>
    </Box>
  );
};

export default Dashboard;