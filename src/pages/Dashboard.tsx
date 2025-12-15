import React, { useEffect, useState } from 'react';
import { Box, Stack, Heading, Text, SimpleGrid, Badge } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { memberService } from '../services/memberService';
import { committeeService } from '../services/committeeService';
import { bidService } from '../services/bidService';
import { IndianRupee, Calendar, User, Users, Building, FileText, TrendingUp } from 'lucide-react';

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
    membersCount: number;
    status: string;
    createdDate: string;
  }>;
  ownedCommittees: Array<{
    id: number;
    name: string;
    totalAmount: number;
    membersCount: number;
    status: string;
    createdDate: string;
  }>;
  allMembers: Array<{
    id: number;
    name: string;
    email: string;
    committeesCount: number;
    status: string;
  }>;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalCommittees: 0,
    totalMembers: 0,
    totalBids: 0,
    recentActivity: [],
    myCommittees: [],
    ownedCommittees: [],
    allMembers: []
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
        const [committeesData, bidsData, ownedCommitteesData] = await Promise.all([
          committeeService.getByMember(memberId).catch(() => []),
          bidService.getByMember(memberId).catch(() => []),
          committeeService.getByOwner(memberId).catch(() => [])
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

        // Process committees data for display
        const myCommittees = committeesData.slice(0, 5).map(committee => ({
          id: committee.comitteId,
          name: committee.comitteName || 'Unnamed Committee',
          totalAmount: committee.totalAmount || 0,
          membersCount: memberCounts[committeesData.indexOf(committee)] || 0,
          status: 'ACTIVE',
          createdDate: committee.createdTimestamp || new Date().toISOString()
        }));

        // Calculate member counts for owned committees
        const ownedMemberCounts = await Promise.all(
          ownedCommitteesData.map(async (committee) => {
            try {
              const members = await memberService.getByCommittee(committee.comitteId);
              return members.length;
            } catch {
              return 0;
            }
          })
        );

        // Process owned committees using the getByOwner API data
        const ownedCommittees = ownedCommitteesData.slice(0, 5).map((committee, index) => ({
          id: committee.comitteId,
          name: committee.comitteName || 'Unnamed Committee',
          totalAmount: committee.fullAmount || 0,
          membersCount: ownedMemberCounts[index] || 0,
          status: 'OWNED',
          createdDate: committee.createdTimestamp || new Date().toISOString()
        }));

        // Fetch all members from all committees
        const allMembersSet = new Set();
        const allMembersArray = [];
        
        for (const committee of committeesData) {
          try {
            const members = await memberService.getByCommittee(committee.comitteId);
            members.forEach(member => {
              if (!allMembersSet.has(member.memberId)) {
                allMembersSet.add(member.memberId);
                allMembersArray.push({
                  id: member.memberId,
                  name: member.memberName || 'Unknown Member',
                  email: member.email || 'No email',
                  committeesCount: 1, // This could be calculated more accurately
                  status: 'ACTIVE'
                });
              }
            });
          } catch (error) {
            // Handle error silently
          }
        }

        setStats({
          totalCommittees: committeesData.length,
          totalMembers: totalMembersCount,
          totalBids: bidsData.length,
          recentActivity: recentActivities,
          myCommittees: myCommittees,
          ownedCommittees: ownedCommittees,
          allMembers: allMembersArray.slice(0, 8) // Show first 8 members
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
          <Heading size="lg" color="white" mb={2}>
            Welcome back, {user?.username || 'User'}!
          </Heading>
          <Text color="gray.400" fontSize="sm">
            Committee Management Portal Dashboard
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
                  <Text color="red.500" fontWeight="bold" fontSize="2xl" mb={1}>{stats.totalCommittees}</Text>
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
                  <Text color="blue.400" fontWeight="bold" fontSize="2xl" mb={1}>{stats.totalMembers}</Text>
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
                  <Text color="green.400" fontWeight="bold" fontSize="2xl" mb={1}>{stats.totalBids}</Text>
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
                  <Text color="purple.400" fontWeight="bold" fontSize="2xl" mb={1}>{stats.recentActivity.length}</Text>
                  <Text color="gray.400" fontSize="xs">Recent activities</Text>
                </Box>
              </Box>
            </SimpleGrid>

            {/* Four Information Sections */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
              {/* Recent Bid Activity */}
              <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg">
                <Box px={4} py={3} borderBottomWidth="1px" borderColor="gray.800" display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Text color="white" fontWeight="semibold" fontSize="md">Recent Bid Activity</Text>
                    <Text color="gray.400" fontSize="xs" mt={1}>Latest bids from your committees</Text>
                  </Box>
                  <Box as={Link} to="/bids" display="flex" alignItems="center" gap={1}>
                    <Text color="blue.400" fontSize="sm" cursor="pointer" _hover={{ textDecoration: "underline" }}>
                      View All
                    </Text>
                    <Text color="blue.400">→</Text>
                  </Box>
                </Box>
                <Box px={4} py={3} maxH="300px" overflowY="auto">
                  {stats.recentActivity.length > 0 ? (
                    <Stack gap={3}>
                      {stats.recentActivity.slice(0, 3).map((activity) => (
                        <Box key={activity.id} p={3} bg="gray.800" rounded="md" borderLeft="3px solid" borderColor="green.400">
                          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                            <Text color="green.400" fontSize="xs" fontWeight="semibold">
                              {activity.committeeName}
                            </Text>
                            <Text color="gray.500" fontSize="xs">
                              {formatRelativeTime(activity.timestamp)}
                            </Text>
                          </Box>
                          <Text color="white" fontSize="sm" lineHeight="1.3">
                            <Text as="span" color="blue.300" fontWeight="medium">{activity.bidderName}</Text>
                            <Text as="span"> bid </Text>
                            <Text as="span" color="blue.300" fontWeight="medium">{formatCurrency(activity.amount || 0)}</Text>
                          </Text>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Box textAlign="center" py={6}>
                      <Text color="gray.500" fontSize="sm">No recent activity</Text>
                      <Text color="gray.600" fontSize="xs">Activity will appear here</Text>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* My Committees */}
              <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg">
                <Box px={4} py={3} borderBottomWidth="1px" borderColor="gray.800" display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Text color="white" fontWeight="semibold" fontSize="md">My Committees</Text>
                    <Text color="gray.400" fontSize="xs" mt={1}>Committees you're part of</Text>
                  </Box>
                  <Box as={Link} to="/committees" display="flex" alignItems="center" gap={1}>
                    <Text color="blue.400" fontSize="sm" cursor="pointer" _hover={{ textDecoration: "underline" }}>
                      View All
                    </Text>
                    <Text color="blue.400">→</Text>
                  </Box>
                </Box>
                <Box px={4} py={3} maxH="300px" overflowY="auto">
                  {stats.myCommittees.length > 0 ? (
                    <Stack gap={3}>
                      {stats.myCommittees.slice(0, 3).map((committee) => (
                        <Box key={committee.id} p={3} bg="gray.800" rounded="md" borderLeft="3px solid" borderColor="blue.400">
                          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                            <Text color="white" fontSize="sm" fontWeight="medium">
                              {committee.name}
                            </Text>
                            <Badge colorScheme="blue" fontSize="xs">ACTIVE</Badge>
                          </Box>
                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Text color="gray.400" fontSize="xs">
                              {committee.membersCount} members
                            </Text>
                            <Text color="green.400" fontSize="xs" fontWeight="medium">
                              {formatCurrency(committee.totalAmount)}
                            </Text>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Box textAlign="center" py={6}>
                      <Text color="gray.500" fontSize="sm">No committees</Text>
                      <Text color="gray.600" fontSize="xs">Join or create committees</Text>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Owned Committees */}
              <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg">
                <Box px={4} py={3} borderBottomWidth="1px" borderColor="gray.800" display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Text color="white" fontWeight="semibold" fontSize="md">Owned Committees</Text>
                    <Text color="gray.400" fontSize="xs" mt={1}>Committees you manage</Text>
                  </Box>
                  <Box as={Link} to="/committees" display="flex" alignItems="center" gap={1}>
                    <Text color="blue.400" fontSize="sm" cursor="pointer" _hover={{ textDecoration: "underline" }}>
                      View All
                    </Text>
                    <Text color="blue.400">→</Text>
                  </Box>
                </Box>
                <Box px={4} py={3} maxH="300px" overflowY="auto">
                  {stats.ownedCommittees.length > 0 ? (
                    <Stack gap={3}>
                      {stats.ownedCommittees.slice(0, 3).map((committee) => (
                        <Box key={committee.id} p={3} bg="gray.800" rounded="md" borderLeft="3px solid" borderColor="orange.400">
                          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                            <Text color="white" fontSize="sm" fontWeight="medium">
                              {committee.name}
                            </Text>
                            <Badge colorScheme="orange" fontSize="xs">OWNER</Badge>
                          </Box>
                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Text color="gray.400" fontSize="xs">
                              {committee.membersCount} members
                            </Text>
                            <Text color="green.400" fontSize="xs" fontWeight="medium">
                              {formatCurrency(committee.totalAmount)}
                            </Text>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Box textAlign="center" py={6}>
                      <Text color="gray.500" fontSize="sm">No owned committees</Text>
                      <Text color="gray.600" fontSize="xs">Create your first committee</Text>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* All Members */}
              <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg">
                <Box px={4} py={3} borderBottomWidth="1px" borderColor="gray.800" display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Text color="white" fontWeight="semibold" fontSize="md">All Members</Text>
                    <Text color="gray.400" fontSize="xs" mt={1}>Active committee members</Text>
                  </Box>
                  <Box as={Link} to="/profile" display="flex" alignItems="center" gap={1}>
                    <Text color="blue.400" fontSize="sm" cursor="pointer" _hover={{ textDecoration: "underline" }}>
                      View All
                    </Text>
                    <Text color="blue.400">→</Text>
                  </Box>
                </Box>
                <Box px={4} py={3} maxH="300px" overflowY="auto">
                  {stats.allMembers.length > 0 ? (
                    <Stack gap={3}>
                      {stats.allMembers.slice(0, 4).map((member) => (
                        <Box key={member.id} p={3} bg="gray.800" rounded="md" borderLeft="3px solid" borderColor="purple.400">
                          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                            <Text color="white" fontSize="sm" fontWeight="medium">
                              {member.name}
                            </Text>
                            <Badge colorScheme="green" fontSize="xs">ACTIVE</Badge>
                          </Box>
                          <Text color="gray.400" fontSize="xs" mb={1}>
                            {member.email}
                          </Text>
                          <Text color="purple.400" fontSize="xs">
                            {member.committeesCount} committees
                          </Text>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Box textAlign="center" py={6}>
                      <Text color="gray.500" fontSize="sm">No members found</Text>
                      <Text color="gray.600" fontSize="xs">Members will appear here</Text>
                    </Box>
                  )}
                </Box>
              </Box>
            </SimpleGrid>
          </>
        )}
      </Stack>
    </Box>
  );
};

export default Dashboard;