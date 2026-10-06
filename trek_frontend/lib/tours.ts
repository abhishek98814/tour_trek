import api from './axios';

export const getTours = async (params?: {
  difficulty?: string;
  best_season?: string;
  region?: string;
  tour_type?: string;
  is_featured?: boolean;
  guide_included?: boolean;
  transport_included?: boolean;
  meals_included?: boolean;
  search?: string;
  ordering?: string;
}) => {
  const response = await api.get('/tours/', { params });
  return response.data;
};

export const getFeaturedTours = async () => {
  const response = await api.get('/tours/featured/');
  return response.data;
};

export const getTourBySlug = async (slug: string) => {
  const response = await api.get(`/tours/${slug}/`);
  return response.data;
};

export const getTourItinerary = async (slug: string) => {
  const response = await api.get(`/tours/${slug}/itinerary/`);
  return response.data;
};

export const getTourAvailability = async (slug: string) => {
  const response = await api.get(`/tours/${slug}/availability/`);
  return response.data;
};

export const getTourImages = async (slug: string) => {
  const response = await api.get(`/tours/${slug}/images/`);
  return response.data;
};

export const getTourCategories = async () => {
  const response = await api.get('/tours/categories/');
  return response.data;
};

export const getTourGuides = async (params?: {
  search?: string;
  ordering?: string;
}) => {
  const response = await api.get('/tours/guides/', { params });
  return response.data;
};

export const getTourGuideById = async (id: number) => {
  const response = await api.get(`/tours/guides/${id}/`);
  return response.data;
};

export const getMyTours = async () => {
  const response = await api.get('/tours/my-tours/');
  return response.data;
};

export const createTour = async (data: FormData) => {
  const response = await api.post('/tours/create/', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};


export const updateTour = async (slug: string, data: FormData) => {
  const response = await api.put(`/tours/${slug}/edit/`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteTour = async (slug: string) => {
  const response = await api.delete(`/tours/${slug}/edit/`);
  return response.data;
};


export const uploadTourImage = async (slug: string, formData: FormData) => {
  const response = await api.post(`/tours/${slug}/images/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};


export const addTourItinerary = async (slug: string, data: {
  day: number;
  title: string;
  description: string;
  accommodation?: string;
  meals?: string;
  places_to_visit?: string;
}) => {
  const response = await api.post(`/tours/${slug}/itinerary/`, data);
  return response.data;
};


export const addTourAvailability = async (slug: string, data: {
  start_date: string;
  end_date: string;
  available_slots: number;
}) => {
  const response = await api.post(`/tours/${slug}/availability/`, data);
  return response.data;
};


export const registerAsGuide = async (data: {
  license_number: string;
  experience_years: number;
  languages: string;
  specialization: string;
  bio: string;
}) => {
  const response = await api.post('/tours/guides/register/', data);
  return response.data;
};


export const getReviewAnalysis = async (
  reviewType: 'trek' | 'tour' | 'gear' | 'guide',
  objectId: number
) => {
  const response = await api.get(`/reviews/analysis/${reviewType}/${objectId}/`);
  return response.data;
};
 

export const refreshReviewAnalysis = async (
  reviewType: 'trek' | 'tour' | 'gear' | 'guide',
  objectId: number
) => {
  const response = await api.post(`/reviews/analysis/${reviewType}/${objectId}/`);
  return response.data;
};