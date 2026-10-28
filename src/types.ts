export interface HouseRentalListing {
  id: string;
  title: string;
  propertyType: 'family' | 'bachelor' | 'sublet' | 'office' | 'hostel';
  rentAmount: number; // in BDT (টাকা)
  serviceCharge?: number;
  advanceDeposit?: number;
  availableFrom: string; // e.g., '১লা নভেম্বর ২০২৪' or date string
  bedrooms: number;
  bathrooms: number;
  balconies: number;
  floor: string; // e.g. "৪র্থ তলা (4th floor)"
  totalFloors?: string;
  sizeSqFt: number; // square feet
  
  // Location
  city: string; // ঢাকা, চট্টগ্রাম, ইত্যাদি
  area: string; // যেমন: মিরপুর-১০, ধানমন্ডি, উত্তরা, গুলশান
  fullAddress: string;
  latitude?: number;
  longitude?: number;
  landmark?: string;

  // Features / Amenities
  gasFacility: 'cylinder' | 'line' | 'none';
  lift: boolean;
  generator: boolean;
  parking: 'bike' | 'car' | 'both' | 'none';
  cctv: boolean;
  wifi: boolean;
  securityGuard: boolean;

  // Photos
  images: string[];

  // Landlord / Contact Info
  landlordName: string;
  landlordPhone: string;
  landlordEmail: string;
  contactTime?: string;
  description: string;

  // Timestamps & Meta
  createdAt: string;
  isAvailable: boolean;
  verified?: boolean;
  landlordUid?: string;

  // Analytics
  viewCount?: number;
  viewHistory?: {
    date: string; // YYYY-MM-DD
    count: number;
  }[];
  isFeatured?: boolean;
}

export interface RentalInquiry {
  id: string;
  listingId: string;
  listingTitle: string;
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string;
  familyMembers?: number;
  profession?: string;
  proposedMoveInDate: string;
  message: string;
  status: 'pending' | 'contacted' | 'booked' | 'rejected';
  createdAt: string;
  sentViaGmail?: boolean;
  tenantUid?: string;
}

export interface FilterState {
  searchQuery: string;
  area: string;
  propertyType: string;
  minRent: number;
  maxRent: number;
  bedrooms: string;
  gasFacility: string;
  hasLift: boolean;
  hasParking: boolean;
  sortBy: 'latest' | 'rent_low_to_high' | 'rent_high_to_low' | 'featured';
  featuredOnly?: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  role: 'landlord' | 'tenant' | 'both';
  nidNumber?: string;
  whatsappNumber?: string;
  address?: string;
  preferredCity?: string;
  occupation?: string;
  bio?: string;
  notificationEmail?: boolean;
  verifiedIdentity?: boolean;
  joinedAt: string;
}

export interface SavedGoogleAccount {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role?: 'landlord' | 'tenant' | 'both';
  phone?: string;
  lastLoginAt: string;
}

export interface GoogleContactItem {
  resourceName: string;
  etag?: string;
  name: string;
  givenName?: string;
  familyName?: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  notes?: string;
  organization?: string;
  jobTitle?: string;
}


