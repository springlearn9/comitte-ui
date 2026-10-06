import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, GridItem, Image, Stack, Text } from '@chakra-ui/react';
import { Edit } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { propertyService } from '../../../services/propertyService';
import { propertyMediaService } from '../../../services/propertyMediaService';
import type { PropertyMedia, PropertyResponse } from '../../../types/property';
import CreateEditPropertyModal from './CreateEditPropertyModal';

const formatCurrency = (value?: number) => {
  if (value == null) return 'Rs 0';
  return `Rs ${Math.round(value).toLocaleString()}`;
};

const PropertyDetails: React.FC = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [media, setMedia] = useState<PropertyMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const loadProperty = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await propertyService.getById(Number(id));
      const inlineMedia = data.media || [];
      if (inlineMedia.length > 0) {
        setMedia(inlineMedia);
      } else {
        try {
          const fallbackMedia = await propertyMediaService.getPropertyMedia(Number(id));
          setMedia(fallbackMedia || []);
        } catch {
          setMedia([]);
        }
      }
      setProperty(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProperty();
  }, [id]);

  if (loading) {
    return (
      <Box p={6}>
        <Text color="gray.400">Loading property details...</Text>
      </Box>
    );
  }

  if (error || !property) {
    return (
      <Box p={6}>
        <Box bg="red.900" borderColor="red.700" borderWidth="1px" p={4} rounded="md">
          <Text color="red.200">{error || 'Property not found'}</Text>
        </Box>
      </Box>
    );
  }

  const location = property.locationDetails;
  const coords = location?.latitude != null && location?.longitude != null
    ? `${location.latitude}, ${location.longitude}`
    : '';
  const googleLink = location?.mapUrl
    || (coords ? `https://www.google.com/maps?q=${encodeURIComponent(coords)}` : undefined);
  const embedUrl = coords
    ? `https://www.google.com/maps?q=${encodeURIComponent(coords)}&z=14&output=embed`
    : undefined;
  const primaryMedia = media.find((item) => item.isPrimary) || media[0];
  const otherMedia = media.filter((item) => item.id !== primaryMedia?.id);

  return (
    <Box p={6}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Box>
          <Text as="h1" fontSize="xl" fontWeight="bold" color="white" mb={1}>{property.title}</Text>
          <Text color="gray.400" fontSize="xs">{property.propertyType} • {property.listingType} • {property.status}</Text>
        </Box>
        <Stack direction="row" align="center" gap={2}>
          <Link to="/property/listings">
            <Text color="red.400" fontSize="sm" _hover={{ color: 'red.300' }}>Back to listings</Text>
          </Link>
          {isAuthenticated && (
            <Button
              size="sm"
              bg="red.500"
              color="white"
              _hover={{ bg: 'red.600' }}
              onClick={() => setIsEditOpen(true)}
            >
              <Box as="span" display="inline-flex" alignItems="center" gap={1}>
                <Edit size={14} />
                Edit
              </Box>
            </Button>
          )}
        </Stack>
      </Box>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={4}>
        <GridItem>
          <Stack gap={4}>
            <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={4}>
              <Text color="white" fontWeight="semibold" mb={2}>Media</Text>
              {!primaryMedia ? (
                <Text color="gray.500" fontSize="sm">No media available for this listing.</Text>
              ) : (
                <Stack gap={3}>
                  {primaryMedia.mediaType === 'VIDEO' ? (
                    <video
                      src={primaryMedia.mediaUrl}
                      controls
                      style={{ width: '100%', maxHeight: '420px', borderRadius: '8px', background: '#111827' }}
                    />
                  ) : (
                    <Image
                      src={primaryMedia.mediaUrl}
                      alt="Primary property media"
                      w="full"
                      maxH="420px"
                      objectFit="cover"
                      rounded="md"
                      bg="gray.800"
                    />
                  )}

                  {otherMedia.length > 0 && (
                    <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={2}>
                      {otherMedia.map((item, idx) => (
                        <GridItem key={item.id || `${item.mediaUrl}-${idx}`}>
                          {item.mediaType === 'VIDEO' ? (
                            <Box h="72px" bg="gray.800" rounded="md" display="flex" alignItems="center" justifyContent="center" borderWidth="1px" borderColor="gray.700">
                              <Text color="gray.400" fontSize="xs">Video</Text>
                            </Box>
                          ) : (
                            <Image
                              src={item.mediaUrl}
                              alt={`Property media ${idx + 1}`}
                              h="72px"
                              w="full"
                              objectFit="cover"
                              rounded="md"
                              bg="gray.800"
                            />
                          )}
                        </GridItem>
                      ))}
                    </Grid>
                  )}
                </Stack>
              )}
            </Box>

            <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={4}>
              <Text color="white" fontWeight="semibold" mb={2}>Overview</Text>
              <Text color="gray.200" fontSize="sm" mb={3}>{property.description || 'No description provided.'}</Text>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={3}>
                <Box><Text color="gray.500" fontSize="xs">Price</Text><Text color="white" fontSize="sm">{formatCurrency(property.price)}</Text></Box>
                <Box><Text color="gray.500" fontSize="xs">Maintenance Fee</Text><Text color="white" fontSize="sm">{formatCurrency(property.maintenanceFee)}</Text></Box>
                <Box><Text color="gray.500" fontSize="xs">Security Deposit</Text><Text color="white" fontSize="sm">{formatCurrency(property.securityDeposit)}</Text></Box>
                <Box><Text color="gray.500" fontSize="xs">Owner/Broker</Text><Text color="white" fontSize="sm">{property.ownerBrokerName || property.ownerBrokerId}</Text></Box>
              </Grid>
            </Box>

            <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={4}>
              <Text color="white" fontWeight="semibold" mb={2}>Specifications</Text>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={3}>
                <Box><Text color="gray.500" fontSize="xs">Bedrooms</Text><Text color="white" fontSize="sm">{property.bedrooms ?? '-'}</Text></Box>
                <Box><Text color="gray.500" fontSize="xs">Bathrooms</Text><Text color="white" fontSize="sm">{property.bathrooms ?? '-'}</Text></Box>
                <Box><Text color="gray.500" fontSize="xs">Balconies</Text><Text color="white" fontSize="sm">{property.balconies ?? '-'}</Text></Box>
                <Box><Text color="gray.500" fontSize="xs">Area SqFt</Text><Text color="white" fontSize="sm">{property.areaSqFt ?? '-'}</Text></Box>
                <Box><Text color="gray.500" fontSize="xs">Carpet Area SqFt</Text><Text color="white" fontSize="sm">{property.carpetAreaSqFt ?? '-'}</Text></Box>
                <Box><Text color="gray.500" fontSize="xs">Furnishing</Text><Text color="white" fontSize="sm">{property.furnishingStatus ?? '-'}</Text></Box>
                <Box><Text color="gray.500" fontSize="xs">Parking Spaces</Text><Text color="white" fontSize="sm">{property.parkingSpaces ?? '-'}</Text></Box>
                <Box><Text color="gray.500" fontSize="xs">Floor</Text><Text color="white" fontSize="sm">{property.floorNumber ?? '-'} / {property.totalFloors ?? '-'}</Text></Box>
                <Box><Text color="gray.500" fontSize="xs">Facing</Text><Text color="white" fontSize="sm">{property.facingDirection ?? '-'}</Text></Box>
                <Box><Text color="gray.500" fontSize="xs">Age (Years)</Text><Text color="white" fontSize="sm">{property.ageOfPropertyInYears ?? '-'}</Text></Box>
                <Box><Text color="gray.500" fontSize="xs">Possession</Text><Text color="white" fontSize="sm">{property.possessionStatus ?? '-'}</Text></Box>
              </Grid>

              <Box mt={4}>
                <Text color="gray.500" fontSize="xs" mb={1}>Amenities</Text>
                <Text color="white" fontSize="sm">
                  {property.amenities && property.amenities.length > 0 ? property.amenities.join(', ') : 'No amenities listed'}
                </Text>
              </Box>
            </Box>
          </Stack>
        </GridItem>

        <GridItem>
          <Stack gap={4}>
            <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={4}>
              <Text color="white" fontWeight="semibold" mb={2}>Location & Maps Metadata</Text>
              <Stack gap={2}>
                <Box><Text color="gray.500" fontSize="xs">Address Line 1</Text><Text color="white" fontSize="sm">{location?.addressLine1 || '-'}</Text></Box>
                <Box><Text color="gray.500" fontSize="xs">Address Line 2</Text><Text color="white" fontSize="sm">{location?.addressLine2 || '-'}</Text></Box>
                <Box><Text color="gray.500" fontSize="xs">Landmark</Text><Text color="white" fontSize="sm">{location?.landmark || '-'}</Text></Box>
                <Box><Text color="gray.500" fontSize="xs">Locality</Text><Text color="white" fontSize="sm">{location?.locality || '-'}</Text></Box>
                <Box><Text color="gray.500" fontSize="xs">City / State</Text><Text color="white" fontSize="sm">{location?.city || '-'} / {location?.state || '-'}</Text></Box>
                <Box><Text color="gray.500" fontSize="xs">Country / Zip</Text><Text color="white" fontSize="sm">{location?.country || '-'} / {location?.zipCode || '-'}</Text></Box>
                <Box><Text color="gray.500" fontSize="xs">Coordinates</Text><Text color="white" fontSize="sm">{coords || '-'}</Text></Box>
                <Box><Text color="gray.500" fontSize="xs">Google Place ID</Text><Text color="white" fontSize="sm">{location?.googlePlaceId || '-'}</Text></Box>
                <Box><Text color="gray.500" fontSize="xs">Formatted Address</Text><Text color="white" fontSize="sm">{location?.formattedAddress || '-'}</Text></Box>
                <Box>
                  <Text color="gray.500" fontSize="xs">Map URL</Text>
                  {googleLink ? (
                    <a href={googleLink} target="_blank" rel="noreferrer">
                      <Text color="blue.300" fontSize="sm" _hover={{ color: 'blue.200' }} lineClamp={2}>{googleLink}</Text>
                    </a>
                  ) : (
                    <Text color="white" fontSize="sm">-</Text>
                  )}
                </Box>
              </Stack>
            </Box>

            {embedUrl && (
              <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={2}>
                <iframe
                  title="property-location-map"
                  src={embedUrl}
                  width="100%"
                  height="240"
                  style={{ border: 0, borderRadius: '8px' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </Box>
            )}
          </Stack>
        </GridItem>
      </Grid>

      <CreateEditPropertyModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        property={property}
        onSuccess={async () => {
          setIsEditOpen(false);
          await loadProperty();
        }}
      />
    </Box>
  );
};

export default PropertyDetails;
