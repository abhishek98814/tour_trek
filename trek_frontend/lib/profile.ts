import { authFetch } from '@/lib/authFetch';
import { readApiError } from '@/lib/bookingg';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'traveller' | 'guide' | 'agency' | 'seller' | 'admin';
  phone: string;
  profile_picture: string | null;
  bio: string;
  is_verified: boolean;
  created_at: string;
}

export const GEAR_ENDPOINT = '/gear/orders/';

const MEDIA = process.env.NEXT_PUBLIC_MEDIA_URL ?? 'http://localhost:8000';

export function mediaUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http')) {
    try {
      return `${MEDIA}${new URL(path).pathname}`;
    } catch {
      return path;
    }
  }
  return `${MEDIA}${path}`;
}

export async function getProfile(): Promise<{ profile?: UserProfile; error?: string; unauthorized?: boolean }> {
  try {
    const res = await authFetch('/auth/me/');
    if (!res.ok) {
      return {
        error: res.status === 401 ? 'Your session has expired.' : "We couldn't load your profile.",
        unauthorized: res.status === 401,
      };
    }
    return { profile: (await res.json()) as UserProfile };
  } catch (err) {
    console.error('GET PROFILE ERROR:', err);
    return { error: 'Something went wrong while loading your profile.' };
  }
}

export async function updateProfile(form: FormData): Promise<{ profile?: UserProfile; error?: string }> {
  try {
    const res = await authFetch('/auth/me/', { method: 'PATCH', body: form });
    if (!res.ok) return { error: await readApiError(res, "We couldn't save your changes.") };
    return { profile: (await res.json()) as UserProfile };
  } catch (err) {
    console.error('UPDATE PROFILE ERROR:', err);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<{ error?: string }> {
  try {
    const res = await authFetch('/auth/me/password/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    });
    if (!res.ok) return { error: await readApiError(res, "We couldn't change your password.") };
    return {};
  } catch (err) {
    console.error('CHANGE PASSWORD ERROR:', err);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export async function fetchList<T>(path: string): Promise<T[] | null> {
  try {
    const res = await authFetch(path);
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : Array.isArray(data.results) ? data.results : [];
  } catch (err) {
    console.error('FETCH LIST ERROR:', path, err);
    return null;
  }
}