// Utility for generating official, publication-ready Academic PDF & Print Documents
// Designed strictly for educational institutions: clean, formal, comprehensive, black-and-white / grayscale academic format.

import type { DetailedTermScores } from './types';
import { getGPAEquivalent, formatYearLevel } from './helpers';

export type PrintStudentRow = {
  subjectId?: string;
  code: string;
  title: string;
  units: number;
  hasLaboratory: boolean;
  prelim?: DetailedTermScores;
  midterm?: DetailedTermScores;
  prefinal?: DetailedTermScores;
  final?: DetailedTermScores;
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

const FORMAL_ACADEMIC_PRINT_CSS = `
  @page {
    size: A4 landscape;
    margin: 8mm 10mm;
  }
  @page portrait {
    size: A4 portrait;
    margin: 10mm 12mm;
  }
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif;
    color: #0f172a;
    background: #ffffff;
    margin: 0;
    padding: 0;
    font-size: 9.5px;
    line-height: 1.35;
  }
  .report-sheet {
    width: 100%;
    max-width: 1120px;
    margin: 0 auto;
    background: #ffffff;
  }
  .report-sheet.portrait {
    max-width: 820px;
  }

  /* Academic Institutional Letterhead */
  .institutional-header {
    text-align: center;
    padding-bottom: 6px;
    margin-bottom: 8px;
    border-bottom: 2px solid #0f172a;
    position: relative;
  }
  .republic-text {
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #475569;
    margin: 0 0 2px 0;
  }
  .agency-text {
    font-size: 8.5px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #334155;
    margin: 0 0 3px 0;
  }
  .institution-name {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 0.05em;
    color: #0f172a;
    text-transform: uppercase;
    margin: 0 0 2px 0;
  }
  .office-name {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #334155;
    margin: 0 0 4px 0;
  }
  .report-title-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: #0f172a;
    padding: 3px 16px;
    border-top: 1px solid #0f172a;
    border-bottom: 1px solid #0f172a;
    margin-top: 3px;
    background: #f8fafc;
  }
  .report-subtitle {
    font-size: 8.5px;
    color: #475569;
    margin: 3px 0 0 0;
    font-style: italic;
  }

  /* Metadata Box */
  .meta-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 8px;
    border: 1.5px solid #0f172a;
  }
  .meta-table td {
    padding: 4px 8px;
    border: 1px solid #cbd5e1;
    font-size: 9.5px;
    vertical-align: middle;
  }
  .meta-table .field-label {
    width: 15%;
    font-size: 8px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #334155;
    background: #f8fafc;
  }
  .meta-table .field-value {
    width: 35%;
    font-weight: 700;
    color: #0f172a;
  }

  /* Main Academic Table */
  .academic-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 8px;
    border: 1.5px solid #0f172a;
  }
  .academic-table th {
    background: #f1f5f9;
    color: #0f172a;
    font-weight: 800;
    font-size: 8.5px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 5px 3px;
    border: 1px solid #64748b;
    text-align: center;
    vertical-align: middle;
  }
  .academic-table th.col-left {
    text-align: left;
    padding-left: 8px;
  }
  .academic-table td {
    padding: 4.5px 3px;
    border: 1px solid #cbd5e1;
    font-size: 9px;
    text-align: center;
    color: #0f172a;
  }
  .academic-table td.col-left {
    text-align: left;
    padding-left: 8px;
  }
  .academic-table tbody tr:nth-child(even) {
    background: #f8fafc;
  }
  .academic-table td.bold {
    font-weight: 700;
  }
  .academic-table .total-row td {
    border-top: 2px solid #0f172a;
    border-bottom: 2px solid #0f172a;
    background: #f1f5f9;
    font-weight: 800;
    font-size: 9.5px;
  }

  /* Statistics & Summary Strip */
  .stats-strip {
    display: table;
    width: 100%;
    margin-top: 6px;
    margin-bottom: 10px;
    border: 1px solid #64748b;
    background: #f8fafc;
    page-break-inside: avoid;
  }
  .stats-cell {
    display: table-cell;
    padding: 5px 8px;
    text-align: center;
    border-right: 1px solid #cbd5e1;
    vertical-align: middle;
  }
  .stats-cell:last-child {
    border-right: none;
  }
  .stats-val {
    font-size: 12px;
    font-weight: 800;
    color: #0f172a;
  }
  .stats-lbl {
    font-size: 7.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #475569;
  }

  /* Academic Grading Scale Legend */
  .legend-container {
    border: 1px solid #cbd5e1;
    padding: 5px 8px;
    margin-top: 6px;
    margin-bottom: 10px;
    background: #ffffff;
    font-size: 8px;
    color: #334155;
    page-break-inside: avoid;
  }
  .legend-header {
    font-weight: 800;
    font-size: 8px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #0f172a;
    margin-bottom: 2px;
    border-bottom: 1px dotted #cbd5e1;
    padding-bottom: 2px;
  }
  .legend-row {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 4px;
    line-height: 1.3;
  }

  /* Signatures Section */
  .signatures-grid {
    display: table;
    width: 100%;
    margin-top: 18px;
    margin-bottom: 10px;
    page-break-inside: avoid;
  }
  .signature-cell {
    display: table-cell;
    width: 33.33%;
    text-align: center;
    padding: 0 16px;
    vertical-align: bottom;
  }
  .signature-cell.two-col {
    width: 50%;
  }
  .sign-underline {
    border-top: 1.5px solid #0f172a;
    margin-top: 32px;
    padding-top: 3px;
    font-weight: 800;
    font-size: 9.5px;
    color: #0f172a;
    text-transform: uppercase;
  }
  .sign-designation {
    font-size: 8px;
    color: #475569;
    font-weight: 600;
  }
  .sign-date {
    font-size: 7.5px;
    color: #64748b;
    margin-top: 1px;
  }

  /* Footer Security Line */
  .document-footer {
    border-top: 1px solid #cbd5e1;
    padding-top: 4px;
    margin-top: 8px;
    font-size: 7.5px;
    color: #64748b;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

export function printStudentGradingBookReport(params: {
  studentName: string;
  studentNo?: string;
  yearLevel?: string;
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
    day: 'numeric',
  });

  const roundedOverallAvg = Math.round(params.overallAverage || 0);
  const totalUnits = params.rows.reduce((sum, r) => sum + (Number(r.units) || 0), 0);
  const passedUnits = params.rows
    .filter((r) => r.subjectAverage >= 75)
    .reduce((sum, r) => sum + (Number(r.units) || 0), 0);
  const overallGPA = roundedOverallAvg > 0 ? getGPAEquivalent(roundedOverallAvg) : '—';
  const docRefId = `TRK-STU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const rowsHtml = params.rows
    .map((r) => {
      const pGrade =
        r.prelim && (r.prelim.termGrade > 0 || r.prelim.computedTermGrade > 0)
          ? `${Math.round(r.prelim.termGrade || r.prelim.computedTermGrade)}%`
          : '—';
      const mGrade =
        r.midterm && (r.midterm.termGrade > 0 || r.midterm.computedTermGrade > 0)
          ? `${Math.round(r.midterm.termGrade || r.midterm.computedTermGrade)}%`
          : '—';
      const pfGrade =
        r.prefinal && (r.prefinal.termGrade > 0 || r.prefinal.computedTermGrade > 0)
          ? `${Math.round(r.prefinal.termGrade || r.prefinal.computedTermGrade)}%`
          : '—';
      const fGrade =
        r.final && (r.final.termGrade > 0 || r.final.computedTermGrade > 0)
          ? `${Math.round(r.final.termGrade || r.final.computedTermGrade)}%`
          : '—';
      const avg = r.subjectAverage > 0 ? Math.round(r.subjectAverage) : null;
      const gpa = avg !== null ? getGPAEquivalent(avg) : '—';
      const remarks = avg === null ? 'PENDING' : avg >= 75 ? 'PASSED' : 'FAILED';

      return `
        <tr>
          <td class="bold" style="width: 12%;">${r.code}</td>
          <td class="col-left" style="width: 32%;">${r.title}</td>
          <td style="width: 6%;">${r.units}</td>
          <td style="width: 9%;">${pGrade}</td>
          <td style="width: 9%;">${mGrade}</td>
          <td style="width: 9%;">${pfGrade}</td>
          <td style="width: 9%;">${fGrade}</td>
          <td class="bold" style="width: 7%;">${avg !== null ? `${avg}%` : '—'}</td>
          <td style="width: 7%; font-weight: 700;">${gpa}</td>
          <td class="bold" style="width: 9%;">${remarks}</td>
        </tr>
      `;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Official Academic Record of Grades - ${params.studentName}</title>
        <style>
          ${FORMAL_ACADEMIC_PRINT_CSS}
          @page {
            size: A4 portrait;
            margin: 12mm 12mm;
          }
        </style>
      </head>
      <body>
        <div class="report-sheet portrait">
          <!-- Institutional Academic Header -->
          <div class="institutional-header">
            <div class="republic-text">Republic of the Philippines</div>
            <div class="agency-text">Commission on Higher Education • Department of Education</div>
            <div class="institution-name">Trackademic Academic Information &amp; College System</div>
            <div class="office-name">Office of the University Registrar • Academic Records Division</div>
            <div class="report-title-badge">CERTIFICATE OF GRADES &amp; ACADEMIC EVALUATION</div>
            <div class="report-subtitle">Official Semester Evaluation • Cumulative Grading System (40% Previous + 60% Raw)</div>
          </div>

          <!-- Academic Metadata Table -->
          <table class="meta-table">
            <tr>
              <td class="field-label">Student Name:</td>
              <td class="field-value">${params.studentName}</td>
              <td class="field-label">Student ID No.:</td>
              <td class="field-value">${params.studentNo || 'N/A'}</td>
            </tr>
            <tr>
              <td class="field-label">Program &amp; Section:</td>
              <td class="field-value">${params.section}</td>
              <td class="field-label">Year Level:</td>
              <td class="field-value">${params.yearLevel || formatYearLevel(undefined, params.section)}</td>
            </tr>
            <tr>
              <td class="field-label">Academic Period:</td>
              <td class="field-value">${params.schoolYear}</td>
              <td class="field-label">Date of Issuance:</td>
              <td class="field-value">${dateStr}</td>
            </tr>
          </table>

          <!-- Main Subjects & Grades Table -->
          <table class="academic-table">
            <thead>
              <tr>
                <th>Subject Code</th>
                <th class="col-left">Subject Description</th>
                <th>Units</th>
                <th>Prelim</th>
                <th>Midterm</th>
                <th>Pre-Final</th>
                <th>Final</th>
                <th>Final Avg</th>
                <th>GPA</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              <tr class="total-row">
                <td colspan="2" class="col-left" style="padding-left: 10px;">
                  GENERAL WEIGHTED AVERAGE (GWA) &amp; TOTALS:
                </td>
                <td>${totalUnits}</td>
                <td colspan="4" style="font-size: 8px; color: #475569; letter-spacing: 0.05em;">
                  CREDIT UNITS PASSED: ${passedUnits} / ${totalUnits}
                </td>
                <td>${roundedOverallAvg > 0 ? `${roundedOverallAvg}%` : '—'}</td>
                <td style="font-weight: 800;">${overallGPA}</td>
                <td style="font-weight: 800;">
                  ${roundedOverallAvg === 0 ? 'PENDING' : roundedOverallAvg >= 75 ? 'PASSED' : 'DEFICIENT'}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Academic Performance Summary -->
          <div class="stats-strip">
            <div class="stats-cell">
              <div class="stats-val">${params.rows.length}</div>
              <div class="stats-lbl">Total Subjects</div>
            </div>
            <div class="stats-cell">
              <div class="stats-val">${totalUnits}</div>
              <div class="stats-lbl">Total Units</div>
            </div>
            <div class="stats-cell">
              <div class="stats-val">${passedUnits}</div>
              <div class="stats-lbl">Earned Units</div>
            </div>
            <div class="stats-cell">
              <div class="stats-val">${roundedOverallAvg > 0 ? `${roundedOverallAvg}%` : '—'}</div>
              <div class="stats-lbl">General Average</div>
            </div>
            <div class="stats-cell">
              <div class="stats-val">${overallGPA}</div>
              <div class="stats-lbl">Equivalent GPA</div>
            </div>
            <div class="stats-cell">
              <div class="stats-val" style="font-size: 11px;">
                ${roundedOverallAvg >= 75 ? 'GOOD STANDING' : roundedOverallAvg === 0 ? 'PENDING' : 'PROBATIONARY'}
              </div>
              <div class="stats-lbl">Academic Status</div>
            </div>
          </div>

          <!-- Philippine Standard Grading Scale Legend -->
          <div class="legend-container">
            <div class="legend-header">OFFICIAL GRADING SCALE &amp; NUMERICAL EQUIVALENTS (CHED / DEPED STANDARD)</div>
            <div class="legend-row">
              <span><strong>1.00</strong> (96–100%) Excellent</span>
              <span><strong>1.25</strong> (92–95%) Very Good</span>
              <span><strong>1.50</strong> (87–91%) Very Good</span>
              <span><strong>1.75</strong> (83–86%) Good</span>
              <span><strong>2.00</strong> (78–82%) Satisfactory</span>
              <span><strong>2.25</strong> (75–77%) Passed</span>
              <span><strong>3.00</strong> (75% Passing Cut-off)</span>
              <span><strong>5.00</strong> (&lt;75% Failed)</span>
              <span><strong>DRP</strong> Dropped</span>
            </div>
          </div>

          <!-- Official Signatories & Seals -->
          <div class="signatures-grid">
            <div class="signature-cell">
              <div class="sign-underline">FACULTY ADVISER / INSTRUCTOR</div>
              <div class="sign-designation">Academic Evaluator</div>
              <div class="sign-date">Date Signed: _______________</div>
            </div>
            <div class="signature-cell">
              <div class="sign-underline">DEPARTMENT CHAIRPERSON / DEAN</div>
              <div class="sign-designation">College / Department Head</div>
              <div class="sign-date">Date Signed: _______________</div>
            </div>
            <div class="signature-cell">
              <div class="sign-underline">UNIVERSITY REGISTRAR</div>
              <div class="sign-designation">Office of Academic Records</div>
              <div class="sign-date">Date Verified: _______________</div>
            </div>
          </div>

          <!-- Document Verification Security Line -->
          <div class="document-footer">
            <span>Security Document ID: ${docRefId} • Official Academic Record</span>
            <span>NOT VALID WITHOUT OFFICIAL UNIVERSITY EMBOSSED SEAL OR REGISTRAR SIGNATURE</span>
            <span>Generated via Trackademic • Page 1 of 1</span>
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
  yearLevel?: string;
  students: PrintClassStudentRow[];
}) {
  const printable = window.open('', '_blank');
  if (!printable) return;

  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const totalStudents = params.students.length;
  const encodedStudents = params.students.filter((s) => s.average > 0);
  const passedStudents = params.students.filter((s) => Math.round(s.average) >= 75);
  const failedStudents = params.students.filter(
    (s) => s.average > 0 && Math.round(s.average) < 75 && s.status !== 'Dropped',
  );
  const droppedStudents = params.students.filter((s) => s.status === 'Dropped');

  const classAvg =
    encodedStudents.length > 0
      ? Math.round(
          encodedStudents.reduce((sum, s) => sum + Math.round(s.average), 0) /
            encodedStudents.length,
        )
      : 0;

  const passingRate =
    encodedStudents.length > 0
      ? Math.round((passedStudents.length / encodedStudents.length) * 100)
      : 0;

  const classGpa = classAvg > 0 ? getGPAEquivalent(classAvg) : '—';
  const docRefId = `TRK-CLS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const rowsHtml = params.students
    .map((s, index) => {
      const isDropped = s.status === 'Dropped';
      const pGrade =
        s.prelim && (s.prelim.termGrade > 0 || s.prelim.computedTermGrade > 0)
          ? `${Math.round(s.prelim.termGrade || s.prelim.computedTermGrade)}%`
          : '—';
      const mGrade =
        s.midterm && (s.midterm.termGrade > 0 || s.midterm.computedTermGrade > 0)
          ? `${Math.round(s.midterm.termGrade || s.midterm.computedTermGrade)}%`
          : '—';
      const pfGrade =
        s.prefinal && (s.prefinal.termGrade > 0 || s.prefinal.computedTermGrade > 0)
          ? `${Math.round(s.prefinal.termGrade || s.prefinal.computedTermGrade)}%`
          : '—';
      const fGrade =
        s.final && (s.final.termGrade > 0 || s.final.computedTermGrade > 0)
          ? `${Math.round(s.final.termGrade || s.final.computedTermGrade)}%`
          : '—';
      const avg = s.average > 0 ? Math.round(s.average) : null;
      const gpa = avg !== null ? getGPAEquivalent(avg) : '—';
      const remarks = isDropped
        ? 'DROPPED'
        : avg === null
        ? 'PENDING'
        : avg >= 75
        ? 'PASSED'
        : 'FAILED';

      return `
        <tr>
          <td style="width: 4%;">${index + 1}</td>
          <td style="width: 12%; font-weight: 700;">${s.studentNo || '—'}</td>
          <td class="col-left bold" style="width: 26%;">${s.studentName}</td>
          <td style="width: 9%;">${pGrade}</td>
          <td style="width: 9%;">${mGrade}</td>
          <td style="width: 9%;">${pfGrade}</td>
          <td style="width: 9%;">${fGrade}</td>
          <td class="bold" style="width: 8%;">${avg !== null ? `${avg}%` : '—'}</td>
          <td style="width: 7%; font-weight: 700;">${gpa}</td>
          <td class="bold" style="width: 7%;">${remarks}</td>
        </tr>
      `;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Official Class Record Sheet - ${params.subjectCode} (${params.sectionName})</title>
        <style>${FORMAL_ACADEMIC_PRINT_CSS}</style>
      </head>
      <body>
        <div class="report-sheet">
          <!-- Institutional Academic Header -->
          <div class="institutional-header">
            <div class="republic-text">Republic of the Philippines</div>
            <div class="agency-text">Commission on Higher Education • Department of Education</div>
            <div class="institution-name">Trackademic Academic Information &amp; College System</div>
            <div class="office-name">Office of Academic Affairs • Faculty Grading &amp; Records Management</div>
            <div class="report-title-badge">OFFICIAL CLASS RECORD BOOK &amp; MASTER GRADING SHEET</div>
            <div class="report-subtitle">Official Master Record • Cumulative Grading System: 40% Previous Period + 60% Current Raw</div>
          </div>

          <!-- Academic Metadata Table -->
          <table class="meta-table">
            <tr>
              <td class="field-label">Subject Code &amp; Title:</td>
              <td class="field-value">${params.subjectCode} — ${params.subjectTitle}</td>
              <td class="field-label">Assigned Faculty:</td>
              <td class="field-value">${params.instructorName}</td>
            </tr>
            <tr>
              <td class="field-label">Program &amp; Section:</td>
              <td class="field-value">${params.sectionName}</td>
              <td class="field-label">Year Level:</td>
              <td class="field-value">${params.yearLevel || formatYearLevel(undefined, params.sectionName)}</td>
            </tr>
            <tr>
              <td class="field-label">Academic Term:</td>
              <td class="field-value">${params.schoolYear}</td>
              <td class="field-label">Schedule &amp; Room:</td>
              <td class="field-value">${params.schedule || 'TBA'} • ${params.room || 'TBA'}</td>
            </tr>
          </table>

          <!-- Main Student Grading Table -->
          <table class="academic-table">
            <thead>
              <tr>
                <th style="width: 4%;">#</th>
                <th style="width: 12%;">Student ID</th>
                <th class="col-left" style="width: 26%;">Student Full Name</th>
                <th style="width: 9%;">Prelim (100%)</th>
                <th style="width: 9%;">Midterm (40/60)</th>
                <th style="width: 9%;">Pre-Final (40/60)</th>
                <th style="width: 9%;">Final (40/60)</th>
                <th style="width: 8%;">Final Avg</th>
                <th style="width: 7%;">GPA</th>
                <th style="width: 7%;">Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              <tr class="total-row">
                <td colspan="3" class="col-left" style="padding-left: 10px;">
                  ROUNDED CLASS GENERAL AVERAGE &amp; SUMMARY:
                </td>
                <td colspan="4" style="font-size: 8px; color: #475569; letter-spacing: 0.04em;">
                  ENROLLED: ${totalStudents} | PASSED: ${passedStudents.length} | FAILED: ${failedStudents.length} | DROPPED: ${droppedStudents.length}
                </td>
                <td style="font-weight: 800;">${classAvg > 0 ? `${classAvg}%` : '—'}</td>
                <td style="font-weight: 800;">${classGpa}</td>
                <td style="font-weight: 800;">${passingRate}% PASS</td>
              </tr>
            </tbody>
          </table>

          <!-- Statistics & Distribution Strip -->
          <div class="stats-strip">
            <div class="stats-cell">
              <div class="stats-val">${totalStudents}</div>
              <div class="stats-lbl">Total Enrolled</div>
            </div>
            <div class="stats-cell">
              <div class="stats-val">${encodedStudents.length}</div>
              <div class="stats-lbl">Grades Encoded</div>
            </div>
            <div class="stats-cell">
              <div class="stats-val">${passedStudents.length}</div>
              <div class="stats-lbl">Passed Students</div>
            </div>
            <div class="stats-cell">
              <div class="stats-val">${failedStudents.length}</div>
              <div class="stats-lbl">Failed Students</div>
            </div>
            <div class="stats-cell">
              <div class="stats-val">${droppedStudents.length}</div>
              <div class="stats-lbl">Dropped Out</div>
            </div>
            <div class="stats-cell">
              <div class="stats-val">${passingRate}%</div>
              <div class="stats-lbl">Passing Rate</div>
            </div>
            <div class="stats-cell">
              <div class="stats-val">${classAvg > 0 ? `${classAvg}%` : '—'}</div>
              <div class="stats-lbl">Class GWA</div>
            </div>
          </div>

          <!-- Official Grading Scale Reference Legend -->
          <div class="legend-container">
            <div class="legend-header">OFFICIAL GRADING SCALE &amp; NUMERICAL EQUIVALENTS (CHED / DEPED STANDARD)</div>
            <div class="legend-row">
              <span><strong>1.00</strong> (96–100%) Excellent</span>
              <span><strong>1.25</strong> (92–95%) Very Good</span>
              <span><strong>1.50</strong> (87–91%) Very Good</span>
              <span><strong>1.75</strong> (83–86%) Good</span>
              <span><strong>2.00</strong> (78–82%) Satisfactory</span>
              <span><strong>2.25</strong> (75–77%) Fair/Passed</span>
              <span><strong>3.00</strong> (75% Passing Mark)</span>
              <span><strong>5.00</strong> (&lt;75% Failed)</span>
              <span><strong>DRP</strong> Dropped Out</span>
            </div>
          </div>

          <!-- Institutional Signatories Block -->
          <div class="signatures-grid">
            <div class="signature-cell">
              <div class="sign-underline">${params.instructorName.toUpperCase()}</div>
              <div class="sign-designation">Subject Instructor / Faculty In-Charge</div>
              <div class="sign-date">Date Submitted: _______________</div>
            </div>
            <div class="signature-cell">
              <div class="sign-underline">DEPARTMENT CHAIRPERSON / DEAN</div>
              <div class="sign-designation">Academic Department Head</div>
              <div class="sign-date">Date Checked: _______________</div>
            </div>
            <div class="signature-cell">
              <div class="sign-underline">COLLEGE REGISTRAR</div>
              <div class="sign-designation">Office of the University Registrar</div>
              <div class="sign-date">Date Approved &amp; Archived: _______________</div>
            </div>
          </div>

          <!-- Legal & Verification Footer -->
          <div class="document-footer">
            <span>Security Document ID: ${docRefId} • Date Generated: ${dateStr}</span>
            <span>OFFICIAL TRANSCRIPT &amp; MASTER RECORD — ANY ALTERATION RENDERS THIS DOCUMENT NULL AND VOID</span>
            <span>Page 1 of 1</span>
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
