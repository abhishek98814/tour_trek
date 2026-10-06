export default function AboutPage() {
  return (
    <main style={{ 
      // paddingTop: '68px', 
      background: '#f8f9fb', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #0f3d57 0%, #0a2e45 50%, #061e30 100%)',
        padding: '100px 24px 80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(20,184,166,0.12) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(20,184,166,0.08) 0%, transparent 40%)',
        }} />
        <div style={{ position: 'relative', maxWidth: '720px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: '20px',
            border: '1px solid rgba(20,184,166,0.4)',
            color: '#14b8a6',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '24px',
          }}>Est. 2018 · Kathmandu, Nepal</div>
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.1,
            margin: '0 0 24px',
            letterSpacing: '-1px',
          }}>
            We live in the<br />
            <span style={{ color: '#14b8a6' }}>mountains</span> we guide.
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.7,
            margin: '0 auto',
            maxWidth: '560px',
          }}>
            Trek Nepal was built by local guides, for travellers who want more than a packaged tour — an authentic Himalayan experience crafted with care.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{
        background: '#fff',
        borderBottom: '1px solid #e8ecf0',
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0,
        }}>
          {[
            { number: '6,000+', label: 'Trekkers guided' },
            { number: '40+', label: 'Trek & tour routes' },
            { number: '98%', label: 'Satisfaction rate' },
            { number: '7', label: 'Years operating' },
          ].map((stat, i) => (
            <div key={i} style={{
              padding: '32px 24px',
              textAlign: 'center',
              borderRight: i < 3 ? '1px solid #e8ecf0' : 'none',
            }}>
              <div style={{
                fontSize: '32px',
                fontWeight: 700,
                color: '#0a2e45',
                letterSpacing: '-1px',
                marginBottom: '4px',
              }}>{stat.number}</div>
              <div style={{
                fontSize: '13px',
                color: '#64748b',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '80px 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '64px',
          alignItems: 'center',
        }}>
          <div>
            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#14b8a6',
              marginBottom: '16px',
            }}>Our Story</div>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 700,
              color: '#0a2e45',
              lineHeight: 1.2,
              margin: '0 0 24px',
              letterSpacing: '-0.5px',
            }}>Born from a passion for Nepal's wilderness</h2>
            <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.8, margin: '0 0 16px' }}>
              Our founder Ramesh Tamang summited Everest in 2014 and spent the next four years guiding trekkers through the Khumbu, frustrated by agencies that treated Nepal like a backdrop rather than a living culture.
            </p>
            <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.8, margin: 0 }}>
              Trek Nepal was built differently — local guides who know every pass by name, small group sizes, and partnerships with village teahouses that put money directly into Himalayan communities.
            </p>
          </div>

          {/* Visual card */}
          <div style={{
            background: 'linear-gradient(160deg, #0f3d57, #0a2740)',
            borderRadius: '20px',
            padding: '40px',
            color: '#fff',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🏔️</div>
            <blockquote style={{
              fontSize: '20px',
              fontStyle: 'italic',
              fontWeight: 300,
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.9)',
              margin: '0 0 24px',
              borderLeft: '3px solid #14b8a6',
              paddingLeft: '20px',
            }}>
              "The mountains are not a destination. They are a conversation between the earth and the sky — and we are just the translators."
            </blockquote>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
              — Ramesh Tamang, Founder
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ background: '#fff', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{
              fontSize: '12px', fontWeight: 600, letterSpacing: '2px',
              textTransform: 'uppercase', color: '#14b8a6', marginBottom: '12px',
            }}>What we stand for</div>
            <h2 style={{
              fontSize: '36px', fontWeight: 700, color: '#0a2e45',
              margin: 0, letterSpacing: '-0.5px',
            }}>Our values</h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
          }}>
            {[
              {
                icon: '🧭',
                title: 'Local expertise',
                desc: 'Every guide is Nepali-born, certified, and has personally trekked every route we offer. No outsourced operations, ever.',
              },
              {
                icon: '🤝',
                title: 'Community first',
                desc: 'We partner directly with village teahouses, local porters, and Himalayan cooperatives — keeping tourism revenue in the mountains.',
              },
              {
                icon: '🌿',
                title: 'Responsible travel',
                desc: 'Small group sizes, leave-no-trace principles, and a carbon offset programme for every booking made through our platform.',
              },
              {
                icon: '🛡️',
                title: 'Safety without compromise',
                desc: 'Wilderness first aid-certified guides, real-time weather monitoring, and satellite communication on every high-altitude trek.',
              },
              {
                icon: '✨',
                title: 'Curated experiences',
                desc: 'We offer fewer routes than competitors by design — every trek and tour is personally vetted and itinerary-tested by our team.',
              },
              {
                icon: '📡',
                title: 'Transparent pricing',
                desc: 'No hidden fees, no surprise surcharges. The price you see includes permits, guides, meals, and accommodation where stated.',
              },
            ].map((v, i) => (
              <div key={i} style={{
                background: '#f8f9fb',
                borderRadius: '16px',
                padding: '28px',
                border: '1px solid #e8ecf0',
                transition: 'border-color 0.2s',
              }}>
                <div style={{ fontSize: '28px', marginBottom: '16px' }}>{v.icon}</div>
                <h3 style={{
                  fontSize: '16px', fontWeight: 700, color: '#0a2e45',
                  margin: '0 0 10px',
                }}>{v.title}</h3>
                <p style={{
                  fontSize: '14px', color: '#64748b', lineHeight: 1.7, margin: 0,
                }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{
            fontSize: '12px', fontWeight: 600, letterSpacing: '2px',
            textTransform: 'uppercase', color: '#14b8a6', marginBottom: '12px',
          }}>The people</div>
          <h2 style={{
            fontSize: '36px', fontWeight: 700, color: '#0a2e45',
            margin: 0, letterSpacing: '-0.5px',
          }}>Meet our core team</h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px',
        }}>
          {[
            { name: 'Ramesh Tamang', role: 'Founder & Head Guide', exp: '14 years', region: 'Khumbu', initials: 'RT' },
            { name: 'Sita Gurung', role: 'Operations Director', exp: '9 years', region: 'Annapurna', initials: 'SG' },
            { name: 'Prakash Rai', role: 'Senior Trek Guide', exp: '11 years', region: 'Langtang', initials: 'PR' },
            { name: 'Dawa Sherpa', role: 'High Altitude Specialist', exp: '16 years', region: 'Khumbu', initials: 'DS' },
          ].map((person, i) => (
            <div key={i} style={{
              background: '#fff',
              borderRadius: '16px',
              border: '1px solid #e8ecf0',
              padding: '28px 20px',
              textAlign: 'center',
            }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #0f3d57, #14b8a6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '18px',
                margin: '0 auto 16px',
              }}>{person.initials}</div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#0a2e45', marginBottom: '4px' }}>{person.name}</div>
              <div style={{ fontSize: '12px', color: '#14b8a6', fontWeight: 600, marginBottom: '12px' }}>{person.role}</div>
              <div style={{
                display: 'flex', flexDirection: 'column', gap: '4px',
              }}>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>📍 {person.region}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>⏱ {person.exp} experience</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: 'linear-gradient(135deg, #0f3d57 0%, #0a2e45 100%)',
        padding: '80px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '36px', fontWeight: 700, color: '#fff',
            margin: '0 0 16px', letterSpacing: '-0.5px',
          }}>Ready to trek with us?</h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', margin: '0 0 36px', lineHeight: 1.7 }}>
            Browse our curated collection of treks and tours, or reach out to our team to plan a custom itinerary.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/trek" style={{ textDecoration: 'none' }}>
              <button style={{
                padding: '14px 32px', borderRadius: '10px', border: 'none',
                background: '#14b8a6', color: '#fff', fontSize: '15px',
                fontWeight: 600, cursor: 'pointer',
              }}>Browse Treks</button>
            </a>
            <a href="/tours" style={{ textDecoration: 'none' }}>
              <button style={{
                padding: '14px 32px', borderRadius: '10px',
                border: '1.5px solid rgba(255,255,255,0.3)',
                background: 'transparent', color: '#fff', fontSize: '15px',
                fontWeight: 600, cursor: 'pointer',
              }}>Explore Tours</button>
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}