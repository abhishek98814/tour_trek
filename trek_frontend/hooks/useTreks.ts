import { useQuery } from '@tanstack/react-query';
import { getTreks, getFeaturedTreks, getTrekBySlug, getTrekCategories } from '@/lib/treks';

export const useTreks = (params?: any) =>
  useQuery({ queryKey: ['treks', params], queryFn: () => getTreks(params) });

export const useFeaturedTreks = () =>
  useQuery({ queryKey: ['treks', 'featured'], queryFn: getFeaturedTreks });

export const useTrekBySlug = (slug: string) =>
  useQuery({ queryKey: ['trek', slug], queryFn: () => getTrekBySlug(slug), enabled: !!slug });

export const useTrekCategories = () =>
  useQuery({ queryKey: ['trek-categories'], queryFn: getTrekCategories });