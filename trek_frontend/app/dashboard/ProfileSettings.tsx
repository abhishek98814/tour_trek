'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Camera, CheckCircle2 } from 'lucide-react';
import { changePassword, mediaUrl, updateProfile, type UserProfile } from '@/lib/profile';

interface Props {
  profile: UserProfile;
  serifClass: string;
  onSaved: (p: UserProfile) => void;
}

const inputClass =
  'w-full rounded-lg border border-[#d5dbe0] bg-white px-3.5 py-2.5 text-sm text-[#17242f] outline-none transition focus:border-[#1f8f86] focus:ring-4 focus:ring-[#1f8f86]/15 disabled:bg-[#f1f4f5] disabled:text-[#64748b]';
const labelClass = 'mb-1.5 block text-xs font-semibold text-[#475569]';
const primaryBtn =
  'rounded bg-[#0f3d57] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1f8f86] disabled:cursor-not-allowed disabled:opacity-60';

function Notice({ type, children }: { type: 'error' | 'success'; children: React.ReactNode }) {
  const isError = type === 'error';
  const Icon = isError ? AlertTriangle : CheckCircle2;
  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`mt-4 flex items-start gap-2 rounded-lg border px-3.5 py-3 text-sm font-medium ${
        isError ? 'border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]' : 'border-[#b7e4df] bg-[#f0fdfa] text-[#0d9488]'
      }`}
    >
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export default function ProfileSettings({ profile, serifClass, onSaved }: Props) {
  /* ---------- profile form ---------- */
  const [firstName, setFirstName] = useState(profile.first_name);
  const [lastName, setLastName] = useState(profile.last_name);
  const [phone, setPhone] = useState(profile.phone);
  const [bio, setBio] = useState(profile.bio);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  useEffect(() => {
    if (!photo) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const changed =
    firstName !== profile.first_name ||
    lastName !== profile.last_name ||
    phone !== profile.phone ||
    bio !== profile.bio ||
    !!photo;

  const avatar = preview || mediaUrl(profile.profile_picture);
  const initial = (profile.first_name || profile.username || '?').charAt(0).toUpperCase();

  function pickPhoto(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProfileMsg({ type: 'error', text: 'Please choose an image file.' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileMsg({ type: 'error', text: 'Image must be 2 MB or smaller.' });
      return;
    }
    setProfileMsg(null);
    setPhoto(file);
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    setSaving(true);

    const form = new FormData();
    form.append('first_name', firstName.trim());
    form.append('last_name', lastName.trim());
    form.append('phone', phone.trim());
    form.append('bio', bio.trim());
    if (photo) form.append('profile_picture', photo);

    const { profile: updated, error } = await updateProfile(form);
    setSaving(false);

    if (error || !updated) {
      setProfileMsg({ type: 'error', text: error ?? "We couldn't save your changes." });
      return;
    }
    setPhoto(null);
    onSaved(updated);
    setProfileMsg({ type: 'success', text: 'Your profile has been updated.' });
  }

  /* ---------- password form ---------- */
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);

    if (newPw.length < 8) return setPwMsg({ type: 'error', text: 'Your new password must be at least 8 characters.' });
    if (newPw !== confirmPw) return setPwMsg({ type: 'error', text: "The new passwords don't match." });

    setPwSaving(true);
    const { error } = await changePassword(oldPw, newPw);
    setPwSaving(false);

    if (error) return setPwMsg({ type: 'error', text: error });

    setOldPw('');
    setNewPw('');
    setConfirmPw('');
    setPwMsg({ type: 'success', text: 'Password changed successfully.' });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Profile details */}
      <form onSubmit={handleSaveProfile} className="rounded-xl border border-[#e3e7ea] bg-white p-6 lg:col-span-2">
        <h3 className={`${serifClass} mb-5 text-xl font-semibold text-[#17242f]`}>Profile details</h3>

        <div className="mb-6 flex items-center gap-4">
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full bg-[#0f3d57]">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-2xl font-semibold text-white">
                {initial}
              </span>
            )}
          </div>
          <div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-[#d5dbe0] bg-white px-3.5 py-2 text-sm font-semibold text-[#17242f] transition-colors hover:border-[#1f8f86] hover:text-[#1f8f86]">
              <Camera className="h-4 w-4" />
              Change photo
              <input type="file" accept="image/*" className="hidden" onChange={(e) => pickPhoto(e.target.files?.[0])} />
            </label>
            <p className="mt-1.5 text-xs text-[#64748b]">JPG or PNG, up to 2 MB.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>First name</label>
            <input className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={150} />
          </div>
          <div>
            <label className={labelClass}>Last name</label>
            <input className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={150} />
          </div>
          <div>
            <label className={labelClass}>Username</label>
            <input className={inputClass} value={profile.username} disabled />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input className={inputClass} value={profile.email} disabled />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Phone</label>
            <input
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={15}
              placeholder="+977 98XXXXXXXX"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>About you</label>
            <textarea
              className={`${inputClass} min-h-[110px] resize-y`}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other travellers a little about yourself."
            />
          </div>
        </div>

        {profileMsg && <Notice type={profileMsg.type}>{profileMsg.text}</Notice>}

        <div className="mt-5 flex justify-end">
          <button type="submit" disabled={saving || !changed} className={primaryBtn}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>

      {/* Password */}
      <form onSubmit={handleChangePassword} className="h-fit rounded-xl border border-[#e3e7ea] bg-white p-6">
        <h3 className={`${serifClass} mb-5 text-xl font-semibold text-[#17242f]`}>Change password</h3>

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Current password</label>
            <input type="password" autoComplete="current-password" className={inputClass} value={oldPw} onChange={(e) => setOldPw(e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>New password</label>
            <input type="password" autoComplete="new-password" className={inputClass} value={newPw} onChange={(e) => setNewPw(e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>Confirm new password</label>
            <input type="password" autoComplete="new-password" className={inputClass} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required />
          </div>
        </div>

        {pwMsg && <Notice type={pwMsg.type}>{pwMsg.text}</Notice>}

        <button type="submit" disabled={pwSaving || !oldPw || !newPw || !confirmPw} className={`${primaryBtn} mt-5 w-full`}>
          {pwSaving ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}