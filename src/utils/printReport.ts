// Utility for generating official, publication-ready Academic PDF & Print Documents
// Aligned 100% with Grading_Book_Template (1).xlsx

export type PrintStudentRow = {
  code: string
  title: string
  units: number
  hasLaboratory: boolean
  prelimExam: number
  quiz: number
  activity: number
  attendance: number
  participation: number
  labExam: number | null // null indicates N/A
  midterm: number
  final: number
  subjectAverage: number
}

export type PrintClassStudentRow = {
  studentName: string
  studentNo?: string
  prelimExam: number
  quiz: number
  activity: number
  attendance: number
  participation: number
  labExam?: number | null
  midterm: number
  final: number
  average: number
  status: string
}

const COMMON_PRINT_STYLES = `
  @page {
    size: A4 landscape;
    margin: 12mm 15mm;
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
    padding: 16px;
    font-size: 11.5px;
    line-height: 1.4;
  }
  .report-container {
    max-width: 1060px;
    margin: 0 auto;
    background: #ffffff;
  }
  .header-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 14px;
    border-bottom: 2.5px solid #1e3a8a;
    padding-bottom: 8px;
  }
  .institution-name {
    font-size: 18px;
    font-weight: 900;
    letter-spacing: 0.05em;
    color: #1e3a8a;
    text-transform: uppercase;
    margin: 0 0 2px 0;
  }
  .document-title {
    font-size: 13px;
    font-weight: 800;
    color: #0f172a;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0 0 2px 0;
  }
  .document-subtitle {
    font-size: 10px;
    color: #475569;
    font-style: italic;
    margin: 0;
  }
  .meta-grid {
    display: table;
    width: 100%;
    margin-bottom: 12px;
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 11px;
  }
  .meta-cell {
    display: table-cell;
    vertical-align: middle;
  }
  .meta-label {
    font-size: 9.5px;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 2px;
  }
  .meta-value {
    font-size: 12.5px;
    font-weight: 800;
    color: #0f172a;
  }
  .grading-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
    margin-bottom: 12px;
  }
  .grading-table th {
    background: #1e3a8a;
    color: #ffffff;
    font-weight: 800;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 7px 5px;
    border: 1px solid #0f172a;
    text-align: center;
    vertical-align: middle;
  }
  .grading-table th.col-subject {
    text-align: left;
    padding-left: 8px;
  }
  .grading-table td {
    padding: 6px 5px;
    border: 1px solid #cbd5e1;
    font-size: 11px;
    text-align: center;
    color: #0f172a;
  }
  .grading-table td.col-subject {
    text-align: left;
    padding-left: 8px;
    font-weight: 600;
  }
  .grading-table tbody tr:nth-child(even) {
    background: #f8fafc;
  }
  .badge-na {
    display: inline-block;
    background: #e2e8f0;
    color: #64748b;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 800;
    font-size: 9.5px;
    letter-spacing: 0.05em;
  }
  .badge-lab {
    display: inline-block;
    background: #dbeafe;
    color: #1e40af;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 800;
    font-size: 9px;
  }
  .col-avg {
    background: #ecfdf5 !important;
    font-weight: 900 !important;
    color: #065f46 !important;
    font-size: 11.5px !important;
  }
  .overall-row {
    background: #fef3c7 !important;
    font-weight: 900 !important;
    color: #92400e !important;
    border-top: 2px solid #b45309;
  }
  .overall-row td {
    border: 1px solid #b45309 !important;
    padding: 8px 6px !important;
  }
  .signatures {
    display: table;
    width: 100%;
    margin-top: 32px;
    page-break-inside: avoid;
  }
  .sig-col {
    display: table-cell;
    width: 33.33%;
    text-align: center;
    padding: 0 16px;
    vertical-align: top;
  }
  .sig-line {
    border-top: 1.5px solid #0f172a;
    margin-top: 40px;
    padding-top: 4px;
    font-weight: 800;
    font-size: 11px;
    color: #0f172a;
  }
  .sig-title {
    font-size: 9.5px;
    color: #64748b;
    text-transform: uppercase;
    font-weight: 600;
  }
  .footer-note {
    margin-top: 18px;
    font-size: 9px;
    color: #64748b;
    border-top: 1px dashed #cbd5e1;
    padding-top: 6px;
    display: flex;
    justify-content: space-between;
  }
`

/**
 * Generates and prints the Student Grading Book mirroring Grading_Book_Template (1).xlsx
 */
