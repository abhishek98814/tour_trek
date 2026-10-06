import useAuthStore from '@/store/authStore';

const API = process.env.NEXT_PUBLIC_API_URL;

// CHANGE THIS to match your Django refresh route
// (look for TokenRefreshView in your Django urls.py).
// If NEXT_PUBLIC_API_URL already ends in /api, do NOT repeat /api here.
// common ones: '/auth/token/refresh/' or '/token/refresh/'
const REFRESH_PATH = '/auth/token/refresh/';

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, setTokens, logout } = useAuthStore.getState();

  if (!refreshToken) {
    logout();
    return null;
  }

  try {
    const res = await fetch(`${API}${REFRESH_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!res.ok) {
      console.error('TOKEN REFRESH FAILED:', res.status);
      logout(); // refresh token expired too, user must log in again
      return null;
    }

    const data = await res.json();
    // data.refresh is only present if ROTATE_REFRESH_TOKENS = True
    setTokens(data.access, data.refresh);

    return data.access;
  } catch (err) {
    console.error('TOKEN REFRESH ERROR:', err);
    return null;
  }
}

/**
 * Drop-in replacement for fetch() for logged-in API calls.
 *
 *   authFetch('/bookings/')
 *   authFetch('/bookings/create/', { method: 'POST', body: ... })
 *
 * - Adds the Authorization header for you
 * - On a 401 (expired token) it refreshes the token once
 *   and retries the request automatically
 */
export async function authFetch(
  pathOrUrl: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${API}${pathOrUrl}`;

  const send = (token: string | null) =>
    fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

  let res = await send(useAuthStore.getState().accessToken);

  if (res.status === 401) {
    // share one refresh call if several requests fail at once
    refreshing ??= refreshAccessToken().finally(() => {
      refreshing = null;
    });
    const newToken = await refreshing;
    if (newToken) res = await send(newToken);
  }

  return res;
}