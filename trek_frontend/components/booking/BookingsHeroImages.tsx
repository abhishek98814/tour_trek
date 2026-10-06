'use client';

import { useEffect, useState } from 'react';

/**
 * Full-size photo slider meant to sit BEHIND the hero content.
 * Place it inside a `position: relative` wrapper; it fills that wrapper.
 * Save as: components/booking/BookingsHeroImages.tsx
 */
export default function BookingsHeroImages({
  images,
  interval = 5500,
}: {
  images: string[];
  interval?: number;
}) {
  const [pos, setPos] = useState({ active: 0, prev: -1 });

  useEffect(() => {
    if (images.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => {
      setPos((p) => ({ active: (p.active + 1) % images.length, prev: p.active }));
    }, interval);
    return () => clearInterval(id);
  }, [images.length, interval]);

  const cur = images.length ? pos.active % images.length : 0;

  return (
    <div
      aria-hidden
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, background: '#0f3d57' }}
    >
      {images.map((src, i) => {
        const isActive = i === cur;
        const isPrev = i === pos.prev && !isActive;
        return (
          <div
            key={src}
            className="bhi-slide"
            style={{
              position: 'absolute',
              inset: 0,
              transform: isActive ? 'translateX(0)' : isPrev ? 'translateX(-100%)' : 'translateX(100%)',
              transition: isActive || isPrev ? 'transform 1s cubic-bezier(0.65, 0, 0.35, 1)' : 'none',
            }}
          >
            <img
              src={src}
              alt=""
              className={isActive || isPrev ? 'bhi-kb' : undefined}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        );
      })}

      {/* darkens the photo so the white hero text stays readable */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to top, rgba(10,26,38,0.88), rgba(10,26,38,0.45) 55%, rgba(10,26,38,0.3))',
        }}
      />

      <style>{`
        .bhi-kb { animation: bhiZoom 8s ease-out forwards; }
        @keyframes bhiZoom { from { transform: scale(1); } to { transform: scale(1.08); } }
        @media (prefers-reduced-motion: reduce) {
          .bhi-kb { animation: none; }
          .bhi-slide { transition: none !important; }
        }
      `}</style>
    </div>
  );
}