import { User } from './auth';

// ─── Enums / Literals ───────────────────────────────────────────────────────

export type GearCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';

export type GearListingType = 'sell' | 'rent' | 'both';

export type GearStatus = 'active' | 'sold' | 'rented' | 'inactive';

export type GearSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'one_size' | 'na';

// ─── Models ─────────────────────────────────────────────────────────────────

export interface GearCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
}

export interface GearImage {
  id: number;
  image: string;       
  caption: string;
  is_cover: boolean;
  uploaded_at: string;
}

export interface GearRentalAvailability {
  id: number;
  start_date: string;   // ISO date e.g. "2025-06-01"
  end_date: string;
  is_available: boolean;
}

export interface GearReview {
  id: number;
  reviewer: User;       // or `number` if serialized as FK id only
  rating: number;
  comment: string;
  created_at: string;
}

export interface Gear {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: GearCategory | null;  // SET_NULL on delete
  seller: User;                   // or `number` if FK id only

  // Gear details
  brand: string;
  model_name: string;
  size: GearSize;
  weight_kg: string | null;       // DecimalField → string from DRF
  condition: GearCondition;
  year_purchased: number | null;
  color: string;

  // Listing
  listing_type: GearListingType;

  // Pricing — DecimalField → string from DRF
  sell_price: string | null;
  rent_price_per_day: string | null;
  price_currency: string;
  is_negotiable: boolean;
  deposit_amount: string | null;

  // Location
  location: string;
  latitude: string | null;
  longitude: string | null;

  // Status
  status: GearStatus;
  is_available: boolean;
  is_featured: boolean;
  views_count: number;
  average_rating: string;         // DecimalField → string from DRF

  // Nested
  images: GearImage[];
  rental_availability: GearRentalAvailability[];
  reviews: GearReview[];

  created_at: string;
  updated_at: string;
}

// ─── Useful Derived Types ────────────────────────────────────────────────────

// For list pages where you don't need full nested data
export type GearListItem = Pick<Gear,
  | 'id'
  | 'title'
  | 'slug'
  | 'category'
  | 'listing_type'
  | 'sell_price'
  | 'rent_price_per_day'
  | 'price_currency'
  | 'condition'
  | 'status'
  | 'is_available'
  | 'is_featured'
  | 'average_rating'
  | 'views_count'
  | 'location'
  | 'images'
  | 'created_at'
>;