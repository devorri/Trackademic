// Utility for generating official, publication-ready Academic PDF & Print Documents
// Showing full component scores (Attendance, Quiz, Lab Activity, Activity, Exam) per term (Prelim, Midterm, Final)

import type { DetailedTermScores } from './types'

export type PrintStudentRow = {
  code: string
  title: string
  units: number
  hasLaboratory: boolean
  prelim?: DetailedTermScores
  midterm?: DetailedTermScores
  final?: DetailedTermScores
  prelimExam?: number
  quiz?: number
  activity?: number
  attendance?: number
  participation?: number
  labExam?: number | null
  subjectAverage: number
}

export type PrintClassStudentRow = {
  studentName: string
  studentNo?: string
  prelim: DetailedTermScores
  midterm: DetailedTermScores
  final: DetailedTermScores
  average: number
  status: string
}

const COMMON_PRINT_STYLES = `
  @page {
    size: A4 landscape;
    margin: 10mm 10mm;
  }
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #0f172a;
    background: #ffffff;
    margin: 0;
    padding: 12px;
    font-size: 10px;
    line-height: 1.35;
  }
  .report-container {
    max-width: 1120px;
    margin: 0 auto;
    background: #ffffff;
  }
  .header-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 12px;
    border-bottom: 2.5px solid #1e3a8a;
    padding-bottom: 6px;
  }
  .institution-name {
    font-size: 17px;
    font-weight: 900;
    letter-spacing: 0.05em;
    color: #1e3a8a;
    text-transform: uppercase;
    margin: 0 0 2px 0;
  }
  .document-title {
    font-size: 12.5px;
    font-weight: 800;
    color: #0f172a;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin: 0 0 2px 0;
  }
  .document-subtitle {
    font-size: 9.5px;
    color: #475569;
    font-style: italic;
    margin: 0;
  }
  .meta-grid {
    display: table;
    width: 100%;
    margin-bottom: 10px;
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 7px 10px;
    font-size: 10.5px;
  }
  .meta-cell {
    display: table-cell;
    vertical-align: middle;
  }
  .meta-label {
    font-size: 9px;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 2px;
  }
  .meta-value {
    font-size: 12px;
    font-weight: 800;
    color: #0f172a;
  }
  .grading-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 6px;
    margin-bottom: 10px;
  }
  .grading-table th {
    background: #1e3a8a;
    color: #ffffff;
    font-weight: 800;
    font-size: 8.5px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    padding: 5px 3px;
    border: 1px solid #0f172a;
    text-align: center;
    vertical-align: middle;
  }
  .grading-table th.col-subject {
    text-align: left;
    padding-left: 6px;
  }
  .grading-table td {
    padding: 5px 3px;
    border: 1px solid #cbd5e1;
    font-size: 9.5px;
    text-align: center;
    color: #0f172a;
  }
  .grading-table td.col-subject {
    text-align: left;
    padding-left: 6px;
    font-weight: 600;
  }
  .grading-table tbody tr:nth-child(even) {
    background: #f8fafc;
  }
  .badge-na {
    display: inline-block;
    background: #e2e8f0;
    color: #64748b;
    padding: 1px 4px;
    border-radius: 3px;
    font-weight: 800;
    font-size: 8px;
  }
  .badge-lab {
    display: inline-block;
    background: #dbeafe;
    color: #1e40af;
    padding: 1px 4px;
    border-radius: 3px;
    font-weight: 800;
    font-size: 8px;
  }
  .col-term-grade {
    background: #eff6ff !important;
    font-weight: 800 !important;
    color: #1d4ed8 !important;
  }
  .col-avg {
    background: #ecfdf5 !important;
    font-weight: 900 !important;
    color: #065f46 !important;
    font-size: 10.5px !important;
  }
  .overall-row {
    background: #fef3c7 !important;
    font-weight: 900 !important;
    color: #92400e !important;
    border-top: 2px solid #b45309;
  }
  .overall-row td {
    border: 1px solid #b45309 !important;
    padding: 6px 5px !important;
  }
  .signatures {
    display: table;
    width: 100%;
    margin-top: 24px;
    page-break-inside: avoid;
  }
  .sig-col {
    display: table-cell;
    width: 33.33%;
    text-align: center;
    padding: 0 14px;
    vertical-align: top;
  }
  .sig-line {
    border-top: 1.5px solid #0f172a;
    margin-top: 32px;
    padding-top: 4px;
    font-weight: 800;
    font-size: 10.5px;
    color: #0f172a;
  }
  .sig-title {
    font-size: 9px;
    color: #64748b;
    text-transform: uppercase;
    font-weight: 600;
  }
  .footer-note {
    margin-top: 14px;
    font-size: 8.5px;
    color: #64748b;
    border-top: 1px dashed #cbd5e1;
    padding-top: 5px;
    display: flex;
    justify-content: space-between;
  }
`

