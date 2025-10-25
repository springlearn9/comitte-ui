import React, { useState } from 'react';
import { 
  Box, 
  Text, 
  Stack, 
  Button, 
  Input, 
  Textarea
} from '@chakra-ui/react';
import { MessageCircle, Star, Send, CheckCircle } from 'lucide-react';

const Feedback: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 0,
    category: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        rating: 0,
        category: '',
        message: ''
      });
    }, 3000);
  };

  const categories = [
    'General Feedback',
    'Bug Report',
    'Feature Request',
    'User Experience',
    'Performance',
    'Other'
  ];

  return (
    <Box p={6}>
      <Box mb={6}>
        <Text as="h1" fontSize="2xl" fontWeight="bold" color="white" mb={2}>
          Feedback
        </Text>
        <Text color="gray.400" fontSize="lg">
          Help us improve Comitte by sharing your thoughts and suggestions
        </Text>
      </Box>

      {isSubmitted ? (
        <Box bg="gray.900" borderColor="green.500" borderWidth="2px" maxW="2xl" mx="auto" rounded="lg" p={6}>
          <Box textAlign="center" py={8}>
            <Box mb={4}>
              <CheckCircle size={48} color="#22c55e" style={{ margin: '0 auto' }} />
            </Box>
            <Text fontSize="xl" fontWeight="semibold" color="green.400" mb={2}>
              Thank You!
            </Text>
            <Text color="gray.300">
              Your feedback has been submitted successfully. We appreciate your input 
              and will use it to improve our platform.
            </Text>
          </Box>
        </Box>
      ) : (
        <Box display="grid" gridTemplateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
          {/* Feedback Form */}
          <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={6}>
            <Box mb={6}>
              <Box display="flex" alignItems="center" gap={3}>
                <Box p={2} bg="blue.600" rounded="md">
                  <MessageCircle size={20} color="white" />
                </Box>
                <Text fontSize="xl" fontWeight="semibold" color="white">
                  Share Your Feedback
                </Text>
              </Box>
            </Box>
            <form onSubmit={handleSubmit}>
              <Stack gap={4}>
                <Box display="grid" gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                  <Box>
                    <Text color="white" fontSize="sm" fontWeight="medium" mb={2}>
                      Name
                    </Text>
                    <Input
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      bg="gray.800"
                      borderColor="gray.700"
                      color="white"
                      _placeholder={{ color: 'gray.500' }}
                      _focus={{ borderColor: 'blue.400' }}
                      required
                    />
                  </Box>
                  <Box>
                    <Text color="white" fontSize="sm" fontWeight="medium" mb={2}>
                      Email
                    </Text>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      bg="gray.800"
                      borderColor="gray.700"
                      color="white"
                      _placeholder={{ color: 'gray.500' }}
                      _focus={{ borderColor: 'blue.400' }}
                      required
                    />
                  </Box>
                </Box>

                <Box>
                  <Text color="white" fontSize="sm" fontWeight="medium" mb={2}>
                    Rating
                  </Text>
                  <Box display="flex" gap={1}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        variant="ghost"
                        p={1}
                        minW="auto"
                        h="auto"
                        onClick={() => handleInputChange('rating', star)}
                      >
                        <Star
                          size={24}
                          fill={star <= formData.rating ? '#fbbf24' : 'none'}
                          color={star <= formData.rating ? '#fbbf24' : '#6b7280'}
                        />
                      </Button>
                    ))}
                  </Box>
                </Box>

                <Box>
                  <Text color="white" fontSize="sm" fontWeight="medium" mb={2}>
                    Category
                  </Text>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </Box>

                <Box>
                  <Text color="white" fontSize="sm" fontWeight="medium" mb={2}>
                    Message
                  </Text>
                  <Textarea
                    placeholder="Please share your feedback, suggestions, or report any issues..."
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    bg="gray.800"
                    borderColor="gray.700"
                    color="white"
                    _placeholder={{ color: 'gray.500' }}
                    _focus={{ borderColor: 'blue.400' }}
                    rows={5}
                    required
                  />
                </Box>

                <Button
                  type="submit"
                  colorPalette="gray"
                  variant="outline"
                  rounded="full"
                  bg="gray.600"
                  color="white"
                  borderColor="gray.500"
                  _hover={{ bg: 'white', color: 'black', borderColor: 'gray.400' }}
                  transition="all 0.2s"
                  loading={isLoading}
                  loadingText="Submitting..."
                  disabled={!formData.name || !formData.email || !formData.category || !formData.message}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Send size={16} />
                    Submit Feedback
                  </Box>
                </Button>
              </Stack>
            </form>
          </Box>

          {/* Info Section */}
          <Stack gap={4}>
            <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={4}>
              <Text fontSize="lg" fontWeight="semibold" color="white" mb={4}>
                Why Your Feedback Matters
              </Text>
              <Stack gap={3}>
                <Text color="gray.300" fontSize="sm">
                  • Help us identify and fix bugs
                </Text>
                <Text color="gray.300" fontSize="sm">
                  • Suggest new features and improvements
                </Text>
                <Text color="gray.300" fontSize="sm">
                  • Share your user experience insights
                </Text>
                <Text color="gray.300" fontSize="sm">
                  • Contribute to making Comitte better for everyone
                </Text>
              </Stack>
            </Box>

            <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={4}>
              <Text fontSize="lg" fontWeight="semibold" color="white" mb={4}>
                Response Time
              </Text>
              <Text color="gray.300" fontSize="sm">
                We typically respond to feedback within 2-3 business days. 
                For urgent issues, please contact our support team directly.
              </Text>
            </Box>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default Feedback;