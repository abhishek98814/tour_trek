const MEDIA = process.env.NEXT_PUBLIC_MEDIA_URL || 'http://localhost:8000';

const INTERNAL_HOSTS = ['backend'];


export function mediaUrl(path?: string | null): string | null {
  if (!path) return null;

  if (path.startsWith('http')) {
    try {
      const url = new URL(path);
      if (INTERNAL_HOSTS.includes(url.hostname)) return MEDIA + url.pathname;
    } catch {
      /* not a valid url, fall through and return it as is */
    }
    return path;
  }

  return MEDIA + (path.startsWith('/') ? '' : '/') + path;
}