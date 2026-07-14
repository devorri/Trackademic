import React from 'react'
import { useReports } from '../../hooks/useReports'
import { useAuth } from '../../hooks/useAuth'
import type { ReportType } from '../../utils/types'
import { downloadFile } from '../../utils/helpers'

export const ReportPanel: React.FC = () => {
  const { activeUser } = useAuth()
  const { reports, generateReport, printReport, reportText } = useReports()

  const reportTypes: ReportType[] = [
    'Student Grade Report',
    'Class Record',
    'Academic Performance Report',
    'Prediction Report',
  ]

  return (
    <section className="panel">
      <div className="card-heading">
        <h3>Reports</h3>
        <div className="table-actions">
          <button type="button" onClick={printReport}>
            View / Print
          </button>
          <button type="button" onClick={printReport}>
            Export PDF
          </button>
          <button
            type="button"
            onClick={() => downloadFile('trackademic-report.csv', reportText(), 'text/csv')}
          >
            Export Excel
          </button>
        </div>
      </div>
      <div className="report-buttons">
        {reportTypes.map((type) => (
          <button
            type="button"
            key={type}
            onClick={() => generateReport(type, activeUser?.name ?? 'System')}
          >
            Generate {type}
          </button>
        ))}
      </div>
      <div className="report-list">
        {reports.length === 0 ? (
          <span>No reports generated yet.</span>
        ) : (
          reports.map((report) => (
            <span key={report.id}>
              {report.title}
              <small>
                {report.generatedAt} by {report.generatedBy}
              </small>
            </span>
          ))
        )}
      </div>
    </section>
  )
}
export default ReportPanel
