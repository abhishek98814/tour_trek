'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { StaticImageData } from 'next/image';

import everest from '@/public/everest.jpg';
import annapurna from '@/public/ann.jpg';
import langtang from '@/public/Langtang.jpg';
import mustang from '@/public/mardi.jpg';

interface Slide {
  image: StaticImageData;
  title: string;
  subtitle: string;
  price: number;
  slug: string;
  region: string;
}

const slides: Slide[] = [
  {
    image: everest,
    title: 'Everest Base Camp Trek',
    subtitle: 'Khumbu · 14 Days · Difficult',
    price: 1200,
    slug: 'everest-base-camp',
    region: 'Khumbu Region',
  },
  {
    image: annapurna,
    title: 'Annapurna Circuit Trek',
    subtitle: 'Annapurna · 12 Days · Moderate',
    price: 900,
    slug: 'annapurna-circuit',
    region: 'Annapurna Region',
  },
  {
    image: langtang,
    title: 'Langtang Valley Trek',
    subtitle: 'Langtang · 7 Days · Moderate',
    price: 600,
    slug: 'langtang-valley',
    region: 'Langtang Region',
  },
  {
    image: mustang,
    title: 'Upper Mustang Trek',
    subtitle: 'Mustang · 15 Days · Moderate',
    price: 1800,
    slug: 'upper-mustang',
    region: 'Mustang Region',
  },
];

