export interface TourCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export interface TourImage {
  id: number;
  image: string;
  caption: string;
  is_cover: boolean;
  uploaded_at: string;
}

export interface TourItinerary {
  id: number;
  day: number;
  title: string;
  description: string;
  accommodation: string;
  meals: string;
  places_to_visit: string;
}

export interface TourAvailability {
  id: number;
  start_date: string;
  end_date: string;
  available_slots: number;
  booked_slots: number;
  remaining_slots: number;
  is_active: boolean;
}

export interface TourGuide {
  id: number;
  username: string;
  email: string;
  license_number: string;
  experience_years: number;
  languages: string;
  specialization: string;
  is_verified: boolean;
  average_rating: number;
  total_tours: number;
  profile_picture: string | null;
  bio: string;
}

export interface Tour {
  id: number;
  title: string;
  slug: string;
  description: string;
  highlights: string;
  category: TourCategory;
  category_name: string;
  tour_type: 'cultural' | 'adventure' | 'wildlife' | 'spiritual' | 'scenic' | 'photography';
  difficulty: 'easy' | 'moderate' | 'challenging';
  duration_days: number;
  duration_hours: number | null;
  max_group_size: number;
  min_group_size: number;
  min_age: number;
  destination: string;
  pickup_point: string;
  dropoff_point: string;
  region: string;
  latitude: number | null;
  longitude: number | null;
  price_per_person: number;
  price_currency: string;
  discount_percent: number;
  discounted_price: number;
  child_price: number | null;
  best_season: string;
  entry_fee_included: boolean;
  guide_included: boolean;
  transport_included: boolean;
  meals_included: boolean;
  included: string;
  excluded: string;
  requirements: string;
  status: 'draft' | 'active' | 'inactive';
  is_featured: boolean;
  total_bookings: number;
  average_rating: number;
  cover_image: string | null;
  images: TourImage[];
  itinerary: TourItinerary[];
  availability: TourAvailability[];
  created_at: string;
  updated_at: string;
}

export interface TourFormData {
  title: string;
  slug: string;
  description: string;
  highlights: string;
  category: number;
  tour_type: string;
  difficulty: string;
  duration_days: number;
  duration_hours?: number;
  max_group_size: number;
  min_group_size: number;
  min_age: number;
  destination: string;
  pickup_point?: string;
  dropoff_point?: string;
  region: string;
  price_per_person: number;
  discount_percent: number;
  child_price?: number;
  best_season: string;
  entry_fee_included: boolean;
  guide_included: boolean;
  transport_included: boolean;
  meals_included: boolean;
  included: string;
  excluded: string;
  requirements?: string;
  status: string;
  is_featured: boolean;
}


export interface ReviewAnalysis {
  review_type: 'trek' | 'tour' | 'gear' | 'guide';
  object_id: number;
  summary: string;
  sentiment: 'positive' | 'mixed' | 'negative' | '';
  pros: string[];
  cons: string[];
  recommendation: string;
  review_count_at_analysis: number;
  average_rating_at_analysis: number | null;
  updated_at: string;
}