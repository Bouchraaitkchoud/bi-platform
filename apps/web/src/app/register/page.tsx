'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { authApi } from '@/lib/api-client';


export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { level: 0, label: 'None', color: '#d1d5db' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    
    const levels = [
      { level: 1, label: 'Weak', color: '#ef4444' },
      { level: 2, label: 'Fair', color: '#f97316' },
      { level: 3, label: 'Good', color: '#eab308' },
      { level: 4, label: 'Strong', color: '#22c55e' },
    ];
    return levels[Math.max(0, score - 1)] || { level: 0, label: 'Weak', color: '#ef4444' };
  };

  const passwordsMatch = password === confirmPassword && password.length > 0;
  const passwordStrength = getPasswordStrength(password);
  const isFormValid = fullName && email && passwordsMatch && password.length >= 8;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isFormValid) {
      setError('Please fill in all fields correctly');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.register({
        full_name: fullName,
        email,
        password,
      });

      if ((response as any)?.id || (response as any)?.email) {
        router.push('/login?registered=true');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)',
        display: 'flex',
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      {/* Left Side - Branding */}
      <div
        style={{
          width: '50%',
          background: 'linear-gradient(135deg, #2d8659 0%, #1f5c3d 100%)',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px',
          color: 'white',
          display: 'flex',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', margin: '0 0 16px 0' }}>📊 DataFlow BI</h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
            Transform data into actionable insights
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '400px' }}>
          {[
            { title: 'Fast Data Import', desc: 'Upload and process data instantly' },
            { title: 'Smart Dashboards', desc: 'Create visualizations without code' },
            { title: 'Real-time Collaboration', desc: 'Share insights with your team' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  backgroundColor: '#4ca569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '20px',
                }}
              >
                ✓
              </div>
              <div>
                <h3 style={{ fontWeight: '600', margin: '0 0 4px 0' }}>{item.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', margin: 0 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Form */}
      <div
        style={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>Create Account</h2>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 32px 0' }}>
            Join DataFlow BI to start analyzing your data
          </p>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div
                style={{
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'flex-start',
                }}
              >
                <AlertCircle size={20} style={{ color: '#dc2626', marginTop: '2px', flexShrink: 0 }} />
                <p style={{ color: '#991b1b', margin: 0, fontSize: '14px' }}>{error}</p>
              </div>
            )}

            {/* Full Name Input */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                Full Name
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  paddingLeft: '12px',
                  backgroundColor: 'white',
                }}
              >
                <input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    padding: '10px 12px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                Email
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  paddingLeft: '12px',
                  backgroundColor: 'white',
                }}
              >
                <Mail size={18} style={{ color: '#9ca3af' }} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    padding: '10px 12px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                Password
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  paddingLeft: '12px',
                  backgroundColor: 'white',
                }}
              >
                <Lock size={18} style={{ color: '#9ca3af' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    padding: '10px 12px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    paddingRight: '12px',
                    cursor: 'pointer',
                    color: '#9ca3af',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Password Strength */}
            {password && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ flex: 1, height: '4px', backgroundColor: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${passwordStrength.level * 25}%`,
                      backgroundColor: passwordStrength.color,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <span style={{ fontSize: '12px', color: passwordStrength.color, fontWeight: '500' }}>
                  {passwordStrength.label}
                </span>
              </div>
            )}

            {/* Confirm Password Input */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                Confirm Password
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: `1px solid ${passwordsMatch && password ? '#10b981' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  paddingLeft: '12px',
                  backgroundColor: 'white',
                }}
              >
                <Lock size={18} style={{ color: '#9ca3af' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    padding: '10px 12px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    paddingRight: '12px',
                    cursor: 'pointer',
                    color: '#9ca3af',
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword && (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                  {passwordsMatch ? (
                    <>
                      <CheckCircle size={16} style={{ color: '#10b981' }} />
                      <span style={{ color: '#059669' }}>Passwords match</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} style={{ color: '#ef4444' }} />
                      <span style={{ color: '#dc2626' }}>Passwords don't match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              style={{
                backgroundColor: isFormValid && !isLoading ? '#2d8659' : '#d1d5db',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isFormValid && !isLoading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                marginTop: '8px',
              }}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
              {!isLoading && <ArrowRight size={16} />}
            </button>

            {/* Login Link */}
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280', margin: '16px 0 0 0' }}>
              Already have an account?{' '}
              <a
                href="/login"
                style={{ color: '#2d8659', textDecoration: 'none', fontWeight: '600' }}
              >
                Sign in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
