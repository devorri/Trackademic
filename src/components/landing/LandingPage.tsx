import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useData } from '../../context/DataContext'
import { landingFeatures } from '../../utils/constants'
import { LandingNav } from '../layout/LandingNav'
import { LoginModal } from '../auth/LoginModal'

export const LandingPage: React.FC = () => {
  const { setIsLoginOpen } = useAuth()
  const { students, atRiskRows, averagePerformance } = useData()

  return (
    <div className="landing-page">
      <LoginModal />
      <LandingNav />

      <section className="landing-hero" aria-labelledby="login-title">
        <div className="brand-panel">
          <img className="hero-logo" src="/trackademic-logo.jpg" alt="Trackademic Web-Based Class Record System" />
          <p className="eyebrow">Sandigan Colleges, Inc.</p>
          <h1 id="login-title">Class records, predictions, and reports in one academic system.</h1>
          <p>
            Trackademic helps administrators manage school data, instructors encode and compute grades, and students
            view their academic performance through secure role-based dashboards.
          </p>
          <div className="hero-actions">
            <button type="button" className="primary-link" onClick={() => setIsLoginOpen(true)}>
              Open login
            </button>
            <a className="secondary-link" href="#features">View system features</a>
          </div>
        </div>

        <div className="hero-preview" aria-label="System highlights">
          <div><span>Total Students</span><strong>{students.length}</strong></div>
          <div><span>At-Risk Alerts</span><strong>{atRiskRows.length}</strong></div>
          <div><span>Average Performance</span><strong>{averagePerformance}%</strong></div>
          <div><span>Report Types</span><strong>4</strong></div>
        </div>
      </section>

      <section id="features" className="feature-section">
        <div className="section-heading">
          <p className="eyebrow">System features</p>
          <h2>Built around the full admin-to-student workflow.</h2>
        </div>
        <div className="feature-grid">
          {landingFeatures.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="workflow-section">
        <div className="section-heading">
          <p className="eyebrow">Workflow</p>
          <h2>Login, manage records, compute grades, predict results, generate reports.</h2>
        </div>
        <div className="workflow-list">
          {['Email login', 'Role dashboard', 'Grade computation', 'Predictive analytics', 'Reports', 'Logout'].map(
            (step) => (
              <span key={step}>{step}</span>
            ),
          )}
        </div>
      </section>

      <section id="login" className="login-section login-section-compact">
        <div className="login-section-card glass">
          <p className="eyebrow">Ready to explore?</p>
          <h3>Open the sign-in window</h3>
          <p>Use the polished modal experience from the navigation bar for a cleaner, more presentable login flow.</p>
          <button type="button" className="primary-action" onClick={() => setIsLoginOpen(true)}>
            Open login window
          </button>
        </div>
      </section>
    </div>
  )
}
export default LandingPage
