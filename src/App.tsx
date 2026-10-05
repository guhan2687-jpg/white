import React, { useState, useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Search,
  SlidersHorizontal,
  Navigation,
  Phone,
  MessageSquare,
  ShieldCheck,
  Star,
  PlusCircle,
  BookOpen,
  Calendar,
  AlertTriangle,
  LocateFixed,
  Maximize2,
  Trash2,
  Info,
  CheckCircle,
  X,
} from 'lucide-react';

// ================= TYPES =================
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
  isCustom?: boolean;
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

// ================= CONSTANTS & METADATA =================
const CATEGORIES_META = [
  {
    id: 'all' as CategoryType,
    label: 'All Services',
    tamilLabel: 'அனைத்து சேவைகள்',
    color: '#2563eb',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  {
    id: 'electrician' as CategoryType,
    label: 'Electrician',
    tamilLabel: 'மின் பணியாளர்',
    color: '#d97706',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
  },
  {
    id: 'plumber' as CategoryType,
    label: 'Plumber',
    tamilLabel: 'குழாய் பழுது',
    color: '#0891b2',
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    borderColor: 'border-cyan-200',
  },
  {
    id: 'mechanic' as CategoryType,
    label: 'Bike/Car Mechanic',
    tamilLabel: 'வாகன மெக்கானிக்',
    color: '#e11d48',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200',
  },
  {
    id: 'ac_repair' as CategoryType,
    label: 'AC & Cooling',
    tamilLabel: 'ஏசி மெக்கானிக்',
    color: '#0284c7',
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-700',
    borderColor: 'border-sky-200',
  },
  {
    id: 'carpenter' as CategoryType,
    label: 'Carpenter',
    tamilLabel: 'மரவேலை',
    color: '#ea580c',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
  },
  {
    id: 'doctor' as CategoryType,
    label: 'Doctor / Clinic',
    tamilLabel: 'மருத்துவர் / கிளினிக்',
    color: '#059669',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
  },
  {
    id: 'cleaning' as CategoryType,
    label: 'Home Cleaning',
    tamilLabel: 'சுத்தம் செய்தல்',
    color: '#7c3aed',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
  },
  {
    id: 'appliance' as CategoryType,
    label: 'Appliance Repair',
    tamilLabel: 'உபகரண பழுது',
    color: '#4f46e5',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
  },
  {
    id: 'emergency_sos' as CategoryType,
    label: 'Emergency SOS',
    tamilLabel: 'அவசர உதவி SOS',
    color: '#dc2626',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-300',
  },
];

const COLLEGE_PRESETS: CollegePreset[] = [
  {
    id: 'anna-univ',
    name: 'Anna University (Guindy)',
    city: 'Chennai',
    tag: 'Engineering Campus',
    lat: 13.0102,
    lng: 80.2355,
    description: 'CEG Campus, Sardar Patel Road, Guindy, Chennai',
  },
  {
    id: 'iit-madras',
    name: 'IIT Madras',
    city: 'Chennai',
    tag: 'Research Campus',
    lat: 12.9915,
    lng: 80.2337,
    description: 'Opposite CLRI, Adyar, Chennai',
  },
  {
    id: 'psg-tech',
    name: 'PSG College of Technology',
    city: 'Coimbatore',
    tag: 'Coimbatore Hub',
    lat: 11.0247,
    lng: 76.9942,
    description: 'Avinashi Road, Peelamedu, Coimbatore',
  },
  {
    id: 'tce-madurai',
    name: 'Thiagarajar College (TCE)',
    city: 'Madurai',
    tag: 'Madurai Hub',
    lat: 9.8828,
    lng: 78.0816,
    description: 'Thiruparankundram, Madurai',
  },
  {
    id: 'srm-ktr',
    name: 'SRM Institute (KTR)',
    city: 'Chengalpattu',
    tag: 'Suburban Hub',
    lat: 12.823,
    lng: 80.0444,
    description: 'Potheri, SRM Nagar, Kattankulathur',
  },
  {
    id: 'tnagar-hub',
    name: 'T. Nagar Commercial Center',
    city: 'Chennai',
    tag: 'City Central',
    lat: 13.0418,
    lng: 80.2341,
    description: 'Panagal Park, Usman Road, Chennai',
  },
];

const SEED_PROVIDERS: ServiceProvider[] = [
  {
    id: 'prov-1',
    name: 'Murugan Power Tech & Wiring',
    category: 'electrician',
    subcategory: 'Domestic & Commercial Wiring',
    rating: 4.8,
    reviewCount: 142,
    hourlyRate: 350,
    visitingFee: 150,
    phone: '+91 98401 23456',
    whatsapp: '919840123456',
    experienceYears: 9,
    address: 'No. 14, Gandhi Road, Near Guindy Station',
    locality: 'Guindy, Chennai',
    lat: 13.0075,
    lng: 80.2158,
    isAvailable: true,
    isVerified: true,
    is24x7: true,
    services: ['Short Circuit Repair', 'MCB Tripping Fix', 'Inverter Wiring', 'Fan & Light Fitting'],
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&auto=format&fit=crop&q=80',
    description: 'Licensed wireman with 9+ years experience resolving tripping, surge issues, and domestic installations with a 30-day guarantee.',
  },
  {
    id: 'prov-2',
    name: 'Cauvery Aqua Plumbers',
    category: 'plumber',
    subcategory: 'Leakage & Tank Cleaning',
    rating: 4.7,
    reviewCount: 98,
    hourlyRate: 300,
    visitingFee: 100,
    phone: '+91 94440 87654',
    whatsapp: '919444087654',
    experienceYears: 7,
    address: 'Shop 4, Sardar Patel Road, Adyar',
    locality: 'Adyar, Chennai',
    lat: 13.0042,
    lng: 80.245,
    isAvailable: true,
    isVerified: true,
    is24x7: false,
    services: ['Bathroom Tap Leakage', 'Water Tank Cleaning', 'Drainage Block Clearing', 'Motor Pump Installation'],
    image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=300&auto=format&fit=crop&q=80',
    description: 'Specialist in CPVC pipeline, motor installation, overhead tank float repair, and bathroom drain unclogging.',
  },
  {
    id: 'prov-3',
    name: 'SpeedPro 24x7 Roadside Mechanic',
    category: 'mechanic',
    subcategory: 'On-Spot Breakdown Assistance',
    rating: 4.9,
    reviewCount: 230,
    hourlyRate: 450,
    visitingFee: 200,
    phone: '+91 97900 11223',
    whatsapp: '919790011223',
    experienceYears: 12,
    address: 'Near Kathipara Junction, Guindy',
    locality: 'Guindy Industrial Estate',
    lat: 13.0089,
    lng: 80.2078,
    isAvailable: true,
    isVerified: true,
    is24x7: true,
    services: ['Tubeless Puncture Repair', 'Battery Jumpstart', 'Clutch Cable Replace', 'Emergency Towing'],
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=300&auto=format&fit=crop&q=80',
    description: 'Rapid mobile roadside van with jump-starter kit, air compressor, tubeless tools, and 24-hour on-road breakdown rescue.',
  },
  {
    id: 'prov-4',
    name: 'FrostBreeze AC & Cooling Care',
    category: 'ac_repair',
    subcategory: 'Inverter AC Jet Pump Wash',
    rating: 4.6,
    reviewCount: 115,
    hourlyRate: 500,
    visitingFee: 200,
    phone: '+91 98844 55667',
    whatsapp: '919884455667',
    experienceYears: 8,
    address: '22, Velachery Main Road',
    locality: 'Velachery, Chennai',
    lat: 12.9815,
    lng: 80.218,
    isAvailable: true,
    isVerified: true,
    is24x7: false,
    services: ['Foam Jet Service', 'Gas Leakage & Refill', 'PCB Board Repair', 'AC Relocation'],
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300&auto=format&fit=crop&q=80',
    description: 'Certified Daikin, Voltas & LG technician. High-pressure jet pump cleaning enhances airflow and lowers electricity consumption.',
  },
  {
    id: 'prov-5',
    name: 'Karpagam Wood Craft & Carpentry',
    category: 'carpenter',
    subcategory: 'Furniture Repair & Door Latches',
    rating: 4.5,
    reviewCount: 64,
    hourlyRate: 400,
    visitingFee: 150,
    phone: '+91 91760 99887',
    whatsapp: '919176099887',
    experienceYears: 15,
    address: '8/1, Kottur Garden 2nd Cross',
    locality: 'Kotturpuram, Chennai',
    lat: 13.0185,
    lng: 80.241,
    isAvailable: true,
    isVerified: true,
    is24x7: false,
    services: ['Door Latch & Lock Replacement', 'Cupboard Hinge Repair', 'Study Table Assembly', 'Termite Treatment'],
    image: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=300&auto=format&fit=crop&q=80',
    description: 'Expert wooden craftsperson for home furniture adjustments, study tables, Godrej door locks, and hinge alignments.',
  },
  {
    id: 'prov-6',
    name: 'Dr. Anand Kumar (MBBS) - City Clinic',
    category: 'doctor',
    subcategory: 'General Physician & Home Visit',
    rating: 4.9,
    reviewCount: 310,
    hourlyRate: 400,
    visitingFee: 300,
    phone: '+91 98410 44332',
    whatsapp: '919841044332',
    experienceYears: 14,
    address: 'Door 15, Anna Salai, Saidapet',
    locality: 'Saidapet, Chennai',
    lat: 13.021,
    lng: 80.2225,
    isAvailable: true,
    isVerified: true,
    is24x7: true,
    services: ['Fever & Flu Consultation', 'Blood Pressure & Vitals', 'Emergency First-Aid', 'Home Health Visit'],
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
    description: 'Senior medical practitioner offering clinical consultations, home visits for students/seniors, and prescription care.',
  },
  {
    id: 'prov-7',
    name: 'SparkleClean Deep Cleaning',
    category: 'cleaning',
    subcategory: 'Home & Kitchen Sanitization',
    rating: 4.7,
    reviewCount: 82,
    hourlyRate: 600,
    visitingFee: 250,
    phone: '+91 90030 77665',
    whatsapp: '919003077665',
    experienceYears: 6,
    address: 'Plot 31, Tharamani Link Road',
    locality: 'Taramani, Chennai',
    lat: 12.986,
    lng: 80.242,
    isAvailable: false,
    isVerified: true,
    is24x7: false,
    services: ['Bathroom Stain Removal', 'Kitchen Chimney Degreasing', 'Sofa Shampooing', 'Full Home Deep Clean'],
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&auto=format&fit=crop&q=80',
    description: 'Equipped with industrial vacuum scrubbers, steam disinfectors, and eco-friendly cleaning detergents.',
  },
  {
    id: 'prov-8',
    name: 'SmartFix LED TV & Appliance',
    category: 'appliance',
    subcategory: 'Smart TV & Washing Machine',
    rating: 4.6,
    reviewCount: 77,
    hourlyRate: 350,
    visitingFee: 150,
    phone: '+91 96000 88991',
    whatsapp: '919600088991',
    experienceYears: 10,
    address: 'Near Little Mount Metro',
    locality: 'Saidapet, Chennai',
    lat: 13.016,
    lng: 80.228,
    isAvailable: true,
    isVerified: true,
    is24x7: false,
    services: ['LED Screen Backlight Repair', 'Washing Machine Drum Fix', 'Microwave Heating Issue', 'RO Water Purifier'],
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80',
    description: 'Component-level motherboard repair and genuine replacement parts for Samsung, LG, Sony, and IFB appliances.',
  },
  {
    id: 'prov-9',
    name: 'Guindy Trauma & Rapid Ambulance',
    category: 'emergency_sos',
    subcategory: '24x7 Emergency Life Support',
    rating: 5.0,
    reviewCount: 420,
    hourlyRate: 800,
    visitingFee: 500,
    phone: '+91 99400 10808',
    whatsapp: '919940010808',
    experienceYears: 16,
    address: 'Adjacent to Guindy Railway Junction',
    locality: 'Guindy, Chennai',
    lat: 13.009,
    lng: 80.213,
    isAvailable: true,
    isVerified: true,
    is24x7: true,
    services: ['ICU Oxygen Ambulance', 'Paramedic Dispatch', 'Accident Retrieval', 'Hospital Transport'],
    image: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=300&auto=format&fit=crop&q=80',
    description: 'Rapid response unit with on-board oxygen, cardiac defibrillator, trained emergency nurse, and immediate hospital dispatch.',
  },
];

// ================= GEOSPATIAL HAVERSINE ALGORITHM =================
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const toRad = (angle: number) => (angle * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 100) / 100;
}

