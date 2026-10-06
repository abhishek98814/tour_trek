"use client";

import React, { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface IconProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

interface ExperienceItem {
  role: string;
  org: string;
  place: string;
  start: string;
  end: string;
  length: string;
  current?: boolean;
  tags: string[];
  note?: string;
}

interface EducationItem {
  school: string;
  degree: string;
  period: string;
  grade: string;
}

interface SkillGroup {
  label: string;
  icon: (props: IconProps) => React.JSX.Element;
  color: string;
  items: string[];
}

interface StatItem {
  value: string;
  label: string;
}

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
}

/* ------------------------------------------------------------------ */
/* Inline SVG icons — no external icon library needed                  */
/* ------------------------------------------------------------------ */

interface IconBaseProps extends IconProps {
  children: React.ReactNode;
}

const IconBase = ({ children, size = 18, color = "currentColor", style }: IconBaseProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    {children}
  </svg>
);

const ArrowUpRight = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M7 17 17 7" />
    <path d="M7 7h10v10" />
  </IconBase>
);
const MapPin = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </IconBase>
);
const Link2 = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M9 17H7A5 5 0 0 1 7 7h2" />
    <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </IconBase>
);
const Mail = (props: IconProps) => (
  <IconBase {...props}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 6-10 7L2 6" />
  </IconBase>
);
const TrendingUp = (props: IconProps) => (
  <IconBase {...props}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </IconBase>
);
const Layers = (props: IconProps) => (
  <IconBase {...props}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </IconBase>
);
const Target = (props: IconProps) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </IconBase>
);
const Megaphone = (props: IconProps) => (
  <IconBase {...props}>
    <path d="m3 11 18-5v12L3 13v-2Z" />
    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
  </IconBase>
);

/**
 * Puspa Mabo Limbu — Digital Marketing Executive
 * "Campaign Report" concept: a metrics ticker up top, a chronological
 * campaign timeline for experience, and skills styled as targeting tags.
 *
 * Pure CSS — no Tailwind, no UI library required. Next.js App Router
 * client component — drop into e.g. app/portfolio/page.tsx or import
 * it into a page.
 */

const TOKENS = {
  ink: "#14161F",
  paper: "#ECEEF4",
  paperDim: "#DDE1EC",
  blue: "#2F6BFF",
  coral: "#FF5470",
  green: "#1FA971",
  slate: "#6B7280",
  slateLight: "#9AA1B2",
};

const experience: ExperienceItem[] = [
  {
    role: "Digital Marketing Executive",
    org: "Fasto",
    place: "Chapal Karkhana · On-site",
    start: "Sep 2025",
    end: "Present",
    length: "11 mos",
    current: true,
    tags: ["Digital Marketing", "Media Planning", "Analytics"],
  },
  {
    role: "Project Officer",
    org: "Infinity Digital Agency (IDA)",
    place: "Kathmandu, Bāgmatī",
    start: "Apr 2024",
    end: "Aug 2025",
    length: "1 yr 5 mos",
    tags: ["Analytical Skills", "Business Analysis", "+11 more"],
  },
  {
    role: "Marketing Executive",
    org: "WoM-Marketing, Inc.",
    place: "Tinkuney, Kathmandu · On-site",
    start: "Oct 2023",
    end: "Mar 2024",
    length: "6 mos",
    tags: ["Content Creation", "Scheduling", "Community Engagement"],
    note:
      "Supported digital marketing efforts across social platforms — content creation, scheduling, audience engagement, and analytics-driven optimization.",
  },
];

const education: EducationItem[] = [
  {
    school: "Amrit Science Campus",
    degree: "Bachelor of Applied Science (BASc), Liberal Arts & Sciences",
    period: "Nov 2016 – Feb 2021",
    grade: "Grade B",
  },
  {
    school: "Damak Multiple Campus",
    degree: "English",
    period: "Jul 2013 – May 2015",
    grade: "Grade A",
  },
];

const skillGroups: SkillGroup[] = [
  {
    label: "Platforms",
    icon: Megaphone,
    color: TOKENS.blue,
    items: ["Meta Ads", "Google Ads", "E-commerce SEO"],
  },
  {
    label: "Core Skills",
    icon: Target,
    color: TOKENS.coral,
    items: ["Teamwork", "Communication", "Marketing", "Analytical Skills"],
  },
  {
    label: "Practice",
    icon: TrendingUp,
    color: TOKENS.green,
    items: [
      "Content Planning",
      "Copywriting",
      "Performance Analysis",
      "Digital Marketing Media",
    ],
  },
];

