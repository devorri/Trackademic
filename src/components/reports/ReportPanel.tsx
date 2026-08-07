import React, { useState } from 'react'
import { useReports } from '../../hooks/useReports'
import { useAuth } from '../../hooks/useAuth'
import type { ReportType } from '../../utils/types'
import { downloadFile } from '../../utils/helpers'
import { FileText, ClipboardList, BarChart3, Sparkles, FilePenLine, Printer, Download, Check } from 'lucide-react'

const reportTypesMeta: { type: ReportType; icon: React.ComponentType<any>; description: string }[] = [
  {
    type: 'Student Grade Report',
    icon: FileText,
    description: 'Individual student grades, GPA equivalents, and academic standing per class.',
  },
  {
    type: 'Class Record',
    icon: ClipboardList,
    description: 'Complete class record with all enrolled students, scores, and averages.',
  },
  {
    type: 'Academic Performance Report',
    icon: BarChart3,
    description: 'Overall academic performance analysis, trends, and class-wide statistics.',
  },
  {
    type: 'Prediction Report',
    icon: Sparkles,
    description: 'AI-driven prediction of student outcomes, risk factors, and recommendations.',
  },
]

export const ReportPanel: React.FC = () => {
  const { activeUser } = useAuth()
  const { reports, generateReport, printReport, reportText } = useReports()
  const [selectedType, setSelectedType] = useState<ReportType | null>(null)

  function handleGenerate() {
    if (!selectedType) {
      alert('Please select a report type first.')
      return
    }
    generateReport(selectedType, activeUser?.name ?? 'System')
  }

  function handleExportPDF() {
    if (!selectedType) {
      alert('Please select a report type first.')
      return
    }
    generateReport(selectedType, activeUser?.name ?? 'System')
    printReport()
  }

  function handleExportCSV() {
    if (!selectedType) {
      alert('Please select a report type first.')
      return
    }
    generateReport(selectedType, activeUser?.name ?? 'System')
    downloadFile('trackademic-report.csv', reportText(), 'text/csv')
  }

  return (
    <section className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="card-heading">
        <div>
          <h3>Reports</h3>
          <span className="chip">Select a report type, then generate or export</span>
        </div>
      </div>

      {/* Step 1: Select Report Type */}
      <div>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 0.8rem 0', fontWeight: 600 }}>
          Step 1 — Select Report Type
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {reportTypesMeta.map((item) => {
            const isSelected = selectedType === item.type
            const IconComp = item.icon
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => setSelectedType(item.type)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  padding: '1.1rem 1.2rem',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(139, 92, 246, 0.12))'
                    : 'rgba(255,255,255,0.03)',
                  border: isSelected
                    ? '2px solid #3b82f6'
                    : '1px solid rgba(255,255,255,0.08)',
                  color: '#f8fafc',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 0 16px rgba(59, 130, 246, 0.15)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <IconComp size={20} style={{ color: isSelected ? '#60a5fa' : '#64748b' }} />
                  <strong style={{ fontSize: '0.95rem' }}>{item.type}</strong>
                </div>
                <span style={{ fontSize: '0.78rem', color: isSelected ? '#93c5fd' : '#64748b', lineHeight: 1.4 }}>
                  {item.description}
                </span>
                {isSelected && (
                  <span
                    style={{
                      marginTop: '0.3rem',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#3b82f6',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <Check size={12} /> Selected
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Step 2: Actions */}
      <div>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 0.8rem 0', fontWeight: 600 }}>
          Step 2 — Generate or Export
          {selectedType && (
            <span style={{ color: '#60a5fa', marginLeft: '0.5rem', fontWeight: 400 }}>
              ({selectedType})
            </span>
          )}
        </p>
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={handleGenerate}
            disabled={!selectedType}
            style={{
              padding: '0.65rem 1.4rem',
              cursor: selectedType ? 'pointer' : 'not-allowed',
              opacity: selectedType ? 1 : 0.45,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <FilePenLine size={16} /> Generate Report
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={!selectedType}
            style={{
              padding: '0.65rem 1.4rem',
              cursor: selectedType ? 'pointer' : 'not-allowed',
              opacity: selectedType ? 1 : 0.45,
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.06)',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Printer size={16} /> View / Print PDF
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={!selectedType}
            style={{
              padding: '0.65rem 1.4rem',
              cursor: selectedType ? 'pointer' : 'not-allowed',
              opacity: selectedType ? 1 : 0.45,
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.06)',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Download size={16} /> Export Excel (CSV)
          </button>
        </div>
      </div>

      {/* Generated Reports History */}
      <div>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 0.8rem 0', fontWeight: 600 }}>
          Report History
        </p>
        <div className="report-list" style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
          {reports.length === 0 ? (
            <span style={{ color: '#64748b', fontSize: '0.88rem' }}>No reports generated yet. Select a report type above to get started.</span>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.7rem 0.8rem',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.03)',
                  marginBottom: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>{report.title}</strong>
                  <small style={{ color: '#64748b', fontSize: '0.75rem' }}>
                    {report.created_at} • by {report.generated_by}
                  </small>
                </div>
                <span className="chip" style={{ fontSize: '0.7rem', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                  {report.type}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

