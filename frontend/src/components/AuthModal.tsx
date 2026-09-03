import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Briefcase, DollarSign, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../api';
import { User, UserRole } from '../types';

interface AuthModalProps {
  initialMode: 'login' | 'register';
  onSuccess: (user: User, token: string) => void;
  onNeedsVerification: (email: string, devOtp?: string) => void;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialMode,
  onSuccess,
  onNeedsVerification,
  onClose
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<UserRole>('client');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [skills, setSkills] = useState('');
  const [hourlyRate, setHourlyRate] = useState(65);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'register') {
        const res = await api.register({
          email,
          password,
          full_name: fullName,
          role,
          title: role === 'freelancer' ? title : 'Project Client',
          skills: role === 'freelancer' ? skills : '',
          hourly_rate: role === 'freelancer' ? hourlyRate : 0
        });

        // Trigger the 6-digit OTP verification modal view!
        onNeedsVerification(res.email, res.dev_otp);
      } else {
        const res = await api.login({ email, password });
        localStorage.setItem('nexus_token', res.access_token);
        onSuccess(res.user, res.access_token);
      }
    } catch (err: any) {
      // Check if error is unverified account
      if (err.message && err.message.includes('unverified')) {
        try {
          const otpRes = await api.resendOtp(email);
          onNeedsVerification(email, otpRes.dev_otp);
          return;
        } catch {}
      }
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container" style={{ position: 'relative', maxWidth: 500 }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            color: 'var(--text-muted)'
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            style={{
              flex: 1,
              padding: '1.25rem',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: mode === 'login' ? '#818cf8' : 'var(--text-muted)',
              borderBottom: mode === 'login' ? '2px solid #6366f1' : 'none',
              background: mode === 'login' ? 'rgba(99, 102, 241, 0.05)' : 'transparent'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            style={{
              flex: 1,
              padding: '1.25rem',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: mode === 'register' ? '#818cf8' : 'var(--text-muted)',
              borderBottom: mode === 'register' ? '2px solid #6366f1' : 'none',
              background: mode === 'register' ? 'rgba(99, 102, 241, 0.05)' : 'transparent'
            }}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                color: '#f87171',
                fontSize: '0.85rem'
              }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Role selector for registration */}
          {mode === 'register' && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div className="form-label" style={{ marginBottom: '0.5rem' }}>Select Your Account Role</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: role === 'client' ? '1.5px solid #6366f1' : '1px solid var(--border-subtle)',
                    background: role === 'client' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    textAlign: 'left',
                    color: '#ffffff'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Hire Talent</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Post projects & hire verified specialists
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('freelancer')}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: role === 'freelancer' ? '1.5px solid #10b981' : '1px solid var(--border-subtle)',
                    background: role === 'freelancer' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    textAlign: 'left',
                    color: '#ffffff'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Work as Talent</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Get AI-matched to clients & earn securely
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Full Name for register */}
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Hayes"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.4rem', width: '100%' }}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.4rem', width: '100%' }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.4rem', width: '100%' }}
              />
            </div>
          </div>

          {/* Additional Freelancer Fields */}
          {mode === 'register' && role === 'freelancer' && (
            <>
              <div className="form-group">
                <label className="form-label">Professional Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Full-Stack & AI Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Skills (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="React, FastAPI, Python, PostgreSQL, PyTorch"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Hourly Rate ($/hr)</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
                  <input
                    type="number"
                    min={15}
                    max={300}
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="form-input"
                    style={{ paddingLeft: '2.4rem', width: '100%' }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Processing...</span>
            ) : mode === 'register' ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={16} /> Continue & Send 6-Digit OTP
              </span>
            ) : (
              <span>Sign In to Marketplace</span>
            )}
          </button>

          {mode === 'register' && (
            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.8rem' }}>
              Upon submission, a 6-digit email verification code will be generated to activate your account.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
