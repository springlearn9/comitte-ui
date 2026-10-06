export type PropertyType =
  | 'APARTMENT'
  | 'VILLA'
  | 'PLOT'
  | 'COMMERCIAL'
  | 'INDEPENDENT_HOUSE'
  | 'PENTHOUSE';

export type ListingType = 'SELL' | 'RENT';

export type PropertyStatus = 'AVAILABLE' | 'SOLD' | 'RENTED' | 'PENDING';

export type FurnishingStatus = 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FULLY_FURNISHED';

export type FacingDirection =
  | 'NORTH'
  | 'SOUTH'
  | 'EAST'
  | 'WEST'
  | 'NORTH_EAST'
  | 'NORTH_WEST'
  | 'SOUTH_EAST'
  | 'SOUTH_WEST';

export type PossessionStatus = 'READY_TO_MOVE' | 'UNDER_CONSTRUCTION';

export type MediaType = 'IMAGE' | 'VIDEO' | 'VIRTUAL_TOUR';

export interface LocationDetails {
  addressLine1?: string;
  addressLine2?: string;
  landmark?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  locality?: string;
  latitude?: number;
  longitude?: number;
  googlePlaceId?: string;
  formattedAddress?: string;
  mapUrl?: string;
}

export interface PropertyMedia {
  id?: number;
  mediaUrl: string;
  uploadUrl?: string;
  isPrimary?: boolean;
  mediaType: MediaType;
}

export interface MediaPresignRequest {
  fileName: string;
  contentType: string;
  mediaType: MediaType;
  expiresInMinutes?: number;
}

export interface MediaPresignResponse {
  objectKey: string;
  uploadUrl: string;
  fileUrl: string;
  expiresAt: string;
  requiredHeaders?: Record<string, string>;
}

export interface ConfirmPropertyMediaRequest {
  objectKey?: string;
  mediaUrl?: string;
  uploadUrl?: string;
  isPrimary?: boolean;
  mediaType: MediaType;
}

export interface PropertyResponse {
  id: number;
  ownerBrokerId: number;
  ownerBrokerName?: string;
  title: string;
  description?: string;
  propertyType: PropertyType;
  listingType: ListingType;
  price: number;
  maintenanceFee?: number;
  securityDeposit?: number;
  status: PropertyStatus;
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  areaSqFt?: number;
  carpetAreaSqFt?: number;
  furnishingStatus?: FurnishingStatus;
  parkingSpaces?: number;
  floorNumber?: number;
  totalFloors?: number;
  facingDirection?: FacingDirection;
  ageOfPropertyInYears?: number;
  possessionStatus?: PossessionStatus;
  amenities?: string[];
  locationDetails?: LocationDetails;
  media?: PropertyMedia[];
  createdTimestamp?: string;
  updatedTimestamp?: string;
}

export interface PropertyRequest {
  title: string;
  description?: string;
  propertyType: PropertyType;
  listingType: ListingType;
  price: number;
  maintenanceFee?: number;
  securityDeposit?: number;
  status: PropertyStatus;
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  areaSqFt?: number;
  carpetAreaSqFt?: number;
  furnishingStatus?: FurnishingStatus;
  parkingSpaces?: number;
  floorNumber?: number;
  totalFloors?: number;
  facingDirection?: FacingDirection;
  ageOfPropertyInYears?: number;
  possessionStatus?: PossessionStatus;
  amenities?: string[];
  locationDetails?: LocationDetails;
  media?: PropertyMedia[];
}

export interface PropertyFilters {
  city?: string;
  locality?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: PropertyType;
  listingType?: ListingType;
  bedrooms?: number;
  furnishingStatus?: FurnishingStatus;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface PropertyListItem {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  price: number;
  listingType: ListingType;
  propertyType: PropertyType;
  status: PropertyStatus;
  bedrooms?: number;
  primaryMediaUrl?: string;
  primaryMediaType?: MediaType;
  mediaCount?: number;
  createdAt?: string;
}

export const mapPropertyResponse = (r: PropertyResponse): PropertyListItem => {
  const primary = (r.media || []).find((m) => m.isPrimary) || (r.media || [])[0];

  return {
    id: String(r.id),
    title: r.title,
    subtitle: `${r.propertyType} • ${r.listingType}`,
    location: [r.locationDetails?.locality, r.locationDetails?.city].filter(Boolean).join(', ') || 'Location not set',
    price: r.price,
    listingType: r.listingType,
    propertyType: r.propertyType,
    status: r.status,
    bedrooms: r.bedrooms,
    primaryMediaUrl: primary?.mediaUrl,
    primaryMediaType: primary?.mediaType,
    mediaCount: r.media?.length || 0,
    createdAt: r.createdTimestamp,
  };
};
