import React from 'react'
import { Sparkles, Lightbulb } from 'lucide-react'

export const StudentPerformance: React.FC = () => {
  // As specified by user:
  // Performance History:
  // PRELIM: 78%
  // MIDTERM: 82%
  // CURRENT: 85%
  const prelimScore = 78
  const midtermScore = 82
  const currentScore = 85

  // Course comparisons
  const subjectProgress = [
    { subject: 'Database Management', previous: 78, current: 84, change: '+6%', status: 'Improved' },
    { subject: 'Networking', previous: 79, current: 82, change: '+3%', status: 'Improved' },
    { subject: 'Web Dev', previous: 88, current: 91, change: '+3%', status: 'Improved' },
    { subject: 'Introduction to Computing', previous: 82, current: 85, change: '+3%', status: 'Improved' },
    { subject: 'Data Structures', previous: 81, current: 84, change: '+3%', status: 'Improved' },
    { subject: 'Systems Analysis', previous: 80, current: 85, change: '+5%', status: 'Improved' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
      {/* Performance Insight Banner Requested by User */}
      <section
        style={{
          padding: '1.8rem 2rem',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#faf5ff',
              border: '1px solid #e9d5ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7c3aed',
            }}
          >
            <Sparkles size={20} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a', fontWeight: 800 }}>
            Performance Insight
          </h3>
        </div>

        <div style={{ margin: '1.2rem 0' }}>
          <p style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 700 }}>
            “Your performance in Database Management improved from{' '}
            <span style={{ color: '#dc2626', fontWeight: 800 }}>78%</span> to{' '}
            <span style={{ color: '#15803d', fontWeight: 800, fontSize: '1.3rem' }}>84%</span>.”
          </p>
        </div>

        <div
          style={{
            background: '#fefce8',
            border: '1px solid #fef08a',
            borderRadius: '12px',
            padding: '1rem 1.4rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.8rem',
          }}
        >
          <Lightbulb size={20} color="#ca8a04" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
          <div>
            <strong style={{ color: '#854d0e', fontSize: '0.9rem', display: 'block', marginBottom: '0.2rem' }}>
              Actionable Suggestion:
            </strong>
            <p style={{ margin: 0, fontSize: '0.92rem', color: '#713f12', lineHeight: 1.45, fontWeight: 500 }}>
              “Continue maintaining your performance and focus on subjects with lower grades.”
            </p>
          </div>
        </div>
      </section>

      {/* Performance History Section
          PRELIM     78%
          MIDTERM    82%
          CURRENT    85%
      */}
      <section
        style={{
          padding: '1.8rem 2rem',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#1d4ed8',
                background: '#eff6ff',
                border: '1px solid #dbeafe',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
              }}
            >
              Academic Trajectory
            </span>
            <h4 style={{ margin: '0.5rem 0 0.2rem 0', fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
              Performance History
            </h4>
            <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>
              Historical progression across examination periods
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.2rem',
            marginTop: '1.4rem',
          }}
        >
          {/* PRELIM 78% */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1.5rem',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              PRELIM
            </span>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.4rem' }}>
              {prelimScore}%
            </div>
            <small style={{ color: '#64748b', fontWeight: 500 }}>Baseline start grade</small>
          </div>

          {/* MIDTERM 82% */}
          <div
            style={{
              background: '#eff6ff',
              border: '1px solid #dbeafe',
              borderRadius: '14px',
              padding: '1.5rem',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>
              MIDTERM
            </span>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1d4ed8', marginTop: '0.4rem' }}>
              {midtermScore}%
            </div>
            <small style={{ color: '#2563eb', fontWeight: 600 }}>+4% period increase</small>
          </div>

          {/* CURRENT 85% */}
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '14px',
              padding: '1.5rem',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>
              CURRENT
            </span>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#15803d', marginTop: '0.4rem' }}>
              {currentScore}%
            </div>
            <small style={{ color: '#16a34a', fontWeight: 600 }}>+7% overall cumulative growth</small>
          </div>
        </div>
      </section>

      {/* Course-by-course Performance Progression */}
      <section
        style={{
          padding: '1.6rem 2rem',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
        }}
      >
        <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
          Course-by-Course Trajectory
        </h4>

        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <table style={{ margin: 0, width: '100%' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ color: '#0f172a', fontWeight: 700 }}>Subject</th>
                <th style={{ color: '#0f172a', fontWeight: 700 }}>Previous Mark</th>
                <th style={{ color: '#0f172a', fontWeight: 700 }}>Current Mark</th>
                <th style={{ color: '#0f172a', fontWeight: 700 }}>Change</th>
                <th style={{ color: '#0f172a', fontWeight: 700 }}>Trend</th>
              </tr>
            </thead>
            <tbody>
              {subjectProgress.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <strong style={{ color: '#0f172a' }}>{item.subject}</strong>
                  </td>
                  <td style={{ color: '#475569', fontWeight: 600 }}>{item.previous}%</td>
                  <td>
                    <strong style={{ color: '#15803d', fontWeight: 800 }}>{item.current}%</strong>
                  </td>
                  <td>
                    <span style={{ color: '#15803d', fontWeight: 800 }}>{item.change}</span>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: '#f0fdf4',
                        color: '#15803d',
                        border: '1px solid #bbf7d0',
                      }}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default StudentPerformance
