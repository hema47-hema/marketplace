import React, { useState, useRef, useEffect } from 'react';
import { Mail, CheckCircle2, AlertCircle, RefreshCw, Sparkles, X } from 'lucide-react';
import { api } from '../api';
import { User } from '../types';

interface OTPVerifyModalProps {
  email: string;
  initialDevOtp?: string;
  onSuccess: (user: User, token: string) => void;
  onClose: () => void;
}

export const OTPVerifyModal: React.FC<OTPVerifyModalProps> = ({
  email,
  initialDevOtp,
  onSuccess,
  onClose
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(45);
  const [devOtp, setDevOtp] = useState<string | undefined>(initialDevOtp);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the first empty box on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Attempt to fetch dev OTP if not initially provided
  useEffect(() => {
    if (!devOtp && email) {
      api.getLatestOtp(email)
        .then((res) => setDevOtp(res.code))
        .catch(() => {});
    }
  }, [email, devOtp]);

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric single character
    const cleaned = value.replace(/[^0-9]/g, '');
    if (!cleaned) {
      const nextDigits = [...digits];
      nextDigits[index] = '';
      setDigits(nextDigits);
      return;
    }

    const nextDigits = [...digits];
    nextDigits[index] = cleaned[cleaned.length - 1]; // Take last character
    setDigits(nextDigits);
    setError(null);

    // Auto-advance focus to next input
    if (index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits entered
    const completeCode = nextDigits.join('');
    if (completeCode.length === 6) {
      submitCode(completeCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pastedData) return;

    const nextDigits = [...digits];
    for (let i = 0; i < pastedData.length; i++) {
      nextDigits[i] = pastedData[i];
    }
    setDigits(nextDigits);
    setError(null);

    // Focus last filled or next empty
    const nextFocus = Math.min(pastedData.length, 5);
    inputRefs.current[nextFocus]?.focus();

    if (pastedData.length === 6) {
      submitCode(pastedData);
    }
  };

  const submitCode = async (codeToSubmit?: string) => {
    const code = codeToSubmit || digits.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.verifyOtp(email, code);
      localStorage.setItem('nexus_token', response.access_token);
      onSuccess(response.user, response.access_token);
    } catch (err: any) {
      setError(err.message || 'Invalid verification code. Please check and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setIsLoading(true);
    try {
      const res = await api.resendOtp(email);
      setResendCooldown(60);
      if (res.dev_otp) {
        setDevOtp(res.dev_otp);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const autofillCode = (code: string) => {
    const chars = code.split('').slice(0, 6);
    const nextDigits = [...chars];
    while (nextDigits.length < 6) nextDigits.push('');
    setDigits(nextDigits);
    if (code.length === 6) {
      submitCode(code);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container" style={{ padding: '2rem', position: 'relative' }}>
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

        {/* Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1.5px solid rgba(99, 102, 241, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 0 24px rgba(99, 102, 241, 0.3)'
            }}
          >
            <Mail size={28} color="#818cf8" />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.4rem' }}>
            Verify Your Email
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            We've sent a 6-digit verification code to
          </p>
          <p style={{ color: '#818cf8', fontWeight: 600, fontSize: '0.95rem', marginTop: '0.2rem' }}>
            {email}
          </p>
        </div>

        {/* Dev helper notice for instant testing */}
        {devOtp && (
          <div
            style={{
              background: 'rgba(6, 182, 212, 0.12)',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.82rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8' }}>
              <Sparkles size={16} />
              <span>
                Dev Demo Helper: Code is <strong>{devOtp}</strong>
              </span>
            </div>
            <button
              onClick={() => autofillCode(devOtp)}
              style={{
                background: 'rgba(6, 182, 212, 0.25)',
                color: '#ffffff',
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              Autofill
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
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

        {/* 6-Digit Segmented Input Boxes */}
        <div className="otp-container" onPaste={handlePaste}>
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => { inputRefs.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className={`otp-box ${digit ? 'filled' : ''}`}
              disabled={isLoading}
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          className="btn-primary"
          style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
          onClick={() => submitCode()}
          disabled={isLoading || digits.join('').length !== 6}
        >
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw size={18} className="pulse-glow" />
              <span>Verifying Code...</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} />
              <span>Verify & Activate Account</span>
            </div>
          )}
        </button>

        {/* Resend Link */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Didn't receive the code?{' '}
          {resendCooldown > 0 ? (
            <span style={{ color: 'var(--text-muted)' }}>
              Resend code in <strong>00:{resendCooldown < 10 ? `0${resendCooldown}` : resendCooldown}</strong>
            </span>
          ) : (
            <button
              onClick={handleResend}
              style={{
                color: '#818cf8',
                fontWeight: 600,
                textDecoration: 'underline'
              }}
              disabled={isLoading}
            >
              Resend 6-Digit Code
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
