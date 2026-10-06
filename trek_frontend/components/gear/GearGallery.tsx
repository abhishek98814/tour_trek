'use client';
import { useEffect, useMemo, useState } from 'react';
import { Backpack, ChevronLeft, ChevronRight } from 'lucide-react';
import { mediaUrl } from '@/lib/media';

interface GearImage {
  id: number | string;
  image: string;
  caption?: string;
  is_cover?: boolean;
}

export default function GearGallery({ images, title }: { images: GearImage[]; title: string }) {
  // cover image first, the rest keep their order
  const sorted = useMemo(() => {
    const list = Array.isArray(images) ? images.filter((i) => i?.image) : [];
    return [...list].sort((a, b) => (b.is_cover ? 1 : 0) - (a.is_cover ? 1 : 0));
  }, [images]);

  const [active, setActive] = useState(0);

  // if the images change (or one is removed) make sure we don't point past the end
  useEffect(() => {
    if (active > sorted.length - 1) setActive(0);
  }, [sorted.length, active]);

  if (sorted.length === 0) {
    return (
      <div className="flex h-[420px] w-full items-center justify-center rounded-[20px] bg-gradient-to-br from-[#0f3d57] via-[#17242f] to-[#1f8f86]">
        <Backpack className="h-16 w-16 text-white/70" strokeWidth={1.2} />
      </div>
    );
  }

  const current = sorted[active] ?? sorted[0];
  const prev = () => setActive((i) => (i - 1 + sorted.length) % sorted.length);
  const next = () => setActive((i) => (i + 1) % sorted.length);

  return (
    <div>
      <div className="relative mb-3 h-[420px] w-full overflow-hidden rounded-[20px] bg-[#f1f5f9]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current.id}
          src={mediaUrl(current.image) ?? ''}
          alt={current.caption || title}
          className="h-full w-full animate-[fadeIn_0.35s_ease-out] object-cover"
        />

        {sorted.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#17242f] shadow transition hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#17242f] shadow transition hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-md bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white">
              {active + 1} / {sorted.length}
            </span>
          </>
        )}

        {current.caption && (
          <span className="absolute bottom-3 left-3 max-w-[70%] truncate rounded-md bg-black/55 px-2.5 py-1 text-xs text-white">
            {current.caption}
          </span>
        )}
      </div>

      {sorted.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                active === i ? 'border-[#dd8a3c]' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaUrl(img.image) ?? ''}
                alt={img.caption || title}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}