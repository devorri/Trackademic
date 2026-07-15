import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useData } from '../../context/DataContext'
import { landingFeatures } from '../../utils/constants'
import { LandingNav } from '../layout/LandingNav'
import { LoginModal } from '../auth/LoginModal'
import type { LucideIcon } from 'lucide-react'
import { ShieldCheck, BarChart3, FileText, Sparkles, Star, Circle } from 'lucide-react'

const workflowSteps = [
  'Email login',
  'Role dashboard',
  'Grade computation',
  'Predictive analytics',
  'Reports',
  'Logout',
]

const problemPills = [
  'Grades in Excel sheets',
  'Reminders in group chats',
  'Manual averaging',
  'Printed report cards',
  'Guesswork on who\u2019s falling behind',
]

// static bar heights (%) for the hero mockup's decorative chart — purely visual
const chartBars = [38, 62, 45, 80, 54, 70, 48, 90, 60]

type HighlightItem = {
  label: string
  value: string
  Icon: LucideIcon
}

const heroHighlights: HighlightItem[] = [
  { label: 'Secure access', value: 'Email-based role login', Icon: ShieldCheck },
  { label: 'Live grades', value: 'Auto-updating dashboards', Icon: BarChart3 },
  { label: 'Clear reports', value: 'Export-ready summaries', Icon: FileText },
]

const platformPillars = [
  {
    title: 'Fewer manual tasks',
    description: 'Reduce duplicate grading work with shared records and automatic grade computation.',
  },
  {
    title: 'Earlier intervention',
    description: 'Surface at-risk students sooner with clear predictive signals and alerts.',
  },
  {
    title: 'Better visibility',
    description: 'Give administrators, instructors, and students one place to track progress.',
  },
]

export const LandingPage: React.FC = () => {
  const { setIsLoginOpen } = useAuth()
  const { students, atRiskRows, averagePerformance } = useData()

  return (
    <div className="landing-page">
      <div className="landing-background-icons" aria-hidden="true">
        <span className="bg-icon bg-icon-1"><Sparkles size={20} /></span>
        <span className="bg-icon bg-icon-2"><Star size={24} /></span>
        <span className="bg-icon bg-icon-3"><Circle size={18} /></span>
        <span className="bg-icon bg-icon-4"><Sparkles size={28} /></span>
      </div>
      <LoginModal />
      <LandingNav />

      <section className="landing-hero" aria-labelledby="login-title">
        <div className="brand-panel">
          <p className="eyebrow">Sandigan Colleges, Inc.</p>
          <h1 id="login-title">
            Every class record, <span className="highlight">predicted</span> before it becomes a problem.
          </h1>
          <p>
            Trackademic helps administrators manage school data, instructors encode and compute grades, and students
            view their academic performance through secure role-based dashboards.
          </p>
          <div className="hero-actions">
            <button type="button" className="primary-link" onClick={() => setIsLoginOpen(true)}>
              Open login
            </button>
            <a className="secondary-link" href="#features">
              View system features
            </a>
          </div>
          <div className="hero-highlights" aria-label="Platform highlights">
            {heroHighlights.map((highlight) => (
              <div className="hero-highlight-card" key={highlight.label}>
                <div className="hero-highlight-top">
                  <span className="hero-highlight-icon" aria-hidden="true">
                    <highlight.Icon size={18} strokeWidth={2} />
                  </span>
                  <span className="hero-highlight-label">{highlight.label}</span>
                </div>
                <strong>{highlight.value}</strong>
              </div>
            ))}
          </div>
          <div className="hero-roles">
            <span className="hero-roles-label">Built for every role</span>
            <span>Admin</span>
            <span>Instructor</span>
            <span>Student</span>
          </div>
        </div>

        <div className="hero-preview" aria-label="System dashboard preview">
          <div className="hero-preview-bar">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
            <span className="url">trackademic.sandigan.edu.ph</span>
          </div>
          <div className="hero-preview-body">
            <div className="hero-preview-sidebar" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="hero-preview-main">
              <div className="hero-preview-grid">
                <div>
                  <span>Total Students</span>
                  <strong>{students.length}</strong>
                </div>
                <div className="flag">
                  <span>At-Risk Alerts</span>
                  <strong>{atRiskRows.length}</strong>
                </div>
                <div>
                  <span>Average Performance</span>
                  <strong>{averagePerformance}%</strong>
                </div>
                <div>
                  <span>Report Types</span>
                  <strong>4</strong>
                </div>
              </div>
              <div className="hero-preview-chart" aria-hidden="true">
                {chartBars.map((height, index) => (
                  <span key={index} style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="story-section" aria-labelledby="story-title">
        <div className="section-heading">
          <p className="eyebrow">Why it works</p>
          <h2 id="story-title">A calmer way to run school records from start to finish.</h2>
        </div>
        <div className="story-grid">
          {platformPillars.map((pillar) => (
            <article className="story-card" key={pillar.title}>
              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="problem-section" aria-labelledby="problem-title">
        <p className="eyebrow">The Problem</p>
        <h2 id="problem-title">Most class records still live across spreadsheets, chats, and memory.</h2>
        <p>
          Instructors compute grades by hand, chase missing scores over Messenger, and reprint report cards when a
          number changes. At-risk students often surface only after the term is already over.
        </p>
        <div className="problem-pills">
          {problemPills.map((pill) => (
            <span key={pill}>{pill}</span>
          ))}
        </div>
        <p className="problem-followup">
          <span className="muted-line">Hindi kulang ang dedikasyon ng guro.</span>
          <span className="accent-line">Kulang lang ng sistemang sasabay sa bilis ng grading.</span>
        </p>
      </section>

      <section id="features" className="feature-section">
        <div className="section-heading">
          <p className="eyebrow">System features</p>
          <h2>
            Built around the full <span>admin-to-student</span> workflow.
          </h2>
        </div>
        <div className="feature-grid">
          {landingFeatures.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <div className="feature-icon" aria-hidden="true">
                <feature.icon size={24} strokeWidth={2} />
              </div>
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
          {workflowSteps.map((step) => (
            <span className="workflow-pill" key={step}>
              {step}
            </span>
          ))}
        </div>
      </section>

      <section id="login" className="login-section login-section-compact">
        <div className="login-section-card">
          <p className="eyebrow">Ready to explore?</p>
          <h3>Open the sign-in window</h3>
          <p>Use the sign-in modal from the navigation bar for a cleaner, more presentable login flow.</p>
          <button type="button" className="primary-action" onClick={() => setIsLoginOpen(true)}>
            Open login window
          </button>
        </div>
      </section>
    </div>
  )
}
export default LandingPage