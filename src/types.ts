export type CategoryType =
  | 'all'
  | 'electrician'
  | 'plumber'
  | 'mechanic'
  | 'ac_repair'
  | 'carpenter'
  | 'doctor'
  | 'cleaning'
  | 'appliance'
  | 'emergency_sos';

export interface CategoryMeta {
  id: CategoryType;
  label: string;
  tamilLabel: string;
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  category: CategoryType;
  subcategory: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number; // in INR ₹
  visitingFee: number;
  phone: string;
  whatsapp: string;
  experienceYears: number;
  address: string;
  locality: string;
  lat: number;
  lng: number;
  distanceKm?: number;
  etaMins?: number;
  isAvailable: boolean;
  isVerified: boolean;
  is24x7: boolean;
  services: string[];
  image: string;
  description: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
  addressName: string;
  accuracy?: number;
  isGpsActive: boolean;
}

export interface Booking {
  id: string;
  providerId: string;
  providerName: string;
  providerCategory: CategoryType;
  providerPhone: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  date: string;
  timeSlot: string;
  issueDescription: string;
  urgency: 'normal' | 'urgent' | 'emergency';
  status: 'confirmed' | 'in_transit' | 'completed' | 'cancelled';
  createdAt: string;
  estimatedCost: number;
}

export interface CollegePreset {
  id: string;
  name: string;
  city: string;
  tag: string;
  lat: number;
  lng: number;
  description: string;
}

export interface FilterOptions {
  category: CategoryType;
  searchQuery: string;
  maxRadiusKm: number;
  minRating: number;
  sortBy: 'distance' | 'rating' | 'price_low' | 'experience';
  onlyAvailable: boolean;
  only24x7: boolean;
  onlyVerified: boolean;
}
