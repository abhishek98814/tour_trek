import { useQuery, useMutation } from '@tanstack/react-query';
import { getMyBookings, createBooking, cancelBooking } from '@/lib/booking';
import toast from 'react-hot-toast';

export const useMyBookings = () =>
  useQuery({ queryKey: ['my-bookings'], queryFn: getMyBookings });

export const useCreateBooking = () =>
  useMutation({
    mutationFn: createBooking,
    onSuccess: () => toast.success('Booking created successfully!'),
    onError: () => toast.error('Booking failed. Try again.'),
  });

export const useCancelBooking = () =>
  useMutation({
    mutationFn: ({ ref, reason }: { ref: string; reason: string }) =>
      cancelBooking(ref, reason),
    onSuccess: () => toast.success('Booking cancelled.'),
    onError: () => toast.error('Cancel failed.'),
  });