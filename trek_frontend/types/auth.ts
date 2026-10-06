export type UserRole = 'traveller' | 'guide' | 'agency' | 'seller' | 'admin';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone: string;
  profile_picture: string | null;
  bio: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;   
  date_joined: string;  
}