const AUTOPLAY_MS = 5000;
const TRANSITION_MS = 800;

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [faded, setFaded] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const transitioning = useRef(false);

  const goTo = (index: number) => {
    if (transitioning.current || index === current) return;
    transitioning.current = true;

    setPrevIndex(current);
    setCurrent(index);
    setFaded(false);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => setFaded(true));
    });

    setTimeout(() => {
      setPrevIndex(null);
      transitioning.current = false;
    }, TRANSITION_MS);
  };

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      goTo((current + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, isPaused]);

  const slide = slides[current];

  return (
    <section
      className="relative h-screen min-h-[700px] overflow-hidden bg-[#17242f]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Outgoing image, fading out */}
      {prevIndex !== null && (
        <div className="absolute inset-0 z-[1]">
          <Image src={slides[prevIndex].image} alt="" fill priority className="object-cover" />
        </div>
      )}

      {/* Incoming image, fading + zooming in */}
      <div
        key={current}
        className={`absolute inset-0 z-[2] transition-opacity ease-out ${
          faded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transitionDuration: `${TRANSITION_MS}ms` }}
      >
        <div className="hero-kenburns absolute inset-0">
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority={current === 0}
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </div>

      {/* Contrast wash */}
      <div className="absolute inset-0 z-[3] bg-gradient-to-r from-[#17242f]/90 via-[#17242f]/50 to-[#17242f]/10" />
      <div className="absolute inset-x-0 bottom-0 z-[4] h-48 bg-gradient-to-t from-[#f7f4ee] to-transparent" />

      {/* Content */}
      <div className="relative z-[5] mx-auto flex h-full max-w-[1200px] items-center px-6 md:px-10">
        <div key={`text-${current}`} className="max-w-[650px]">
          <div
            className="hero-in mb-6 inline-flex items-center gap-2 rounded-full border border-[#dd8a3c]/40 bg-[#dd8a3c]/15 px-4 py-2 text-xs font-bold uppercase tracking-[2px] text-[#f0aa5f]"
            style={{ animationDelay: '0ms' }}
          >
            <svg width="11" height="14" viewBox="0 0 11 14" fill="none">
              <path
                d="M5.5 13S1 8.2 1 5a4.5 4.5 0 1 1 9 0c0 3.2-4.5 8-4.5 8Z"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <circle cx="5.5" cy="5" r="1.6" fill="currentColor" />
            </svg>
            {slide.region}
          </div>

          <h1
            className="hero-in mb-4 text-[42px] font-extrabold leading-[1.05] tracking-[-2px] text-white sm:text-[56px] lg:text-[76px]"
            style={{ animationDelay: '60ms' }}
          >
            {slide.title}
          </h1>

          <p className="hero-in mb-5 text-lg text-white/75" style={{ animationDelay: '120ms' }}>
            {slide.subtitle}
          </p>

          <div className="hero-in mb-8 flex items-baseline gap-2" style={{ animationDelay: '160ms' }}>
            <span className="text-[15px] text-white/60">From</span>
            <span className="text-[42px] font-extrabold text-[#f0aa5f]">
              Nprs&nbsp;{slide.price.toLocaleString()}
            </span>
            <span className="text-[15px] text-white/60">/ person</span>
          </div>

          <div className="hero-in flex flex-wrap gap-3.5" style={{ animationDelay: '200ms' }}>
            <Link
              href={`/trek/${slide.slug}`}
              className="group inline-flex items-center gap-2 rounded-[10px] bg-gradient-to-br from-[#e6994a] to-[#b96a24] px-8 py-3.5 text-[15px] font-bold text-white shadow-[0_10px_25px_rgba(221,138,60,0.35)] transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              View Trek
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/trek"
              className="rounded-[10px] border border-white/25 bg-white/10 px-8 py-3.5 text-[15px] font-semibold text-white backdrop-blur-md transition-colors duration-200 hover:bg-white/20"
            >
              All Treks
            </Link>
          </div>
        </div>
      </div>

      {/* Side progress dots */}
      <div className="absolute right-6 top-1/2 z-[6] hidden -translate-y-1/2 flex-col gap-2.5 md:flex">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`relative w-1 overflow-hidden rounded-full bg-white/25 transition-[height] duration-300 ${
              i === current ? 'h-11' : 'h-5'
            }`}
          >
            {i === current && (
              <span
                key={`fill-${current}-${isPaused}`}
                className="hero-barfill absolute inset-x-0 top-0 rounded-full bg-[#f0aa5f]"
                style={{
                  animationDuration: `${AUTOPLAY_MS}ms`,
                  animationPlayState: isPaused ? 'paused' : 'running',
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Mobile dots */}
      <div className="absolute bottom-6 left-1/2 z-[6] flex -translate-x-1/2 gap-2 md:hidden">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? 'w-6 bg-[#f0aa5f]' : 'w-1.5 bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Thumbnail strip */}
      <div className="absolute bottom-9 left-1/2 z-[6] hidden -translate-x-1/2 gap-3 md:flex">
        {slides.map((s, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={s.title}
            className={`relative h-[75px] w-[120px] overflow-hidden rounded-xl border-2 transition-all duration-300 ${
              i === current
                ? 'border-[#f0aa5f] opacity-100'
                : 'border-white/20 opacity-50 hover:opacity-80'
            }`}
          >
            <Image src={s.image} alt={s.title} fill sizes="120px" className="object-cover" />
          </button>
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={() => goTo(current === 0 ? slides.length - 1 : current - 1)}
        aria-label="Previous slide"
        className="absolute left-5 top-1/2 z-[6] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors duration-200 hover:bg-white/20"
      >
        <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
          <path d="M8 1 1 8l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        onClick={() => goTo(current === slides.length - 1 ? 0 : current + 1)}
        aria-label="Next slide"
        className="absolute right-5 top-1/2 z-[6] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors duration-200 hover:bg-white/20 md:right-20"
      >
        <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
          <path d="M1 1l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <style jsx>{`
        .hero-kenburns {
          animation: kenburns 6s ease-out forwards;
        }
        @keyframes kenburns {
          from {
            transform: scale(1.08);
          }
          to {
            transform: scale(1);
          }
        }
        .hero-in {
          opacity: 0;
          animation: heroIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes heroIn {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .hero-barfill {
          animation-name: barfill;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
        @keyframes barfill {
          from {
            height: 0%;
          }
          to {
            height: 100%;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-kenburns,
          .hero-in,
          .hero-barfill {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}