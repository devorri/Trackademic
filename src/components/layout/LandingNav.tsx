import React from 'react'
import { useAuth } from '../../hooks/useAuth'

export const LandingNav: React.FC = () => {
  const { setIsLoginOpen } = useAuth()

  return (
    <nav className="landing-nav" aria-label="Landing page">
      <a className="brand-mark" href="#login-title" aria-label="Trackademic home">
        <img src="/trackademic-logo.png" alt="Trackademic logo" />
        <span className="brand-name">
          <span className="brand-name-strong">Track</span>
          <span className="brand-name-blue">ademic</span>
        </span>
      </a>
      <a href="#features">Features</a>
      <button type="button" className="nav-login" onClick={() => setIsLoginOpen(true)}>
        Login
      </button>
    </nav>
  )
}
