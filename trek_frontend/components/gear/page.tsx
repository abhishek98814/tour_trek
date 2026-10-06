'use client';
import { useState } from 'react';
import { useGear } from '@/hooks/useGear';
import Link from 'next/link';

const CONDITIONS = ['all', 'new', 'like_new', 'good', 'fair', 'poor'];
const LISTING_TYPES = ['all', 'sell', 'rent', 'both'];
const SIZES = ['all', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'one_size'];

const conditionColors: Record<string, { bg: string; color: string }> = {
  new:      { bg: '#dcfce7', color: '#16a34a' },
  like_new: { bg: '#dbeafe', color: '#2563eb' },
  good:     { bg: '#fef9c3', color: '#ca8a04' },
  fair:     { bg: '#ffedd5', color: '#ea580c' },
  poor:     { bg: '#fee2e2', color: '#dc2626' },
};

const listingColors: Record<string, { bg: string; color: string }> = {
  sell: { bg: '#f0fdf4', color: '#16a34a' },
  rent: { bg: '#eff6ff', color: '#2563eb' },
  both: { bg: '#fdf4ff', color: '#9333ea' },
};

function GearCard({ item }: { item: any }) {
  const [hovered, setHovered] = useState(false);
  const cond = conditionColors[item.condition] ?? conditionColors.good;
  const listing = listingColors[item.listing_type] ?? listingColors.sell;
  const cover = item.cover_image || item.images?.[0]?.image || null;

  return (
    <Link href={`/gear/${item.slug}`} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: '#fff', borderRadius: '20px',
          overflow: 'hidden',
          border: hovered ? '1px solid rgba(20,184,166,0.4)' : '1px solid #e8ecf0',
          transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
          boxShadow: hovered ? '0 24px 60px rgba(10,46,69,0.12)' : '0 2px 12px rgba(10,46,69,0.05)',
          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
          cursor: 'pointer',
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
          {cover ? (
            <img
              src={cover}
              alt={item.title}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transform: hovered ? 'scale(1.06)' : 'scale(1)',
                transition: 'transform 0.5s ease',
              }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: 'linear-gradient(135deg, #ea580c, #c2410c)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '56px',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
              transition: 'transform 0.5s ease',
            }}>🎒</div>
          )}

          {/* Overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(10,46,69,0.6) 0%, transparent 60%)',
            opacity: hovered ? 1 : 0.7,
            transition: 'opacity 0.3s',
          }} />

          {/* Badges */}
          <div style={{
            position: 'absolute', top: '12px', left: '12px',
            display: 'flex', gap: '6px', flexWrap: 'wrap',
          }}>
            <span style={{
              padding: '4px 10px', borderRadius: '6px',
              fontSize: '11px', fontWeight: 700,
              background: cond.bg, color: cond.color,
              textTransform: 'capitalize',
            }}>
              {item.condition?.replace('_', ' ')}
            </span>
            <span style={{
              padding: '4px 10px', borderRadius: '6px',
              fontSize: '11px', fontWeight: 700,
              background: listing.bg, color: listing.color,
              textTransform: 'capitalize',
            }}>
              {item.listing_type === 'both' ? 'Sale & Rent' : `For ${item.listing_type}`}
            </span>
          </div>

          {/* Featured */}
          {item.is_featured && (
            <div style={{
              position: 'absolute', top: '12px', right: '12px',
              background: 'rgba(245,158,11,0.9)',
              padding: '4px 10px', borderRadius: '6px',
              fontSize: '11px', fontWeight: 700, color: '#fff',
            }}>⭐ Featured</div>
          )}

          {/* Location bottom */}
          <div style={{
            position: 'absolute', bottom: '12px', left: '12px',
            fontSize: '12px', color: 'rgba(255,255,255,0.85)',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            📍 {item.location}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '16px' }}>
          {/* Brand */}
          {item.brand && (
            <div style={{
              fontSize: '11px', fontWeight: 700, color: '#14b8a6',
              letterSpacing: '0.5px', textTransform: 'uppercase',
              marginBottom: '4px',
            }}>
              {item.brand}
            </div>
          )}

          {/* Title */}
          <h3 style={{
            fontSize: '15px', fontWeight: 700, color: '#0a2e45',
            margin: '0 0 8px', lineHeight: 1.3,
          }}>
            {item.title}
          </h3>

          {/* Size & Weight */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            {item.size && item.size !== 'na' && (
              <span style={{
                padding: '3px 10px', borderRadius: '6px',
                background: '#f1f5f9', color: '#475569',
                fontSize: '11px', fontWeight: 600,
                textTransform: 'uppercase',
              }}>
                Size: {item.size?.replace('_', ' ')}
              </span>
            )}
            {item.weight_kg && (
              <span style={{
                padding: '3px 10px', borderRadius: '6px',
                background: '#f1f5f9', color: '#475569',
                fontSize: '11px', fontWeight: 600,
              }}>
                {item.weight_kg} kg
              </span>
            )}
          </div>

          {/* Price */}
          <div style={{
            borderTop: '1px solid #f1f5f9',
            paddingTop: '12px',
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}>
            <div>
              {item.sell_price && (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#0a2e45' }}>
                    NPR {Number(item.sell_price).toLocaleString()}
                  </span>
                  {item.is_negotiable && (
                    <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>
                      · Nego
                    </span>
                  )}
                </div>
              )}
              {item.rent_price_per_day && (
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  NPR {Number(item.rent_price_per_day).toLocaleString()}/day rent
                </div>
              )}
            </div>

            <div style={{
              padding: '8px 14px', borderRadius: '8px',
              background: hovered
                ? 'linear-gradient(135deg, #14b8a6, #0d9488)'
                : 'linear-gradient(135deg, #0f3d57, #14b8a6)',
              color: '#fff', fontSize: '12px', fontWeight: 700,
              transition: 'background 0.3s',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              View
              <span style={{
                transform: hovered ? 'translateX(2px)' : 'translateX(0)',
                transition: 'transform 0.2s', display: 'inline-block',
              }}>→</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function GearPage() {
  const [listingType, setListingType] = useState('all');
  const [condition, setCondition] = useState('all');
  const [size, setSize] = useState('all');
  const [search, setSearch] = useState('');
  const [negotiable, setNegotiable] = useState(false);

  const { data, isLoading, isError } = useGear({
    listing_type: listingType !== 'all' ? listingType : undefined,
    condition: condition !== 'all' ? condition : undefined,
    size: size !== 'all' ? size : undefined,
    search: search || undefined,
    is_negotiable: negotiable || undefined,
  });

  const items = data?.results || data || [];

  return (
    <div style={{ background: '#f8f9fb', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 60%, #7c2d12 100%)',
        padding: '60px 24px 50px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)',
        }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
          <div style={{
            fontSize: '12px', fontWeight: 600, letterSpacing: '2px',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)',
            marginBottom: '10px',
          }}>
            Gear Marketplace
          </div>
          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800,
            color: '#fff', margin: '0 0 10px', letterSpacing: '-1px',
          }}>
            Buy, Sell & Rent<br />Trekking Gear
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', margin: 0 }}>
            {items.length} items available from verified sellers in Nepal
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e8ecf0',
        position: 'sticky', top: '68px', zIndex: 100,
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          padding: '14px 24px',
          display: 'flex', gap: '10px', flexWrap: 'wrap',
          alignItems: 'center',
        }}>

          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <span style={{
              position: 'absolute', left: '12px', top: '50%',
              transform: 'translateY(-50%)', fontSize: '14px',
            }}>🔍</span>
            <input
              type="text"
              placeholder="Search gear, brand..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '9px 14px 9px 34px',
                borderRadius: '8px', border: '1.5px solid #e5e7eb',
                fontSize: '13px', outline: 'none', boxSizing: 'border-box' as const,
              }}
              onFocus={e => (e.target.style.border = '1.5px solid #ea580c')}
              onBlur={e => (e.target.style.border = '1.5px solid #e5e7eb')}
            />
          </div>

          {/* Listing type */}
          <select
            value={listingType}
            onChange={e => setListingType(e.target.value)}
            style={{
              padding: '9px 12px', borderRadius: '8px',
              border: '1.5px solid #e5e7eb', fontSize: '13px',
              background: '#fff', cursor: 'pointer', outline: 'none',
              color: '#374151', fontWeight: 500,
            }}
          >
            {LISTING_TYPES.map(t => (
              <option key={t} value={t}>
                {t === 'all' ? 'All Types' : t === 'both' ? 'Sale & Rent' : `For ${t.charAt(0).toUpperCase() + t.slice(1)}`}
              </option>
            ))}
          </select>

          {/* Condition */}
          <select
            value={condition}
            onChange={e => setCondition(e.target.value)}
            style={{
              padding: '9px 12px', borderRadius: '8px',
              border: '1.5px solid #e5e7eb', fontSize: '13px',
              background: '#fff', cursor: 'pointer', outline: 'none',
              color: '#374151', fontWeight: 500,
            }}
          >
            {CONDITIONS.map(c => (
              <option key={c} value={c}>
                {c === 'all' ? 'All Conditions' : c.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>

          {/* Size */}
          <select
            value={size}
            onChange={e => setSize(e.target.value)}
            style={{
              padding: '9px 12px', borderRadius: '8px',
              border: '1.5px solid #e5e7eb', fontSize: '13px',
              background: '#fff', cursor: 'pointer', outline: 'none',
              color: '#374151', fontWeight: 500,
            }}
          >
            {SIZES.map(s => (
              <option key={s} value={s}>
                {s === 'all' ? 'All Sizes' : s === 'one_size' ? 'One Size' : s.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Negotiable toggle */}
          <button
            onClick={() => setNegotiable(!negotiable)}
            style={{
              padding: '9px 16px', borderRadius: '8px',
              border: negotiable ? '1.5px solid #16a34a' : '1.5px solid #e5e7eb',
              background: negotiable ? '#f0fdf4' : '#fff',
              color: negotiable ? '#16a34a' : '#64748b',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {negotiable ? '✓' : ''} Negotiable
          </button>

          {/* Reset */}
          {(listingType !== 'all' || condition !== 'all' || size !== 'all' || search || negotiable) && (
            <button
              onClick={() => {
                setListingType('all'); setCondition('all');
                setSize('all'); setSearch(''); setNegotiable(false);
              }}
              style={{
                padding: '9px 14px', borderRadius: '8px',
                border: '1px solid #fecaca', background: '#fef2f2',
                color: '#dc2626', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer',
              }}
            >✕ Reset</button>
          )}

          <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
            {items.length} item{items.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Sell your gear CTA */}
        <div style={{
          padding: '20px 24px', borderRadius: '16px',
          background: 'linear-gradient(135deg, #0f3d57, #0a2e45)',
          marginBottom: '32px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
              🎒 Have gear to sell or rent?
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
              List your trekking equipment and reach thousands of trekkers in Nepal.
            </div>
          </div>
          <Link href="/gear/create" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '10px 24px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
              color: '#fff', fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              List Your Gear →
            </button>
          </Link>
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '80px', gap: '16px',
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              border: '3px solid #e8ecf0', borderTopColor: '#ea580c',
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ color: '#64748b', fontSize: '15px' }}>Loading gear...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div style={{
            textAlign: 'center', padding: '60px',
            background: '#fef2f2', borderRadius: '16px',
            border: '1px solid #fecaca',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
            <p style={{ color: '#dc2626', fontWeight: 600 }}>Failed to load gear</p>
            <p style={{ color: '#64748b', fontSize: '13px' }}>Make sure Django server is running.</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && items.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '80px',
            background: '#fff', borderRadius: '20px',
            border: '1px dashed #cbd5e1',
          }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎒</div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0a2e45', marginBottom: '8px' }}>
              No gear found
            </h3>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>
              {search || listingType !== 'all' || condition !== 'all'
                ? 'Try adjusting your filters'
                : 'No gear listed yet. Be the first to list!'}
            </p>
            <Link href="/gear/create">
              <button style={{
                padding: '10px 24px', background: '#ea580c',
                color: '#fff', border: 'none', borderRadius: '8px',
                cursor: 'pointer', fontWeight: 600,
              }}>
                List Gear →
              </button>
            </Link>
          </div>
        )}

        {/* Grid */}
        {!isLoading && !isError && items.length > 0 && (
          <>
            {/* Category quick filters */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {['All', '⛺ Tents', '🥾 Boots', '🧥 Jackets', '🎒 Backpacks', '🧤 Gloves', '🔦 Lights', '🧗 Climbing'].map((cat, i) => (
                <button key={i} style={{
                  padding: '6px 14px', borderRadius: '20px',
                  border: i === 0 ? 'none' : '1px solid #e8ecf0',
                  background: i === 0 ? 'linear-gradient(135deg, #ea580c, #c2410c)' : '#fff',
                  color: i === 0 ? '#fff' : '#64748b',
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                }}>
                  {cat}
                </button>
              ))}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px',
            }}>
              {items.map((item: any) => (
                <GearCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}