import type { ReactNode } from 'react';
import { colorFor, css } from './styles';

export function BookingStyles() {
  return <style>{css}</style>;
}

export function StatusBadge({ value }: { value: string }) {
  const c = colorFor(value);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 700,
        background: c.bg,
        color: c.text,
        textTransform: 'capitalize',
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot }} />
      {value}
    </span>
  );
}

export function InfoCell({
  icon,
  label,
  value,
  bold = false,
}: {
  icon: string;
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div>
      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: 600 }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: '14px', fontWeight: bold ? 800 : 600, color: '#0a2e45' }}>{value}</div>
    </div>
  );
}

export function FullScreen({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f4f7fa',
        padding: '24px',
      }}
    >
      {children}
    </div>
  );
}

export function MessageCard({
  icon,
  title,
  text,
  children,
}: {
  icon: string;
  title: string;
  text?: string;
  children?: ReactNode;
}) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '48px',
        background: '#fff',
        borderRadius: '24px',
        border: '1px solid #e8ecf0',
        boxShadow: '0 12px 40px rgba(10,46,69,.08)',
        maxWidth: '400px',
      }}
    >
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
      <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0a2e45', margin: '0 0 8px' }}>{title}</h2>
      {text && <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px' }}>{text}</p>}
      {children}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e8ecf0', padding: '24px' }}>
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
        <div className="bp-skel" style={{ width: 50, height: 50 }} />
        <div style={{ flex: 1 }}>
          <div className="bp-skel" style={{ height: 16, width: '40%', marginBottom: 8 }} />
          <div className="bp-skel" style={{ height: 12, width: '25%' }} />
        </div>
      </div>
      <div className="bp-skel" style={{ height: 70, marginTop: 20 }} />
      <div className="bp-skel" style={{ height: 36, width: '35%', marginTop: 18, marginLeft: 'auto' }} />
    </div>
  );
}

export function Toast({ message }: { message: string }) {
  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: '28px',
        transform: 'translateX(-50%)',
        animation: 'bp-toast .3s ease both',
        background: '#0a2e45',
        color: '#fff',
        padding: '14px 22px',
        borderRadius: '14px',
        fontSize: '14px',
        fontWeight: 600,
        boxShadow: '0 14px 40px rgba(0,0,0,.3)',
        zIndex: 2000,
      }}
    >
      ✅ {message}
    </div>
  );
}