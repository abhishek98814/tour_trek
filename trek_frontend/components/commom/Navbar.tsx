'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import useAuthStore from '@/store/authStore';
// import TN from '../../public/tn.jpg'

const navLinks = [
  { href: '/trek', label: 'Treks' },
  { href: '/tours', label: 'Tours' },
  { href: '/gear', label: 'Gear' },
  { href: '/about', label: 'About' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const profileRef = useRef(null);

  const { user, hasHydrated, logout } = useAuthStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the profile menu on an outside click, and the mobile menu on route change.
  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current?.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  // Avoid a flash of logged-out UI while the auth store rehydrates.
  if (!hasHydrated) {
    return <nav className="nav" aria-hidden />;
  }

  const dashboardLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/my-bookings', label: 'My bookings' },
    // { href: '/dashboard/profile', label: 'Profile' },
    ...(user?.role === 'admin' ? [{ href: '/admin-panel', label: 'Admin panel' }] : []),
  ];

  return (
    <>
      <nav className={`nav ${scrolled ? 'nav--solid' : ''}`}>
        <div className="nav__inner">
          <Link href="/" className="brand" aria-label="Trek Nepal, home">

              <Image
                  src="/tn.jpg"
                  alt="Trek Nepal"
                  width={45}
                  height={45}
                  className="brand__logo"
                />
            <span className="brand__text">
              <span className="brand__name">Trek Nepal</span>
              <span className="brand__tag">Explore &middot; Book &middot; Discover</span>
            </span>
          </Link>

          <div className="links">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} className={`links__item ${active ? 'is-active' : ''}`}>
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="actions">
            {user ? (
              <div className="profile" ref={profileRef}>
                <button
                  className="profile__trigger"
                  onClick={() => setProfileOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                >
                  <span className="profile__avatar">{user.username?.charAt(0).toUpperCase()}</span>
                  <span className="profile__name">{user.username}</span>
                  <svg className={`profile__chevron ${profileOpen ? 'is-open' : ''}`} viewBox="0 0 12 8" fill="none">
                    <path d="M1 1.5L6 6.5L11 1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {profileOpen && (
                  <div className="dropdown" role="menu">
                    <div className="dropdown__header">
                      <div className="dropdown__name">{user.username}</div>
                      <div className="dropdown__email">{user.email}</div>
                      <span className="dropdown__badge">{user.role}</span>
                    </div>
                    <div className="dropdown__list">
                      {dashboardLinks.map((item, i) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="dropdown__item"
                          style={{ '--i': i }}
                          onClick={() => setProfileOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    <button
                      className="dropdown__logout"
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                      }}
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link href="/auth/login" className="btn btn--ghost">
                  Log in
                </Link>
                <Link href="/auth/register" className="btn btn--solid">
                  Get started
                </Link>
              </div>
            )}

            <button
              className={`burger ${menuOpen ? 'is-open' : ''}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile ${menuOpen ? 'is-open' : ''}`}>
        <div className="mobile__backdrop" onClick={() => setMenuOpen(false)} />
        <div className="mobile__panel">
          {navLinks.map((link, i) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`mobile__item ${active ? 'is-active' : ''}`}
                style={{ '--i': i }}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
          {!user && (
            <div className="mobile__auth">
              <Link href="/auth/login" className="btn btn--ghost" onClick={() => setMenuOpen(false)}>
                Log in
              </Link>
              <Link href="/auth/register" className="btn btn--solid" onClick={() => setMenuOpen(false)}>
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        :root {
          --ink: #17242f;
          --ink-soft: #3c4d59;
          --marigold: #dd8a3c;
          --marigold-deep: #b96a24;
          --teal: #1f8f86;
          --mist: #8fa1ab;
          --cloud: #f7f4ee;
          --paper: #ffffff;
        }

        .nav {
          position: fixed;
          inset: 0 0 auto 0;
          z-index: 1000;
          height: 72px;
          border-bottom: 1px solid transparent;
          background: transparent;
          backdrop-filter: blur(0px);
          transition: background 0.45s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.45s ease,
            backdrop-filter 0.45s ease;
        }
        .nav--solid {
          background: rgba(247, 244, 238, 0.92);
          border-bottom-color: rgba(23, 36, 47, 0.08);
          backdrop-filter: blur(14px);
        }

        .nav__inner {
          max-width: 1200px;
          height: 100%;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        /* Brand */
        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .brand__mark {
          width: 34px;
          height: 34px;
          overflow: visible;
        }
        .brand__peaks {
          stroke: var(--marigold);
          stroke-width: 2.4;
          fill: none;
          transition: stroke 0.35s ease, transform 0.35s ease;
          transform-origin: 20px 30px;
        }
        .nav--solid .brand__peaks {
          stroke: var(--ink);
        }
        .brand__sun {
          fill: var(--marigold);
          transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease;
          transform-origin: 28px 12px;
        }
        .brand:hover .brand__sun {
          transform: translateY(-3px) scale(1.12);
        }
        .brand:hover .brand__peaks {
          transform: scale(1.03);
        }
        .brand__text {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }
        .brand__name {
          font-family: 'Fraunces', Georgia, 'Times New Roman', serif;
          font-weight: 600;
          font-size: 18px;
          letter-spacing: -0.2px;
          color: #fff;
          transition: color 0.35s ease;
        }
        .nav--solid .brand__name {
          color: var(--ink);
        }
        .brand__tag {
          margin-top: 3px;
          font-size: 10px;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.65);
          transition: color 0.35s ease;
        }
        .nav--solid .brand__tag {
          color: var(--teal);
        }

        /* Links */
        .links {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .links__item {
          position: relative;
          padding: 8px 4px;
          margin: 0 10px;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          color: rgba(255, 255, 255, 0.85);
          transition: color 0.3s ease;
        }
        .nav--solid .links__item {
          color: var(--ink-soft);
        }
        .links__item::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: 0;
          width: 0;
          height: 2px;
          background: var(--marigold);
          transform: translateX(-50%);
          transition: width 0.28s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .links__item:hover {
          color: #fff;
        }
        .nav--solid .links__item:hover {
          color: var(--ink);
        }
        .links__item:hover::after,
        .links__item.is-active::after {
          width: 100%;
        }
        .links__item.is-active {
          color: #fff;
          font-weight: 600;
        }
        .nav--solid .links__item.is-active {
          color: var(--ink);
        }

        /* Actions */
        .actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .auth-buttons {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .btn {
          padding: 9px 20px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          text-align: center;
          cursor: pointer;
          transition: transform 0.18s ease, opacity 0.2s ease, background 0.2s ease, border-color 0.2s ease;
          display: inline-block;
        }
        .btn:active {
          transform: scale(0.96);
        }
        .btn--ghost {
          border: 1.5px solid rgba(255, 255, 255, 0.4);
          color: #fff;
          background: transparent;
        }
        .nav--solid .btn--ghost {
          border-color: rgba(23, 36, 47, 0.22);
          color: var(--ink);
        }
        .btn--ghost:hover {
          border-color: var(--marigold);
          color: var(--marigold);
        }
        .btn--solid {
          border: none;
          background: var(--ink);
          color: var(--cloud);
        }
        .nav--solid .btn--solid {
          background: var(--marigold);
          color: #fff;
        }
        .btn--solid:hover {
          background: var(--marigold-deep);
          color: #fff;
        }

        .profile {
          position: relative;
        }
        .profile__trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 12px 4px 4px;
          border-radius: 999px;
          border: 1.5px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.08);
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .nav--solid .profile__trigger {
          border-color: rgba(31, 143, 134, 0.3);
          background: rgba(31, 143, 134, 0.06);
        }
        .profile__trigger:hover {
          border-color: var(--marigold);
        }
        .profile__avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--ink);
          color: var(--marigold);
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .profile__name {
          font-size: 13px;
          font-weight: 500;
          color: #fff;
        }
        .nav--solid .profile__name {
          color: var(--ink);
        }
        .profile__chevron {
          width: 10px;
          height: 7px;
          stroke: currentColor;
          color: rgba(255, 255, 255, 0.7);
          transition: transform 0.25s ease;
        }
        .nav--solid .profile__chevron {
          color: var(--mist);
        }
        .profile__chevron.is-open {
          transform: rotate(180deg);
        }

        .dropdown {
          position: absolute;
          top: 50px;
          right: 0;
          width: 230px;
          background: var(--paper);
          border-radius: 14px;
          border: 1px solid rgba(23, 36, 47, 0.07);
          box-shadow: 0 16px 40px rgba(23, 36, 47, 0.16);
          padding: 8px;
          transform-origin: top right;
          animation: pop-in 0.18s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes pop-in {
          from {
            opacity: 0;
            transform: scale(0.94) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .dropdown__header {
          padding: 10px 12px 14px;
          border-bottom: 1px solid #f1efe9;
          margin-bottom: 4px;
        }
        .dropdown__name {
          font-weight: 700;
          font-size: 14px;
          color: var(--ink);
        }
        .dropdown__email {
          font-size: 12px;
          color: var(--mist);
          margin-top: 2px;
        }
        .dropdown__badge {
          margin-top: 8px;
          display: inline-block;
          padding: 3px 10px;
          border-radius: 6px;
          background: rgba(31, 143, 134, 0.1);
          color: var(--teal);
          font-size: 11px;
          font-weight: 600;
          text-transform: capitalize;
        }
        .dropdown__list {
          display: flex;
          flex-direction: column;
        }
        .dropdown__item {
          padding: 9px 12px;
          border-radius: 8px;
          font-size: 13px;
          color: var(--ink-soft);
          text-decoration: none;
          transition: background 0.15s ease, padding-left 0.15s ease;
          animation: item-in 0.25s cubic-bezier(0.22, 1, 0.36, 1) backwards;
          animation-delay: calc(var(--i) * 0.03s);
        }
        @keyframes item-in {
          from {
            opacity: 0;
            transform: translateX(-4px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .dropdown__item:hover {
          background: var(--cloud);
          padding-left: 16px;
        }
        .dropdown__logout {
          width: 100%;
          margin-top: 4px;
          padding: 9px 12px;
          border-top: 1px solid #f1efe9;
          border-left: none;
          border-right: none;
          border-bottom: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #c0432a;
          background: transparent;
          text-align: left;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .dropdown__logout:hover {
          background: #fdf1ee;
        }

        /* Burger (mobile) */
        .burger {
          display: none;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          cursor: pointer;
        }
        .burger span {
          width: 20px;
          height: 2px;
          background: #fff;
          border-radius: 2px;
          transition: transform 0.3s ease, opacity 0.3s ease, background 0.3s ease;
        }
        .nav--solid .burger span {
          background: var(--ink);
        }
        .burger.is-open span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        .burger.is-open span:nth-child(2) {
          opacity: 0;
        }
        .burger.is-open span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        /* Mobile panel */
        .mobile {
          position: fixed;
          inset: 0;
          z-index: 999;
          pointer-events: none;
        }
        .mobile__backdrop {
          position: absolute;
          inset: 0;
          background: rgba(23, 36, 47, 0.4);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .mobile__panel {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 78%;
          max-width: 320px;
          background: var(--paper);
          padding: 96px 28px 32px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          transform: translateX(100%);
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
          box-shadow: -8px 0 32px rgba(23, 36, 47, 0.12);
        }
        .mobile.is-open {
          pointer-events: auto;
        }
        .mobile.is-open .mobile__backdrop {
          opacity: 1;
        }
        .mobile.is-open .mobile__panel {
          transform: translateX(0);
        }
        .mobile__item {
          padding: 14px 4px;
          font-size: 16px;
          font-weight: 500;
          color: var(--ink-soft);
          text-decoration: none;
          border-bottom: 1px solid #f1efe9;
          opacity: 0;
          transform: translateX(12px);
        }
        .mobile.is-open .mobile__item {
          animation: item-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: calc(0.1s + var(--i) * 0.05s);
        }
        .mobile__item.is-active {
          color: var(--marigold-deep);
          font-weight: 700;
        }
        .mobile__auth {
          display: flex;
          gap: 10px;
          margin-top: 18px;
        }
        .mobile__auth .btn {
          flex: 1;
          color: var(--ink);
          border-color: rgba(23, 36, 47, 0.2);
        }
        .mobile__auth .btn--solid {
          background: var(--marigold);
          color: #fff;
        }

        @media (max-width: 860px) {
          .links,
          .auth-buttons {
            display: none;
          }
          .burger {
            display: flex;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.001ms !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600&display=swap');
      `}</style>
    </>
  );
}