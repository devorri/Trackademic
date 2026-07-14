import React from 'react'
import { useAuth } from '../../hooks/useAuth'

export const LandingNav: React.FC = () => {
  const { setIsLoginOpen } = useAuth()

  return (
    <nav className="landing-nav" aria-label="Landing page">
      <a className="brand-mark" href="#login-title" aria-label="Trackademic home">
        <img src="/trackademic-logo.jpg" alt="" />
        <span>Trackademic</span>
      </a>
      <a href="#features">Features</a>
      <button type="button" className="nav-login" onClick={() => setIsLoginOpen(true)}>
        Login
      </button>
    </nav>
  )
}
