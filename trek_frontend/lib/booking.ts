import api from './axios';

export const getMyBookings = async () => {
  const res = await api.get('/bookings/');
  return res.data;
};
export const getBookingByRef = async (ref: string) => {
  const res = await api.get(`/bookings/${ref}/`);
  return res.data;
};
export const createBooking = async (data: any) => {
  const res = await api.post('/bookings/create/', data);
  return res.data;
};
export const cancelBooking = async (ref: string, reason: string) => {
  const res = await api.post(`/bookings/${ref}/cancel/`, { reason });
  return res.data;
};
export const initiatePayment = async (data: any) => {
  const res = await api.post('/bookings/payment/initiate/', data);
  return res.data;
};