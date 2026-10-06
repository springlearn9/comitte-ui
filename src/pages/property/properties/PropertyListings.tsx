import React, { useEffect, useRef, useState } from 'react';
import { Badge, Box, Button, Grid, GridItem, Image, Input, NativeSelectField, NativeSelectRoot, Tabs, Text } from '@chakra-ui/react';
import { Check, Edit, Heart, Phone, Plus, Search, Star, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreateEditPropertyModal from './CreateEditPropertyModal';
import { useAuth } from '../../../hooks/useAuth';
import { propertyService } from '../../../services/propertyService';
import {
  mapPropertyResponse,
  type FurnishingStatus,
  type ListingType,
  type PropertyFilters,
  type PropertyListItem,
  type PropertyResponse,
  type PropertyType,
} from '../../../types/property';

const propertyTypes: PropertyType[] = ['APARTMENT', 'VILLA', 'PLOT', 'COMMERCIAL', 'INDEPENDENT_HOUSE', 'PENTHOUSE'];
const listingTypes: ListingType[] = ['SELL', 'RENT'];
const furnishingTypes: FurnishingStatus[] = ['UNFURNISHED', 'SEMI_FURNISHED', 'FULLY_FURNISHED'];

const formatCurrency = (value?: number) => {
  if (value == null) return '₹0';

  const abs = Math.abs(value);
  if (abs >= 10000000) {
    return `₹${(value / 10000000).toFixed(2).replace(/\.00$/, '')}Cr`;
  }
  if (abs >= 100000) {
    return `₹${(value / 100000).toFixed(2).replace(/\.00$/, '')}L`; 
  }
  return `₹${Math.round(value).toLocaleString()}`;
};

const formatDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const mm = months[d.getMonth()];
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}${mm}${yy}`;
};

const formatPropertyType = (value?: string) => (value ? value.replaceAll('_', ' ') : '');

const getPrimaryMedia = (property: PropertyResponse) => {
  const media = property.media || [];
  return media.find((item) => item.isPrimary) || media[0];
};

const getPropertyBadgeVariant = (property: PropertyResponse) => {
  const seed = Number(property.id || 0);
  const variant = seed % 3;

  if (variant === 0) {
    return {
      type: 'verified',
      label: 'VERIFIED',
      bg: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
      text: 'white',
      border: 'rgba(255,255,255,0.25)',
      iconBg: 'rgba(255,255,255,0.2)',
      iconColor: 'white',
      icon: Check,
    };
  }

  if (variant === 1) {
    return {
      type: 'standard',
      label: 'STANDARD',
      bg: 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
      text: 'white',
      border: 'rgba(255,255,255,0.25)',
      iconBg: 'rgba(255,255,255,0.18)',
      iconColor: 'white',
      icon: Check,
    };
  }

  return {
    type: 'unverified',
    label: 'UNVERIFIED',
    bg: 'linear-gradient(90deg, #ffffff 0%, #f8fafc 100%)',
    text: '#dc2626',
    border: '#fca5a5',
    iconBg: 'rgba(239,68,68,0.12)',
    iconColor: '#dc2626',
    icon: X,
  };
};

const ListingTile: React.FC<{
  item: PropertyListItem;
  property: PropertyResponse;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}> = ({ item, property, onView, onEdit, onDelete }) => {
  const mediaItems = property.media || [];
  const primaryMedia = getPrimaryMedia(property);
  const location = [property.locationDetails?.locality, property.locationDetails?.city].filter(Boolean).join(', ');
  const nearbyTags = [property.locationDetails?.landmark, property.locationDetails?.locality, property.locationDetails?.city].filter(Boolean).slice(0, 3);
  const [isSelected, setIsSelected] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeMedia = mediaItems.length > 0
    ? mediaItems[activeImageIndex] || mediaItems[0]
    : primaryMedia || undefined;
  const badge = getPropertyBadgeVariant(property);
  const BadgeIcon = badge.icon;

  useEffect(() => {
    if (mediaItems.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % mediaItems.length);
    }, 2000);

    return () => window.clearInterval(timer);
  }, [mediaItems.length]);

  return (
    <Box
      bg="gray.900"
      borderWidth="1px"
      borderColor="gray.800"
      rounded="2xl"
      overflow="hidden"
      boxShadow="0 10px 24px rgba(2, 6, 23, 0.28)"
      _hover={{ boxShadow: '0 18px 30px rgba(2, 6, 23, 0.35)', transform: 'translateY(-1px)' }}
      transition="all 0.2s ease"
      onClick={onView}
      cursor={onView ? 'pointer' : 'default'}
      maxW="320px"
      mx="auto"
    >
      <Box position="relative" h={{ base: '200px', md: '220px' }} bg="gray.100">
        {activeMedia?.mediaUrl ? (
          activeMedia.mediaType === 'VIDEO' ? (
            <video src={activeMedia.mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted autoPlay loop playsInline />
          ) : (
            <Image src={activeMedia.mediaUrl} alt={item.title} w="full" h="full" objectFit="cover" />
          )
        ) : (
          <Box w="full" h="full" bgGradient="linear(to-br, gray.100, blue.50)" display="flex" alignItems="center" justifyContent="center">
            <Text color="gray.500" fontSize="sm">No media available</Text>
          </Box>
        )}

        <Box position="absolute" top={3} left={3} display="flex" gap={2} alignItems="center">
          <Box
            display="inline-flex"
            alignItems="center"
            gap={1.5}
            px={2.5}
            py={1}
            rounded="full"
            bg={badge.bg}
            borderWidth="1px"
            borderColor={badge.border}
            boxShadow="sm"
          >
            <Box
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              w={6}
              h={6}
              rounded="full"
              bg={badge.iconBg}
              color={badge.iconColor}
            >
              <BadgeIcon size={11} strokeWidth={3} />
            </Box>
            <Text color={badge.text} fontSize="10px" fontWeight="bold" letterSpacing="0.02em">{badge.label}</Text>
          </Box>
        </Box>

        <Box position="absolute" top={3} right={3} display="flex" gap={2} alignItems="center">
          <Box
            as="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsSelected((prev) => !prev);
            }}
            aria-label="Toggle selection"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            w={9}
            h={9}
            rounded="full"
            bg="rgba(255,255,255,0.92)"
            color={isSelected ? 'yellow.500' : 'gray.700'}
            borderWidth="1px"
            borderColor="gray.200"
            boxShadow="sm"
          >
            <Star size={16} fill={isSelected ? 'currentColor' : 'none'} />
          </Box>
          <Box
            as="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite((prev) => !prev);
            }}
            aria-label="Toggle favorite"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            w={9}
            h={9}
            rounded="full"
            bg="rgba(255,255,255,0.92)"
            color={isFavorite ? 'red.500' : 'gray.700'}
            borderWidth="1px"
            borderColor="gray.200"
            boxShadow="sm"
          >
            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </Box>
        </Box>

        <Box position="absolute" bottom={3} left={3} right={3} display="flex" alignItems="flex-end" justifyContent="space-between">
          <Box bg="rgba(15, 23, 42, 0.72)" borderWidth="1px" borderColor="rgba(255,255,255,0.22)" px={2.5} py={1.25} rounded="lg">
            <Text color="white" fontSize="xs" fontWeight="bold">{formatCurrency(item.price)}</Text>
            <Text color="gray.200" fontSize="8px" fontWeight="medium">
              {property.possessionStatus ? `${formatPropertyType(property.possessionStatus)} · ` : ''}
              {formatDate(item.createdAt) || 'New listing'}
            </Text>
          </Box>
          <Box display="flex" alignItems="center" gap={1} bg="rgba(17,24,39,0.75)" color="white" px={2} py={1} rounded="md">
            <Text fontSize="10px">📷</Text>
            <Text fontSize="10px">{property.media?.length || 0}</Text>
          </Box>
        </Box>

        {mediaItems.length > 1 && (
          <Box
            position="absolute"
            left={0}
            right={0}
            bottom={16}
            display="flex"
            justifyContent="center"
            gap={2}
            px={3}
          >
            {mediaItems.map((media, index) => (
              <Box
                key={`${property.id}-${media.id ?? index}`}
                as="button"
                aria-label={`View image ${index + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(index);
                }}
                w={2.5}
                h={2.5}
                rounded="full"
                bg={index === activeImageIndex ? 'white' : 'rgba(255,255,255,0.55)'}
                borderWidth="1px"
                borderColor={index === activeImageIndex ? 'white' : 'rgba(255,255,255,0.3)'}
                boxShadow="sm"
                _hover={{ transform: 'scale(1.08)' }}
                transition="all 0.2s ease"
              />
            ))}
          </Box>
        )}
      </Box>

      <Box p={{ base: 3, md: 3.5 }} display="flex" flexDirection="column" gap={3}>
        <Box>
          <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
            <Text as="h3" color="white" fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }} lineHeight="1.2" lineClamp={1}>{item.title}</Text>
            <Badge bg="red.500/10" color="red.300" borderWidth="1px" borderColor="red.400/30" px={2} py={0.5} rounded="md" fontSize="9px" fontWeight="bold">RESALE</Badge>
          </Box>

          <Text color="gray.300" fontSize="11px" mt={1} lineClamp={1}>
            {property.bedrooms ? `${property.bedrooms} BHK` : '-'} {formatPropertyType(property.propertyType)} in {location || 'Location'}
          </Text>

          <Box mt={2}>
            <Text color="gray.400" fontSize="11px">{property.areaSqFt ? `${property.areaSqFt} sq ft` : '—'}</Text>
          </Box>

          <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(3, minmax(0, 1fr))' }} gap={2} mt={3}>
            <Box bg="gray.950" borderWidth="1px" borderColor="gray.800" rounded="md" p={2}>
              <Text color="gray.400" fontSize="9px">Area</Text>
              <Text color="white" fontWeight="semibold" fontSize="11px">{property.areaSqFt ? `${property.areaSqFt} sq ft` : '—'}</Text>
            </Box>
            <Box bg="gray.950" borderWidth="1px" borderColor="gray.800" rounded="md" p={2}>
              <Text color="gray.400" fontSize="9px">Bedroom</Text>
              <Text color="white" fontWeight="semibold" fontSize="11px">{property.bedrooms ? `${property.bedrooms} BHK` : '—'}</Text>
            </Box>
            <Box bg="gray.950" borderWidth="1px" borderColor="gray.800" rounded="md" p={2}>
              <Text color="gray.400" fontSize="9px">Status</Text>
              <Text color="white" fontWeight="semibold" fontSize="11px">{property.status}</Text>
            </Box>
          </Grid>

          <Box mt={3} display="flex" alignItems="center" gap={2} flexWrap="wrap">
            {nearbyTags.length > 0 ? nearbyTags.map((tag) => (
              <Badge key={tag} bg="gray.800" borderWidth="1px" borderColor="gray.700" color="gray.200" rounded="md" px={2} py={0.5} fontSize="9px">{tag}</Badge>
            )) : (
              <Text color="gray.500" fontSize="11px">No nearby highlights</Text>
            )}
          </Box>

          <Text color="gray.400" fontSize="11px" mt={2} lineClamp={2}>
            {property.description || `Discover ${property.bedrooms ? `${property.bedrooms} BHK` : 'this home'} in ${location || 'this location'} with premium amenities and convenient access.`}
          </Text>
        </Box>

        <Box pt={2} borderTopWidth="1px" borderColor="gray.800" display="flex" alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap">
          <Box display="flex" alignItems="center" gap={2}>
            <Box w={8} h={8} rounded="full" bg="gray.800" borderWidth="1px" borderColor="gray.700" display="flex" alignItems="center" justifyContent="center">
              <Text color="gray.200" fontSize="9px" fontWeight="bold">P</Text>
            </Box>
            <Box>
              <Text color="white" fontWeight="semibold" fontSize="11px">{property.ownerBrokerName || `Member ${property.ownerBrokerId}`}</Text>
              <Text color="gray.400" fontSize="9px">Featured dealer</Text>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Button
              variant="outline"
              borderColor="gray.700"
              color="gray.100"
              borderRadius="md"
              px={2.5}
              minH="30px"
              fontSize="11px"
              _hover={{ bg: 'gray.800', borderColor: 'gray.600' }}
              onClick={(e) => {
                e.stopPropagation();
                onView?.();
              }}
            >
              View Number
            </Button>
            <Button
              bg="red.500"
              color="white"
              borderRadius="full"
              w="30px"
              h="30px"
              minW="30px"
              p={0}
              _hover={{ bg: 'red.600' }}
              onClick={(e) => {
                e.stopPropagation();
                onView?.();
              }}
              aria-label="Call property owner"
            >
              <Phone size={14} />
            </Button>
            {onEdit && onDelete && (
              <>
                <Box
                  as="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.();
                  }}
                  title="Edit"
                  p={1.5}
                  _hover={{ bg: 'gray.800', color: 'red.300' }}
                  rounded="full"
                  color="red.300"
                  cursor="pointer"
                >
                  <Edit size={14} />
                </Box>
                <Box
                  as="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.();
                  }}
                  title="Delete"
                  p={1.5}
                  _hover={{ bg: 'gray.800', color: 'red.300' }}
                  rounded="full"
                  color="red.300"
                  cursor="pointer"
                >
                  <Trash2 size={14} />
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const PropertyListings: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'my-listings' | 'discover'>('discover');
  const [myListings, setMyListings] = useState<PropertyResponse[]>([]);
  const [discoverListings, setDiscoverListings] = useState<PropertyResponse[]>([]);
  const [totalMyListings, setTotalMyListings] = useState(0);
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalState, setModalState] = useState<{ open: boolean; property: PropertyResponse | null }>({ open: false, property: null });
  const loadedTabsRef = useRef({ my: false, discover: false });

  const parseNumber = (value: string) => {
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  const setFilterField = (field: keyof PropertyFilters, value: string | number | undefined) => {
    setFilters((prev) => ({ ...prev, [field]: value === '' ? undefined : value }));
  };

  const loadMyListings = async () => {
    if (!isAuthenticated) {
      setMyListings([]);
      setTotalMyListings(0);
      return;
    }

    try {
      setLoading(true);
      const page = await propertyService.getMyListings(0, 20);
      setMyListings(page.content || []);
      setTotalMyListings(page.totalElements || 0);
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load your listings.';
      setMyListings([]);
      setTotalMyListings(0);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const loadDiscover = async (nextFilters: PropertyFilters = filters) => {
    try {
      setLoading(true);
      const page = await propertyService.search(nextFilters, 0, 20);
      setDiscoverListings(page.content || []);
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load property listings.';
      setDiscoverListings([]);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this property listing?')) return;
    try {
      await propertyService.delete(id);
      await loadMyListings();
      await loadDiscover();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed.';
      setError(message);
    }
  };

  useEffect(() => {
    void loadDiscover();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      void loadMyListings();
      loadedTabsRef.current.my = true;
    } else {
      setMyListings([]);
      setTotalMyListings(0);
      loadedTabsRef.current.my = false;
    }
  }, [isAuthenticated]);

  return (
    <Box p={6}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Box>
          <Text as="h1" fontSize="xl" fontWeight="bold" color="white" mb={1}>Properties</Text>
          <Text color="gray.400" fontSize="xs">Discover available listings or manage your property portfolio.</Text>
        </Box>
        <Button
          onClick={() => {
            if (!isAuthenticated) {
              navigate('/auth/signin');
              return;
            }
            setModalState({ open: true, property: null });
          }}
          bg="red.500"
          color="white"
          _hover={{ bg: 'red.600' }}
        >
          <Plus size={20} style={{ marginRight: '8px' }} />
          New Listing
        </Button>
      </Box>

      {error && (
        <Box bg="red.900" borderColor="red.700" borderWidth="1px" p={3} rounded="md" mb={4}>
          <Text color="red.200" fontSize="sm">{error}</Text>
        </Box>
      )}

      <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value as 'my-listings' | 'discover')}>
        <Tabs.List bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={1} mb={4}>
          <Tabs.Trigger value="my-listings" color="white" _selected={{ bg: 'gray.700' }} rounded="md" px={4}>My Listings ({totalMyListings})</Tabs.Trigger>
          <Tabs.Trigger value="discover" color="white" _selected={{ bg: 'gray.700' }} rounded="md" px={4}>Discover</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="my-listings">
          {!isAuthenticated ? (
            <Text color="gray.500">Sign in to manage your listings.</Text>
          ) : loading ? (
            <Text color="gray.400">Loading listings...</Text>
          ) : myListings.length === 0 ? (
            <Text color="gray.500">No listings yet. Create your first property listing.</Text>
          ) : (
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' }} gap={4}>
              {myListings.map((property) => {
                const item = mapPropertyResponse(property);
                return (
                  <GridItem key={property.id}>
                    <ListingTile
                      item={item}
                      property={property}
                      onView={() => navigate(`/property/listings/${property.id}`)}
                      onEdit={() => setModalState({ open: true, property })}
                      onDelete={() => void handleDelete(property.id)}
                    />
                  </GridItem>
                );
              })}
            </Grid>
          )}
        </Tabs.Content>

        <Tabs.Content value="discover">
          <Box bg="gray.900" borderColor="gray.800" borderWidth="1px" rounded="lg" p={4} mb={4}>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={3}>
              <GridItem>
                <Input value={filters.city || ''} onChange={(e) => setFilterField('city', e.target.value)} placeholder="City" bg="gray.800" borderColor="gray.700" color="white" _placeholder={{ color: 'gray.500' }} />
              </GridItem>
              <GridItem>
                <Input value={filters.locality || ''} onChange={(e) => setFilterField('locality', e.target.value)} placeholder="Locality" bg="gray.800" borderColor="gray.700" color="white" _placeholder={{ color: 'gray.500' }} />
              </GridItem>
              <GridItem>
                <Input type="number" value={filters.minPrice ?? ''} onChange={(e) => setFilterField('minPrice', parseNumber(e.target.value))} placeholder="Min Price" bg="gray.800" borderColor="gray.700" color="white" _placeholder={{ color: 'gray.500' }} />
              </GridItem>
              <GridItem>
                <Input type="number" value={filters.maxPrice ?? ''} onChange={(e) => setFilterField('maxPrice', parseNumber(e.target.value))} placeholder="Max Price" bg="gray.800" borderColor="gray.700" color="white" _placeholder={{ color: 'gray.500' }} />
              </GridItem>
              <GridItem>
                <NativeSelectRoot>
                  <NativeSelectField value={filters.propertyType || ''} onChange={(e) => setFilterField('propertyType', (e.target.value || undefined) as PropertyType | undefined)} bg="gray.800" borderColor="gray.700" color="white">
                    <option value="">Property Type</option>
                    {propertyTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                  </NativeSelectField>
                </NativeSelectRoot>
              </GridItem>
              <GridItem>
                <NativeSelectRoot>
                  <NativeSelectField value={filters.listingType || ''} onChange={(e) => setFilterField('listingType', (e.target.value || undefined) as ListingType | undefined)} bg="gray.800" borderColor="gray.700" color="white">
                    <option value="">Listing Type</option>
                    {listingTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                  </NativeSelectField>
                </NativeSelectRoot>
              </GridItem>
              <GridItem>
                <Input type="number" value={filters.bedrooms ?? ''} onChange={(e) => setFilterField('bedrooms', parseNumber(e.target.value))} placeholder="Bedrooms" bg="gray.800" borderColor="gray.700" color="white" _placeholder={{ color: 'gray.500' }} />
              </GridItem>
              <GridItem>
                <NativeSelectRoot>
                  <NativeSelectField value={filters.furnishingStatus || ''} onChange={(e) => setFilterField('furnishingStatus', (e.target.value || undefined) as FurnishingStatus | undefined)} bg="gray.800" borderColor="gray.700" color="white">
                    <option value="">Furnishing</option>
                    {furnishingTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                  </NativeSelectField>
                </NativeSelectRoot>
              </GridItem>
            </Grid>

            <Box mt={3} display="flex" gap={2}>
              <Button onClick={() => void loadDiscover(filters)} bg="red.500" color="white" _hover={{ bg: 'red.600' }}>
                <Search size={16} style={{ marginRight: '8px' }} />
                Search
              </Button>
              <Button
                variant="outline"
                colorScheme="gray"
                onClick={() => {
                  const cleared: PropertyFilters = {};
                  setFilters(cleared);
                  void loadDiscover(cleared);
                }}
              >
                Reset
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Text color="gray.400">Searching listings...</Text>
          ) : discoverListings.length === 0 ? (
            <Text color="gray.500">No listings match current filters.</Text>
          ) : (
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' }} gap={4}>
              {discoverListings.map((property) => {
                const item = mapPropertyResponse(property);
                return (
                  <GridItem key={`discover-${property.id}`}>
                    <ListingTile item={item} property={property} onView={() => navigate(`/property/listings/${property.id}`)} />
                  </GridItem>
                );
              })}
            </Grid>
          )}
        </Tabs.Content>
      </Tabs.Root>

      <CreateEditPropertyModal
        isOpen={modalState.open}
        onClose={() => setModalState({ open: false, property: null })}
        onSuccess={async () => {
          if (isAuthenticated) {
            await loadMyListings();
          }
          await loadDiscover(filters);
        }}
        property={modalState.property}
      />
    </Box>
  );
};

export default PropertyListings;
