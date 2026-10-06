import { useQuery } from '@tanstack/react-query';
import { getGear, getFeaturedGear, getGearBySlug, getGearCategories } from '@/lib/gear';

export const useGear = (params?: any) =>
  useQuery({ queryKey: ['gear', params], queryFn: () => getGear(params) });

export const useFeaturedGear = () =>
  useQuery({ queryKey: ['gear', 'featured'], queryFn: getFeaturedGear });

export const useGearBySlug = (slug: string) =>
  useQuery({ queryKey: ['gear', slug], queryFn: () => getGearBySlug(slug), enabled: !!slug });

export const useGearCategories = () =>
  useQuery({ queryKey: ['gear-categories'], queryFn: getGearCategories });