export function printStudentGradingBookReport(params: {
  studentName: string
  section: string
  schoolYear: string
  rows: PrintStudentRow[]
  overallAverage: number
}) {
  const printable = window.open('', '_blank')
  if (!printable) return

  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const rowsHtml = params.rows
    .map(
      (r) => `
      <tr>
        <td style="font-weight: 700; color: #1e3a8a;">${r.code}</td>
        <td class="col-subject">
          ${r.title}
          ${r.hasLaboratory ? '<span class="badge-lab" style="margin-left: 6px;">🧪 Lab</span>' : ''}
        </td>
        <td>${r.prelimExam || '-'}</td>
        <td>${r.quiz || '-'}</td>
        <td>${r.activity || '-'}</td>
        <td>${r.attendance || '-'}</td>
        <td>${r.participation || '-'}</td>
        <td>${r.hasLaboratory ? (r.labExam ?? '-') : '<span class="badge-na">N/A</span>'}</td>
        <td>${r.midterm || '-'}</td>
        <td>${r.final || '-'}</td>
        <td class="col-avg">${r.subjectAverage > 0 ? r.subjectAverage.toFixed(1) : '-'}</td>
      </tr>
    `,
    )
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
          <!-- Institutional Header -->
          <table class="header-table">
            <tr>
              <td style="vertical-align: middle;">
                <div class="institution-name">TRACKADEMIC UNIVERSITY SYSTEM</div>
                <div class="document-title">STUDENT GRADING BOOK & OFFICIAL TRANSCRIPT OF ASSESSMENTS</div>
                <div class="document-subtitle">Generated in accordance with standard CHED & TESDA Academic Grading Sheet Specifications</div>
              </td>
              <td style="text-align: right; vertical-align: middle;">
                <div style="font-size: 10px; color: #64748b; font-weight: 700;">OFFICIAL COPY</div>
                <div style="font-size: 10px; color: #0f172a; font-weight: 800;">Date: ${dateStr}</div>
              </td>
            </tr>
          </table>

          <!-- Metadata Ribbon: Student Name, Section, School Year -->
          <div class="meta-grid">
            <div class="meta-cell" style="width: 45%;">
              <div class="meta-label">Student Name</div>
              <div class="meta-value" style="color: #1e3a8a; font-size: 14px;">${params.studentName}</div>
            </div>
            <div class="meta-cell" style="width: 25%;">
              <div class="meta-label">Section / Year</div>
              <div class="meta-value">${params.section}</div>
            </div>
            <div class="meta-cell" style="width: 30%;">
              <div class="meta-label">Academic Period</div>
              <div class="meta-value">${params.schoolYear}</div>
            </div>
          </div>

          <!-- Main Assessment Table: Matching Grading_Book_Template (1).xlsx -->
          <table class="grading-table">
            <thead>
              <tr>
                <th style="width: 10%;">Subject Code</th>
                <th class="col-subject" style="width: 28%;">Subject Name</th>
                <th style="width: 7%;">Prelim Exam</th>
                <th style="width: 6%;">Quiz</th>
                <th style="width: 6%;">Activity</th>
                <th style="width: 6%;">Attendance</th>
                <th style="width: 6%;">Participation</th>
                <th style="width: 9%;">Laboratory Exam</th>
                <th style="width: 6%;">Midterm</th>
                <th style="width: 6%;">Final</th>
                <th style="width: 10%;">Subject Average</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              <!-- Overall Average Summary Row -->
              <tr class="overall-row">
                <td colspan="10" style="text-align: right; font-weight: 900; letter-spacing: 0.05em; padding-right: 12px;">
                  OVERALL ACADEMIC AVERAGE:
                </td>
                <td class="col-avg" style="font-size: 13px !important; color: #065f46; font-weight: 900;">
                  ${params.overallAverage.toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>

          <div style="font-size: 9.5px; color: #475569; margin-top: 4px; font-style: italic;">
            * Note: Subjects without a laboratory component display <strong>N/A</strong> under Laboratory Exam and are calculated excluding that column, mirroring the official grading book workbook.
          </div>

          <!-- Official Signatory Block -->
          <div class="signatures">
            <div class="sig-col">
              <div class="sig-line">CLASS ADVISER / TRAINER</div>
              <div class="sig-title">Faculty In-Charge</div>
            </div>
            <div class="sig-col">
              <div class="sig-line">DEPARTMENT HEAD / DEAN</div>
              <div class="sig-title">College of Computer Studies</div>
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
        <td>${s.prelimExam || '-'}</td>
        <td>${s.quiz || '-'}</td>
        <td>${s.activity || '-'}</td>
        <td>${s.attendance || '-'}</td>
        <td>${s.participation || '-'}</td>
        ${params.hasLaboratory ? `<td>${s.labExam ?? '-'}</td>` : `<td><span class="badge-na">N/A</span></td>`}
        <td>${s.midterm || '-'}</td>
        <td>${s.final || '-'}</td>
        <td class="col-avg">${s.average > 0 ? s.average.toFixed(1) : '-'}</td>
        <td style="font-weight: 800; color: ${s.status === 'Bound to Fail' ? '#b91c1c' : s.status === 'At Risk' ? '#c2410c' : '#15803d'};">
          ${s.status}
        </td>
      </tr>
    `,
    )
    .join('')

  const classAvg = params.students.length > 0
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
          <!-- Institutional Header -->
          <table class="header-table">
            <tr>
              <td style="vertical-align: middle;">
                <div class="institution-name">TRACKADEMIC UNIVERSITY SYSTEM</div>
                <div class="document-title">OFFICIAL CLASS RECORD & ITEMIZE ASSESSMENT REPORT</div>
                <div class="document-subtitle">Office of Academic Affairs • College of Computer Studies & Information Technology</div>
              </td>
              <td style="text-align: right; vertical-align: middle;">
                <div style="font-size: 10px; color: #64748b; font-weight: 700;">CLASS RECORD</div>
                <div style="font-size: 10px; color: #0f172a; font-weight: 800;">Printed: ${dateStr}</div>
              </td>
            </tr>
          </table>

          <!-- Metadata Ribbon: Subject, Trainer, Section, Schedule, Room -->
          <div class="meta-grid">
            <div class="meta-cell" style="width: 35%;">
              <div class="meta-label">Subject & Classification</div>
              <div class="meta-value" style="color: #1e3a8a;">
                ${params.subjectCode} — ${params.subjectTitle}
                ${params.hasLaboratory ? '<span class="badge-lab" style="margin-left: 6px;">🧪 With Laboratory</span>' : '<span class="badge-na" style="margin-left: 6px;">📚 Lecture-Only</span>'}
              </div>
            </div>
            <div class="meta-cell" style="width: 25%;">
              <div class="meta-label">Instructor / Trainer</div>
              <div class="meta-value">${params.instructorName}</div>
            </div>
            <div class="meta-cell" style="width: 20%;">
              <div class="meta-label">Section & Room</div>
              <div class="meta-value">${params.sectionName} • ${params.room}</div>
            </div>
            <div class="meta-cell" style="width: 20%;">
              <div class="meta-label">Schedule & Term</div>
              <div class="meta-value">${params.schedule}</div>
            </div>
          </div>

          <!-- Class Grades Table -->
          <table class="grading-table">
            <thead>
              <tr>
                <th style="width: 4%;">#</th>
                <th class="col-subject" style="width: 26%;">Student Name</th>
                <th style="width: 7%;">Prelim Exam</th>
                <th style="width: 6%;">Quiz</th>
                <th style="width: 6%;">Activity</th>
                <th style="width: 6%;">Attendance</th>
                <th style="width: 6%;">Participation</th>
                <th style="width: 9%;">Laboratory Exam</th>
                <th style="width: 6%;">Midterm</th>
                <th style="width: 6%;">Final</th>
                <th style="width: 9%;">Subject Average</th>
                <th style="width: 9%;">Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              <tr class="overall-row">
                <td colspan="10" style="text-align: right; font-weight: 900; letter-spacing: 0.05em; padding-right: 12px;">
                  CLASS BATCH AVERAGE:
                </td>
                <td class="col-avg" style="font-size: 13px !important; color: #065f46; font-weight: 900;">
                  ${classAvg}%
                </td>
                <td style="font-weight: 900; color: #065f46;">
                  ${Number(classAvg) >= 75 ? 'PASSED' : 'AT RISK'}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Signatures -->
          <div class="signatures">
            <div class="sig-col">
              <div class="sig-line">${params.instructorName.toUpperCase()}</div>
              <div class="sig-title">Instructor / Trainer</div>
            </div>
            <div class="sig-col">
              <div class="sig-line">DEAN OF COMPUTER STUDIES</div>
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
