import { User } from './auth';


export type TrekDifficulty = 'easy' | 'moderate' | 'difficult' | 'extreme';

export type TrekSeason = 'spring' | 'summer' | 'autumn' | 'winter' | 'all';

export type TrekStatus = 'draft' | 'active' | 'inactive';


export interface TrekCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
}

export interface TrekImage {
  id: number;
  image: string;          // URL string e.g. /media/trek_images/...
  caption: string;
  is_cover: boolean;
  uploaded_at: string;
}

export interface TrekItinerary {
  id: number;
  day: number;
  title: string;
  description: string;
  distance_km: string | null;   // DecimalField → string from DRF
  altitude_m: number | null;
  accommodation: string;
  meals: string;
}

export interface TrekAvailability {
  id: number;
  start_date: string;           // ISO date e.g. "2025-06-01"
  end_date: string;
  available_slots: number;
  booked_slots: number;
  remaining_slots: number;      // computed property from model method
  is_active: boolean;
}

export interface Trek {
  id: number;
  title: string;
  slug: string;
  description: string;
  highlight: string | null;
  category: TrekCategory;
  created_by: User;             // or `number` if FK id only

  // Trek details
  difficulty: TrekDifficulty;
  duration_days: number;
  max_altitude: number;
  distance_km: string | null;   // DecimalField → string from DRF
  max_group_size: number;
  min_age: number;

  // Location
  start_point: string;
  end_point: string;
  region: string;
  latitude: string | null;      // DecimalField → string from DRF
  longitude: string | null;
  gpx_file: string | null;      // URL string e.g. /media/gpx_files/...

  // Pricing
  price_per_person: string;     // DecimalField → string from DRF
  discount_percent: number;

  // Trek specifics
  best_season: TrekSeason;
  tims_required: boolean;
  permit_info: string;
  gear_list: string;
  included: string;
  excluded: string;

  // Status
  status: TrekStatus;
  is_featured: boolean;
  total_bookings: number;
  average_rating: string;       // DecimalField → string from DRF

  // Nested
  images: TrekImage[];
  itinerary: TrekItinerary[];
  availability: TrekAvailability[];

  created_at: string;
  updated_at: string;
}

// ─── Useful Derived Types ────────────────────────────────────────────────────

export type TrekListItem = Pick<Trek,
  | 'id'
  | 'title'
  | 'slug'
  | 'category'
  | 'difficulty'
  | 'duration_days'
  | 'max_altitude'
  | 'distance_km'
  | 'region'
  | 'start_point'
  | 'end_point'
  | 'price_per_person'
  | 'discount_percent'
  | 'best_season'
  | 'tims_required'
  | 'is_featured'
  | 'average_rating'
  | 'total_bookings'
  | 'images'
  | 'created_at'
>;