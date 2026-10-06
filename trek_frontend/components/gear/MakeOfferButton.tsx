'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { HandCoins, X, Check, Loader2, ShieldCheck, Tag } from 'lucide-react';
import api from '../../lib/axios'; 
import useAuthStore from '@/store/authStore'; 

type Props = {
  slug: string;
  title: string;
  askingPrice: number;
  isNegotiable?: boolean;
};

const money = (n: number) => `NPR ${Math.round(n).toLocaleString('en-US')}`;
const QUICK_DISCOUNTS = [5, 10, 15, 20];
const LOGIN_PATH = '/login'; // 👈 adjust if your login route is different

export default function MakeOfferButton({ slug, title, askingPrice, isNegotiable = true }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useAuthStore((s) => s.accessToken);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => setMounted(true), []);

  const close = () => {
    setOpen(false);
    setTimeout(() => {
      setSuccess(false);
      setError('');
      setAmount('');
      setMessage('');
    }, 200);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleOpen = () => {
    if (hasHydrated && !accessToken) {
      router.push(`${LOGIN_PATH}?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setOpen(true);
  };

  const offer = Number(amount) || 0;
  const diffPct = askingPrice > 0 && offer > 0 ? Math.round((1 - offer / askingPrice) * 100) : 0;

  const submit = async () => {
    setError('');
    if (!offer || offer <= 0) return setError('Enter a valid offer amount.');
    if (offer > askingPrice) return setError(`Offer can't be higher than the asking price (${money(askingPrice)}).`);

    setLoading(true);
    try {
      await api.post(`/gear/${slug}/offers/`, { amount: offer, message: message.trim() });
      setSuccess(true);
    } catch (err: any) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      if (status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        const first = data && typeof data === 'object' ? Object.values(data)[0] : null;
        setError(
          data?.detail ||
            (Array.isArray(first) ? String(first[0]) : typeof first === 'string' ? first : '') ||
            'Could not send your offer. Try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#1f8f86] to-[#136a63] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(31,143,134,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(31,143,134,0.4)] active:translate-y-0"
      >
        <HandCoins className="h-4 w-4 transition-transform group-hover:rotate-[-8deg]" />
        Make an offer
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-[#0f1b24]/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            onClick={close}
          >
            <div
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-[0_30px_80px_rgba(15,27,36,0.35)] sm:rounded-3xl"
            >
              <div className="relative bg-gradient-to-br from-[#1f8f86] to-[#136a63] px-6 pb-6 pt-6 text-white">
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="absolute right-4 top-4 rounded-full bg-white/15 p-1.5 transition hover:bg-white/25"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
                  <HandCoins className="h-5 w-5" />
                </div>
                <h3 className="m-0 text-xl font-extrabold">Make an offer</h3>
                <p className="m-0 mt-1 line-clamp-1 text-sm text-white/80">{title}</p>
              </div>

              {success ? (
                <div className="px-6 py-10 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#dcfce7]">
                    <Check className="h-8 w-8 text-[#16a34a]" />
                  </div>
                  <h4 className="m-0 text-lg font-extrabold text-[#17242f]">Offer sent!</h4>
                  <p className="mx-auto mb-6 mt-2 max-w-xs text-sm text-[#64748b]">
                    Your offer of <b className="text-[#17242f]">{money(offer)}</b> has been sent to the seller. You&apos;ll
                    be notified when they respond.
                  </p>
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-xl bg-[#17242f] px-8 py-2.5 text-sm font-bold text-white transition hover:bg-[#0f1b24]"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="px-6 py-6">
                  <div className="mb-5 flex items-center justify-between rounded-xl bg-[#f8f9fb] px-4 py-3">
                    <span className="flex items-center gap-2 text-sm font-semibold text-[#64748b]">
                      <Tag className="h-4 w-4" /> Asking price
                    </span>
                    <span className="text-base font-extrabold text-[#17242f]">{money(askingPrice)}</span>
                  </div>

                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#94a3b8]">
                    Your offer
                  </label>
                  <div className="flex items-center rounded-xl border-2 border-[#e8ecf0] bg-white px-4 transition focus-within:border-[#1f8f86] focus-within:shadow-[0_0_0_4px_rgba(31,143,134,0.12)]">
                    <span className="text-sm font-bold text-[#94a3b8]">NPR</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="w-full bg-transparent px-3 py-3 text-2xl font-extrabold text-[#17242f] outline-none placeholder:text-[#cbd5e1]"
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {QUICK_DISCOUNTS.map((p) => {
                      const val = Math.round((askingPrice * (100 - p)) / 100);
                      const active = Number(amount) === val;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setAmount(String(val))}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                            active
                              ? 'border-[#1f8f86] bg-[#1f8f86] text-white'
                              : 'border-[#e8ecf0] bg-white text-[#475569] hover:border-[#1f8f86] hover:text-[#1f8f86]'
                          }`}
                        >
                          {p}% off
                        </button>
                      );
                    })}
                  </div>

                  {offer > 0 && offer <= askingPrice && (
                    <p
                      className={`mb-0 mt-3 text-xs font-semibold ${
                        diffPct >= 50 ? 'text-[#dc2626]' : diffPct > 0 ? 'text-[#16a34a]' : 'text-[#64748b]'
                      }`}
                    >
                      {diffPct === 0
                        ? 'You are offering the full asking price.'
                        : diffPct >= 50
                          ? `${diffPct}% below asking — very low offers are often declined.`
                          : `${diffPct}% below asking price (you save ${money(askingPrice - offer)}).`}
                    </p>
                  )}

                  <label className="mb-1.5 mt-5 block text-xs font-bold uppercase tracking-wide text-[#94a3b8]">
                    Message to seller <span className="font-medium normal-case">(optional)</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    maxLength={300}
                    placeholder="Hi, I'm interested in this gear. Can you do this price?"
                    className="w-full resize-none rounded-xl border-2 border-[#e8ecf0] px-4 py-3 text-sm text-[#17242f] outline-none transition placeholder:text-[#cbd5e1] focus:border-[#1f8f86] focus:shadow-[0_0_0_4px_rgba(31,143,134,0.12)]"
                  />

                  {!isNegotiable && (
                    <p className="mb-0 mt-3 text-xs text-[#ca8a04]">
                      The seller marked this price as fixed — they may not accept lower offers.
                    </p>
                  )}

                  {error && (
                    <div className="mt-4 rounded-lg bg-[#fef2f2] px-3 py-2.5 text-[13px] font-medium text-[#b91c1c]">
                      {error}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={submit}
                    disabled={loading || !offer}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#1f8f86] to-[#136a63] px-6 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(31,143,134,0.3)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                      </>
                    ) : (
                      `Send offer${offer > 0 ? ` · ${money(offer)}` : ''}`
                    )}
                  </button>

                  <p className="mb-0 mt-3 flex items-center justify-center gap-1.5 text-[11px] text-[#94a3b8]">
                    <ShieldCheck className="h-3.5 w-3.5" /> No payment now. Seller will accept or decline.
                  </p>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}