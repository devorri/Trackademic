import React, { useState } from 'react'
import { Eye, EyeOff, X, Shield, User, GraduationCap } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export const LoginModal: React.FC = () => {
  const {
    isLoginOpen,
    setIsLoginOpen,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    loginError,
    resetNotice,
    setResetNotice,
    handleLogin,
  } = useAuth()

  const [showPassword, setShowPassword] = useState(false)

  if (!isLoginOpen) return null

  function fillDemoAccount(email: string, pass: string = 'password123') {
    setLoginEmail(email)
    setLoginPassword(pass)
  }

  return (
    <div className="login-modal-backdrop" onClick={() => setIsLoginOpen(false)}>
      <div
        className="login-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <form className="login-card" onSubmit={handleLogin}>
          <button
            type="button"
            className="login-modal-close"
            onClick={() => setIsLoginOpen(false)}
            aria-label="Close login"
          >
            <X size={18} />
          </button>

          <div className="login-modal-header">
            <div className="login-modal-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
              <img
                src="/trackademic-logo.png"
                alt="Trackademic logo"
                style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 4px 12px rgba(26,115,232,0.15)' }}
              />
              <span style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#1a2332' }}>
                Track<span style={{ color: '#1a73e8' }}>ademic</span>
              </span>
            </div>
            <p className="eyebrow">Secure Sign In</p>
            <h2 id="login-modal-title">Welcome Back</h2>
            <p>Select a portal role or enter your credentials</p>
          </div>

          {/* Quick Demo Role Selector Pills */}
          <div style={{ marginBottom: '1.2rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
              Quick Demo Logins:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@example.com')}
                style={{
                  padding: '0.5rem 0.3rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: loginEmail === 'admin@example.com' ? 'rgba(59,130,246,0.15)' : '#f8fafc',
                  color: '#1e293b',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.2rem',
                }}
              >
                <Shield size={14} color="#3b82f6" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('kissy@gmail.com')}
                style={{
                  padding: '0.5rem 0.3rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: loginEmail === 'kissy@gmail.com' ? 'rgba(59,130,246,0.15)' : '#f8fafc',
                  color: '#1e293b',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.2rem',
                }}
              >
                <User size={14} color="#10b981" />
                <span>Instructor</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('student1@example.com')}
                style={{
                  padding: '0.5rem 0.3rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: loginEmail === 'student1@example.com' ? 'rgba(59,130,246,0.15)' : '#f8fafc',
                  color: '#1e293b',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.2rem',
                }}
              >
                <GraduationCap size={14} color="#8b5cf6" />
                <span>Student</span>
              </button>
            </div>
          </div>

          <label>
            Email
            <input
              type="email"
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
              placeholder="Enter your email"
              required
            />
          </label>

          <label>
            Password
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {loginError && <p className="alert">{loginError}</p>}
          {resetNotice && <p className="success">{resetNotice}</p>}

          <button className="primary-action" type="submit">
            Sign In
          </button>

          <button
            className="text-action"
            type="button"
            onClick={() => setResetNotice(`Password reset instructions queued for ${loginEmail}.`)}
          >
            Forgot password?
          </button>

          <div className="login-card-footer">
            Don't have an account?{' '}
            <button
              type="button"
              className="text-action"
              onClick={() => setResetNotice('Contact administrator to create an account.')}
            >
              Contact admin
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginModal
