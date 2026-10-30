// Utility for generating official, publication-ready Academic PDF & Print Documents
// Showing full component scores (Attendance, Quiz, Activity, Participation, Exam) per term (Prelim, Midterm, Pre-Final, Final)

import type { DetailedTermScores } from './types';

export type PrintStudentRow = {
  code: string;
  title: string;
  units: number;
  hasLaboratory: boolean;
  prelim?: DetailedTermScores;
  midterm?: DetailedTermScores;
  prefinal?: DetailedTermScores;
  final?: DetailedTermScores;
  prelimExam?: number;
  quiz?: number;
  activity?: number;
  attendance?: number;
  participation?: number;
  labExam?: number | null;
  subjectAverage: number;
};

export type PrintClassStudentRow = {
  studentName: string;
  studentNo?: string;
  prelim: DetailedTermScores;
  midterm: DetailedTermScores;
  prefinal?: DetailedTermScores;
  final: DetailedTermScores;
  average: number;
  status: string;
};

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
`;

export function printStudentGradingBookReport(params: {
  studentName: string;
  section: string;
  schoolYear: string;
  rows: PrintStudentRow[];
  overallAverage: number;
  gradesOnly?: boolean;
}) {
  const printable = window.open('', '_blank');
  if (!printable) return;

  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const roundedOverallAvg = Math.round(params.overallAverage || 0);

  const summaryRowsHtml = params.rows
    .map((r) => {
      const pGrade = r.prelim && r.prelim.termGrade > 0 ? `${Math.round(r.prelim.termGrade)}%` : '—';
      const mGrade = r.midterm && r.midterm.termGrade > 0 ? `${Math.round(r.midterm.termGrade)}%` : '—';
      const pfGrade = r.prefinal && r.prefinal.termGrade > 0 ? `${Math.round(r.prefinal.termGrade)}%` : '—';
      const fGrade = r.final && r.final.termGrade > 0 ? `${Math.round(r.final.termGrade)}%` : '—';
      const avg = r.subjectAverage > 0 ? Math.round(r.subjectAverage) : null;
      const passed = avg !== null && avg >= 75;
      return `
        <tr>
          <td style="font-weight: 800; color: #1e3a8a;">${r.code}</td>
          <td class="col-subject">${r.title}</td>
          <td style="font-weight: 700;">${r.units}</td>
          <td class="col-term-grade">${pGrade}</td>
          <td class="col-term-grade">${mGrade}</td>
          <td class="col-term-grade">${pfGrade}</td>
          <td class="col-term-grade">${fGrade}</td>
          <td class="col-avg">${avg !== null ? `${avg}%` : '—'}</td>
          <td style="font-weight: 800; color: ${
            avg === null ? '#64748b' : passed ? '#15803d' : '#b91c1c'
          };">
            ${avg === null ? 'PENDING' : passed ? 'PASSED' : 'AT RISK'}
          </td>
        </tr>
      `;
    })
    .join('');

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
                <div class="document-title">OFFICIAL STUDENT REPORT OF GRADES (PRELIM • MIDTERM • PRE-FINAL • FINAL)</div>
                <div class="document-subtitle">All Grades Rounded to Whole Numbers | Cumulative Formula: 40% Previous + 60% Current Raw</div>
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
                <th style="width: 10%;">Subject Code</th>
                <th class="col-subject" style="width: 28%;">Subject Description</th>
                <th style="width: 6%;">Units</th>
                <th style="width: 11%; background: #1d4ed8;">Prelim</th>
                <th style="width: 11%; background: #5b21b6;">Midterm</th>
                <th style="width: 11%; background: #c2410c;">Pre-Final</th>
                <th style="width: 11%; background: #047857;">Final</th>
                <th style="width: 11%; background: #0f766e;">Rounded Avg</th>
                <th style="width: 11%;">Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${summaryRowsHtml}
              <tr class="overall-row">
                <td colspan="7" style="text-align: right; font-weight: 900; letter-spacing: 0.05em; padding-right: 12px;">
                  ROUNDED GENERAL WEIGHTED AVERAGE (GWA):
                </td>
                <td class="col-avg" style="font-size: 12px !important; color: #065f46; font-weight: 900;">
                  ${roundedOverallAvg > 0 ? `${roundedOverallAvg}%` : '—'}
                </td>
                <td style="font-weight: 900; color: ${
                  roundedOverallAvg === 0
                    ? '#64748b'
                    : roundedOverallAvg >= 75
                    ? '#15803d'
                    : '#b91c1c'
                };">
                  ${roundedOverallAvg === 0 ? 'PENDING' : roundedOverallAvg >= 75 ? 'PASSED' : 'AT RISK'}
                </td>
              </tr>
            </tbody>
          </table>

          <div class="signatures">
            <div class="sig-col">
              <div class="sig-line">CLASS ADVISER / INSTRUCTOR</div>
              <div class="sig-title">Faculty In-Charge</div>
            </div>
            <div class="sig-col">
              <div class="sig-line">DEPARTMENT HEAD / DEAN</div>
              <div class="sig-title">Academic Department</div>
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
  `;

  printable.document.open();
  printable.document.write(html);
  printable.document.close();
}

