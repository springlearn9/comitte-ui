import React, { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  DialogBackdrop,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
  Grid,
  GridItem,
  Image,
  Input,
  NativeSelectField,
  NativeSelectRoot,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react';
import { Upload, X } from 'lucide-react';
import { propertyService } from '../../../services/propertyService';
import { propertyMediaService } from '../../../services/propertyMediaService';
import type {
  FurnishingStatus,
  ListingType,
  MediaType,
  PropertyMedia,
  PropertyRequest,
  PropertyResponse,
  PropertyStatus,
  PropertyType,
} from '../../../types/property';

interface CreateEditPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  property?: PropertyResponse | null;
}

const propertyTypes: PropertyType[] = [
  'APARTMENT',
  'VILLA',
  'PLOT',
  'COMMERCIAL',
  'INDEPENDENT_HOUSE',
  'PENTHOUSE',
];
const listingTypes: ListingType[] = ['SELL', 'RENT'];
const propertyStatuses: PropertyStatus[] = ['AVAILABLE', 'SOLD', 'RENTED', 'PENDING'];
const furnishingStatuses: FurnishingStatus[] = ['UNFURNISHED', 'SEMI_FURNISHED', 'FULLY_FURNISHED'];

const emptyForm: PropertyRequest = {
  title: '',
  description: '',
  propertyType: 'APARTMENT',
  listingType: 'SELL',
  price: 0,
  status: 'AVAILABLE',
  bedrooms: undefined,
  bathrooms: undefined,
  furnishingStatus: undefined,
  areaSqFt: undefined,
  amenities: [],
  locationDetails: {
    addressLine1: '',
    city: '',
    locality: '',
    state: '',
    zipCode: '',
    latitude: undefined,
    longitude: undefined,
    mapUrl: '',
  },
  media: [],
};

type UploadedMediaItem = {
  tempId: string;
  id?: number;
  objectKey?: string;
  mediaUrl: string;
  uploadUrl?: string;
  isPrimary: boolean;
  mediaType: MediaType;
  persisted: boolean;
  previewUrl?: string;
};

