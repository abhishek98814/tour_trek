export interface ReviewImage {
  id: number;
  image: string;
  uploaded_by: number;
  uploaded_at: string;
}

export interface Review {
  id: number;
  user: {
    id: number;
    username: string;
    avatar?: string | null;
  };
  review_type: 'trek' | 'tour' | 'gear' | 'guide';
  booking_reference?: string;
  trek_id?: number | null;
  tour_id?: number | null;
  gear_id?: number | null;
  guide_id?: number | null;

  title: string;
  comment: string;
  rating: number;

  value_rating?: number | null;
  service_rating?: number | null;
  safety_rating?: number | null;
  scenery_rating?: number | null;

  images: ReviewImage[];

  is_verified: boolean;
  is_featured: boolean;
  helpful_count: number;
  is_helpful_by_me?: boolean; // only present if your serializer includes it

  travel_date?: string | null;
  created_at: string;
  updated_at: string;
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