const stats: StatItem[] = [
  { value: "3", label: "Agencies" },
  { value: "25", label: "Skills logged" },
  { value: "2", label: "Ad platforms" },
  { value: "NPL", label: "Based in Kathmandu" },
];

function useInView(threshold = 0.15): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function Reveal({ children, delay = 0 }: RevealProps) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0px)" : "translateY(18px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function Ticker() {
  const items = [
    "Meta Ads",
    "Google Ads",
    "Content Planning",
    "Copywriting",
    "Performance Analysis",
    "E-commerce SEO",
    "Audience Targeting",
    "Community Engagement",
  ];
  const loop = [...items, ...items];
  return (
    <div
      style={{
        overflow: "hidden",
        borderTop: `1px solid ${TOKENS.slate}55`,
        borderBottom: `1px solid ${TOKENS.slate}55`,
        width: "100%",
        padding: "0.75rem 0",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "2.5rem",
          whiteSpace: "nowrap",
          animation: "ticker-scroll 26s linear infinite",
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      >
        {loop.map((t, i) => (
          <span
            key={i}
            style={{ color: TOKENS.slateLight, fontSize: "0.78rem", letterSpacing: "0.04em" }}
          >
            {t.toUpperCase()} <span style={{ color: TOKENS.blue, margin: "0 0.6rem" }}>●</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function PuspaPortfolio() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: TOKENS.paper, color: TOKENS.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .pp * { box-sizing: border-box; }
        .pp a { text-decoration: none; color: inherit; }

        .display-font { font-family: 'Space Grotesk', sans-serif; }
        .mono-font { font-family: 'IBM Plex Mono', monospace; }

        .pp-wrap { max-width: 60rem; margin: 0 auto; padding: 0 1.5rem; }

        .pp-row { display: flex; flex-wrap: wrap; }
        .pp-row-center { display: flex; flex-wrap: wrap; align-items: center; }

        .pp-hero-inner { padding: 5rem 0 3.5rem; }
        .pp-eyebrow { font-size: 0.8rem; letter-spacing: 0.15em; }
        .pp-h1 { font-size: 2.6rem; line-height: 1.02; margin-top: 0.9rem; font-weight: 700; }
        .pp-meta { gap: 0.4rem 1.5rem; margin-top: 1.5rem; }
        .pp-meta-item { display: flex; align-items: center; gap: 0.3rem; font-size: 0.95rem; }
        .pp-lede { max-width: 34rem; margin-top: 1.4rem; font-size: 1rem; line-height: 1.6; }
        .pp-cta-row { gap: 0.75rem; margin-top: 2rem; }

        .btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.75rem 1.25rem; border-radius: 999px;
          font-weight: 600; font-size: 0.9rem; border: none; cursor: pointer;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .btn:hover { transform: translateY(-2px); opacity: 0.92; }
        .btn-primary { background: ${TOKENS.blue}; color: #fff; }
        .btn-outline { border: 1px solid ${TOKENS.slate}88; color: inherit; }

        .stat-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 0;
        }
        .stat-cell { padding: 2rem 0 2rem 0; }
        .stat-value { font-size: 2.1rem; font-weight: 700; }
        .stat-label { font-size: 0.72rem; letter-spacing: 0.06em; margin-top: 0.3rem; }

        .section { padding: 5rem 0; }
        .section-label { font-size: 0.8rem; letter-spacing: 0.12em; }
        .section-title { font-size: 1.9rem; margin-top: 0.5rem; font-weight: 700; }

        .about-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
        .about-quote { font-size: 1.35rem; line-height: 1.5; font-weight: 500; }

        .timeline { margin-top: 3rem; position: relative; }
        .exp-card {
          display: grid; grid-template-columns: 1fr; gap: 0.5rem;
          padding: 1.5rem 0; border-bottom: 1px solid ${TOKENS.slate}30;
          transition: transform 0.25s ease;
        }
        .exp-card:hover { transform: translateX(4px); }
        .exp-date { font-size: 0.78rem; color: ${TOKENS.slate}; padding-top: 0.2rem; }
        .exp-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.3rem 0.75rem; }
        .exp-role { font-size: 1.15rem; font-weight: 700; }
        .exp-org { font-size: 0.95rem; color: ${TOKENS.slate}; }
        .exp-badge {
          font-size: 0.65rem; background: ${TOKENS.coral}22; color: ${TOKENS.coral};
          padding: 0.15rem 0.5rem; border-radius: 999px; letter-spacing: 0.05em;
        }
        .exp-place { font-size: 0.85rem; color: ${TOKENS.slate}; margin-top: 0.3rem; }
        .exp-note { font-size: 0.92rem; line-height: 1.55; margin-top: 0.6rem; max-width: 38rem; }
        .exp-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem; }
        .exp-tag {
          font-size: 0.7rem; border: 1px solid ${TOKENS.slate}50; color: ${TOKENS.slate};
          padding: 0.25rem 0.6rem; border-radius: 999px;
        }

        .skills-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; margin-top: 2.5rem; }
        .skill-card { padding: 1.5rem; border-radius: 1rem; height: 100%; }
        .skill-head { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
        .skill-label { font-size: 0.75rem; letter-spacing: 0.08em; }
        .skill-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .tag-chip {
          font-size: 0.85rem; padding: 0.4rem 0.8rem; border-radius: 999px;
          background: #fff; box-shadow: 0 1px 2px rgba(20,22,31,0.1);
          transition: transform 0.2s ease;
        }
        .tag-chip:hover { transform: translateY(-2px); }

        .edu-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; margin-top: 2rem; }
        .edu-card { padding: 1.5rem; border-radius: 1rem; border: 1px solid ${TOKENS.slate}50; }
        .edu-row { display: flex; align-items: flex-start; gap: 0.75rem; }
        .edu-school { font-size: 1.1rem; font-weight: 700; }
        .edu-degree { font-size: 0.9rem; color: ${TOKENS.slateLight}; margin-top: 0.3rem; }
        .edu-period { font-size: 0.75rem; color: ${TOKENS.slateLight}; margin-top: 0.6rem; }

        .footer-title { font-size: 2rem; font-weight: 700; max-width: 26rem; line-height: 1.15; }
        .footer-cta { gap: 1rem; margin-top: 2rem; }
        .footer-note { font-size: 0.75rem; color: ${TOKENS.slate}; margin-top: 3rem; }

        @media (min-width: 768px) {
          .pp-h1 { font-size: 4.2rem; }
          .stat-grid { grid-template-columns: repeat(4, 1fr); }
          .about-grid { grid-template-columns: 140px 1fr; gap: 3rem; }
          .about-quote { font-size: 1.75rem; }
          .section-title { font-size: 2.4rem; }
          .exp-card { grid-template-columns: 7rem 1fr; gap: 1.5rem; }
          .skills-grid { grid-template-columns: repeat(3, 1fr); }
          .edu-grid { grid-template-columns: repeat(2, 1fr); }
          .footer-title { font-size: 2.8rem; }
        }

        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>

      <div className="pp">
        {/* HERO */}
        <header style={{ background: TOKENS.ink, color: TOKENS.paper }}>
          <div className="pp-wrap pp-hero-inner">
            <Reveal>
              <p className="mono-font pp-eyebrow" style={{ color: TOKENS.blue }}>
                CAMPAIGN REPORT · Q3 2026
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="display-font pp-h1">
                Puspa Mabo
                <br />
                Limbu
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <div className="pp-row-center pp-meta" style={{ color: TOKENS.slateLight }}>
                <span style={{ fontSize: "1.05rem" }}>Digital Marketing Executive</span>
                <span className="pp-meta-item">
                  <MapPin size={15} /> Kathmandu, Bāgmatī, Nepal
                </span>
              </div>
            </Reveal>
            <Reveal delay={220}>
              <p className="pp-lede" style={{ color: TOKENS.slateLight }}>
                Managing Meta &amp; Google Ads campaigns end to end — from audience
                strategy and content planning to copywriting and performance
                analysis — to grow brand visibility and hit business goals.
              </p>
            </Reveal>
            <Reveal delay={280}>
              <div className="pp-row pp-cta-row">
                <a href="#contact" className="btn btn-primary">
                  Get in touch <ArrowUpRight size={16} />
                </a>
                <a href="#experience" className="btn btn-outline" style={{ color: TOKENS.paper }}>
                  View experience
                </a>
              </div>
            </Reveal>
          </div>

          <Ticker />

          <div className="pp-wrap">
            <div className="stat-grid">
              {stats.map((s, i) => (
                <Reveal key={s.label} delay={100 * i}>
                  <div
                    className="stat-cell"
                    style={{
                      borderRight: i % 2 === 0 ? `1px solid ${TOKENS.slate}40` : "none",
                      paddingLeft: i % 2 !== 0 ? "1.25rem" : 0,
                    }}
                  >
                    <div className="display-font stat-value" style={{ color: TOKENS.paper }}>
                      {s.value}
                    </div>
                    <div className="mono-font stat-label" style={{ color: TOKENS.slateLight }}>
                      {s.label.toUpperCase()}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </header>

        {/* ABOUT */}
        <section className="pp-wrap section">
          <Reveal>
            <div className="about-grid">
              <p className="mono-font section-label" style={{ color: TOKENS.blue }}>
                ABOUT
              </p>
              <p className="display-font about-quote">
                "As a digital marketer, I specialize in managing social media
                platforms. With a keen understanding of audience demographics
                and industry trends, I consistently deliver impactful posts
                that drive engagement and increase brand visibility — from
                strategic content planning and copywriting to performance
                analysis that optimizes campaign effectiveness."
              </p>
            </div>
          </Reveal>
        </section>

        {/* EXPERIENCE */}
        <section id="experience" style={{ background: TOKENS.paperDim }} className="section">
          <div className="pp-wrap">
            <Reveal>
              <p className="mono-font section-label" style={{ color: TOKENS.blue }}>
                EXPERIENCE
              </p>
              <h2 className="display-font section-title">Campaign timeline</h2>
            </Reveal>

            <div className="timeline">
              {experience.map((job, i) => (
                <Reveal key={job.org} delay={i * 100}>
                  <div className="exp-card">
                    <div className="mono-font exp-date">
                      {job.start}
                      <br />
                      {job.end}
                    </div>
                    <div>
                      <div className="exp-head">
                        <h3 className="display-font exp-role">{job.role}</h3>
                        <span className="exp-org">{job.org}</span>
                        {job.current && (
                          <span className="mono-font exp-badge">CURRENT</span>
                        )}
                      </div>
                      <p className="exp-place">
                        {job.place} · {job.length}
                      </p>
                      {job.note && <p className="exp-note">{job.note}</p>}
                      <div className="exp-tags">
                        {job.tags.map((t) => (
                          <span key={t} className="mono-font exp-tag">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* SKILLS */}
        <section className="pp-wrap section">
          <Reveal>
            <p className="mono-font section-label" style={{ color: TOKENS.blue }}>
              SKILLS
            </p>
            <h2 className="display-font section-title">Targeting &amp; toolkit</h2>
          </Reveal>

          <div className="skills-grid">
            {skillGroups.map((group, gi) => {
              const Icon = group.icon;
              return (
                <Reveal key={group.label} delay={gi * 100}>
                  <div
                    className="skill-card"
                    style={{ background: TOKENS.paperDim, border: `1px solid ${group.color}30` }}
                  >
                    <div className="skill-head">
                      <Icon size={18} color={group.color} />
                      <span className="mono-font skill-label" style={{ color: group.color }}>
                        {group.label.toUpperCase()}
                      </span>
                    </div>
                    <div className="skill-tags">
                      {group.items.map((item) => (
                        <span key={item} className="tag-chip">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* EDUCATION */}
        <section style={{ background: TOKENS.ink, color: TOKENS.paper }} className="section">
          <div className="pp-wrap">
            <Reveal>
              <p className="mono-font section-label" style={{ color: TOKENS.blue }}>
                EDUCATION
              </p>
            </Reveal>
            <div className="edu-grid">
              {education.map((ed, i) => (
                <Reveal key={ed.school} delay={i * 100}>
                  <div className="edu-card">
                    <div className="edu-row">
                      <Layers size={18} color={TOKENS.green} style={{ marginTop: 3 }} />
                      <div>
                        <h3 className="display-font edu-school">{ed.school}</h3>
                        <p className="edu-degree">{ed.degree}</p>
                        <p className="mono-font edu-period">
                          {ed.period} · {ed.grade}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT / FOOTER */}
        <footer id="contact" className="pp-wrap section">
          <Reveal>
            <h2 className="display-font footer-title">Let&apos;s grow your next campaign.</h2>
            <div className="pp-row footer-cta">
              <a href="https://www.linkedin.com/" className="btn btn-primary">
                <Link2 size={16} /> Connect on LinkedIn
              </a>
              <a href="mailto:hello@example.com" className="btn btn-outline">
                <Mail size={16} /> Send an email
              </a>
            </div>
            <p className="mono-font footer-note">
              PUSPA MABO LIMBU © 2026 · KATHMANDU, NEPAL
            </p>
          </Reveal>
        </footer>
      </div>
    </div>
  );
}