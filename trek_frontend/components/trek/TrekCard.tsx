import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Clock } from 'lucide-react';

interface TrekImage {
  image: string;
}

interface Trek {
  slug: string;
  title: string;
  cover_image?: string;
  images?: TrekImage[];
  banner?: string;
  location?: string;
  region?: string;
  price?: number;
  price_per_person?: number;
  duration?: string | number;
  difficulty?: string;
}

export default function TrekCard({ trek }: { trek: Trek }) {
  const image = trek.cover_image || trek.images?.[0]?.image || trek.banner || '/placeholder.jpg';
  const price = trek.price ?? trek.price_per_person;
  const place = trek.location || trek.region;

  return (
    <Link href={`/trek/${trek.slug}`} className="group block no-underline">
      <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#dd8a3c]/40 hover:shadow-[0_16px_36px_rgba(23,36,47,0.14)]">
        <div className="relative h-[200px] overflow-hidden">
          {/* <Image
            src={image}
            alt={trek.title}
            fill
            sizes="(max-width: 768px) 100vw, 340px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          /> */}

           <div
          style={{
            height: "200px",
            backgroundImage: `url(${`${process.env.NEXT_PUBLIC_MEDIA_URL}${trek.cover_image}`})`,
            // src={`${process.env.NEXT_PUBLIC_MEDIA_URL}${trek.cover_image}`} 
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />


       {/* <img 
       src={`${process.env.NEXT_PUBLIC_MEDIA_URL}${trek.cover_image}`} 
       alt={trek.title} /> */}


          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {trek.difficulty && (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold capitalize text-[#17242f] shadow-sm backdrop-blur-sm">
              {trek.difficulty}
            </span>
          )}
          {trek.duration && (
            <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-[#17242f]/80 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
              <Clock className="h-3 w-3" />
              {trek.duration}
              {typeof trek.duration === 'number' ? ' days' : ''}
            </span>
          )}
        </div>

        <div className="p-3.5">
          <h3 className="truncate text-[16px] font-semibold text-[#1c1c1c] transition-colors duration-200 group-hover:text-[#17242f]">
            {trek.title}
          </h3>

          {place && (
            <p className="mt-1.5 flex items-center gap-1 text-[13px] text-[#6b6b6b]">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-[#dd8a3c]" />
              <span className="truncate">{place}</span>
            </p>
          )}

          <div className="mt-2.5 flex items-baseline justify-between border-t border-[#f1efe9] pt-2.5">
            <span className="text-[11px] uppercase tracking-wide text-[#9a9a9a]">From</span>
            <p className="text-[17px] font-bold text-[#17242f]">
              Nprs&nbsp;{price?.toLocaleString() ?? '—'}
              <span className="ml-1 text-[12px] font-medium text-[#9a9a9a]">/ person</span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}