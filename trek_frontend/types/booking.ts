import { User } from  './auth'; // or wherever you defined it

// ─── Enums / Literals ───────────────────────────────────────────────────────

export type BookingType = 'trek' | 'tour' | 'gear_rent' | 'gear_buy';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';

export type PaymentMethod = 'esewa' | 'khalti' | 'stripe' | 'bank' | 'cash';

export type PaymentGatewayStatus = 'initiated' | 'pending' | 'success' | 'failed' | 'refunded';

// ─── Models ─────────────────────────────────────────────────────────────────

export interface BookingParticipant {
  id: number;
  full_name: string;
  age: number;
  nationality: string;
  passport_number: string;
  emergency_contact: string;
  medical_conditions: string;
}

export interface Payment {
  id: number;
  amount: string;           // DecimalField → string from DRF
  currency: string;
  payment_method: string;
  transaction_id: string;
  gateway_response: Record<string, unknown> | null;
  status: PaymentGatewayStatus;
  paid_at: string | null;
  created_at: string;
}

export interface Booking {
  id: number;
  user: User;               // or `number` if serialized as FK id only
  booking_type: BookingType;
  booking_reference: string;

  // Content — only one will be non-null based on booking_type
  trek_id: number | null;
  tour_id: number | null;
  gear_id: number | null;

  // Booking details
  start_date: string;       // ISO date string e.g. "2025-06-01"
  end_date: string | null;
  num_participants: number;
  special_requests: string;

  // Pricing — DecimalField → string from DRF
  unit_price: string;
  total_price: string;
  discount_amount: string;
  final_price: string;
  currency: string;

  // Payment
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | '';
  transaction_id: string;
  paid_at: string | null;

  // Status
  status: BookingStatus;
  cancelled_at: string | null;
  cancellation_reason: string;
  completed_at: string | null;

  // Contact
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  emergency_contact: string;

  // Nested
  participants: BookingParticipant[];
  payments: Payment[];

  created_at: string;
  updated_at: string;
}