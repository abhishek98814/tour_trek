import type { CSSProperties } from 'react';

export const badgeColors: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: '#fefce8', text: '#854d0e', dot: '#eab308' },
  confirmed: { bg: '#f0fdfa', text: '#0d9488', dot: '#14b8a6' },
  cancelled: { bg: '#fef2f2', text: '#dc2626', dot: '#ef4444' },
  completed: { bg: '#eff6ff', text: '#2563eb', dot: '#3b82f6' },
  refunded: { bg: '#f1f5f9', text: '#475569', dot: '#94a3b8' },
  unpaid: { bg: '#fef2f2', text: '#dc2626', dot: '#ef4444' },
  partial: { bg: '#fefce8', text: '#854d0e', dot: '#eab308' },
  paid: { bg: '#f0fdfa', text: '#0d9488', dot: '#14b8a6' },
};

export const colorFor = (key: string) => badgeColors[key] ?? badgeColors.pending;

export const primaryButton: CSSProperties = {
  display: 'inline-block',
  padding: '11px 22px',
  borderRadius: '12px',
  border: 'none',
  background: 'linear-gradient(135deg,#14b8a6,#0d9488)',
  color: '#fff',
  fontSize: '13px',
  fontWeight: 700,
  textDecoration: 'none',
  cursor: 'pointer',
};

export const darkButton: CSSProperties = {
  ...primaryButton,
  background: 'linear-gradient(135deg,#0f3d57,#0a2e45)',
};

export const softButton: CSSProperties = {
  ...primaryButton,
  background: '#f1f5f9',
  color: '#475569',
};

export const css = `
@keyframes bp-spin { to { transform: rotate(360deg); } }
@keyframes bp-rise { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none } }
@keyframes bp-drop { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: none } }
@keyframes bp-pulse { 0%,100% { opacity: 1 } 50% { opacity: .45 } }
@keyframes bp-toast { from { opacity: 0; transform: translate(-50%, 16px) } to { opacity: 1; transform: translate(-50%, 0) } }
@keyframes bp-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
.bp-card { animation: bp-rise .45s ease both; transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
.bp-card:hover { transform: translateY(-3px); box-shadow: 0 16px 36px rgba(10,46,69,.12); }
.bp-card.open { border-color: #99f6e4 !important; }
.bp-panel { animation: bp-drop .25s ease; }
.bp-btn { transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease, background .15s ease; }
.bp-btn:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(15,61,87,.2); }
.bp-tab { transition: all .15s ease; }
.bp-tab:hover { background: rgba(255,255,255,.24) !important; }
.bp-input:focus { outline: none; border-color: #14b8a6 !important; box-shadow: 0 0 0 4px rgba(20,184,166,.15); }
.bp-step:not(:disabled):hover { background: #ccfbf1 !important; }
.bp-skel { animation: bp-pulse 1.3s ease-in-out infinite; background: #e2e8f0; border-radius: 12px; }
.bp-stat { transition: transform .2s ease; }
.bp-stat:hover { transform: translateY(-4px); }
.bp-float { animation: bp-float 4s ease-in-out infinite; }
`;