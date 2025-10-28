import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Text, 
  Stack, 
  Button, 
  Input, 
  Textarea,
  SimpleGrid
} from '@chakra-ui/react';
import { 
  User, 
  Shield, 
  Bell, 
  Save,
  ArrowLeft,
  Camera
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { memberService } from '../services/memberService';
import PasswordChangeModal from '../components/PasswordChangeModal';

interface UserProfileData {
  memberId: number;
  username: string;
  email: string;
  name: string;
  mobile: string;
  aadharNo: string;
  address: string;
  createdTimestamp: string;
  updatedTimestamp?: string;
  // Additional profile fields
  dateOfBirth: string;
  avatar: string;
  // Settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  profileVisibility: boolean;
  twoFactorEnabled: boolean;
}

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState<UserProfileData>({
    memberId: 0,
    username: '',
    email: '',
    name: '',
    mobile: '',
    aadharNo: '',
    address: '',
    createdTimestamp: '',
    updatedTimestamp: '',
    dateOfBirth: '',
    avatar: '',
    emailNotifications: true,
    smsNotifications: false,
    profileVisibility: true,
    twoFactorEnabled: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'notifications'>('personal');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [effectiveMemberId, setEffectiveMemberId] = useState<number>(0);

  // Resolve member ID similar to other components
  useEffect(() => {
    const resolveMemberId = async () => {
      if (!user) return;
      const tryParse = (v: any) => {
        const n = Number(v); 
        return Number.isFinite(n) && n > 0 ? n : null;
      };
      
      // Try to get memberId from user object
      const m1 = tryParse((user as any)?.memberId ?? (user as any)?.memberID ?? (user as any)?.member?.id);
      if (m1) {
        setEffectiveMemberId(m1);
        return;
      }
      
      // If not found, search by username
      try {
        if (user.username) {
          const found = await memberService.searchMembers({ username: user.username });
          if (found?.length) {
            const m2 = tryParse(found[0].memberId);
            if (m2) {
              setEffectiveMemberId(m2);
              return;
            }
          }
        }
      } catch (error) {
        console.error('Error searching for member:', error);
      }
      
      // Fallback to user ID
      const m3 = tryParse(user.id);
      if (m3) setEffectiveMemberId(m3);
    };
    
    resolveMemberId();
  }, [user]);

  // Load member data once we have the member ID
  useEffect(() => {
    const loadMemberData = async () => {
      if (!effectiveMemberId || effectiveMemberId <= 0) return;
      
      setDataLoading(true);
      setErrorMessage('');
      
      try {
        const memberData = await memberService.getMemberById(effectiveMemberId);
        
        setProfileData(prev => ({
          ...prev,
          memberId: memberData.memberId,
          username: memberData.username,
          email: memberData.email,
          name: memberData.name || '',
          mobile: memberData.mobile || '',
          aadharNo: memberData.aadharNo || '',
          address: memberData.address || '',
          dateOfBirth: memberData.dob || '', // Map dob from API to dateOfBirth
          createdTimestamp: memberData.createdTimestamp,
          updatedTimestamp: memberData.updatedTimestamp,
        }));
      } catch (error: any) {
        console.error('Error loading member data:', error);
        setErrorMessage('Failed to load profile data. Please try again.');
        
        // Fallback to user data if API fails
        if (user) {
          setProfileData(prev => ({
            ...prev,
            memberId: effectiveMemberId,
            username: user.username || '',
            email: user.email || '',
          }));
        }
      } finally {
        setDataLoading(false);
      }
    };
    
    loadMemberData();
  }, [effectiveMemberId, user]);

  const handleInputChange = (field: keyof UserProfileData, value: string | boolean) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!effectiveMemberId || effectiveMemberId <= 0) {
      setErrorMessage('Invalid member ID. Cannot save profile.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Prepare data for API call
      const updateData = {
        username: profileData.username,
        email: profileData.email,
        name: profileData.name,
        mobile: profileData.mobile,
        aadharNo: profileData.aadharNo,
        address: profileData.address,
        dob: profileData.dateOfBirth, // Map dateOfBirth to dob for API
      };

      // Call the API to update member data
      const updatedMember = await memberService.updateMember(effectiveMemberId, updateData);
      
      // Update the local state with the response data
      setProfileData(prev => ({
        ...prev,
        username: updatedMember.username,
        email: updatedMember.email,
        name: updatedMember.name || '',
        mobile: updatedMember.mobile || '',
        aadharNo: updatedMember.aadharNo || '',
        address: updatedMember.address || '',
        updatedTimestamp: updatedMember.updatedTimestamp,
      }));
      
      setSuccessMessage('Profile updated successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to update profile. Please try again.';
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordSave = async (passwords: { current: string; new: string; confirm: string }) => {
    // Simulate API call for password change
    console.log('Changing password:', passwords.current ? '[current password hidden]' : '', passwords.new ? '[new password hidden]' : '');
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSuccessMessage('Password changed successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleAccountDeactivation = () => {
    // Handle account deactivation
    console.log('Account deactivation requested');
  };

  return (
    <Box p={6}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={4} mb={6}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          color="gray.400"
          _hover={{ color: 'white', bg: 'gray.800' }}
        >
          <ArrowLeft size={16} />
        </Button>
        <Box>
          <Text as="h1" fontSize="2xl" fontWeight="bold" color="white" mb={1}>
            Profile Settings
          </Text>
          <Text color="gray.400" fontSize="md">
            Manage your account settings and preferences
          </Text>
        </Box>
      </Box>

      {/* Success/Error Messages */}
      {successMessage && (
        <Box bg="green.900" borderColor="green.600" borderWidth="1px" rounded="lg" p={4} mb={4}>
          <Text color="green.200">{successMessage}</Text>
        </Box>
      )}
      
      {errorMessage && (
        <Box bg="red.900" borderColor="red.600" borderWidth="1px" rounded="lg" p={4} mb={4}>
          <Text color="red.200">{errorMessage}</Text>
        </Box>
      )}

      {/* Loading State */}
      {dataLoading && (
        <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={8} textAlign="center">
          <Text color="gray.400">Loading profile data...</Text>
        </Box>
      )}

      {!dataLoading && (
        <Box>
          {/* Horizontal Navigation Tabs */}
          <Box mb={6}>
            <Box display="flex" gap={2} borderBottom="1px solid" borderColor="gray.800" pb={4}>
              <Button
                variant={activeTab === 'personal' ? 'solid' : 'ghost'}
                bg={activeTab === 'personal' ? 'blue.600' : 'transparent'}
                color={activeTab === 'personal' ? 'white' : 'gray.400'}
                _hover={{ bg: activeTab === 'personal' ? 'blue.700' : 'gray.800', color: 'white' }}
                onClick={() => setActiveTab('personal')}
                size={{ base: 'sm', md: 'md' }}
                borderRadius="md"
                title="Personal Information"
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <User size={16} />
                  <Text display={{ base: 'none', md: 'block' }}>Personal Information</Text>
                </Box>
              </Button>
              
              <Button
                variant={activeTab === 'security' ? 'solid' : 'ghost'}
                bg={activeTab === 'security' ? 'blue.600' : 'transparent'}
                color={activeTab === 'security' ? 'white' : 'gray.400'}
                _hover={{ bg: activeTab === 'security' ? 'blue.700' : 'gray.800', color: 'white' }}
                onClick={() => setActiveTab('security')}
                size={{ base: 'sm', md: 'md' }}
                borderRadius="md"
                title="Security"
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Shield size={16} />
                  <Text display={{ base: 'none', md: 'block' }}>Security</Text>
                </Box>
              </Button>
              
              <Button
                variant={activeTab === 'notifications' ? 'solid' : 'ghost'}
                bg={activeTab === 'notifications' ? 'blue.600' : 'transparent'}
                color={activeTab === 'notifications' ? 'white' : 'gray.400'}
                _hover={{ bg: activeTab === 'notifications' ? 'blue.700' : 'gray.800', color: 'white' }}
                onClick={() => setActiveTab('notifications')}
                size={{ base: 'sm', md: 'md' }}
                borderRadius="md"
                title="Notifications"
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Bell size={16} />
                  <Text display={{ base: 'none', md: 'block' }}>Notifications</Text>
                </Box>
              </Button>
            </Box>
          </Box>

          {/* Content Area */}
          <Box>
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={6}>
              <Text fontSize="xl" fontWeight="semibold" color="white" mb={6}>
                Personal Information
              </Text>
              
              {/* Profile Picture */}
              <Box mb={6}>
                <Text color="white" fontSize="sm" fontWeight="medium" mb={3}>
                  Profile Picture
                </Text>
                <Box display="flex" alignItems="center" gap={4}>
                  <Box
                    w={20}
                    h={20}
                    bg="gray.700"
                    rounded="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {profileData.avatar ? (
                      <img
                        src={profileData.avatar}
                        alt="Profile"
                        style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                      />
                    ) : (
                      <User size={32} color="#9ca3af" />
                    )}
                  </Box>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="gray"
                    bg="gray.600"
                    color="white"
                    borderColor="gray.500"
                    _hover={{ bg: 'white', color: 'black' }}
                  >
                    <Box display="flex" alignItems="center" gap={2}>
                      <Camera size={14} />
                      Change Photo
                    </Box>
                  </Button>
                </Box>
              </Box>

              <Stack gap={4}>
                <Box>
                  <Text color="white" fontSize="sm" fontWeight="medium" mb={2}>
                    Full Name
                  </Text>
                  <Input
                    placeholder="Enter your full name"
                    value={profileData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    bg="gray.800"
                    borderColor="gray.700"
                    color="white"
                    _placeholder={{ color: 'gray.500' }}
                    _focus={{ borderColor: 'blue.400' }}
                  />
                </Box>

                <Box>
                  <Text color="white" fontSize="sm" fontWeight="medium" mb={2}>
                    Username
                  </Text>
                  <Input
                    placeholder="Enter username"
                    value={profileData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    bg="gray.800"
                    borderColor="gray.700"
                    color="white"
                    _placeholder={{ color: 'gray.500' }}
                    _focus={{ borderColor: 'blue.400' }}
                  />
                </Box>

                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <Box>
                    <Text color="white" fontSize="sm" fontWeight="medium" mb={2}>
                      Email Address
                    </Text>
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      bg="gray.800"
                      borderColor="gray.700"
                      color="white"
                      _placeholder={{ color: 'gray.500' }}
                      _focus={{ borderColor: 'blue.400' }}
                    />
                  </Box>
                  
                  <Box>
                    <Text color="white" fontSize="sm" fontWeight="medium" mb={2}>
                      Phone Number
                    </Text>
                    <Input
                      placeholder="Enter phone number"
                      value={profileData.mobile}
                      onChange={(e) => handleInputChange('mobile', e.target.value)}
                      bg="gray.800"
                      borderColor="gray.700"
                      color="white"
                      _placeholder={{ color: 'gray.500' }}
                      _focus={{ borderColor: 'blue.400' }}
                    />
                  </Box>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <Box>
                    <Text color="white" fontSize="sm" fontWeight="medium" mb={2}>
                      Date of Birth
                    </Text>
                    <Input
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      bg="gray.800"
                      borderColor="gray.700"
                      color="white"
                      _focus={{ borderColor: 'blue.400' }}
                    />
                  </Box>
                  
                  <Box>
                    <Text color="white" fontSize="sm" fontWeight="medium" mb={2}>
                      Aadhar Number
                    </Text>
                    <Input
                      placeholder="Enter 12-digit Aadhar number"
                      value={profileData.aadharNo}
                      onChange={(e) => handleInputChange('aadharNo', e.target.value)}
                      bg="gray.800"
                      borderColor="gray.700"
                      color="white"
                      _placeholder={{ color: 'gray.500' }}
                      _focus={{ borderColor: 'blue.400' }}
                      maxLength={12}
                    />
                  </Box>
                </SimpleGrid>

                <Box>
                  <Text color="white" fontSize="sm" fontWeight="medium" mb={2}>
                    Address
                  </Text>
                  <Textarea
                    placeholder="Enter your address"
                    value={profileData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    bg="gray.800"
                    borderColor="gray.700"
                    color="white"
                    _placeholder={{ color: 'gray.500' }}
                    _focus={{ borderColor: 'blue.400' }}
                    rows={3}
                  />
                </Box>
              </Stack>
            </Box>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={6}>
              <Text fontSize="xl" fontWeight="semibold" color="white" mb={6}>
                Security Settings
              </Text>
              
              <Stack gap={6}>
                <Box>
                  <Text color="white" fontSize="lg" fontWeight="medium" mb={4}>
                    Password
                  </Text>
                  <Box display="flex" justifyContent="space-between" alignItems="center" p={4} bg="gray.800" rounded="lg">
                    <Box>
                      <Text color="white" fontSize="sm" fontWeight="medium">
                        Change Password
                      </Text>
                      <Text color="gray.400" fontSize="xs">
                        Last changed 3 months ago
                      </Text>
                    </Box>
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="gray"
                      bg="gray.600"
                      color="white"
                      borderColor="gray.500"
                      _hover={{ bg: 'white', color: 'black' }}
                      onClick={handlePasswordChange}
                    >
                      Change
                    </Button>
                  </Box>
                </Box>

                <Box>
                  <Text color="white" fontSize="lg" fontWeight="medium" mb={4}>
                    Two-Factor Authentication
                  </Text>
                  <Box display="flex" justifyContent="space-between" alignItems="center" p={4} bg="gray.800" rounded="lg">
                    <Box>
                      <Text color="white" fontSize="sm" fontWeight="medium">
                        Two-Factor Authentication
                      </Text>
                      <Text color="gray.400" fontSize="xs">
                        Add an extra layer of security to your account
                      </Text>
                    </Box>
                    <input
                      type="checkbox"
                      checked={profileData.twoFactorEnabled}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('twoFactorEnabled', e.target.checked)}
                      style={{
                        width: '20px',
                        height: '20px',
                        accentColor: '#3b82f6'
                      }}
                    />
                  </Box>
                </Box>

                <Box>
                  <Text color="white" fontSize="lg" fontWeight="medium" mb={4}>
                    Profile Visibility
                  </Text>
                  <Box display="flex" justifyContent="space-between" alignItems="center" p={4} bg="gray.800" rounded="lg">
                    <Box>
                      <Text color="white" fontSize="sm" fontWeight="medium">
                        Public Profile
                      </Text>
                      <Text color="gray.400" fontSize="xs">
                        Allow others to view your profile information
                      </Text>
                    </Box>
                    <input
                      type="checkbox"
                      checked={profileData.profileVisibility}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('profileVisibility', e.target.checked)}
                      style={{
                        width: '20px',
                        height: '20px',
                        accentColor: '#3b82f6'
                      }}
                    />
                  </Box>
                </Box>

                <Box>
                  <Text color="white" fontSize="lg" fontWeight="medium" mb={4}>
                    Danger Zone
                  </Text>
                  <Box p={4} bg="red.900" borderColor="red.600" borderWidth="1px" rounded="lg">
                    <Text color="red.200" fontSize="sm" fontWeight="medium" mb={2}>
                      Deactivate Account
                    </Text>
                    <Text color="red.300" fontSize="xs" mb={4}>
                      Once you deactivate your account, you will lose access to all committee data.
                    </Text>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={handleAccountDeactivation}
                    >
                      Deactivate Account
                    </Button>
                  </Box>
                </Box>
              </Stack>
            </Box>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={6}>
              <Text fontSize="xl" fontWeight="semibold" color="white" mb={6}>
                Notification Preferences
              </Text>
              
              <Stack gap={4}>
                <Box display="flex" justifyContent="space-between" alignItems="center" p={4} bg="gray.800" rounded="lg">
                  <Box>
                    <Text color="white" fontSize="sm" fontWeight="medium">
                      Email Notifications
                    </Text>
                    <Text color="gray.400" fontSize="xs">
                      Receive notifications via email
                    </Text>
                  </Box>
                  <input
                    type="checkbox"
                    checked={profileData.emailNotifications}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('emailNotifications', e.target.checked)}
                    style={{
                      width: '20px',
                      height: '20px',
                      accentColor: '#3b82f6'
                    }}
                  />
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center" p={4} bg="gray.800" rounded="lg">
                  <Box>
                    <Text color="white" fontSize="sm" fontWeight="medium">
                      SMS Notifications
                    </Text>
                    <Text color="gray.400" fontSize="xs">
                      Receive notifications via SMS
                    </Text>
                  </Box>
                  <input
                    type="checkbox"
                    checked={profileData.smsNotifications}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('smsNotifications', e.target.checked)}
                    style={{
                      width: '20px',
                      height: '20px',
                      accentColor: '#3b82f6'
                    }}
                  />
                </Box>

                <Box p={4} bg="gray.800" rounded="lg">
                  <Text color="white" fontSize="sm" fontWeight="medium" mb={3}>
                    Email Notification Types
                  </Text>
                  <Stack gap={3}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Text color="gray.300" fontSize="xs">Committee updates</Text>
                      <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }} />
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Text color="gray.300" fontSize="xs">Bid notifications</Text>
                      <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }} />
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Text color="gray.300" fontSize="xs">Member activity</Text>
                      <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }} />
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Text color="gray.300" fontSize="xs">Security alerts</Text>
                      <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }} />
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          )}

          {/* Save Button */}
          <Box mt={6} display="flex" justifyContent="flex-end">
            <Button
              colorScheme="blue"
              bg="blue.600"
              color="white"
              _hover={{ bg: 'blue.500' }}
              loading={isLoading}
              loadingText="Saving..."
              onClick={handleSave}
              size="lg"
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Save size={16} />
                Save Changes
              </Box>
            </Button>
          </Box>
        </Box>
        </Box>
      )}

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSave={handlePasswordSave}
      />
    </Box>
  );
};

export default UserProfile;