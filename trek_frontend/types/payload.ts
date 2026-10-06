// types/payload.types.ts

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  role?: string;
  phone?: string;
}

// ─── Booking ─────────────────────────────────────────────────────────────────

export interface BookingPayload {
  booking_type: BookingType;
  trek_id?: number;
  tour_id?: number;
  gear_id?: number;
  start_date: string;
  end_date?: string;
  num_participants: number;
  special_requests?: string;
  payment_method: PaymentMethod;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  emergency_contact?: string;
}

// ─── Review ──────────────────────────────────────────────────────────────────

export interface ReviewPayload {
  review_type: ReviewType;
  booking_reference?: string;
  trek_id?: number;
  tour_id?: number;
  gear_id?: number;
  guide_id?: number;
  title: string;
  comment: string;
  rating: number;
  value_rating?: number;
  service_rating?: number;
  safety_rating?: number;
  scenery_rating?: number;
  travel_date?: string;
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export interface AdminStats {
  total_users: number;
  total_bookings: number;
  [key: string]: unknown;
}