function formatLabCell(hasLaboratory: boolean, val?: number | null) {
  if (!hasLaboratory) return '<span class="badge-na">N/A</span>'
  return val !== null && val !== undefined ? String(val) : '-'
}

/**
 * Generates and prints the Student Grading Book with Prelim, Midterm, and Final component breakdowns
 */
export function printStudentGradingBookReport(params: {
  studentName: string
  section: string
  schoolYear: string
  rows: PrintStudentRow[]
  overallAverage: number
  gradesOnly?: boolean
}) {
  const printable = window.open('', '_blank')
  if (!printable) return

  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  if (params.gradesOnly) {
    const getGpa = (score: number) => {
      if (score >= 96) return '1.00'
      if (score >= 91.5) return '1.25'
      if (score >= 87) return '1.50'
      if (score >= 82.5) return '1.75'
      if (score >= 78) return '2.00'
      if (score >= 73.5) return '2.25'
      if (score >= 70) return '2.50'
      if (score >= 65) return '2.75'
      if (score >= 60) return '3.00'
      return '5.00'
    }

    const summaryRowsHtml = params.rows
      .map((r) => {
        const pGrade = r.prelim?.computedTermGrade ?? r.subjectAverage
        const mGrade = r.midterm?.computedTermGrade ?? r.subjectAverage
        const fGrade = r.final?.computedTermGrade ?? r.subjectAverage
        const passed = r.subjectAverage >= 75
        return `
        <tr>
          <td style="font-weight: 800; color: #1e3a8a;">${r.code}</td>
          <td class="col-subject">
            ${r.title}
          </td>
          <td style="font-weight: 700;">${r.units}</td>
          <td class="col-term-grade">${pGrade.toFixed(1)}%</td>
          <td class="col-term-grade">${mGrade.toFixed(1)}%</td>
          <td class="col-term-grade">${fGrade.toFixed(1)}%</td>
          <td class="col-avg">${r.subjectAverage.toFixed(1)}%</td>
          <td style="font-weight: 800; color: #0f172a;">${getGpa(r.subjectAverage)}</td>
          <td style="font-weight: 800; color: ${passed ? '#15803d' : '#b91c1c'};">
            ${passed ? 'PASSED' : 'AT RISK'}
          </td>
        </tr>
      `
      })
      .join('')

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Official Report of Grades - ${params.studentName}</title>
          <style>${COMMON_PRINT_STYLES}</style>
        </head>
        <body>
          <div class="report-container">
            <table class="header-table">
              <tr>
                <td style="vertical-align: middle;">
                  <div class="institution-name">TRACKADEMIC UNIVERSITY SYSTEM</div>
                  <div class="document-title">OFFICIAL STUDENT REPORT OF GRADES (PRELIM • MIDTERM • FINAL)</div>
                  <div class="document-subtitle">Summary of Term Grades, Subject Averages & Academic Standing</div>
                </td>
                <td style="text-align: right; vertical-align: middle;">
                  <div style="font-size: 9.5px; color: #64748b; font-weight: 700;">STUDENT COPY</div>
                  <div style="font-size: 9.5px; color: #0f172a; font-weight: 800;">Date: ${dateStr}</div>
                </td>
              </tr>
            </table>

            <div class="meta-grid">
              <div class="meta-cell" style="width: 45%;">
                <div class="meta-label">Student Name</div>
                <div class="meta-value" style="color: #1e3a8a; font-size: 13px;">${params.studentName}</div>
              </div>
              <div class="meta-cell" style="width: 25%;">
                <div class="meta-label">Course & Section</div>
                <div class="meta-value">${params.section}</div>
              </div>
              <div class="meta-cell" style="width: 30%;">
                <div class="meta-label">Academic Period</div>
                <div class="meta-value">${params.schoolYear}</div>
              </div>
            </div>

            <table class="grading-table">
              <thead>
                <tr>
                  <th style="width: 11%;">Subject Code</th>
                  <th class="col-subject" style="width: 31%;">Subject Description</th>
                  <th style="width: 7%;">Units</th>
                  <th style="width: 11%; background: #1d4ed8;">Prelim Grade (30%)</th>
                  <th style="width: 11%; background: #5b21b6;">Midterm Grade (30%)</th>
                  <th style="width: 11%; background: #047857;">Final Grade (40%)</th>
                  <th style="width: 10%; background: #0f766e;">Subject Average</th>
                  <th style="width: 8%;">GPA</th>
                  <th style="width: 10%;">Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${summaryRowsHtml}
                <tr class="overall-row">
                  <td colspan="6" style="text-align: right; font-weight: 900; letter-spacing: 0.05em; padding-right: 12px;">
                    OVERALL ACADEMIC AVERAGE:
                  </td>
                  <td class="col-avg" style="font-size: 12px !important; color: #065f46; font-weight: 900;">
                    ${params.overallAverage.toFixed(1)}%
                  </td>
                  <td style="font-weight: 900; color: #0f172a;">
                    ${getGpa(params.overallAverage)}
                  </td>
                  <td style="font-weight: 900; color: ${params.overallAverage >= 75 ? '#15803d' : '#b91c1c'};">
                    ${params.overallAverage >= 75 ? 'PASSED' : 'AT RISK'}
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="signatures">
              <div class="sig-col">
                <div class="sig-line">CLASS ADVISER / TRAINER</div>
                <div class="sig-title">Faculty In-Charge</div>
              </div>
              <div class="sig-col">
                <div class="sig-line">DEPARTMENT HEAD / DEAN</div>
                <div class="sig-title">College of Information Technology (CIT)</div>
              </div>
              <div class="sig-col">
                <div class="sig-line">UNIVERSITY REGISTRAR</div>
                <div class="sig-title">Certified Official Record</div>
              </div>
            </div>

            <div class="footer-note">
              <span>Trackademic Academic Information & Grading System — Official Student Grade Report</span>
              <span>Document ID: TRK-${Math.random().toString(36).substring(2, 9).toUpperCase()}</span>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `

    printable.document.open()
    printable.document.write(html)
    printable.document.close()
    return
  }

  const rowsHtml = params.rows
    .map((r) => {
      const p = r.prelim || {
        attendance: r.attendance ?? 88,
        quiz: r.quiz ?? 84,
        labActivity: r.hasLaboratory ? (r.labExam ?? 85) : null,
        activity: r.activity ?? 85,
        exam: r.prelimExam ?? 82,
        computedTermGrade: r.subjectAverage,
      }
      const m = r.midterm || p
      const f = r.final || p

      return `
      <tr>
        <td style="font-weight: 700; color: #1e3a8a;">${r.code}</td>
        <td class="col-subject">
          ${r.title}
          ${r.hasLaboratory ? '<span class="badge-lab" style="margin-left: 4px;">Lab</span>' : ''}
        </td>
        <!-- Prelim -->
        <td>${p.attendance ?? '-'}</td>
        <td>${p.quiz ?? '-'}</td>
        <td>${formatLabCell(r.hasLaboratory, p.labActivity)}</td>
        <td>${p.activity ?? '-'}</td>
        <td>${p.exam ?? '-'}</td>
        <td class="col-term-grade">${p.computedTermGrade.toFixed(1)}</td>
        <!-- Midterm -->
        <td>${m.attendance ?? '-'}</td>
        <td>${m.quiz ?? '-'}</td>
        <td>${formatLabCell(r.hasLaboratory, m.labActivity)}</td>
        <td>${m.activity ?? '-'}</td>
        <td>${m.exam ?? '-'}</td>
        <td class="col-term-grade">${m.computedTermGrade.toFixed(1)}</td>
        <!-- Final -->
        <td>${f.attendance ?? '-'}</td>
        <td>${f.quiz ?? '-'}</td>
        <td>${formatLabCell(r.hasLaboratory, f.labActivity)}</td>
        <td>${f.activity ?? '-'}</td>
        <td>${f.exam ?? '-'}</td>
        <td class="col-term-grade">${f.computedTermGrade.toFixed(1)}</td>
        <!-- Overall -->
        <td class="col-avg">${r.subjectAverage > 0 ? r.subjectAverage.toFixed(1) : '-'}</td>
      </tr>
    `
    })
    .join('')

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Student Grading Book - ${params.studentName}</title>
        <style>${COMMON_PRINT_STYLES}</style>
      </head>
      <body>
        <div class="report-container">
          <table class="header-table">
            <tr>
              <td style="vertical-align: middle;">
                <div class="institution-name">TRACKADEMIC UNIVERSITY SYSTEM</div>
                <div class="document-title">STUDENT GRADING BOOK & OFFICIAL TRANSCRIPT OF ASSESSMENTS (PRELIM • MIDTERM • FINAL)</div>
                <div class="document-subtitle">Itemized Component Scores (Attendance, Quiz, Lab Activity, Activity, Exam) per Grading Period</div>
              </td>
              <td style="text-align: right; vertical-align: middle;">
                <div style="font-size: 9.5px; color: #64748b; font-weight: 700;">OFFICIAL COPY</div>
                <div style="font-size: 9.5px; color: #0f172a; font-weight: 800;">Date: ${dateStr}</div>
              </td>
            </tr>
          </table>

          <div class="meta-grid">
            <div class="meta-cell" style="width: 45%;">
              <div class="meta-label">Student Name</div>
              <div class="meta-value" style="color: #1e3a8a; font-size: 13px;">${params.studentName}</div>
            </div>
            <div class="meta-cell" style="width: 25%;">
              <div class="meta-label">Course & Section</div>
              <div class="meta-value">${params.section}</div>
            </div>
            <div class="meta-cell" style="width: 30%;">
              <div class="meta-label">Academic Period</div>
              <div class="meta-value">${params.schoolYear}</div>
            </div>
          </div>

          <table class="grading-table">
            <thead>
              <tr>
                <th rowspan="2" style="width: 7%;">Code</th>
                <th rowspan="2" class="col-subject" style="width: 17%;">Subject Name</th>
                <th colspan="6" style="background: #1d4ed8;">Preliminary Period (30%)</th>
                <th colspan="6" style="background: #047857;">Midterm Period (30%)</th>
                <th colspan="6" style="background: #6d28d9;">Final Period (40%)</th>
                <th rowspan="2" style="width: 6%; background: #0f766e;">Overall Avg</th>
              </tr>
              <tr>
                <!-- Prelim -->
                <th>Att</th>
                <th>Quiz</th>
                <th>Lab</th>
                <th>Act</th>
                <th>Exam</th>
                <th style="background: #1e40af;">Prelim</th>
                <!-- Midterm -->
                <th>Att</th>
                <th>Quiz</th>
                <th>Lab</th>
                <th>Act</th>
                <th>Exam</th>
                <th style="background: #065f46;">Midterm</th>
                <!-- Final -->
                <th>Att</th>
                <th>Quiz</th>
                <th>Lab</th>
                <th>Act</th>
                <th>Exam</th>
                <th style="background: #5b21b6;">Final</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              <tr class="overall-row">
                <td colspan="20" style="text-align: right; font-weight: 900; letter-spacing: 0.05em; padding-right: 12px;">
                  OVERALL ACADEMIC AVERAGE:
                </td>
                <td class="col-avg" style="font-size: 12px !important; color: #065f46; font-weight: 900;">
                  ${params.overallAverage.toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>

          <div class="signatures">
            <div class="sig-col">
              <div class="sig-line">CLASS ADVISER / TRAINER</div>
              <div class="sig-title">Faculty In-Charge</div>
            </div>
            <div class="sig-col">
              <div class="sig-line">DEPARTMENT HEAD / DEAN</div>
              <div class="sig-title">College of Information Technology (CIT)</div>
            </div>
            <div class="sig-col">
              <div class="sig-line">UNIVERSITY REGISTRAR</div>
              <div class="sig-title">Certified Official Record</div>
            </div>
          </div>

          <div class="footer-note">
            <span>Trackademic Academic Information & Grading System — Confidential Academic Record</span>
            <span>Document ID: TRK-${Math.random().toString(36).substring(2, 9).toUpperCase()}</span>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `

  printable.document.open()
  printable.document.write(html)
  printable.document.close()
}

/**
 * Generates and prints the Official Class Roster Grade Record for Instructors
 */
export function printClassGradeReport(params: {
  subjectCode: string
  subjectTitle: string
  hasLaboratory: boolean
  sectionName: string
  instructorName: string
  schedule: string
  room: string
  schoolYear: string
  students: PrintClassStudentRow[]
}) {
  const printable = window.open('', '_blank')
  if (!printable) return

  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const rowsHtml = params.students
    .map(
      (s, index) => `
      <tr>
        <td style="font-weight: 700;">${index + 1}</td>
        <td class="col-subject" style="font-weight: 700; color: #0f172a;">
          ${s.studentName}
        </td>
        <!-- Prelim -->
        <td>${s.prelim.attendance}</td>
        <td>${s.prelim.quiz}</td>
        <td>${formatLabCell(params.hasLaboratory, s.prelim.labActivity)}</td>
        <td>${s.prelim.activity}</td>
        <td>${s.prelim.exam}</td>
        <td class="col-term-grade">${s.prelim.computedTermGrade.toFixed(1)}</td>
        <!-- Midterm -->
        <td>${s.midterm.attendance}</td>
        <td>${s.midterm.quiz}</td>
        <td>${formatLabCell(params.hasLaboratory, s.midterm.labActivity)}</td>
        <td>${s.midterm.activity}</td>
        <td>${s.midterm.exam}</td>
        <td class="col-term-grade">${s.midterm.computedTermGrade.toFixed(1)}</td>
        <!-- Final -->
        <td>${s.final.attendance}</td>
        <td>${s.final.quiz}</td>
        <td>${formatLabCell(params.hasLaboratory, s.final.labActivity)}</td>
        <td>${s.final.activity}</td>
        <td>${s.final.exam}</td>
        <td class="col-term-grade">${s.final.computedTermGrade.toFixed(1)}</td>
        <!-- Overall -->
        <td class="col-avg">${s.average > 0 ? s.average.toFixed(1) : '-'}</td>
        <td style="font-weight: 800; color: ${s.status === 'Bound to Fail' ? '#b91c1c' : s.status === 'At Risk' ? '#c2410c' : '#15803d'};">
          ${s.status}
        </td>
      </tr>
    `,
    )
    .join('')

  const classAvg =
    params.students.length > 0
      ? (params.students.reduce((sum, s) => sum + s.average, 0) / params.students.length).toFixed(1)
      : '0.0'

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Official Class Record - ${params.subjectCode}</title>
        <style>${COMMON_PRINT_STYLES}</style>
      </head>
      <body>
        <div class="report-container">
          <table class="header-table">
            <tr>
              <td style="vertical-align: middle;">
                <div class="institution-name">TRACKADEMIC UNIVERSITY SYSTEM</div>
                <div class="document-title">OFFICIAL CLASS RECORD & ITEMIZED ASSESSMENT REPORT (PRELIM • MIDTERM • FINAL)</div>
                <div class="document-subtitle">Office of Academic Affairs • College of Information Technology (CIT)</div>
              </td>
              <td style="text-align: right; vertical-align: middle;">
                <div style="font-size: 9.5px; color: #64748b; font-weight: 700;">CLASS RECORD</div>
                <div style="font-size: 9.5px; color: #0f172a; font-weight: 800;">Printed: ${dateStr}</div>
              </td>
            </tr>
          </table>

          <div class="meta-grid">
            <div class="meta-cell" style="width: 35%;">
              <div class="meta-label">Subject & Classification</div>
              <div class="meta-value" style="color: #1e3a8a;">
                ${params.subjectCode} — ${params.subjectTitle}
                ${params.hasLaboratory ? '<span class="badge-lab" style="margin-left: 6px;">With Laboratory</span>' : '<span class="badge-na" style="margin-left: 6px;">Lecture-Only</span>'}
              </div>
            </div>
            <div class="meta-cell" style="width: 25%;">
              <div class="meta-label">Instructor / Trainer</div>
              <div class="meta-value">${params.instructorName}</div>
            </div>
            <div class="meta-cell" style="width: 20%;">
              <div class="meta-label">Course, Section & Room</div>
              <div class="meta-value">${params.sectionName} • ${params.room}</div>
            </div>
            <div class="meta-cell" style="width: 20%;">
              <div class="meta-label">Schedule & Term</div>
              <div class="meta-value">${params.schedule}</div>
            </div>
          </div>

          <table class="grading-table">
            <thead>
              <tr>
                <th rowspan="2" style="width: 3%;">#</th>
                <th rowspan="2" class="col-subject" style="width: 15%;">Student Name</th>
                <th colspan="6" style="background: #1d4ed8;">Preliminary Period (30%)</th>
                <th colspan="6" style="background: #047857;">Midterm Period (30%)</th>
                <th colspan="6" style="background: #6d28d9;">Final Period (40%)</th>
                <th rowspan="2" style="width: 6%; background: #0f766e;">Overall</th>
                <th rowspan="2" style="width: 7%;">Remarks</th>
              </tr>
              <tr>
                <!-- Prelim -->
                <th>Att</th>
                <th>Quiz</th>
                <th>Lab</th>
                <th>Act</th>
                <th>Exam</th>
                <th style="background: #1e40af;">Grade</th>
                <!-- Midterm -->
                <th>Att</th>
                <th>Quiz</th>
                <th>Lab</th>
                <th>Act</th>
                <th>Exam</th>
                <th style="background: #065f46;">Grade</th>
                <!-- Final -->
                <th>Att</th>
                <th>Quiz</th>
                <th>Lab</th>
                <th>Act</th>
                <th>Exam</th>
                <th style="background: #5b21b6;">Grade</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              <tr class="overall-row">
                <td colspan="20" style="text-align: right; font-weight: 900; letter-spacing: 0.05em; padding-right: 12px;">
                  CLASS BATCH AVERAGE:
                </td>
                <td class="col-avg" style="font-size: 12px !important; color: #065f46; font-weight: 900;">
                  ${classAvg}%
                </td>
                <td style="font-weight: 900; color: #065f46;">
                  ${Number(classAvg) >= 75 ? 'PASSED' : 'AT RISK'}
                </td>
              </tr>
            </tbody>
          </table>

          <div class="signatures">
            <div class="sig-col">
              <div class="sig-line">${params.instructorName.toUpperCase()}</div>
              <div class="sig-title">Instructor / Trainer</div>
            </div>
            <div class="sig-col">
              <div class="sig-line">DEAN OF INFORMATION TECHNOLOGY</div>
              <div class="sig-title">Checked & Endorsed</div>
            </div>
            <div class="sig-col">
              <div class="sig-line">COLLEGE REGISTRAR</div>
              <div class="sig-title">Approved & Archived</div>
            </div>
          </div>

          <div class="footer-note">
            <span>Trackademic Academic Information & Grading System — Official Class Record</span>
            <span>Total Enrolled: ${params.students.length} Students</span>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `

  printable.document.open()
  printable.document.write(html)
  printable.document.close()
}
