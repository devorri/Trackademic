import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import { Activity, Search, User, Download } from 'lucide-react'
import { downloadFile } from '../../utils/helpers'

export const ActivityLogs: React.FC = () => {
  const { activityLogs } = useData()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedActor, setSelectedActor] = useState<string>('ALL')

  const uniqueActors = Array.from(new Set(activityLogs.map((log) => log.actor)))

  const filteredLogs = activityLogs.filter((log) => {
    if (selectedActor !== 'ALL' && log.actor !== selectedActor) return false

    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      return (
        log.actor.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.timeFormatted.toLowerCase().includes(q) ||
        (log.target && log.target.toLowerCase().includes(q))
      )
    }
    return true
  })

  function handleExportLogs() {
    const csvContent = [
      'Timestamp,Actor,Action,Target',
      ...activityLogs.map((l) => `"${l.timeFormatted}","${l.actor}","${l.action}","${l.target || ''}"`),
    ].join('\n')
    downloadFile('trackademic-activity-logs.csv', csvContent, 'text/csv')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)', borderRadius: '16px', padding: '1.4rem' }}>
          <span style={{ fontSize: '0.82rem', color: '#475569', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.03em' }}>Total Audit Logs</span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem', lineHeight: 1.1 }}>{activityLogs.length}</div>
          <small style={{ color: '#2563eb', fontWeight: 600, display: 'block', marginTop: '0.3rem' }}>All user and system activities</small>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)', borderRadius: '16px', padding: '1.4rem' }}>
          <span style={{ fontSize: '0.82rem', color: '#475569', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.03em' }}>Active Contributors</span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#16a34a', marginTop: '0.5rem', lineHeight: 1.1 }}>{uniqueActors.length}</div>
          <small style={{ color: '#15803d', fontWeight: 600, display: 'block', marginTop: '0.3rem' }}>Instructors & Administrators</small>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)', borderRadius: '16px', padding: '1.4rem' }}>
          <span style={{ fontSize: '0.82rem', color: '#475569', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.03em' }}>Logging Status</span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#7c3aed', marginTop: '0.5rem', lineHeight: 1.1 }}>Active</div>
          <small style={{ color: '#6d28d9', fontWeight: 600, display: 'block', marginTop: '0.3rem' }}>Real-time event capture</small>
        </div>
      </div>

      {/* Activity Logs Panel */}
      <section className="panel data-card" style={{ padding: '1.8rem' }}>
        <div className="card-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#0f172a' }}>
              <Activity size={22} color="#0284c7" /> System Activity Logs
            </h3>
            <span className="chip" style={{ marginTop: '0.3rem' }}>
              Chronological log of instructor updates, student additions, and grading actions
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <input
                placeholder="Search actor or action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.2rem', background: '#ffffff', color: '#0f172a', border: '1.5px solid #cbd5e1' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            </div>

            <select
              value={selectedActor}
              onChange={(e) => setSelectedActor(e.target.value)}
              style={{ padding: '0.65rem', borderRadius: '10px', background: '#ffffff', color: '#0f172a', border: '1.5px solid #cbd5e1', fontWeight: 500 }}
            >
              <option value="ALL">All Actors</option>
              {uniqueActors.map((actor) => (
                <option key={actor} value={actor}>
                  {actor}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="btn-primary"
              onClick={handleExportLogs}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.6rem 1rem', fontWeight: 700 }}
            >
              <Download size={15} /> Export CSV
            </button>
          </div>
        </div>

        {/* Activity Log Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1.4rem' }}>
          {filteredLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
              No activity logs match the search query.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.1rem 1.4rem',
                  borderRadius: '12px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)',
                  transition: 'background 0.2s ease',
                  flexWrap: 'wrap',
                  gap: '0.8rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0284c7',
                      flexShrink: 0,
                    }}
                  >
                    <User size={18} />
                  </div>

                  <div>
                    {/* Exact format requested by user: Kissy — Updated student grade — 10:35 AM */}
                    <div style={{ fontSize: '0.98rem' }}>
                      <strong style={{ color: '#1d4ed8', fontWeight: 700 }}>{log.actor}</strong>
                      <span style={{ color: '#94a3b8', margin: '0 0.5rem' }}>—</span>
                      <span style={{ color: '#0f172a', fontWeight: 600 }}>{log.action}</span>
                      <span style={{ color: '#94a3b8', margin: '0 0.5rem' }}>—</span>
                      <span style={{ color: '#2563eb', fontWeight: 700 }}>{log.timeFormatted}</span>
                    </div>

                    {log.target && (
                      <small style={{ color: '#64748b', display: 'block', marginTop: '0.2rem' }}>
                        Area: {log.target}
                      </small>
                    )}
                  </div>
                </div>

                <span className="chip" style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: 600 }}>
                  Recorded
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

export default ActivityLogs
