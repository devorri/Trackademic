import React, { useState } from 'react'
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

  return (
    <div
      className="login-modal-backdrop"
      onClick={() => setIsLoginOpen(false)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(5, 13, 26, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(8px)',
        padding: '20px',
      }}
    >
      <div
        className="login-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: '440px',
          width: '100%',
          margin: 'auto',
        }}
      >
        <form className="login-card" onSubmit={handleLogin}>
          <button
            type="button"
            className="login-modal-close"
            onClick={() => setIsLoginOpen(false)}
            aria-label="Close login"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '36px',
              height: '36px',
              border: 'none',
              borderRadius: '999px',
              background: '#f0f2f5',
              color: '#333',
              fontSize: '1.3rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              zIndex: 10,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e0e0e0'
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f0f2f5'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            ×
          </button>
          <div>
            <p
              className="eyebrow"
              style={{
                color: '#1A73E8',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                fontSize: '0.75rem',
                marginBottom: '4px',
              }}
            >
              Secure Sign In
            </p>
            <h2 id="login-modal-title" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0A1628', margin: '4px 0 8px' }}>
              Welcome Back
            </h2>
            <p style={{ color: '#6B7A8F', marginBottom: '24px', fontSize: '0.95rem' }}>
              Sign in to access your dashboard
            </p>
          </div>

          <label style={{ display: 'grid', gap: '8px', marginBottom: '16px', fontWeight: 600, fontSize: '0.9rem', color: '#0A1628' }}>
            Email
            <input
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
              placeholder="Enter your email"
              style={{
                width: '100%',
                minHeight: '48px',
                border: '2px solid rgba(0,0,0,0.08)',
                borderRadius: '12px',
                padding: '10px 16px',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                background: 'rgba(255,255,255,0.5)',
                backdropFilter: 'blur(4px)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#1A73E8'
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(26,115,232,0.08)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.8)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.background = 'rgba(255,255,255,0.5)'
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: '8px', marginBottom: '20px', fontWeight: 600, fontSize: '0.9rem', color: '#0A1628' }}>
            Password
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  minHeight: '48px',
                  border: '2px solid rgba(0,0,0,0.08)',
                  borderRadius: '12px',
                  padding: '10px 48px 10px 16px',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  background: 'rgba(255,255,255,0.5)',
                  backdropFilter: 'blur(4px)',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#1A73E8'
                  e.currentTarget.style.boxShadow = '0 0 0 4px rgba(26,115,232,0.08)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.8)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.5)'
                }}
              />
              <button
                type="button"
                id="toggle-password-visibility"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#6B7A8F',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#1A73E8' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7A8F' }}
              >
                {showPassword ? (
                  /* Eye-off icon */
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  /* Eye icon */
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </label>

          {loginError && (
            <p
              className="alert"
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(234,67,53,0.06)',
                border: '1px solid rgba(234,67,53,0.08)',
                color: '#B31412',
                fontWeight: 600,
                fontSize: '0.9rem',
                marginBottom: '16px',
              }}
            >
              {loginError}
            </p>
          )}

          {resetNotice && (
            <p
              className="success"
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(52,168,83,0.06)',
                border: '1px solid rgba(52,168,83,0.08)',
                color: '#1E7E34',
                fontWeight: 600,
                fontSize: '0.9rem',
                marginBottom: '16px',
              }}
            >
              {resetNotice}
            </p>
          )}

          <button
            className="primary-action"
            type="submit"
            style={{
              width: '100%',
              minHeight: '50px',
              background: 'linear-gradient(135deg, #1A73E8, #0D5BBF)',
              color: 'white',
              fontWeight: 700,
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              fontSize: '1rem',
              letterSpacing: '0.02em',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(26,115,232,0.2)',
              marginBottom: '12px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(26,115,232,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(26,115,232,0.2)'
            }}
          >
            Sign In
          </button>

          <button
            className="text-action"
            type="button"
            onClick={() => setResetNotice(`Password reset instructions queued for ${loginEmail}.`)}
            style={{
              background: 'transparent',
              color: '#1A73E8',
              border: 'none',
              padding: '8px 0',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none'
            }}
          >
            Forgot password?
          </button>

          <div
            style={{
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(0,0,0,0.06)',
              textAlign: 'center',
              fontSize: '0.9rem',
              color: '#6B7A8F',
            }}
          >
            Don't have an account?{' '}
            <button
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#1A73E8',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '4px 8px',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none'
              }}
              onClick={() => setResetNotice('Contact administrator to create an account.')}
            >
              Create one here
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