function estimateETA(distanceKm: number, isEmergency = false): number {
  const speed = isEmergency ? 40 : 25; // km/h
  const buffer = isEmergency ? 3 : 5; // dispatch mins
  return Math.max(3, Math.round((distanceKm / speed) * 60 + buffer));
}

function formatDistance(distKm: number): string {
  if (distKm < 1) {
    return `${Math.round(distKm * 1000)} m`;
  }
  return `${distKm.toFixed(1)} km`;
}

function formatCurrency(amount: number): string {
  return `₹${amount}`;
}

// Dynamically generate realistic providers if none are nearby
function generateDynamicProvidersAround(lat: number, lng: number): ServiceProvider[] {
  const templates = [
    {
      cat: 'electrician' as CategoryType,
      name: 'BrightSpark Electric & Solar',
      sub: 'Emergency Fuse & Inverter Wiring',
      rate: 350,
      fee: 150,
      offset: [0.005, 0.006],
      services: ['Trip Switch Diagnostics', 'Inverter Setup', 'Geyser Wiring', 'Ceiling Fan Installation'],
      desc: 'Expert residential and commercial electrician with instant 20-min arrival in your neighborhood.',
    },
    {
      cat: 'plumber' as CategoryType,
      name: 'AquaFlow Pipeline Masters',
      sub: 'Tap Leakage & Motor Pump',
      rate: 320,
      fee: 100,
      offset: [-0.004, 0.007],
      services: ['Overhead Tank Float Valve', 'Water Filter RO Setup', 'Drain Line De-clogging', 'Bath Fittings'],
      desc: 'Quick emergency plumbing solution with guaranteed sealants and genuine fittings.',
    },
    {
      cat: 'mechanic' as CategoryType,
      name: 'QuickShift Roadside Breakdown',
      sub: '24x7 Bike & Car Towing',
      rate: 400,
      fee: 150,
      offset: [0.007, -0.005],
      services: ['Doorstep Puncture Repair', 'Jump Start Battery', 'Drive Belt Fix', 'Engine Oil Change'],
      desc: 'Mobile technician van on call 24 hours with hydraulic jacks and emergency toolkit.',
    },
    {
      cat: 'ac_repair' as CategoryType,
      name: 'CoolPoint Air Conditioners',
      sub: 'Jet Clean & Gas Refill',
      rate: 490,
      fee: 200,
      offset: [-0.006, -0.006],
      services: ['Pressure Jet Pump Wash', 'Gas Top-up R32', 'PCB Board Soldering', 'Indoor Unit Noise Fix'],
      desc: 'Certified HVAC technicians for split and window AC servicing with 45-day cooling guarantee.',
    },
    {
      cat: 'doctor' as CategoryType,
      name: 'Dr. S. Priya Clinic & Diagnostics',
      sub: 'General Physician & First-Aid',
      rate: 350,
      fee: 250,
      offset: [0.003, -0.003],
      services: ['Seasonal Flu & Fever', 'Blood Glucose Check', 'Nebulization & Inhaler', 'Home Visit Consultation'],
      desc: 'Dedicated family clinic providing gentle care, primary health checks, and urgent consultation.',
    },
    {
      cat: 'emergency_sos' as CategoryType,
      name: 'LifeLine Rapid Emergency Response',
      sub: 'Oxygen & Trauma Ambulance',
      rate: 750,
      fee: 400,
      offset: [0.002, 0.002],
      services: ['24/7 Patient Transport', 'Paramedic on Board', 'Oxygen Support', 'Cardiac Monitor'],
      desc: 'High priority SOS transport unit with GPS tracking and zero delay response.',
    },
  ];

  return templates.map((t, idx) => ({
    id: `dyn-${idx}-${Date.now().toString(36)}`,
    name: t.name,
    category: t.cat,
    subcategory: t.sub,
    rating: Number((4.6 + (idx % 4) * 0.1).toFixed(1)),
    reviewCount: 50 + idx * 25,
    hourlyRate: t.rate,
    visitingFee: t.fee,
    phone: `+91 9840${idx} ${12000 + idx * 111}`,
    whatsapp: `919840${idx}12345`,
    experienceYears: 6 + idx,
    address: `Service Hub #${idx + 1}, Main Road`,
    locality: 'Local Area',
    lat: lat + t.offset[0],
    lng: lng + t.offset[1],
    isAvailable: true,
    isVerified: true,
    is24x7: t.cat === 'emergency_sos' || t.cat === 'mechanic',
    services: t.services,
    image: SEED_PROVIDERS[idx % SEED_PROVIDERS.length].image,
    description: t.desc,
  }));
}

// ================= MAIN APP COMPONENT =================
export default function App() {
  const [lang, setLang] = useState<'en' | 'ta'>('en');

  // Location State (Default: Anna University Campus, Guindy)
  const [userLocation, setUserLocation] = useState<UserLocation>({
    lat: 13.0102,
    lng: 80.2355,
    addressName: 'Anna University Campus, Guindy, Chennai',
    isGpsActive: false,
  });

  // Providers list
  const [allProviders, setAllProviders] = useState<ServiceProvider[]>(() => {
    try {
      const stored = localStorage.getItem('geoserve_custom_providers');
      if (stored) {
        const custom: ServiceProvider[] = JSON.parse(stored);
        return [...SEED_PROVIDERS, ...custom];
      }
    } catch {
      // ignore
    }
    return SEED_PROVIDERS;
  });

  // Bookings list
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const stored = localStorage.getItem('geoserve_bookings');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  });

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(10);
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [only24x7, setOnly24x7] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'price' | 'experience'>('distance');

  // Modals & UI selection
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [bookingProvider, setBookingProvider] = useState<ServiceProvider | null>(null);
  const [showAddProviderModal, setShowAddProviderModal] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [showVivaModal, setShowVivaModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [bookingSuccessTicket, setBookingSuccessTicket] = useState<Booking | null>(null);

  // Add Provider Form
  const [newProvName, setNewProvName] = useState('');
  const [newProvCat, setNewProvCat] = useState<CategoryType>('electrician');
  const [newProvSub, setNewProvSub] = useState('');
  const [newProvPhone, setNewProvPhone] = useState('');
  const [newProvRate, setNewProvRate] = useState(350);
  const [newProvFee, setNewProvFee] = useState(150);
  const [newProvExp, setNewProvExp] = useState(5);
  const [newProvLocality, setNewProvLocality] = useState('');
  const [newProvServices, setNewProvServices] = useState('Wiring, Installation, Emergency Repair');
  const [newProvLat, setNewProvLat] = useState(userLocation.lat);
  const [newProvLng, setNewProvLng] = useState(userLocation.lng);

  // Booking Form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState(userLocation.addressName);
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bookingTimeSlot, setBookingTimeSlot] = useState('10:00 AM - 12:00 PM');
  const [bookingIssue, setBookingIssue] = useState('');
  const [bookingUrgency, setBookingUrgency] = useState<'normal' | 'urgent' | 'emergency'>('normal');

  // Leaflet Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  // Auto-populate dynamic providers if none exist nearby
  useEffect(() => {
    const nearbyCount = allProviders.filter(
      (p) => calculateHaversineDistance(userLocation.lat, userLocation.lng, p.lat, p.lng) <= 30
    ).length;

    if (nearbyCount === 0) {
      const generated = generateDynamicProvidersAround(userLocation.lat, userLocation.lng);
      setAllProviders((prev) => [...prev, ...generated]);
    }
  }, [userLocation.lat, userLocation.lng]);

  // Compute distances & filter providers
  const filteredProviders = useMemo(() => {
    return allProviders
      .map((p) => {
        const dist = calculateHaversineDistance(userLocation.lat, userLocation.lng, p.lat, p.lng);
        const eta = estimateETA(dist, p.category === 'emergency_sos');
        return {
          ...p,
          distanceKm: dist,
          etaMins: eta,
        };
      })
      .filter((p) => {
        if (p.distanceKm! > maxRadiusKm) return false;
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
        if (minRating > 0 && p.rating < minRating) return false;
        if (onlyAvailable && !p.isAvailable) return false;
        if (only24x7 && !p.is24x7) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          const matchSub = p.subcategory.toLowerCase().includes(q);
          const matchLoc = p.locality.toLowerCase().includes(q);
          const matchSvc = p.services.some((s) => s.toLowerCase().includes(q));
          if (!matchName && !matchCat && !matchSub && !matchLoc && !matchSvc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'distance') return (a.distanceKm || 0) - (b.distanceKm || 0);
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'price') return a.hourlyRate - b.hourlyRate;
        if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
        return 0;
      });
  }, [
    allProviders,
    userLocation.lat,
    userLocation.lng,
    selectedCategory,
    maxRadiusKm,
    minRating,
    onlyAvailable,
    only24x7,
    searchQuery,
    sortBy,
  ]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 13,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      handleLocationChange(
        e.latlng.lat,
        e.latlng.lng,
        `Point (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`
      );
    });

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update User Marker & Radius
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const userIconHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-12 h-12 bg-blue-500/30 rounded-full radar-pulse"></div>
        <div class="relative w-8 h-8 bg-blue-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white font-bold text-xs">
          📍
        </div>
      </div>
    `;

    const userDivIcon = L.divIcon({
      className: 'custom-map-pin',
      html: userIconHtml,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      const marker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userDivIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      marker.bindPopup(
        `
        <div class="p-3 text-center">
          <div class="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1">Your Location</div>
          <div class="text-xs font-semibold text-slate-800">${userLocation.addressName}</div>
          <div class="text-[10px] text-slate-500 mt-1">Tap anywhere to relocate pin</div>
        </div>
      `,
        { className: 'custom-popup' }
      );

      userMarkerRef.current = marker;
    }

    const radiusMeters = maxRadiusKm * 1000;
    if (radiusCircleRef.current) {
      radiusCircleRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      radiusCircleRef.current.setRadius(radiusMeters);
    } else {
      const circle = L.circle([userLocation.lat, userLocation.lng], {
        radius: radiusMeters,
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        weight: 2,
        dashArray: '5, 5',
      }).addTo(map);
      radiusCircleRef.current = circle;
    }
  }, [userLocation.lat, userLocation.lng, userLocation.addressName, maxRadiusKm]);

  // Update Markers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    filteredProviders.forEach((prov) => {
      const meta = CATEGORIES_META.find((c) => c.id === prov.category) || CATEGORIES_META[1];
      const isSelected = selectedProvider?.id === prov.id;
      const isEmergency = prov.category === 'emergency_sos';

      const iconEmoji =
        prov.category === 'electrician' ? '⚡' :
        prov.category === 'plumber' ? '🔧' :
        prov.category === 'mechanic' ? '🚗' :
        prov.category === 'ac_repair' ? '❄️' :
        prov.category === 'doctor' ? '🏥' :
        prov.category === 'emergency_sos' ? '🚨' :
        prov.category === 'carpenter' ? '🪚' :
        prov.category === 'cleaning' ? '🧹' : '📺';

      const markerHtml = `
        <div class="relative cursor-pointer transition-transform duration-200 ${
          isSelected ? 'scale-125 z-50' : 'hover:scale-110'
        }">
          <div class="w-8 h-8 rounded-xl shadow-md border-2 ${
            isSelected ? 'border-amber-400 ring-4 ring-amber-300/60' : 'border-white'
          } flex items-center justify-center text-white ${isEmergency ? 'bg-red-600 animate-pulse' : ''}" style="background-color: ${meta.color}">
            <span class="text-sm">${iconEmoji}</span>
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45" style="background-color: ${meta.color}"></div>
          ${
            prov.distanceKm !== undefined
              ? `<div class="absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[9px] font-bold px-1.5 py-0.2 rounded shadow whitespace-nowrap">${formatDistance(
                  prov.distanceKm
                )}</div>`
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: markerHtml,
        iconSize: [32, 42],
        iconAnchor: [16, 38],
        popupAnchor: [0, -35],
      });

      const marker = L.marker([prov.lat, prov.lng], { icon: customIcon });

      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-3 w-60 text-left';
      popupDiv.innerHTML = `
        <div class="flex items-center justify-between mb-1">
          <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${meta.bgColor} ${meta.textColor}">
            ${meta.label}
          </span>
          <span class="text-xs font-bold text-amber-600">★ ${prov.rating.toFixed(1)}</span>
        </div>
        <h4 class="font-bold text-slate-900 text-sm line-clamp-1">${prov.name}</h4>
        <p class="text-xs text-slate-500 mb-2">${prov.locality}</p>
        <div class="flex items-center justify-between text-xs py-1.5 border-t border-b border-slate-100 mb-2">
          <span class="text-slate-600">Distance: <b>${formatDistance(prov.distanceKm || 0)}</b></span>
          <span class="text-emerald-700 font-bold">${formatCurrency(prov.hourlyRate)}/hr</span>
        </div>
        <button id="card-btn-${prov.id}" class="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 rounded-lg shadow-sm">
          View Profile & Book
        </button>
      `;

      marker.bindPopup(popupDiv, { className: 'custom-popup' });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`card-btn-${prov.id}`);
        if (btn) {
          btn.onclick = () => {
            setSelectedProvider(prov);
          };
        }
      });

      marker.on('click', () => {
        setSelectedProvider(prov);
      });

      marker.addTo(markersLayer);
    });
  }, [filteredProviders, selectedProvider]);

  // Selected Provider Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    if (selectedProvider) {
      const line = L.polyline(
        [
          [userLocation.lat, userLocation.lng],
          [selectedProvider.lat, selectedProvider.lng],
        ],
        {
          color: '#2563eb',
          weight: 3,
          opacity: 0.85,
          dashArray: '6, 6',
        }
      ).addTo(map);

      routeLineRef.current = line;
      map.fitBounds(
        L.latLngBounds([
          [userLocation.lat, userLocation.lng],
          [selectedProvider.lat, selectedProvider.lng],
        ]),
        { padding: [50, 50], maxZoom: 15 }
      );
    }
  }, [selectedProvider, userLocation.lat, userLocation.lng]);

  const handleLocationChange = (lat: number, lng: number, addressName: string) => {
    setUserLocation({
      lat,
      lng,
      addressName,
      isGpsActive: false,
    });
    setNewProvLat(lat);
    setNewProvLng(lng);
    setCustomerAddress(addressName);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo([lat, lng]);
    }
  };

  // Browser Geolocation API
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setUserLocation({
          lat: latitude,
          lng: longitude,
          addressName: `Detected GPS (${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E)`,
          accuracy,
          isGpsActive: true,
        });
        setNewProvLat(latitude);
        setNewProvLng(longitude);
        setCustomerAddress(`My GPS Location (Accuracy ~${Math.round(accuracy)}m)`);
        setIsGpsLoading(false);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 14, { duration: 1.2 });
        }
      },
      (err) => {
        setIsGpsLoading(false);
        let msg = 'Could not access GPS.';
        if (err.code === 1) msg = 'Location access was denied. Please allow permission.';
        if (err.code === 2) msg = 'Position unavailable. Try selecting a college preset above.';
        if (err.code === 3) msg = 'Location request timed out.';
        setGpsError(msg);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // CRUD: Add New Provider
  const handleAddProviderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProvName.trim() || !newProvPhone.trim()) return;

    const newProvider: ServiceProvider = {
      id: `custom-${Date.now()}`,
      name: newProvName.trim(),
      category: newProvCat,
      subcategory: newProvSub.trim() || `${newProvCat.toUpperCase()} Specialist`,
      rating: 4.8,
      reviewCount: 1,
      hourlyRate: Number(newProvRate) || 350,
      visitingFee: Number(newProvFee) || 150,
      phone: newProvPhone.trim(),
      whatsapp: newProvPhone.replace(/[^0-9]/g, ''),
      experienceYears: Number(newProvExp) || 4,
      address: newProvLocality.trim() || 'Local Area Address',
      locality: newProvLocality.trim() || userLocation.addressName,
      lat: Number(newProvLat),
      lng: Number(newProvLng),
      isAvailable: true,
      isVerified: true,
      is24x7: false,
      services: newProvServices
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      image: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=300&auto=format&fit=crop&q=80',
      description: `Newly registered local ${newProvCat} service provider ready to assist with domestic and commercial needs.`,
      isCustom: true,
    };

    const updated = [newProvider, ...allProviders];
    setAllProviders(updated);

    const customList = updated.filter((p) => p.isCustom);
    localStorage.setItem('geoserve_custom_providers', JSON.stringify(customList));

    setNewProvName('');
    setNewProvSub('');
    setNewProvPhone('');
    setShowAddProviderModal(false);
    setSelectedProvider(newProvider);
  };

  const handleDeleteProvider = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = allProviders.filter((p) => p.id !== id);
    setAllProviders(updated);
    const customList = updated.filter((p) => p.isCustom);
    localStorage.setItem('geoserve_custom_providers', JSON.stringify(customList));
    if (selectedProvider?.id === id) setSelectedProvider(null);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingProvider || !customerName.trim() || !customerPhone.trim()) return;

    const newBooking: Booking = {
      id: `BK-${Math.floor(100000 + Math.random() * 900000)}`,
      providerId: bookingProvider.id,
      providerName: bookingProvider.name,
      providerCategory: bookingProvider.category,
      providerPhone: bookingProvider.phone,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim() || userLocation.addressName,
      date: bookingDate,
      timeSlot: bookingTimeSlot,
      issueDescription: bookingIssue.trim() || 'General service request',
      urgency: bookingUrgency,
      status: 'confirmed',
      createdAt: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      estimatedCost: bookingProvider.hourlyRate + bookingProvider.visitingFee,
    };

    const updated = [newBooking, ...bookings];
    setBookings(updated);
    localStorage.setItem('geoserve_bookings', JSON.stringify(updated));

    setBookingSuccessTicket(newBooking);
    setBookingProvider(null);
  };

  const handleCancelBooking = (bookingId: string) => {
    const updated = bookings.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' as const } : b));
    setBookings(updated);
    localStorage.setItem('geoserve_bookings', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* ================= TOP ANNOUNCEMENT & COLLEGE LAB BAR ================= */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo & Lab Tag */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold text-lg">
                <Navigation className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-base tracking-tight text-white">
                    {lang === 'en' ? 'GeoServe' : 'ஜியோசர்வ்'}
                  </h1>
                  <span className="bg-blue-600/30 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                    Mini Project Prototype
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {lang === 'en'
                    ? 'Geo Local Service Finder • Web Programming Lab'
                    : 'உள்ளூர் சேவை தேடுபவர் • இணைய நிரலாக்க ஆய்வகம்'}
                </p>
              </div>
            </div>

            {/* Quick Actions (Add Provider, Bookings, Viva Modal, Emergency SOS, Language) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEmergencyModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition animate-pulse"
                title="Immediate 24/7 Emergency Services"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="hidden md:inline">24x7 SOS</span>
              </button>

              <button
                onClick={() => setShowAddProviderModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
                title="Register New Service Provider (CRUD Demo)"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Service (CRUD)</span>
              </button>

              <button
                onClick={() => setShowBookingsModal(true)}
                className="relative flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
                title="View My Service Requests"
              >
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Bookings</span>
                {bookings.length > 0 && (
                  <span className="w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {bookings.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowVivaModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-sm transition"
                title="Lab Presentation, Viva Q&A & Math Info"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-200" />
                <span className="hidden sm:inline">Lab Viva Info</span>
              </button>

              {/* Language Switcher */}
              <button
                onClick={() => setLang((l) => (l === 'en' ? 'ta' : 'en'))}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700"
                title="Toggle Language"
              >
                {lang === 'en' ? 'தமிழ்' : 'English'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ================= GEOLOCATION CONTROLS & COLLEGE PRESETS ================= */}
      <section className="bg-white border-b border-slate-200 shadow-sm py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Current Active Location Display & GPS detect */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 py-1.5 px-3 rounded-xl border border-slate-200">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-semibold text-slate-900 truncate max-w-[240px] sm:max-w-xs">
                {userLocation.addressName}
              </span>
            </div>

            <button
              onClick={handleDetectGPS}
              disabled={isGpsLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-xl transition"
            >
              <LocateFixed className={`w-3.5 h-3.5 ${isGpsLoading ? 'animate-spin' : ''}`} />
              <span>{isGpsLoading ? 'Detecting GPS...' : 'Use My GPS'}</span>
            </button>
          </div>

          {/* College Campuses & Cities Quick Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
              College Hubs:
            </span>
            {COLLEGE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleLocationChange(preset.lat, preset.lng, `${preset.name}, ${preset.city}`)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium shrink-0 transition ${
                  Math.abs(userLocation.lat - preset.lat) < 0.001
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {preset.name.split(' ')[0]} ({preset.city.split(',')[0]})
              </button>
            ))}
          </div>
        </div>

        {gpsError && (
          <div className="max-w-7xl mx-auto mt-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg flex items-center justify-between">
            <span>{gpsError}</span>
            <button onClick={() => setGpsError(null)} className="font-bold ml-2">
              ×
            </button>
          </div>
        )}
      </section>

      {/* ================= SEARCH & CATEGORY CHIPS ================= */}
      <section className="bg-slate-100/60 border-b border-slate-200 py-3 px-4">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Search bar & radius slider */}
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  lang === 'en'
                    ? 'Search by service (Electrician, Plumber), name, or locality...'
                    : 'சேவை அல்லது ஊர் பெயரை தேடவும்...'
                }
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
                >
                  ×
                </button>
              )}
            </div>

            {/* Radius Slider */}
            <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-slate-200 w-full md:w-auto shadow-sm">
              <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                Radius: <strong className="text-blue-600">{maxRadiusKm} km</strong>
              </span>
              <input
                type="range"
                min="1"
                max="25"
                step="1"
                value={maxRadiusKm}
                onChange={(e) => setMaxRadiusKm(Number(e.target.value))}
                className="w-28 accent-blue-600 cursor-pointer"
              />
              <div className="flex gap-1">
                {[3, 5, 10, 20].map((r) => (
                  <button
                    key={r}
                    onClick={() => setMaxRadiusKm(r)}
                    className={`px-1.5 py-0.5 text-[10px] rounded font-bold ${
                      maxRadiusKm === r ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {r}k
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 w-full md:w-auto shadow-sm">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs bg-transparent font-medium text-slate-700 outline-none cursor-pointer"
              >
                <option value="distance">Sort: Nearest Distance</option>
                <option value="rating">Sort: Top Rated</option>
                <option value="price">Sort: Lowest Price</option>
                <option value="experience">Sort: Most Experienced</option>
              </select>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES_META.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.id === 'emergency_sos' ? '🚨' : ''}</span>
                  <span>{lang === 'en' ? cat.label : cat.tamilLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= MAIN SPLIT VIEW (MAP + PROVIDER LIST) ================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col lg:flex-row gap-4">
        {/* Left Column: Interactive Map */}
        <div className="lg:w-7/12 flex flex-col h-[400px] lg:h-[calc(100vh-250px)] sticky lg:top-24">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-blue-600" />
                <span>Geospatial Coverage Map</span>
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                ({filteredProviders.length} in {maxRadiusKm}km circle)
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span> You
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> Service
              </span>
            </div>
          </div>

          {/* Leaflet Map Container */}
          <div className="relative flex-1 w-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Recenter & Fit buttons */}
            <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
              <button
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 14, { duration: 0.8 });
                  }
                }}
                className="p-2 bg-white/95 text-slate-700 hover:text-blue-600 rounded-xl shadow-md border border-slate-200 text-xs font-semibold flex items-center gap-1"
                title="Recenter Map on User"
              >
                <LocateFixed className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">Center Me</span>
              </button>

              <button
                onClick={() => {
                  if (!mapInstanceRef.current || filteredProviders.length === 0) return;
                  const pts: [number, number][] = [
                    [userLocation.lat, userLocation.lng],
                    ...filteredProviders.map((p): [number, number] => [p.lat, p.lng]),
                  ];
                  mapInstanceRef.current.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 15 });
                }}
                className="p-2 bg-white/95 text-slate-700 hover:text-blue-600 rounded-xl shadow-md border border-slate-200 text-xs font-semibold flex items-center gap-1"
                title="Fit All Markers"
              >
                <Maximize2 className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline">Fit All</span>
              </button>
            </div>

            {/* Map click hint */}
            <div className="absolute bottom-3 left-3 z-20 bg-slate-900/85 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5 shadow pointer-events-none">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>Tap anywhere on the map to relocate your search center</span>
            </div>
          </div>
        </div>

        {/* Right Column: Service Provider Cards List */}
        <div className="lg:w-5/12 flex flex-col">
          {/* Header Bar */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {lang === 'en' ? 'Nearby Verified Providers' : 'அருகிலுள்ள சரிபார்க்கப்பட்ட சேவையாளர்கள்'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Sorted by Haversine distance from your location
              </p>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Online Now</span>
              </label>

              <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={only24x7}
                  onChange={(e) => setOnly24x7(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>24/7 SOS</span>
              </label>
            </div>
          </div>

          {/* List or Empty State */}
          {filteredProviders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center my-auto">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">No Service Providers Found</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
                No providers match your search within {maxRadiusKm} km. Try increasing the search radius or resetting filters.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setMaxRadiusKm(20)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold"
                >
                  Expand Radius to 20 km
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setOnlyAvailable(false);
                    setOnly24x7(false);
                  }}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto pr-1">
              {filteredProviders.map((provider) => {
                const meta = CATEGORIES_META.find((c) => c.id === provider.category) || CATEGORIES_META[1];
                const isSelected = selectedProvider?.id === provider.id;

                return (
                  <div
                    key={provider.id}
                    onClick={() => setSelectedProvider(provider)}
                    className={`bg-white rounded-2xl border transition-all duration-200 cursor-pointer p-4 hover:shadow-md ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md bg-blue-50/15'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Header Row: Category Badge + Distance & ETA */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${meta.bgColor} ${meta.textColor} border ${meta.borderColor}`}
                        >
                          {meta.label}
                        </span>
                        {provider.is24x7 && (
                          <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200 animate-pulse">
                            24/7 SOS
                          </span>
                        )}
                        {provider.isCustom && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                            Lab Demo Added
                          </span>
                        )}
                      </div>

                      {provider.distanceKm !== undefined && (
                        <div className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          <span>{formatDistance(provider.distanceKm)}</span>
                          {provider.etaMins && (
                            <span className="text-slate-400 text-[10px] font-normal">
                              (~{provider.etaMins}m)
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Content Row: Image + Details */}
                    <div className="flex items-start gap-3 mb-2.5">
                      <div className="relative shrink-0">
                        <img
                          src={provider.image}
                          alt={provider.name}
                          className="w-13 h-13 rounded-xl object-cover border border-slate-200 shadow-sm"
                        />
                        <span
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white rounded-full ${
                            provider.isAvailable ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                          title={provider.isAvailable ? 'Online' : 'Busy'}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <h4 className="font-bold text-slate-900 text-sm truncate hover:text-blue-600">
                            {provider.name}
                          </h4>
                          {provider.isVerified && (
                            <span title="Verified Professional">
                              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 truncate mb-1">
                          {provider.subcategory} • {provider.locality}
                        </p>

                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex items-center gap-0.5 font-bold text-amber-600">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{provider.rating.toFixed(1)}</span>
                            <span className="text-slate-400 font-normal">({provider.reviewCount})</span>
                          </div>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-600 font-medium">
                            {provider.experienceYears}+ yrs exp
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {provider.services.slice(0, 3).map((s, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* Bottom Pricing & Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-medium">Rates</div>
                        <div className="text-sm font-extrabold text-slate-900">
                          {formatCurrency(provider.hourlyRate)}
                          <span className="text-[11px] font-normal text-slate-500">/hr</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {provider.isCustom && (
                          <button
                            onClick={(e) => handleDeleteProvider(provider.id, e)}
                            title="Delete custom provider (CRUD)"
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `tel:${provider.phone.replace(/[^0-9+]/g, '')}`;
                          }}
                          title={`Call ${provider.name}`}
                          className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-slate-200 transition"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const msg = encodeURIComponent(
                              `Hello ${provider.name}, I found you on GeoServe. I need help with ${provider.subcategory}. Are you available?`
                            );
                            window.open(`https://wa.me/${provider.whatsapp}?text=${msg}`, '_blank');
                          }}
                          title="WhatsApp Chat"
                          className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-slate-200 transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setBookingProvider(provider);
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ================= MODAL 1: PROVIDER DETAIL VIEW ================= */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="relative h-40 bg-gradient-to-r from-blue-600 to-indigo-700 p-6 flex flex-col justify-end text-white">
              <button
                onClick={() => setSelectedProvider(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-white/20 backdrop-blur-sm font-bold px-2.5 py-0.5 rounded-full uppercase">
                  {selectedProvider.category.replace('_', ' ')}
                </span>
                {selectedProvider.is24x7 && (
                  <span className="text-xs bg-red-500 font-bold px-2 py-0.5 rounded-full">
                    24/7 Service
                  </span>
                )}
              </div>
              <h3 className="text-xl font-extrabold mt-1 truncate">{selectedProvider.name}</h3>
              <p className="text-xs text-blue-100">{selectedProvider.locality}</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center justify-between text-xs py-2 bg-slate-50 px-3 rounded-xl border border-slate-200">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Haversine Distance</div>
                  <div className="font-extrabold text-blue-600 text-sm">
                    {formatDistance(selectedProvider.distanceKm || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Response ETA</div>
                  <div className="font-extrabold text-slate-800 text-sm">
                    ~{selectedProvider.etaMins} mins
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Hourly Rate</div>
                  <div className="font-extrabold text-emerald-600 text-sm">
                    {formatCurrency(selectedProvider.hourlyRate)}/hr
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Visiting Fee</div>
                  <div className="font-extrabold text-slate-800 text-sm">
                    {formatCurrency(selectedProvider.visitingFee)}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">About Service</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedProvider.description}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Services & Specialties</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProvider.services.map((svc, i) => (
                    <span
                      key={i}
                      className="text-xs bg-blue-50 text-blue-700 border border-blue-100 font-medium px-2.5 py-1 rounded-lg"
                    >
                      ✓ {svc}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Contact & Address</h4>
                <p className="text-xs text-slate-600">{selectedProvider.address}</p>
                <p className="text-xs font-semibold text-slate-800 mt-1">Phone: {selectedProvider.phone}</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  window.location.href = `tel:${selectedProvider.phone.replace(/[^0-9+]/g, '')}`;
                }}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Call Provider</span>
              </button>

              <button
                onClick={() => {
                  setBookingProvider(selectedProvider);
                  setSelectedProvider(null);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Service Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: BOOKING FORM MODAL ================= */}
      {bookingProvider && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-blue-400 font-bold uppercase tracking-wider">
                  Confirm Service Booking
                </div>
                <h3 className="text-base font-bold text-white truncate">{bookingProvider.name}</h3>
              </div>
              <button
                onClick={() => setBookingProvider(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto">
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-xs text-blue-900 flex items-center justify-between">
                <span>
                  Service: <strong>{bookingProvider.subcategory}</strong>
                </span>
                <span className="font-extrabold text-blue-700">
                  Est. Base: {formatCurrency(bookingProvider.hourlyRate + bookingProvider.visitingFee)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Guhan / Student Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service Address / Location *</label>
                <input
                  type="text"
                  required
                  placeholder="Hostel, Street address, Room number"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot *</label>
                  <select
                    value={bookingTimeSlot}
                    onChange={(e) => setBookingTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Immediate (Next 30 Mins)">Immediate (Next 30 Mins)</option>
                    <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                    <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                    <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                    <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Urgency Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['normal', 'urgent', 'emergency'] as const).map((urg) => (
                    <button
                      type="button"
                      key={urg}
                      onClick={() => setBookingUrgency(urg)}
                      className={`py-1.5 text-xs font-semibold rounded-lg capitalize border ${
                        bookingUrgency === urg
                          ? urg === 'emergency'
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {urg}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Issue Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe your issue (e.g. MCB tripping continuously, water pipe burst, bike tyre puncture)"
                  value={bookingIssue}
                  onChange={(e) => setBookingIssue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBookingProvider(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Confirm & Generate Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: BOOKING SUCCESS TICKET ================= */}
      {bookingSuccessTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 p-6 text-center animate-in zoom-in-95">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full mb-1">
              Booking Confirmed
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Reference #{bookingSuccessTicket.id}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Your service request has been dispatched to {bookingSuccessTicket.providerName}
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 text-left text-xs space-y-2 border border-slate-200 mb-5">
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="font-bold text-slate-900">{bookingSuccessTicket.providerCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Slot:</span>
                <span className="font-bold text-slate-900">
                  {bookingSuccessTicket.date} • {bookingSuccessTicket.timeSlot}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-semibold text-slate-800">{bookingSuccessTicket.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                  {bookingSuccessTicket.customerAddress}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-bold">Estimated Cost:</span>
                <span className="font-extrabold text-emerald-600">
                  {formatCurrency(bookingSuccessTicket.estimatedCost)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  window.location.href = `tel:${bookingSuccessTicket.providerPhone.replace(/[^0-9+]/g, '')}`;
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Provider</span>
              </button>

              <button
                onClick={() => setBookingSuccessTicket(null)}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: ADD SERVICE PROVIDER (CRUD FOR LAB EVALUATION) ================= */}
      {showAddProviderModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">
                  Lab Viva CRUD Feature
                </span>
                <h3 className="text-lg font-extrabold mt-1">Register New Service Provider</h3>
                <p className="text-xs text-emerald-100">
                  Demonstrates dynamic CREATE operation in Web Programming
                </p>
              </div>
              <button
                onClick={() => setShowAddProviderModal(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProviderSubmit} className="p-5 space-y-3 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Provider / Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sri Balaji Electricals"
                    value={newProvName}
                    onChange={(e) => setNewProvName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newProvCat}
                    onChange={(e) => setNewProvCat(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {CATEGORIES_META.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Specialty / Subcategory</label>
                  <input
                    type="text"
                    placeholder="e.g. 24x7 Inverter & Tripping Fix"
                    value={newProvSub}
                    onChange={(e) => setNewProvSub(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98401 99999"
                    value={newProvPhone}
                    onChange={(e) => setNewProvPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    value={newProvRate}
                    onChange={(e) => setNewProvRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Visiting Fee (₹)</label>
                  <input
                    type="number"
                    value={newProvFee}
                    onChange={(e) => setNewProvFee(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Exp (Years)</label>
                  <input
                    type="number"
                    value={newProvExp}
                    onChange={(e) => setNewProvExp(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address / Locality</label>
                <input
                  type="text"
                  placeholder="e.g. Sardar Patel Road, Guindy, Chennai"
                  value={newProvLocality}
                  onChange={(e) => setNewProvLocality(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Services List (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="Inverter Repair, MCB Tripping, Ceiling Fan, Wiring"
                  value={newProvServices}
                  onChange={(e) => setNewProvServices(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Coordinates configuration */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-700">GPS Coordinates (Map Pin Position)</span>
                  <button
                    type="button"
                    onClick={() => {
                      setNewProvLat(userLocation.lat + 0.003);
                      setNewProvLng(userLocation.lng + 0.003);
                    }}
                    className="text-[10px] text-emerald-700 font-bold underline"
                  >
                    Place Near My Location
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={newProvLat}
                      onChange={(e) => setNewProvLat(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={newProvLng}
                      onChange={(e) => setNewProvLng(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProviderModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20"
                >
                  Register Provider & Pin on Map
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: MY BOOKINGS MODAL ================= */}
      {showBookingsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">My Service Bookings</h3>
                <p className="text-xs text-slate-400">Track and manage your local service appointments</p>
              </div>
              <button
                onClick={() => setShowBookingsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto space-y-3">
              {bookings.length === 0 ? (
                <div className="text-center py-10">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No active bookings yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Book any local service provider to see your appointment tickets here.
                  </p>
                </div>
              ) : (
                bookings.map((b) => (
                  <div key={b.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-blue-700">{b.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <div className="font-bold text-slate-900 text-sm">{b.providerName}</div>
                    <div className="text-slate-500">
                      📅 {b.date} at {b.timeSlot} • {b.issueDescription}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <span className="font-extrabold text-slate-800">
                        Est: {formatCurrency(b.estimatedCost)}
                      </span>
                      <div className="flex items-center gap-2">
                        {b.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancelBooking(b.id)}
                            className="text-rose-600 hover:underline text-[11px] font-semibold"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => {
                            window.location.href = `tel:${b.providerPhone.replace(/[^0-9+]/g, '')}`;
                          }}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold"
                        >
                          Call
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 6: EMERGENCY 24x7 SOS MODAL ================= */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-red-300">
            <div className="bg-red-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
                <div>
                  <h3 className="text-base font-extrabold">24x7 Emergency SOS Services</h3>
                  <p className="text-xs text-red-100">Immediate hotlines and nearest emergency responders</p>
                </div>
              </div>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="tel:108"
                  className="p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <div className="font-extrabold text-red-700 text-sm">Ambulance</div>
                    <div className="text-[10px] text-slate-500">Medical Emergency</div>
                  </div>
                  <span className="text-base font-black text-red-600">108</span>
                </a>

                <a
                  href="tel:100"
                  className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <div className="font-extrabold text-blue-700 text-sm">Police Patrol</div>
                    <div className="text-[10px] text-slate-500">Law & Order SOS</div>
                  </div>
                  <span className="text-base font-black text-blue-600">100</span>
                </a>
              </div>

              <div className="pt-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                  Nearest Local SOS Responders (Haversine Sorted)
                </h4>
                <div className="space-y-2">
                  {allProviders
                    .filter((p) => p.is24x7 || p.category === 'emergency_sos' || p.category === 'mechanic')
                    .map((p) => {
                      const dist = calculateHaversineDistance(userLocation.lat, userLocation.lng, p.lat, p.lng);
                      return (
                        <div
                          key={p.id}
                          className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-slate-900">{p.name}</div>
                            <div className="text-[11px] text-slate-500">
                              {p.subcategory} • <strong>{formatDistance(dist)} away</strong> (~{estimateETA(dist, true)}m)
                            </div>
                          </div>
                          <a
                            href={`tel:${p.phone.replace(/[^0-9+]/g, '')}`}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm"
                          >
                            Call SOS
                          </a>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 7: COLLEGE WEB PROGRAMMING LAB VIVA INFO ================= */}
      {showVivaModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 text-xs">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">
                  College Lab Viva Guide
                </span>
                <h3 className="text-base font-extrabold mt-1">
                  Geo Local Service Finder • Mini Project Architecture
                </h3>
                <p className="text-xs text-blue-100">
                  Web Programming Lab Mini Project Presentation Cheat Sheet
                </p>
              </div>
              <button
                onClick={() => setShowVivaModal(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-slate-700">
              {/* Project Objective */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">1. Project Objective</h4>
                <p className="leading-relaxed">
                  To design and implement a responsive Client-Side Geospatial Web Application that enables users to locate, filter, contact, and book verified hyper-local service providers (electricians, plumbers, mechanics, doctors, carpenters) using HTML5 Geolocation and interactive OpenStreetMap Leaflet layers.
                </p>
              </div>

              {/* Haversine Formula (Crucial for Lab Viva!) */}
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                <h4 className="font-extrabold text-amber-900 text-sm mb-1">
                  2. Mathematical Engine: Great-Circle Haversine Formula
                </h4>
                <p className="text-amber-800 mb-2">
                  Examiners often ask: <em>&quot;How do you calculate distance on a spherical Earth instead of flat 2D Euclidean distance?&quot;</em>
                </p>
                <div className="bg-white p-3 rounded-xl font-mono text-[11px] text-slate-800 border border-amber-200 space-y-1">
                  <div>Δφ = (lat2 - lat1) ⋅ π / 180</div>
                  <div>Δλ = (lon2 - lon1) ⋅ π / 180</div>
                  <div>a = sin²(Δφ/2) + cos(φ1) ⋅ cos(φ2) ⋅ sin²(Δλ/2)</div>
                  <div>c = 2 ⋅ atan2(√a, √(1−a))</div>
                  <div>d = R ⋅ c (where R = 6,371 km Earth radius)</div>
                </div>
                <p className="text-[11px] text-amber-800 mt-2">
                  <strong>Time Complexity:</strong> O(N) linear scan for radius filtering where N is total registered service providers.
                </p>
              </div>

              {/* System Architecture */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1.5">3. System Architecture & Tech Stack</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li><strong>Frontend Framework:</strong> React 19 with TypeScript and Tailwind CSS</li>
                  <li><strong>Mapping Engine:</strong> Leaflet.js with OpenStreetMap raster tiles (Zero API key dependency)</li>
                  <li><strong>Hardware API:</strong> W3C HTML5 <code>navigator.geolocation.getCurrentPosition()</code></li>
                  <li><strong>Data Persistence:</strong> HTML5 <code>localStorage</code> for CRUD provider registry and booking tickets</li>
                  <li><strong>Real-time Telephony:</strong> Direct URI scheme protocols (<code>tel:+91...</code> and <code>https://wa.me/...</code>)</li>
                </ul>
              </div>

              {/* Viva Sample Q&A */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">4. Top 3 Lab Viva Questions & Answers</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900">Q: Why use Haversine instead of Euclidean Pythagoras?</p>
                    <p className="text-slate-600 mt-0.5">
                      A: The Earth is an oblate spheroid. Euclidean distance $(x_2-x_1)^2 + (y_2-y_1)^2$ treats coordinates as a flat plane, resulting in significant distortions over geographic latitudes. Haversine calculates true Great-Circle arc distance.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900">Q: How does HTML5 Geolocation determine user location?</p>
                    <p className="text-slate-600 mt-0.5">
                      A: On mobile devices it queries hardware GPS satellites; on desktop laptops it triangulates nearby Wi-Fi BSSID routers, IP geolocation database, and cellular cell towers.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900">Q: What CRUD operations are demonstrated in this prototype?</p>
                    <p className="text-slate-600 mt-0.5">
                      A: <strong>Create:</strong> Register new service provider / Create booking; <strong>Read:</strong> Query and filter providers within radius; <strong>Update:</strong> Status changes; <strong>Delete:</strong> Remove custom provider or cancel appointment.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setShowVivaModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold"
              >
                Close Viva Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-4 px-4 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">GeoServe Prototype</span>
            <span>•</span>
            <span>College Web Programming Lab Mini Project</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>Algorithm: Great-Circle Haversine Formula</span>
            <span>•</span>
            <button onClick={() => setShowVivaModal(true)} className="text-blue-400 hover:underline">
              Viva Q&A
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
