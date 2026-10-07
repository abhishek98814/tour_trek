import Link from 'next/link';

const footerLinks = {
  Explore: [
    { href: '/trek', label: 'Trek packages' },
    { href: '/tours', label: 'Tour packages' },
    { href: '/gear', label: 'Gear marketplace' },
    { href: '/trek?filter=featured', label: 'Featured treks' },
  ],
  Company: [
    { href: '/about', label: 'About us' },
    { href: '/about#team', label: 'Meet the team' },
    { href: '/about#guides', label: 'Our guides' },
    { href: '/about#contact', label: 'Say hello' },
  ],
  Account: [
    { href: '/auth/login', label: 'Log in' },
    { href: '/auth/register', label: 'Sign up' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/my-bookings', label: 'My bookings' },
  ],
  Legal: [
    { href: '/privacy', label: 'Privacy policy' },
    { href: '/terms', label: 'Terms of service' },
    { href: '/refund', label: 'Refund policy' },
    { href: '/safety', label: 'Safety guidelines' },
  ],
};

const popularTreks = [
  'Everest Base Camp',
  'Annapurna Circuit',
  'Langtang Valley',
  'Manaslu Circuit',
  'Upper Mustang',
  'Gokyo Lakes',
];

const socials = [
  { label: 'Instagram', href: '#' },
  { label: 'Facebook', href: '#' },
  { label: 'YouTube', href: '#' },
  { label: 'Twitter', href: '#' },
];

const contacts = [
  { icon: '✉️', label: 'Write to us', value: 'info@treknepal.com', href: 'mailto:info@treknepal.com' },
  { icon: '📞', label: 'Call us', value: '+977-1-4XXXXXX', href: 'tel:+97714000000' },
  { icon: '📍', label: 'Visit us', value: 'Thamel, Kathmandu', href: '#' },
];

export default function Footer() {
  return (
    <footer className="tn-footer">
      <style>{css}</style>

      <div className="tn-flags" aria-hidden="true">
        {['#2f6fd0', '#f4f1ea', '#d6403a', '#2e9b5b', '#f2b134'].map((c, i) => (
          <span key={i} style={{ background: c }} />
        ))}
      </div>

      <section className="tn-cta">
        <svg className="tn-ridge" viewBox="0 0 1440 160" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M0 160 L0 110 L120 70 L210 105 L340 30 L440 90 L560 55 L680 115 L800 20 L920 95 L1040 60 L1160 110 L1280 50 L1440 100 L1440 160 Z"
            fill="#0b1a2b"
          />
          <path d="M340 30 L372 52 L352 50 L340 62 L326 48 L314 52 Z" fill="#f4f1ea" opacity="0.9" />
          <path d="M800 20 L834 44 L812 42 L800 56 L786 40 L770 46 Z" fill="#f4f1ea" opacity="0.9" />
        </svg>

        <div className="tn-cta-inner">
          <h2>Namaste. The mountains are already waiting.</h2>
          <p>
            Thousands of trekkers have laced up with us, from first-timers on a
            week-long walk to old hands chasing a high pass. Pick a trail, meet your
            guide, and we'll handle the rest.
          </p>
          <div className="tn-cta-actions">
            <Link href="/trek" className="tn-btn tn-btn-solid">Find your trek</Link>
            <Link href="/auth/register" className="tn-btn tn-btn-ghost">Create a free account</Link>
          </div>
        </div>
      </section>

  
      <div className="tn-main">
        <div className="tn-grid">
          <div className="tn-brand">
            <div className="tn-logo">
              <span className="tn-logo-mark">🏔️</span>
              <span>
                <strong>Trek Nepal</strong>
                <small>Treks, tours and gear, all in one place</small>
              </span>
            </div>
            <p>
              Born in Kathmandu and run by people who actually walk these trails.
              Questions about altitude, packing or permits? Just ask. We love
              talking about this stuff.
            </p>

            <div className="tn-label">Popular right now</div>
            <div className="tn-chips">
              {popularTreks.map((trek) => (
                <Link key={trek} href={`/trek?search=${encodeURIComponent(trek)}`} className="tn-chip">
                  {trek}
                </Link>
              ))}
            </div>

            <div className="tn-socials">
              {socials.map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label} className="tn-social">
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <nav key={category} aria-label={category}>
              <div className="tn-label">{category}</div>
              <ul className="tn-links">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

     
        <div className="tn-contact">
          {contacts.map((c) => (
            <a key={c.label} href={c.href} className="tn-contact-item">
              <span className="tn-contact-icon">{c.icon}</span>
              <span>
                <small>{c.label}</small>
                <strong>{c.value}</strong>
              </span>
            </a>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="tn-bottom">
          <div>
            © {new Date().getFullYear()} Trek Nepal. Made with care in Kathmandu by{' '}
            <span className="tn-author">Abhishek Jha</span> 🇳🇵
          </div>
          <div className="tn-pay">
            <span>We accept</span>
            {['eSewa', 'Khalti', 'Stripe', 'Bank transfer'].map((p) => (
              <span key={p} className="tn-pay-chip">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

const css = `
.tn-footer {
  --night: #0b1a2b;
  --night-2: #112338;
  --snow: #f4f1ea;
  --muted: #93a3b8;
  --pine: #2e9b5b;
  --marigold: #f2b134;
  background: var(--night);
  color: var(--snow);
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}
.tn-footer a { color: inherit; text-decoration: none; }
.tn-footer a:focus-visible, .tn-footer button:focus-visible {
  outline: 2px solid var(--marigold);
  outline-offset: 3px;
  border-radius: 6px;
}

/* flags */
.tn-flags { display: flex; height: 6px; }
.tn-flags span { flex: 1; }

/* CTA */
.tn-cta {
  position: relative;
  background: linear-gradient(180deg, #17375c 0%, #1f5a6e 55%, #2c7a62 100%);
  padding: 88px 24px 190px;
  text-align: center;
  overflow: hidden;
}
.tn-ridge { position: absolute; left: 0; bottom: -1px; width: 100%; height: 150px; display: block; }
.tn-cta-inner { position: relative; max-width: 640px; margin: 0 auto; }
.tn-cta h2 {
  font-family: 'Fraunces', Georgia, 'Times New Roman', serif;
  font-size: clamp(30px, 5vw, 46px);
  line-height: 1.12;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0 0 18px;
}
.tn-cta p {
  font-size: 16px;
  line-height: 1.7;
  color: rgba(244, 241, 234, 0.82);
  margin: 0 auto 32px;
  max-width: 54ch;
}
.tn-cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.tn-btn {
  display: inline-block;
  padding: 13px 26px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
  transition: transform 0.15s ease, background 0.15s ease;
}
.tn-btn:hover { transform: translateY(-2px); }
.tn-btn-solid { background: var(--marigold); color: #1b1405 !important; }
.tn-btn-solid:hover { background: #ffc24f; }
.tn-btn-ghost { border: 1.5px solid rgba(244, 241, 234, 0.55); }
.tn-btn-ghost:hover { background: rgba(244, 241, 234, 0.1); }

/* main */
.tn-main { max-width: 1200px; margin: 0 auto; padding: 8px 24px 32px; }
.tn-grid {
  display: grid;
  grid-template-columns: 2.2fr 1fr 1fr 1fr 1fr;
  gap: 40px;
  padding: 24px 0 8px;
}
.tn-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--marigold);
  margin-bottom: 14px;
}

/* brand */
.tn-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.tn-logo-mark {
  width: 44px; height: 44px; border-radius: 12px;
  background: linear-gradient(135deg, var(--pine), #1d6e40);
  display: grid; place-items: center; font-size: 22px;
}
.tn-logo strong { display: block; font-size: 19px; }
.tn-logo small { display: block; font-size: 12px; color: var(--muted); margin-top: 2px; }
.tn-brand > p { color: var(--muted); font-size: 14px; line-height: 1.75; margin: 0 0 24px; max-width: 46ch; }
.tn-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
.tn-chip {
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12.5px;
  color: #c3cedc;
  background: var(--night-2);
  border: 1px solid rgba(244, 241, 234, 0.08);
  transition: border-color 0.15s ease, color 0.15s ease;
}
.tn-chip:hover { border-color: var(--pine); color: #fff; }
.tn-socials { display: flex; flex-wrap: wrap; gap: 14px; }
.tn-social {
  font-size: 13px;
  color: var(--muted);
  border-bottom: 1px solid rgba(147, 163, 184, 0.35);
  padding-bottom: 1px;
  transition: color 0.15s ease, border-color 0.15s ease;
}
.tn-social:hover { color: var(--snow); border-color: var(--marigold); }


.tn-links { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 11px; }
.tn-links a { font-size: 14px; color: var(--muted); transition: color 0.15s ease; }
.tn-links a:hover { color: var(--snow); }


.tn-contact {
  margin-top: 40px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.tn-contact-item {
  display: flex; align-items: center; gap: 14px;
  padding: 16px 18px;
  border-radius: 14px;
  background: var(--night-2);
  border: 1px solid rgba(244, 241, 234, 0.06);
  transition: border-color 0.15s ease;
}
.tn-contact-item:hover { border-color: rgba(242, 177, 52, 0.5); }
.tn-contact-icon {
  width: 42px; height: 42px; border-radius: 50%;
  background: rgba(46, 155, 91, 0.18);
  display: grid; place-items: center; font-size: 18px; flex-shrink: 0;
}
.tn-contact-item small { display: block; font-size: 12px; color: var(--muted); margin-bottom: 2px; }
.tn-contact-item strong { font-size: 14px; font-weight: 500; color: var(--snow); }


.tn-bottom {
  margin-top: 32px;
  padding-top: 22px;
  border-top: 1px solid rgba(244, 241, 234, 0.08);
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;
  font-size: 13px; color: var(--muted);
}
.tn-author { color: var(--snow); font-weight: 600; }
.tn-pay { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.tn-pay-chip {
  padding: 3px 10px; border-radius: 6px;
  border: 1px solid rgba(244, 241, 234, 0.12);
  font-size: 12px;
}


@media (max-width: 960px) {
  .tn-grid { grid-template-columns: 1fr 1fr 1fr; }
  .tn-brand { grid-column: 1 / -1; }
}
@media (max-width: 640px) {
  .tn-cta { padding: 64px 20px 150px; }
  .tn-ridge { height: 110px; }
  .tn-grid { grid-template-columns: 1fr 1fr; gap: 32px 24px; }
  .tn-contact { grid-template-columns: 1fr; }
  .tn-bottom { flex-direction: column; align-items: flex-start; }
}
@media (prefers-reduced-motion: reduce) {
  .tn-footer * { transition: none !important; }
  .tn-btn:hover { transform: none; }
}
`;