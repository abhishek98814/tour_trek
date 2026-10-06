'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useLogin } from '@/hooks/useAuth';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending, isError } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(form);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #0f3d57 0%, #0a2e45 60%, #061e30 100%)',
    }}>

      {/* Left — Image side */}
      <div style={{
        flex: 1, display: 'none',
        position: 'relative', overflow: 'hidden',
      }} className="login-left">
        <img
          src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80"
          alt="Nepal Trek"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(10,46,69,0.3), rgba(10,46,69,0.7))',
        }} />
        <div style={{
          position: 'absolute', bottom: '60px', left: '48px', right: '48px',
        }}>
          <div style={{
            fontSize: '12px', fontWeight: 700, letterSpacing: '2px',
            textTransform: 'uppercase', color: '#14b8a6', marginBottom: '12px',
          }}>Trek Nepal</div>
          <h2 style={{
            fontSize: '36px', fontWeight: 800, color: '#fff',
            lineHeight: 1.2, margin: '0 0 12px', letterSpacing: '-1px',
          }}>
            Your next Himalayan<br />adventure awaits.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: 1.6 }}>
            Join thousands of trekkers exploring Nepal's most iconic routes.
          </p>
        </div>
      </div>

      {/* Right — Form side */}
      <div style={{
        width: '100%', maxWidth: '480px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 48px',
        background: '#fff',
        borderRadius: '0',
      }}>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #0f3d57, #14b8a6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px',
            }}>🏔️</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '18px', color: '#0a2e45' }}>Trek Nepal</div>
              <div style={{ fontSize: '10px', color: '#14b8a6', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                Explore · Book · Discover
              </div>
            </div>
          </div>
        </Link>

        {/* Heading */}
        <div style={{ width: '100%', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0a2e45', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Welcome back
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Error */}
        {isError && (
          <div style={{
            width: '100%', padding: '12px 16px',
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: '10px', marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <span style={{ fontSize: '16px' }}>⚠️</span>
            <p style={{ color: '#dc2626', fontSize: '13px', margin: 0, fontWeight: 500 }}>
              Invalid username or password. Please try again.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Username */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required
              style={{
                width: '100%', padding: '12px 14px',
                borderRadius: '10px', fontSize: '14px',
                border: '1.5px solid #e5e7eb',
                outline: 'none', boxSizing: 'border-box',
                transition: 'border 0.2s',
                color: '#0a2e45',
              }}
              onFocus={e => (e.target.style.border = '1.5px solid #14b8a6')}
              onBlur={e => (e.target.style.border = '1.5px solid #e5e7eb')}
            />
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                Password
              </label>
              <Link href="/auth/forgot-password" style={{ textDecoration: 'none' }}>
                <span style={{ fontSize: '12px', color: '#14b8a6', fontWeight: 500 }}>
                  Forgot password?
                </span>
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                style={{
                  width: '100%', padding: '12px 44px 12px 14px',
                  borderRadius: '10px', fontSize: '14px',
                  border: '1.5px solid #e5e7eb',
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border 0.2s',
                  color: '#0a2e45',
                }}
                onFocus={e => (e.target.style.border = '1.5px solid #14b8a6')}
                onBlur={e => (e.target.style.border = '1.5px solid #e5e7eb')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: '16px',
                  color: '#94a3b8',
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            style={{
              width: '100%', padding: '13px',
              borderRadius: '10px', border: 'none',
              background: isPending
                ? '#94a3b8'
                : 'linear-gradient(135deg, #0f3d57, #14b8a6)',
              color: '#fff', fontSize: '15px', fontWeight: 700,
              cursor: isPending ? 'not-allowed' : 'pointer',
              marginTop: '4px',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '8px',
            }}
          >
            {isPending ? (
              <>
                <div style={{
                  width: '16px', height: '16px', borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  animation: 'spin 0.7s linear infinite',
                }} />
                Signing in...
              </>
            ) : 'Sign In →'}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          width: '100%', display: 'flex', alignItems: 'center',
          gap: '12px', margin: '24px 0',
        }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
        </div>

        {/* Quick login for demo */}
        <div style={{
          width: '100%', padding: '16px',
          background: '#f0fdfa', borderRadius: '12px',
          border: '1px solid rgba(20,184,166,0.2)',
          marginBottom: '24px',
        }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#0d9488', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            🔑 Demo Credentials
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { label: 'Admin', username: 'admin', password: 'admin123' },
              { label: 'Guide', username: 'guide_ram', password: 'guide123' },
            ].map((cred) => (
              <button
                key={cred.label}
                onClick={() => setForm({ username: cred.username, password: cred.password })}
                style={{
                  padding: '6px 14px', borderRadius: '6px',
                  border: '1px solid rgba(20,184,166,0.3)',
                  background: '#fff', color: '#0d9488',
                  fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {cred.label}
              </button>
            ))}
          </div>
        </div>

        {/* Register link */}
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          Don't have an account?{' '}
          <Link href="/auth/register" style={{ textDecoration: 'none' }}>
            <span style={{ color: '#14b8a6', fontWeight: 700 }}>Create one free →</span>
          </Link>
        </p>

      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (min-width: 768px) {
          .login-left { display: block !important; }
        }
      `}</style>
    </div>
  );
}