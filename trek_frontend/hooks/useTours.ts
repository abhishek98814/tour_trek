import { useQuery } from '@tanstack/react-query';
import { getTours, getFeaturedTours, getTourBySlug, getTourCategories } from '@/lib/tours';

export const useTours = (params?: any) =>
  useQuery({ queryKey: ['tours', params], queryFn: () => getTours(params) });

export const useFeaturedTours = () =>
  useQuery({ queryKey: ['tours', 'featured'], queryFn: getFeaturedTours });

export const useTourBySlug = (slug: string) =>
  useQuery({ queryKey: ['tour', slug], queryFn: () => getTourBySlug(slug), enabled: !!slug });

export const useTourCategories = () =>
  useQuery({ queryKey: ['tour-categories'], queryFn: getTourCategories });