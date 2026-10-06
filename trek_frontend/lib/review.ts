import api from './axios';

// --- Get reviews (optionally filtered) ---
export const getReviews = async (params?: {
  review_type?: 'trek' | 'tour' | 'gear' | 'guide';
  trek_id?: number;
  tour_id?: number;
  gear_id?: number;
  guide_id?: number;
  rating?: number;
  is_verified?: boolean;
  ordering?: string;
  search?: string;
}) => {
  const response = await api.get('/reviews/', { params });
  return response.data;
};

// --- Get featured reviews ---
export const getFeaturedReviews = async () => {
  const response = await api.get('/reviews/featured/');
  return response.data;
};

// --- Get my reviews ---
export const getMyReviews = async () => {
  const response = await api.get('/reviews/my-reviews/');
  return response.data;
};

// --- Get single review ---
export const getReview = async (id: number) => {
  const response = await api.get(`/reviews/${id}/`);
  return response.data;
};

// --- Create review ---
// image_ids: ids returned from uploadReviewImage(), attached to this review.
export const createReview = async (data: {
  review_type: 'trek' | 'tour' | 'gear' | 'guide';
  object_id: number; // mapped to trek_id/tour_id/gear_id/guide_id server-side
  booking_reference?: string;
  title: string;
  comment: string;
  rating: number;
  value_rating?: number;
  service_rating?: number;
  safety_rating?: number;
  scenery_rating?: number;
  travel_date?: string;
  image_ids?: number[];
}) => {
  const response = await api.post('/reviews/create/', data);
  return response.data;
};

// --- Mark review as helpful ---
export const markReviewHelpful = async (id: number) => {
  const response = await api.post(`/reviews/${id}/helpful/`);
  return response.data;
};

// --- Upload a review image (call before createReview, then pass id in image_ids) ---
export const uploadReviewImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post('/reviews/images/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// --- Get review analysis for a trek/tour/gear/guide ---
export const getReviewAnalysis = async (
  reviewType: 'trek' | 'tour' | 'gear' | 'guide',
  objectId: number
) => {
  const response = await api.get(`/reviews/analysis/${reviewType}/${objectId}/`);
  return response.data;
};

// --- Force-regenerate review analysis ---
export const refreshReviewAnalysis = async (
  reviewType: 'trek' | 'tour' | 'gear' | 'guide',
  objectId: number
) => {
  const response = await api.post(`/reviews/analysis/${reviewType}/${objectId}/`);
  return response.data;
};