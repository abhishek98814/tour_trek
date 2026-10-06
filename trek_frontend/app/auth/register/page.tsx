'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  FileText,
  Camera,
  ArrowRight,
  Check,
  X,
  Backpack,
  Compass,
  Building2,
  Store,
  Settings,
} from 'lucide-react';

const ROLES = [
  { value: 'traveller', label: 'Traveller', icon: Backpack },
  { value: 'guide', label: 'Guide', icon: Compass },
  { value: 'agency', label: 'Agency', icon: Building2 },
  { value: 'seller', label: 'Seller', icon: Store },
  { value: 'admin', label: 'Admin', icon: Settings },
];

/** Faint topographic contour lines — matches the signature texture used across the app. */
function ContourTexture({ className = '', opacity = 1 }: { className?: string; opacity?: number }) {
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={{ opacity }}
      viewBox="0 0 600 800"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <path
          key={i}
          d={`M -50 ${720 - i * 100} C 100 ${640 - i * 96}, 200 ${820 - i * 104}, 340 ${640 - i * 90} S 560 ${520 - i * 84}, 700 ${700 - i * 92}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[12px] font-semibold text-[#374151]">
      {children}
    </label>
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    role: 'traveller',
    phone: '',
    bio: '',
  });

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePicture(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const passwordsMatch = form.password2.length > 0 && form.password === form.password2;
  const passwordsMismatch = form.password2.length > 0 && form.password !== form.password2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (form.password !== form.password2) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();

      formData.append('username', form.username);
      formData.append('email', form.email);
      formData.append('password', form.password);
      formData.append('password2', form.password2);
      formData.append('role', form.role);
      formData.append('phone', form.phone);
      formData.append('bio', form.bio);

      if (profilePicture) {
        formData.append('profile_picture', profilePicture);
      }

      const res = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || 'Registration failed');
      }

      router.push('/auth/login');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-[#e5e7eb] bg-white py-2.5 pl-10 pr-3.5 text-[14px] text-[#17242f] placeholder:text-[#9aa5ac] outline-none transition-colors focus:border-[#1f8f86] focus:ring-2 focus:ring-[#1f8f86]/15';

  return (
    <div className="flex min-h-screen bg-[#f8f9fb]">
      {/* Brand panel */}
      <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0f3d57] via-[#0a2e45] to-[#061e30] p-10 lg:flex">
        <ContourTexture className="text-white" opacity={0.07} />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 15% 15%, rgba(221,138,60,0.14) 0%, transparent 45%), radial-gradient(ellipse at 90% 85%, rgba(31,143,134,0.18) 0%, transparent 45%)',
          }}
        />

        <Link href="/" className="relative text-lg font-extrabold tracking-tight text-white no-underline">
          Trek Nepal
        </Link>

        <div className="relative">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[2px] text-[#f0aa5f]">Join the trail</div>
          <h1 className="mb-4 max-w-[360px] text-[clamp(24px,2.6vw,32px)] font-extrabold leading-tight text-white">
            One account for every trek, guide, and piece of gear in Nepal
          </h1>
          <ul className="space-y-3 text-[14px] text-white/65">
            <li className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
                <Check className="h-3 w-3 text-[#f0aa5f]" />
              </span>
              Book verified guides and agencies directly
            </li>
            <li className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
                <Check className="h-3 w-3 text-[#f0aa5f]" />
              </span>
              Buy, sell, or rent gear with other trekkers
            </li>
            <li className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
                <Check className="h-3 w-3 text-[#f0aa5f]" />
              </span>
              Plan and track every trip in one place
            </li>
          </ul>
        </div>

        <p className="relative text-[12px] text-white/35">© {new Date().getFullYear()} Trek Nepal</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-1 items-center justify-center p-6 lg:w-[58%]">
        <form onSubmit={handleSubmit} className="w-full max-w-[440px]">
          <div className="mb-7">
            <h2 className="mb-1 text-2xl font-extrabold text-[#17242f]">Create your account</h2>
            <p className="text-[14px] text-[#64748b]">
              Already have one?{' '}
              <Link href="/auth/login" className="font-semibold text-[#1f8f86] no-underline hover:underline">
                Log in
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-[#fecaca] bg-[#fef2f2] p-3 text-[13px] text-[#dc2626]">
              <X className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Avatar */}
          <div className="mb-5 flex items-center gap-4">
            <label
              htmlFor="profile_picture"
              className="group relative flex h-16 w-16 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#cbd5e1] bg-[#f1f5f9] transition-colors hover:border-[#1f8f86]"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile preview" className="h-full w-full object-cover" />
              ) : (
                <Camera className="h-5 w-5 text-[#9aa5ac] transition-colors group-hover:text-[#1f8f86]" />
              )}
              <input
                id="profile_picture"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
            <div>
              <div className="text-[13px] font-semibold text-[#374151]">Profile photo</div>
              <div className="text-[12px] text-[#9aa5ac]">Optional — helps others recognize you</div>
            </div>
          </div>

          {/* Username + Email */}
          <div className="mb-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa5ac]" />
                <input
                  id="username"
                  name="username"
                  placeholder="e.g. sagarmatha_07"
                  className={inputClass}
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa5ac]" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  className={inputClass}
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Passwords */}
          <div className="mb-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa5ac]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="At least 8 characters"
                  className={`${inputClass} pr-10`}
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9aa5ac] hover:text-[#374151]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <FieldLabel htmlFor="password2">Confirm password</FieldLabel>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa5ac]" />
                <input
                  id="password2"
                  type={showPassword2 ? 'text' : 'password'}
                  name="password2"
                  placeholder="Re-enter password"
                  className={`${inputClass} pr-10 ${
                    passwordsMismatch ? 'border-[#fca5a5] focus:border-[#dc2626] focus:ring-[#dc2626]/15' : ''
                  }`}
                  value={form.password2}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword2((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9aa5ac] hover:text-[#374151]"
                  aria-label={showPassword2 ? 'Hide password' : 'Show password'}
                >
                  {showPassword2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordsMismatch && (
                <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[#dc2626]">
                  <X className="h-3 w-3" /> Passwords don't match
                </p>
              )}
              {passwordsMatch && (
                <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[#16a34a]">
                  <Check className="h-3 w-3" /> Passwords match
                </p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="mb-3.5">
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa5ac]" />
              <input
                id="phone"
                name="phone"
                placeholder="98XXXXXXXX"
                className={inputClass}
                value={form.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Role */}
          <div className="mb-3.5">
            <FieldLabel htmlFor="role">I'm joining as a</FieldLabel>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {ROLES.map((r) => {
                const active = form.role === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-[11px] font-semibold transition-colors ${
                      active
                        ? 'border-[#1f8f86] bg-[#f0fdfa] text-[#1f8f86]'
                        : 'border-[#e5e7eb] bg-white text-[#64748b] hover:border-[#1f8f86]/40'
                    }`}
                  >
                    <r.icon className="h-4 w-4" />
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bio */}
          <div className="mb-6">
            <FieldLabel htmlFor="bio">Short bio</FieldLabel>
            <div className="relative">
              <FileText className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#9aa5ac]" />
              <textarea
                id="bio"
                name="bio"
                placeholder="Tell other trekkers a bit about yourself"
                rows={3}
                className={`${inputClass} resize-none pt-2.5`}
                value={form.bio}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-[#0f3d57] to-[#1f8f86] py-3 text-[14px] font-bold text-white transition-transform duration-150 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {loading ? (
              'Creating account…'
            ) : (
              <>
                Create account
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <p className="mt-5 text-center text-[12px] text-[#9aa5ac]">
            By creating an account you agree to Trek Nepal's Terms and Privacy Policy.
          </p>
        </form>
      </div>
    </div>
  );
}