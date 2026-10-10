import React, { useState } from 'react'
import { useReports } from '../../hooks/useReports'
import { useAuth } from '../../hooks/useAuth'
import type { ReportType } from '../../utils/types'
import { downloadFile } from '../../utils/helpers'
import {
  FileText,
  ClipboardList,
  BarChart3,
  Sparkles,
  FilePenLine,
  Printer,
  Download,
  Check,
  AlertTriangle,
  Users,
  Award,
} from 'lucide-react'

const reportTypesMeta: { type: ReportType; icon: React.ComponentType<any>; description: string }[] = [
  {
    type: 'Student Performance Report',
    icon: Award,
    description: 'Individual student performance metrics, preliminary-to-final growth, and subject-specific standing.',
  },
  {
    type: 'Class Performance Report',
    icon: BarChart3,
    description: 'Class-wide evaluation, grade averages, distribution curves, and cohort comparisons.',
  },
  {
    type: 'Instructor / Class Summary',
    icon: Users,
    description: 'Overview of assigned classes, teaching schedules, enrolled student counts, and completion status.',
  },
  {
    type: 'At-Risk Student Report',
    icon: AlertTriangle,
    description: 'Flagged watchlist of students at risk or failing, with identified weak areas and required final targets.',
  },
  {
    type: 'Grade Summary',
    icon: ClipboardList,
    description: 'Comprehensive tabulation of Prelim, Midterm, and Final weighted averages and GPA equivalents.',
  },
  {
    type: 'Predictive Analytics Report',
    icon: Sparkles,
    description: 'Predictive AI model analysis identifying high-performing, on-track, and at-risk students.',
  },
]

export const ReportPanel: React.FC = () => {
  const { activeUser } = useAuth()
  const { reports, generateReport, printReport, reportText } = useReports()
  const [selectedType, setSelectedType] = useState<ReportType | null>(null)
  const [formatNotice, setFormatNotice] = useState<string | null>(null)

  function handleGenerate() {
    if (!selectedType) {
      alert('Please select a report type first.')
      return
    }
    generateReport(selectedType, activeUser?.name ?? 'System')
    setFormatNotice(`Report "${selectedType}" successfully compiled and saved to history!`)
    setTimeout(() => setFormatNotice(null), 3500)
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
    downloadFile(
      `trackademic-${selectedType.toLowerCase().replace(/[\s/]+/g, '-')}.csv`,
      reportText(),
      'text/csv',
    )
  }

  return (
    <section
      className="panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.8rem',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
        borderRadius: '16px',
        padding: '2rem',
      }}
    >
      {/* Header */}
      <div className="card-heading" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1.2rem' }}>
        <div>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#0f172a', fontSize: '1.4rem', fontWeight: 800 }}>
            <FileText size={24} color="#2563eb" /> Academic Reports & Analytics Export
          </h3>
          <span className="chip" style={{ marginTop: '0.4rem', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>
            Select an official report type to generate, print, or download (PDF / Excel CSV)
          </span>
        </div>
      </div>

      {formatNotice && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1.5px solid #86efac',
            borderRadius: '12px',
            padding: '1rem 1.4rem',
            color: '#15803d',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontWeight: 600,
          }}
        >
          <Check size={18} /> {formatNotice}
        </div>
      )}

      {/* Step 1: Select Report Type */}
      <div>
        <p style={{ fontSize: '0.95rem', color: '#0f172a', margin: '0 0 0.9rem 0', fontWeight: 700 }}>
          Step 1 — Select Report Type
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
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
                  gap: '0.6rem',
                  padding: '1.3rem',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  background: isSelected ? '#eff6ff' : '#ffffff',
                  border: isSelected ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                  boxShadow: isSelected
                    ? '0 6px 20px rgba(37, 99, 235, 0.15)'
                    : '0 2px 8px rgba(15, 23, 42, 0.03)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: isSelected ? '#dbeafe' : '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isSelected ? '#1d4ed8' : '#2563eb',
                      flexShrink: 0,
                    }}
                  >
                    <IconComp size={20} />
                  </div>
                  <strong style={{ fontSize: '1rem', color: isSelected ? '#1d4ed8' : '#0f172a', fontWeight: 700 }}>
                    {item.type}
                  </strong>
                </div>
                <span style={{ fontSize: '0.85rem', color: isSelected ? '#1e40af' : '#475569', lineHeight: 1.5 }}>
                  {item.description}
                </span>
                {isSelected && (
                  <span
                    style={{
                      marginTop: '0.4rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#1d4ed8',
                      background: '#dbeafe',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      border: '1px solid #bfdbfe',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      display: 'inline-flex',
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
        <p style={{ fontSize: '0.95rem', color: '#0f172a', margin: '0 0 0.9rem 0', fontWeight: 700 }}>
          Step 2 — Generate, Print, or Download
          {selectedType && (
            <span style={{ color: '#2563eb', marginLeft: '0.5rem', fontWeight: 600 }}>
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
              padding: '0.75rem 1.5rem',
              cursor: selectedType ? 'pointer' : 'not-allowed',
              opacity: selectedType ? 1 : 0.5,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 700,
              fontSize: '0.95rem',
            }}
          >
            <FilePenLine size={18} /> Generate Report
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={!selectedType}
            style={{
              padding: '0.75rem 1.5rem',
              cursor: selectedType ? 'pointer' : 'not-allowed',
              opacity: selectedType ? 1 : 0.5,
              borderRadius: '10px',
              background: '#ffffff',
              color: '#0f172a',
              border: '1.5px solid #cbd5e1',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            <Printer size={18} color="#2563eb" /> View / Print PDF
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={!selectedType}
            style={{
              padding: '0.75rem 1.5rem',
              cursor: selectedType ? 'pointer' : 'not-allowed',
              opacity: selectedType ? 1 : 0.5,
              borderRadius: '10px',
              background: '#ffffff',
              color: '#0f172a',
              border: '1.5px solid #cbd5e1',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            <Download size={18} color="#16a34a" /> Download Report (Excel CSV)
          </button>
        </div>
      </div>

      {/* Generated Reports History */}
      <div>
        <p style={{ fontSize: '0.95rem', color: '#0f172a', margin: '0 0 0.9rem 0', fontWeight: 700 }}>
          Generated Reports History ({reports.length})
        </p>
        <div
          className="report-list"
          style={{
            background: '#f8fafc',
            borderRadius: '14px',
            padding: '1.2rem',
            border: '1px solid #e2e8f0',
          }}
        >
          {reports.length === 0 ? (
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
              No reports generated yet. Select a report type above to get started.
            </span>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem 1.2rem',
                  borderRadius: '12px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)',
                  marginBottom: '0.6rem',
                  flexWrap: 'wrap',
                  gap: '0.6rem',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <strong style={{ fontSize: '0.96rem', color: '#0f172a', fontWeight: 700 }}>{report.title}</strong>
                  <small style={{ color: '#64748b', fontSize: '0.8rem' }}>
                    {report.created_at} • Generated by <strong style={{ color: '#334155' }}>{report.generated_by}</strong>
                  </small>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className="chip" style={{ fontSize: '0.78rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #dbeafe', fontWeight: 600 }}>
                    {report.type}
                  </span>
                  <button
                    type="button"
                    onClick={printReport}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      color: '#2563eb',
                      cursor: 'pointer',
                      padding: '0.4rem 0.6rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Print"
                  >
                    <Printer size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

export default ReportPanel