export function printClassGradeReport(params: {
  subjectCode: string;
  subjectTitle: string;
  hasLaboratory: boolean;
  sectionName: string;
  instructorName: string;
  schedule: string;
  room: string;
  schoolYear: string;
  students: PrintClassStudentRow[];
}) {
  const printable = window.open('', '_blank');
  if (!printable) return;

  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const rowsHtml = params.students
    .map((s, index) => {
      const pGrade = s.prelim.termGrade > 0 ? `${Math.round(s.prelim.termGrade)}%` : '—';
      const mGrade = s.midterm.termGrade > 0 ? `${Math.round(s.midterm.termGrade)}%` : '—';
      const pfGrade =
        s.prefinal && s.prefinal.termGrade > 0 ? `${Math.round(s.prefinal.termGrade)}%` : '—';
      const fGrade = s.final.termGrade > 0 ? `${Math.round(s.final.termGrade)}%` : '—';
      const avg = s.average > 0 ? `${Math.round(s.average)}%` : '—';
      return `
      <tr>
        <td style="font-weight: 700;">${index + 1}</td>
        <td class="col-subject" style="font-weight: 700; color: #0f172a;">
          ${s.studentName}
        </td>
        <td>${s.studentNo || '—'}</td>
        <td class="col-term-grade">${pGrade}</td>
        <td class="col-term-grade">${mGrade}</td>
        <td class="col-term-grade">${pfGrade}</td>
        <td class="col-term-grade">${fGrade}</td>
        <td class="col-avg">${avg}</td>
        <td style="font-weight: 800; color: ${
          s.average <= 0 ? '#64748b' : Math.round(s.average) < 75 ? '#b91c1c' : '#15803d'
        };">
          ${s.average <= 0 ? 'PENDING' : Math.round(s.average) < 75 ? 'AT RISK' : 'PASSED'}
        </td>
      </tr>
    `;
    })
    .join('');

  const encodedStudents = params.students.filter((s) => s.average > 0);
  const classAvg =
    encodedStudents.length > 0
      ? Math.round(
          encodedStudents.reduce((sum, s) => sum + Math.round(s.average), 0) /
            encodedStudents.length
        )
      : 0;

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
                <div class="document-title">OFFICIAL CLASS RECORD (PRELIM • MIDTERM • PRE-FINAL • FINAL)</div>
                <div class="document-subtitle">All Grades Rounded to Whole Numbers | Cumulative Formula: 40% Previous + 60% Current Raw</div>
              </td>
              <td style="text-align: right; vertical-align: middle;">
                <div style="font-size: 9.5px; color: #64748b; font-weight: 700;">CLASS RECORD</div>
                <div style="font-size: 9.5px; color: #0f172a; font-weight: 800;">Printed: ${dateStr}</div>
              </td>
            </tr>
          </table>

          <div class="meta-grid">
            <div class="meta-cell" style="width: 35%;">
              <div class="meta-label">Subject</div>
              <div class="meta-value" style="color: #1e3a8a;">
                ${params.subjectCode} — ${params.subjectTitle}
              </div>
            </div>
            <div class="meta-cell" style="width: 25%;">
              <div class="meta-label">Instructor</div>
              <div class="meta-value">${params.instructorName}</div>
            </div>
            <div class="meta-cell" style="width: 20%;">
              <div class="meta-label">Course, Section & Room</div>
              <div class="meta-value">${params.sectionName} • ${params.room}</div>
            </div>
            <div class="meta-cell" style="width: 20%;">
              <div class="meta-label">Schedule</div>
              <div class="meta-value">${params.schedule}</div>
            </div>
          </div>

          <table class="grading-table">
            <thead>
              <tr>
                <th style="width: 4%;">#</th>
                <th class="col-subject" style="width: 26%;">Student Name</th>
                <th style="width: 12%;">Student No.</th>
                <th style="width: 11%; background: #1d4ed8;">Prelim</th>
                <th style="width: 11%; background: #5b21b6;">Midterm</th>
                <th style="width: 11%; background: #c2410c;">Pre-Final</th>
                <th style="width: 11%; background: #047857;">Final</th>
                <th style="width: 7%; background: #0f766e;">Rounded</th>
                <th style="width: 7%;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              <tr class="overall-row">
                <td colspan="7" style="text-align: right; font-weight: 900; letter-spacing: 0.05em; padding-right: 12px;">
                  ROUNDED CLASS AVERAGE:
                </td>
                <td class="col-avg" style="font-size: 12px !important; color: #065f46; font-weight: 900;">
                  ${classAvg > 0 ? `${classAvg}%` : '—'}
                </td>
                <td style="font-weight: 900; color: #065f46;">
                  ${classAvg === 0 ? 'PENDING' : classAvg >= 75 ? 'PASSED' : 'AT RISK'}
                </td>
              </tr>
            </tbody>
          </table>

          <div class="signatures">
            <div class="sig-col">
              <div class="sig-line">${params.instructorName.toUpperCase()}</div>
              <div class="sig-title">Instructor</div>
            </div>
            <div class="sig-col">
              <div class="sig-line">DEPARTMENT DEAN</div>
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
  `;

  printable.document.open();
  printable.document.write(html);
  printable.document.close();
}
