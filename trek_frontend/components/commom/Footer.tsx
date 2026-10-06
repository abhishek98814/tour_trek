import Link from 'next/link';

const footerLinks = {
  Explore: [
    { href: '/trek', label: 'Trek Packages' },
    { href: '/tours', label: 'Tour Packages' },
    { href: '/gear', label: 'Gear Marketplace' },
    { href: '/trek?filter=featured', label: 'Featured Treks' },
  ],
  Company: [
    { href: '/about', label: 'About Us' },
    { href: '/about#team', label: 'Our Team' },
    { href: '/about#guides', label: 'Our Guides' },
    { href: '/about#contact', label: 'Contact Us' },
  ],
  Account: [
    { href: '/auth/login', label: 'Login' },
    { href: '/auth/register', label: 'Register' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/my-bookings', label: 'My Bookings' },
  ],
  Legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/refund', label: 'Refund Policy' },
    { href: '/safety', label: 'Safety Guidelines' },
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

export default function Footer() {
  return (
    <footer style={{ background: '#0a1628', color: '#fff' }}>

      {/* Top CTA band */}
      <div style={{
        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%)',
        padding: '48px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{
            fontSize: '28px',
            fontWeight: 700,
            marginBottom: '12px',
            letterSpacing: '-0.5px',
          }}>
            Ready to explore Nepal? 🏔️
          </div>
          <p style={{
            color: 'rgba(255,255,255,0.85)',
            marginBottom: '24px',
            fontSize: '15px',
            lineHeight: 1.6,
          }}>
            Join thousands of trekkers who discovered Nepal with us.
            Book your next adventure today.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/trek" style={{ textDecoration: 'none' }}>
              <button style={{
                padding: '12px 28px',
                borderRadius: '8px',
                background: '#fff',
                color: '#16a34a',
                fontWeight: 600,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}>
                Browse Treks →
              </button>
            </Link>
            <Link href="/auth/register" style={{ textDecoration: 'none' }}>
              <button style={{
                padding: '12px 28px',
                borderRadius: '8px',
                background: 'transparent',
                color: '#fff',
                fontWeight: 600,
                fontSize: '14px',
                border: '2px solid rgba(255,255,255,0.6)',
                cursor: 'pointer',
              }}>
                Create Account
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '64px 24px 40px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
          gap: '40px',
        }}>

          {/* Brand Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}>🏔️</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '18px' }}>Trek Nepal</div>
                <div style={{ fontSize: '10px', color: '#16a34a', letterSpacing: '1.5px' }}>
                  EXPLORE · BOOK · DISCOVER
                </div>
              </div>
            </div>
            <p style={{
              color: '#8892a4',
              fontSize: '13px',
              lineHeight: 1.7,
              marginBottom: '20px',
            }}>
              Nepal's most trusted platform for trekking, tours and gear.
              Your adventure starts here.
            </p>

            {/* Popular Treks */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                fontSize: '11px',
                letterSpacing: '1px',
                color: '#16a34a',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: '10px',
              }}>Popular Treks</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {popularTreks.map((trek) => (
                  <Link key={trek} href="/trek" style={{ textDecoration: 'none' }}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '20px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: '11px',
                      color: '#8892a4',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'inline-block',
                    }}>
                      {trek}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { icon: '📘', label: 'Facebook' },
                { icon: '📸', label: 'Instagram' },
                { icon: '🐦', label: 'Twitter' },
                { icon: '▶️', label: 'YouTube' },
              ].map((social) => (
                <button key={social.label} style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  color: '#fff',
                }} title={social.label}>
                  {social.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <div style={{
                fontSize: '11px',
                letterSpacing: '1px',
                color: '#16a34a',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: '16px',
              }}>{category}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {links.map((link) => (
                  <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                    <span style={{
                      fontSize: '13px',
                      color: '#8892a4',
                      cursor: 'pointer',
                      transition: 'color 0.2s',
                      display: 'block',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#8892a4')}
                    >
                      {link.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact row */}
        <div style={{
          marginTop: '48px',
          padding: '24px',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
        }}>
          {[
            { icon: '📧', label: 'Email Us', value: 'info@treknepal.com' },
            { icon: '📞', label: 'Call Us', value: '+977-1-4XXXXXX' },
            { icon: '.', label: 'Find Us', value: 'Thamel, Kathmandu, Nepal' },
          ].map((item) => (
            <div key={item.label} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(22,163,74,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                flexShrink: 0,
              }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '13px', color: '#cdd5e0' }}>
                  {item.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ fontSize: '12px', color: '#8892a4' }}>
            © 2024 Trek Nepal. Built with ❤️ by{' '}
            <span style={{ color: '#16a34a', fontWeight: 600 }}>Abhishek Jha</span>
            {' '}— Kathmandu, Nepal 🇳🇵
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {['eSewa', 'Khalti', 'Stripe', 'Bank'].map((pay) => (
              <span key={pay} style={{
                padding: '3px 10px',
                borderRadius: '4px',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '11px',
                color: '#8892a4',
              }}>{pay}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}