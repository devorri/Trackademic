import React, { useState } from 'react'
import { Eye, EyeOff, X } from 'lucide-react'
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
            <p className="eyebrow">Secure Sign In</p>
            <h2 id="login-modal-title">Welcome Back</h2>
            <p>Sign in to access your dashboard</p>
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

          <button className="text-action" type="button" onClick={() => setResetNotice(`Password reset instructions queued for ${loginEmail}.`)}>
            Forgot password?
          </button>

          <div className="login-card-footer">
            Don't have an account?{' '}
            <button type="button" className="text-action" onClick={() => setResetNotice('Contact administrator to create an account.')}>Create one here</button>
          </div>
        </form>
      </div>
    </div>
  )
}