const CreateEditPropertyModal: React.FC<CreateEditPropertyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  property,
}) => {
  const [formData, setFormData] = useState<PropertyRequest>(emptyForm);
  const [amenitiesText, setAmenitiesText] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMediaItem[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    uploadedMedia.forEach((item) => {
      if (item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });

    if (property) {
      const existingMedia: UploadedMediaItem[] = (property.media || []).map((m, index) => ({
        tempId: `existing-${m.id ?? index}`,
        id: m.id,
        mediaUrl: m.mediaUrl,
        uploadUrl: m.uploadUrl,
        isPrimary: Boolean(m.isPrimary),
        mediaType: m.mediaType,
        persisted: true,
      }));

      setFormData({
        title: property.title,
        description: property.description || '',
        propertyType: property.propertyType,
        listingType: property.listingType,
        price: Number(property.price || 0),
        maintenanceFee: property.maintenanceFee,
        securityDeposit: property.securityDeposit,
        status: property.status,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        balconies: property.balconies,
        areaSqFt: property.areaSqFt,
        carpetAreaSqFt: property.carpetAreaSqFt,
        furnishingStatus: property.furnishingStatus,
        parkingSpaces: property.parkingSpaces,
        floorNumber: property.floorNumber,
        totalFloors: property.totalFloors,
        facingDirection: property.facingDirection,
        ageOfPropertyInYears: property.ageOfPropertyInYears,
        possessionStatus: property.possessionStatus,
        amenities: property.amenities || [],
        locationDetails: {
          addressLine1: property.locationDetails?.addressLine1 || '',
          addressLine2: property.locationDetails?.addressLine2 || '',
          landmark: property.locationDetails?.landmark || '',
          city: property.locationDetails?.city || '',
          state: property.locationDetails?.state || '',
          country: property.locationDetails?.country || '',
          zipCode: property.locationDetails?.zipCode || '',
          locality: property.locationDetails?.locality || '',
          latitude: property.locationDetails?.latitude,
          longitude: property.locationDetails?.longitude,
          googlePlaceId: property.locationDetails?.googlePlaceId || '',
          formattedAddress: property.locationDetails?.formattedAddress || '',
          mapUrl: property.locationDetails?.mapUrl || '',
        },
        media: property.media || [],
      });
      setAmenitiesText((property.amenities || []).join(', '));
      setUploadedMedia(existingMedia);
    } else {
      setFormData(emptyForm);
      setAmenitiesText('');
      setUploadedMedia([]);
    }
    setError(null);
    setUploadError(null);
  }, [property, isOpen]);

  const hasPrimary = useMemo(() => uploadedMedia.some((item) => item.isPrimary), [uploadedMedia]);

  const setField = (field: keyof PropertyRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const setLocationField = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      locationDetails: {
        ...(prev.locationDetails || {}),
        [field]: value,
      },
    }));
  };

  const parseNumber = (value: string): number | undefined => {
    if (value === '' || value == null) return undefined;
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  };

  const handleSubmit = async () => {
    setError(null);
    setUploadError(null);

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.price || formData.price <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    const payload: PropertyRequest = {
      ...formData,
      amenities: amenitiesText
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean),
      media: uploadedMedia
        .filter((item) => item.persisted)
        .map((item): PropertyMedia => ({
          id: item.id,
          mediaUrl: item.mediaUrl,
          uploadUrl: item.uploadUrl,
          isPrimary: item.isPrimary,
          mediaType: item.mediaType,
        })),
    };

    setLoading(true);
    try {
      let savedProperty: PropertyResponse;
      if (property?.id) {
        savedProperty = await propertyService.update(property.id, payload);
      } else {
        savedProperty = await propertyService.create(payload);
      }

      const pendingMedia = uploadedMedia.filter((item) => !item.persisted);
      if (pendingMedia.length > 0) {
        const ordered = [...pendingMedia].sort((a, b) => Number(a.isPrimary) - Number(b.isPrimary));
        for (const item of ordered) {
          await propertyMediaService.confirmMedia(savedProperty.id, {
            objectKey: item.objectKey,
            mediaUrl: item.mediaUrl,
            uploadUrl: item.uploadUrl,
            isPrimary: item.isPrimary,
            mediaType: item.mediaType,
          });
        }
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save property');
    } finally {
      setLoading(false);
    }
  };

  const getMediaType = (file: File): MediaType => {
    if (file.type.startsWith('video/')) return 'VIDEO';
    return 'IMAGE';
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploadError(null);
    setUploading(true);
    try {
      for (const file of files) {
        const mediaType = getMediaType(file);
        const presign = await propertyMediaService.presignUpload({
          fileName: file.name,
          contentType: file.type || 'application/octet-stream',
          mediaType,
        });

        await propertyMediaService.uploadToPresignedUrl(
          presign.uploadUrl,
          file,
          presign.requiredHeaders || {}
        );

        const previewUrl = file.type.startsWith('image/') || file.type.startsWith('video/')
          ? URL.createObjectURL(file)
          : undefined;

        setUploadedMedia((prev) => {
          const shouldBePrimary = !prev.some((item) => item.isPrimary);
          return [
            ...prev,
            {
              tempId: `new-${crypto.randomUUID()}`,
              objectKey: presign.objectKey,
              mediaUrl: presign.fileUrl,
              uploadUrl: presign.uploadUrl,
              isPrimary: shouldBePrimary,
              mediaType,
              persisted: false,
              previewUrl,
            },
          ];
        });
      }
    } catch (err: any) {
      setUploadError(err?.response?.data?.message || err?.message || 'Media upload failed');
    } finally {
      event.target.value = '';
      setUploading(false);
    }
  };

  const setPrimary = (tempId: string) => {
    setUploadedMedia((prev) => prev.map((item) => ({ ...item, isPrimary: item.tempId === tempId })));
  };

  const removeMedia = (tempId: string) => {
    setUploadedMedia((prev) => {
      const target = prev.find((item) => item.tempId === tempId);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }

      const next = prev.filter((item) => item.tempId !== tempId);
      if (next.length > 0 && !next.some((item) => item.isPrimary)) {
        next[0] = { ...next[0], isPrimary: true };
      }
      return next;
    });
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()} size="xl">
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent bg="gray.900" borderColor="gray.800" borderWidth="1px" maxH="90vh" overflowY="auto">
          <DialogHeader>
            <DialogTitle color="white">{property ? 'Edit Property' : 'Create Property Listing'}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Stack gap={4}>
              {error && (
                <Box bg="red.900" borderColor="red.700" borderWidth="1px" p={3} rounded="md">
                  <Text color="red.200" fontSize="sm">{error}</Text>
                </Box>
              )}

              {uploadError && (
                <Box bg="orange.900" borderColor="orange.700" borderWidth="1px" p={3} rounded="md">
                  <Text color="orange.200" fontSize="sm">{uploadError}</Text>
                </Box>
              )}

              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">Title *</Text>
                  <Input value={formData.title} onChange={(e) => setField('title', e.target.value)} placeholder="Property title" bg="gray.800" borderColor="gray.700" color="white" _placeholder={{ color: 'gray.500' }} />
                </GridItem>

                <GridItem>
                  <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">Property Type *</Text>
                  <NativeSelectRoot>
                    <NativeSelectField value={formData.propertyType} onChange={(e) => setField('propertyType', e.target.value as PropertyType)} bg="gray.800" borderColor="gray.700" color="white">
                      {propertyTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </GridItem>

                <GridItem>
                  <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">Listing Type *</Text>
                  <NativeSelectRoot>
                    <NativeSelectField value={formData.listingType} onChange={(e) => setField('listingType', e.target.value as ListingType)} bg="gray.800" borderColor="gray.700" color="white">
                      {listingTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </GridItem>

                <GridItem>
                  <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">Price *</Text>
                  <Input type="number" value={formData.price || ''} onChange={(e) => setField('price', Number(e.target.value))} placeholder="0" bg="gray.800" borderColor="gray.700" color="white" />
                </GridItem>

                <GridItem>
                  <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">Status *</Text>
                  <NativeSelectRoot>
                    <NativeSelectField value={formData.status} onChange={(e) => setField('status', e.target.value as PropertyStatus)} bg="gray.800" borderColor="gray.700" color="white">
                      {propertyStatuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </GridItem>

                <GridItem>
                  <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">Bedrooms</Text>
                  <Input type="number" value={formData.bedrooms ?? ''} onChange={(e) => setField('bedrooms', parseNumber(e.target.value))} placeholder="e.g. 3" bg="gray.800" borderColor="gray.700" color="white" />
                </GridItem>

                <GridItem>
                  <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">Bathrooms</Text>
                  <Input type="number" value={formData.bathrooms ?? ''} onChange={(e) => setField('bathrooms', parseNumber(e.target.value))} placeholder="e.g. 2" bg="gray.800" borderColor="gray.700" color="white" />
                </GridItem>

                <GridItem>
                  <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">Area (sq ft)</Text>
                  <Input type="number" value={formData.areaSqFt ?? ''} onChange={(e) => setField('areaSqFt', parseNumber(e.target.value))} placeholder="1200" bg="gray.800" borderColor="gray.700" color="white" />
                </GridItem>

                <GridItem>
                  <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">Furnishing</Text>
                  <NativeSelectRoot>
                    <NativeSelectField value={formData.furnishingStatus || ''} onChange={(e) => setField('furnishingStatus', (e.target.value || undefined) as FurnishingStatus | undefined)} bg="gray.800" borderColor="gray.700" color="white">
                      <option value="">Select furnishing</option>
                      {furnishingStatuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </GridItem>

                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">Description</Text>
                  <Textarea value={formData.description || ''} onChange={(e) => setField('description', e.target.value)} placeholder="Describe property details" bg="gray.800" borderColor="gray.700" color="white" rows={3} />
                </GridItem>

                <GridItem>
                  <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">City</Text>
                  <Input value={formData.locationDetails?.city || ''} onChange={(e) => setLocationField('city', e.target.value)} placeholder="City" bg="gray.800" borderColor="gray.700" color="white" />
                </GridItem>

                <GridItem>
                  <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">Locality</Text>
                  <Input value={formData.locationDetails?.locality || ''} onChange={(e) => setLocationField('locality', e.target.value)} placeholder="Locality" bg="gray.800" borderColor="gray.700" color="white" />
                </GridItem>

                <GridItem>
                  <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">Latitude</Text>
                  <Input type="number" value={formData.locationDetails?.latitude ?? ''} onChange={(e) => setLocationField('latitude', parseNumber(e.target.value))} placeholder="e.g. 28.7041" bg="gray.800" borderColor="gray.700" color="white" />
                </GridItem>

                <GridItem>
                  <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">Longitude</Text>
                  <Input type="number" value={formData.locationDetails?.longitude ?? ''} onChange={(e) => setLocationField('longitude', parseNumber(e.target.value))} placeholder="e.g. 77.1025" bg="gray.800" borderColor="gray.700" color="white" />
                </GridItem>

                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <Text color="gray.300" mb={2} fontSize="sm" fontWeight="medium">Amenities (comma separated)</Text>
                  <Input value={amenitiesText} onChange={(e) => setAmenitiesText(e.target.value)} placeholder="Lift, Gym, Security, Power Backup" bg="gray.800" borderColor="gray.700" color="white" />
                </GridItem>

                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <Stack gap={3}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" gap={3}>
                      <Text color="gray.300" fontSize="sm" fontWeight="medium">Property Media</Text>
                      <Button as="label" size="sm" bg="gray.700" color="white" _hover={{ bg: 'gray.600' }} loading={uploading} loadingText="Uploading...">
                        <Upload size={16} style={{ marginRight: '8px' }} />
                        Add Photos / Videos
                        <Input
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          onChange={handleFileSelect}
                          display="none"
                        />
                      </Button>
                    </Box>

                    <Text color="gray.500" fontSize="xs">
                      Upload files now, preview them, and pick one primary media before saving.
                    </Text>

                    {uploadedMedia.length === 0 ? (
                      <Text color="gray.500" fontSize="sm">No media uploaded yet.</Text>
                    ) : (
                      <Stack gap={3}>
                        {uploadedMedia.map((item, index) => {
                          const preview = item.previewUrl || item.mediaUrl;
                          const isVideo = item.mediaType === 'VIDEO';
                          const label = `Media ${index + 1}`;

                          return (
                            <Box key={item.tempId} borderWidth="1px" borderColor="gray.700" bg="gray.800" rounded="md" p={3}>
                              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                                <Box display="flex" alignItems="center" gap={2}>
                                  <Box as="label" display="inline-flex" alignItems="center" gap={2} color="white" fontSize="sm">
                                    <input
                                      type="radio"
                                      name="primary-media"
                                      checked={item.isPrimary}
                                      onChange={() => setPrimary(item.tempId)}
                                    />
                                    Primary
                                  </Box>
                                  {item.isPrimary && <Badge colorPalette="green">PRIMARY</Badge>}
                                  {!item.persisted && <Badge colorPalette="blue">NEW</Badge>}
                                  <Text color="gray.400" fontSize="xs">{label}</Text>
                                </Box>
                                <Box
                                  as="button"
                                  onClick={() => removeMedia(item.tempId)}
                                  p={1}
                                  rounded="full"
                                  color="gray.300"
                                  _hover={{ bg: 'gray.700', color: 'red.300' }}
                                  title="Remove media"
                                >
                                  <X size={16} />
                                </Box>
                              </Box>

                              {isVideo ? (
                                <video
                                  src={preview}
                                  controls
                                  style={{ width: '100%', maxHeight: '220px', borderRadius: '0.375rem' }}
                                />
                              ) : (
                                <Image src={preview} alt={label} w="full" maxH="220px" objectFit="cover" rounded="md" />
                              )}
                            </Box>
                          );
                        })}
                      </Stack>
                    )}

                    {uploadedMedia.length > 0 && !hasPrimary && (
                      <Text color="orange.300" fontSize="xs">Select one primary media before saving.</Text>
                    )}
                  </Stack>
                </GridItem>
              </Grid>
            </Stack>
          </DialogBody>
          <DialogFooter>
            <Button onClick={onClose} variant="outline" colorScheme="gray" mr={3} disabled={loading}>Cancel</Button>
            <Button onClick={handleSubmit} bg="red.500" color="white" _hover={{ bg: 'red.600' }} loading={loading} loadingText={property ? 'Updating...' : 'Creating...'}>
              {property ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
};

export default CreateEditPropertyModal;
