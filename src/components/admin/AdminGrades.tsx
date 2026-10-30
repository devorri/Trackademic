import React, { useState, useMemo } from 'react'
import { useData } from '../../context/DataContext'
import { getSubjectTitle, getGPAEquivalent, isTermEncoded, formatCourseSection } from '../../utils/helpers'
import { Calculator, Lock, Printer, Search, User, BookOpen, GraduationCap, CheckCircle2, Clock } from 'lucide-react'

export const AdminGrades: React.FC = () => {
  const {
    classes,
    subjects,
    instructors,
    students,
    detailedGradingSheets,
    printClassGradeReport,
  } = useData()

  const [yearFilter, setYearFilter] = useState<string>('all')
  const [sectionSearch, setSectionSearch] = useState<string>('')
  const [subjectSearch, setSubjectSearch] = useState<string>('')
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)

  // Available unique sections for quick pills/datalist
  const availableSections = useMemo(() => {
    const set = new Set<string>()
    classes.forEach((c) => {
      if (c.section?.name) set.add(c.section.name.trim())
    })
    students.forEach((s) => {
      const formatted = formatCourseSection(s.course, s.section_label)
      if (formatted) set.add(formatted)
    })
    return Array.from(set).sort()
  }, [classes, students])

  // Enrich classes with resolved year level, section, subject, instructor, and student rows
  const enrichedClasses = useMemo(() => {
    return classes.map((cls) => {
      const subj = subjects.find((s) => s.id === cls.subject_id) || cls.subject
      const inst =
        instructors.find(
          (i) =>
            i.id === cls.instructor_id ||
            i.profile_id === cls.instructor_id ||
            i.id === cls.instructor?.id,
        ) || cls.instructor
      const sectionName = cls.section?.name || 'BSIT 1A'

      // Infer year level from section.year_level, enrolled students, or section name (e.g., "BSIT 4A" -> 4, "BSIT-1A" -> 1)
      let yearLevel = cls.section?.year_level || 0
      if (!yearLevel) {
        const match = sectionName.match(/([1-6])/)
        if (match) {
          yearLevel = Number(match[1])
        } else {
          const firstEnrolled = students.find((s) => (cls.studentIds || []).includes(s.id))
          yearLevel = firstEnrolled?.year_level || 1
        }
      }

      const sheetRows = detailedGradingSheets[cls.id] || []
      const enrolledIds = Array.from(
        new Set([...(cls.studentIds || []), ...sheetRows.map((r) => r.studentId)]),
      )

      const studentGradeRows = enrolledIds.map((sid) => {
        const st = students.find((s) => s.id === sid)
        const sr = sheetRows.find((r) => r.studentId === sid)

        const prelimEncoded = isTermEncoded(sr?.prelim)
        const midtermEncoded = isTermEncoded(sr?.midterm)
        const prefinalEncoded = isTermEncoded(sr?.prefinal)
        const finalEncoded = isTermEncoded(sr?.final)

        const prelim = prelimEncoded ? Math.round(sr!.prelim.computedTermGrade) : null
        const midterm = midtermEncoded ? Math.round(sr!.midterm.computedTermGrade) : null
        const prefinal = prefinalEncoded ? Math.round(sr!.prefinal!.computedTermGrade) : null
        const final = finalEncoded ? Math.round(sr!.final.computedTermGrade) : null
        const overall = sr?.average && sr.average > 0 ? Math.round(sr.average) : null

        const isDropped = st?.status === 'dropped' || sr?.status === 'Dropped'
        const remarks = isDropped
          ? 'DROPPED OUT'
          : overall === null
          ? 'PENDING'
          : overall >= 75
          ? 'PASSED'
          : 'FAILED / AT RISK'

        return {
          studentId: sid,
          studentNo: st?.student_no || st?.studentNo || sr?.studentNo || 'N/A',
          studentName: st?.name || sr?.studentName || 'Student',
          courseSection: st ? formatCourseSection(st.course, st.section_label) : sectionName,
          yearLevel: st?.year_level || yearLevel,
          prelim,
          midterm,
          prefinal,
          final,
          overall,
          gpa: overall !== null ? getGPAEquivalent(overall) : '—',
          remarks,
          isDropped,
        }
      })

      const isSubmitted = sheetRows.some((r) => r.submittedToAdmin)
      const submittedAt = sheetRows.find((r) => r.submittedAt)?.submittedAt

      return {
        cls,
        subjectCode: subj?.code || 'SUBJ',
        subjectTitle: subj?.title || getSubjectTitle(subjects, cls.subject_id),
        units: subj?.units || 3,
        instructorName: inst?.name || 'Unassigned Instructor',
        instructorEmail: inst?.email || '',
        sectionName,
        yearLevel,
        studentGradeRows,
        isSubmitted,
        submittedAt,
      }
    })
  }, [classes, subjects, instructors, students, detailedGradingSheets])

  const filteredClasses = useMemo(() => {
    return enrichedClasses.filter((item) => {
      if (yearFilter !== 'all' && String(item.yearLevel) !== yearFilter) {
        return false
      }
      if (sectionSearch.trim()) {
        const qSec = sectionSearch.trim().toLowerCase()
        if (!item.sectionName.toLowerCase().includes(qSec)) {
          return false
        }
      }
      if (subjectSearch.trim()) {
        const qSub = subjectSearch.trim().toLowerCase()
        const hay = `${item.subjectCode} ${item.subjectTitle} ${item.instructorName} ${item.sectionName}`.toLowerCase()
        if (!hay.includes(qSub)) {
          return false
        }
      }
      return true
    })
  }, [enrichedClasses, yearFilter, sectionSearch, subjectSearch])

  const activeClassItem = useMemo(() => {
    if (selectedClassId) {
      const found = filteredClasses.find((c) => c.cls.id === selectedClassId)
      if (found) return found
    }
    return filteredClasses[0] || null
  }, [filteredClasses, selectedClassId])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
      {/* Header & Filter Bar */}
      <section
        className="panel"
        style={{
          padding: '1.8rem 2rem',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.4rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#1d4ed8',
                  background: '#eff6ff',
                  border: '1px solid #dbeafe',
                  padding: '0.25rem 0.7rem',
                  borderRadius: '999px',
                }}
              >
                Master Grade Records
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#475569',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  padding: '0.25rem 0.7rem',
                  borderRadius: '999px',
                }}
              >
                <Lock size={12} /> Read-Only Mode (View Only)
              </span>
            </div>
            <h3
              style={{
                margin: '0.5rem 0 0.2rem 0',
                fontSize: '1.5rem',
                color: '#0f172a',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Calculator size={22} color="#2563eb" /> Class & Student Grades Directory
            </h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
              Inspect subjects per year level and section, assigned instructors, and student grades from Preliminary to Final.
            </p>
          </div>

          {activeClassItem && (
            <button
              type="button"
              className="btn-primary"
              onClick={() => printClassGradeReport(activeClassItem.cls.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1.2rem',
                borderRadius: '10px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Printer size={16} /> Print Class Grade Sheet
            </button>
          )}
        </div>

        {/* Filter Controls: Year Level, Course & Section (Searchable), Subject/Instructor Search */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#334155',
                marginBottom: '0.35rem',
                textTransform: 'uppercase',
              }}
            >
              Filter by Year Level
            </label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.9rem',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontWeight: 700,
                fontSize: '0.9rem',
              }}
            >
              <option value="all">All Year Levels</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#334155',
                marginBottom: '0.35rem',
                textTransform: 'uppercase',
              }}
            >
              Course & Section (Searchable)
            </label>
            <input
              type="text"
              list="admin-grades-sections-list"
              placeholder="Type or select Course & Section (e.g. BSIT 1A)..."
              value={sectionSearch}
              onChange={(e) => setSectionSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.9rem',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            />
            <datalist id="admin-grades-sections-list">
              {availableSections.map((sec) => (
                <option key={sec} value={sec} />
              ))}
            </datalist>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#334155',
                marginBottom: '0.35rem',
                textTransform: 'uppercase',
              }}
            >
              Search Subject or Instructor
            </label>
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                color="#64748b"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder="Search subject code, title, or instructor..."
                value={subjectSearch}
                onChange={(e) => setSubjectSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem 0.65rem 2.2rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Subject / Class Cards Grid (Per Year, Per Section, showing Instructor) */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '1rem',
        }}
      >
        {filteredClasses.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              padding: '2.5rem',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
              color: '#64748b',
            }}
          >
            No subjects/classes found matching the selected Year Level and Section filters.
          </div>
        ) : (
          filteredClasses.map((item) => {
            const isSelected = activeClassItem?.cls.id === item.cls.id
            return (
              <div
                key={item.cls.id}
                onClick={() => setSelectedClassId(item.cls.id)}
                style={{
                  padding: '1.3rem 1.4rem',
                  borderRadius: '14px',
                  background: isSelected ? '#eff6ff' : '#ffffff',
                  border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  boxShadow: isSelected
                    ? '0 8px 20px rgba(37, 99, 235, 0.12)'
                    : '0 2px 8px rgba(15, 23, 42, 0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      background: '#dbeafe',
                      color: '#1e40af',
                    }}
                  >
                    {item.subjectCode}
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '999px',
                      background: item.isSubmitted ? '#dcfce7' : '#fef3c7',
                      color: item.isSubmitted ? '#15803d' : '#b45309',
                      border: item.isSubmitted ? '1px solid #bbf7d0' : '1px solid #fde68a',
                    }}
                  >
                    {item.isSubmitted ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {item.isSubmitted ? 'Submitted' : 'In Progress'}
                  </span>
                </div>

                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.08rem', color: '#0f172a', fontWeight: 800 }}>
                  {item.subjectTitle}
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.84rem', color: '#334155' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <GraduationCap size={14} color="#7c3aed" />
                    <span>
                      <strong>Year & Section:</strong> Year {item.yearLevel} •{' '}
                      <strong style={{ color: '#0f172a' }}>{item.sectionName}</strong>
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <User size={14} color="#2563eb" />
                    <span>
                      <strong>Instructor:</strong> {item.instructorName}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <BookOpen size={14} color="#059669" />
                    <span>
                      <strong>Students:</strong> {item.studentGradeRows.length} enrolled
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </section>

      {/* Selected Class Read-Only Student Grades Table (Prelim to Final) */}
      {activeClassItem && (
        <section
          className="panel"
          style={{
            padding: '1.8rem 2rem',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.2rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '6px',
                  }}
                >
                  {activeClassItem.subjectCode}
                </span>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    background: '#faf5ff',
                    color: '#7e22ce',
                    border: '1px solid #e9d5ff',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '6px',
                  }}
                >
                  Year {activeClassItem.yearLevel} • {activeClassItem.sectionName}
                </span>
              </div>
              <h4 style={{ margin: '0.45rem 0 0.2rem 0', fontSize: '1.3rem', color: '#0f172a', fontWeight: 800 }}>
                {activeClassItem.subjectTitle}
              </h4>
              <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>
                Assigned Instructor: <strong style={{ color: '#0f172a' }}>{activeClassItem.instructorName}</strong>{' '}
                {activeClassItem.instructorEmail ? `(${activeClassItem.instructorEmail})` : ''} • Schedule:{' '}
                <strong>{activeClassItem.cls.schedule || 'TBA'}</strong> • Room:{' '}
                <strong>{activeClassItem.cls.room || 'TBA'}</strong>
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1rem',
                borderRadius: '10px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#334155',
                fontSize: '0.84rem',
                fontWeight: 700,
              }}
            >
              <Lock size={15} color="#475569" />
              <span>Admin Read-Only View (Grades cannot be edited by Admin)</span>
            </div>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', margin: 0 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'left', color: '#0f172a', fontWeight: 800, fontSize: '0.85rem' }}>
                    #
                  </th>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'left', color: '#0f172a', fontWeight: 800, fontSize: '0.85rem' }}>
                    Student ID
                  </th>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'left', color: '#0f172a', fontWeight: 800, fontSize: '0.85rem' }}>
                    Student Name
                  </th>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'left', color: '#0f172a', fontWeight: 800, fontSize: '0.85rem' }}>
                    Course & Section
                  </th>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'center', color: '#0f172a', fontWeight: 800, fontSize: '0.85rem' }}>
                    Prelim
                  </th>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'center', color: '#0f172a', fontWeight: 800, fontSize: '0.85rem' }}>
                    Midterm
                  </th>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'center', color: '#0f172a', fontWeight: 800, fontSize: '0.85rem' }}>
                    Pre-Final
                  </th>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'center', color: '#0f172a', fontWeight: 800, fontSize: '0.85rem' }}>
                    Final
                  </th>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'center', color: '#1d4ed8', fontWeight: 800, fontSize: '0.85rem' }}>
                    Overall (Rounded)
                  </th>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'center', color: '#0f172a', fontWeight: 800, fontSize: '0.85rem' }}>
                    GPA
                  </th>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'center', color: '#0f172a', fontWeight: 800, fontSize: '0.85rem' }}>
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeClassItem.studentGradeRows.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                      No students enrolled in this class yet.
                    </td>
                  </tr>
                ) : (
                  activeClassItem.studentGradeRows.map((row, index) => (
                    <tr
                      key={row.studentId}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: row.isDropped ? '#fff5f5' : '#ffffff',
                      }}
                    >
                      <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontWeight: 700 }}>
                        {index + 1}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#334155', fontWeight: 700 }}>
                        {row.studentNo}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#0f172a', fontWeight: 800 }}>
                        {row.studentName}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#475569', fontWeight: 600 }}>
                        {row.courseSection}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#0f172a', fontWeight: 700 }}>
                        {row.prelim !== null ? row.prelim : '—'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#0f172a', fontWeight: 700 }}>
                        {row.midterm !== null ? row.midterm : '—'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#0f172a', fontWeight: 700 }}>
                        {row.prefinal !== null ? row.prefinal : '—'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#0f172a', fontWeight: 700 }}>
                        {row.final !== null ? row.final : '—'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <strong
                          style={{
                            fontSize: '1rem',
                            fontWeight: 900,
                            color:
                              row.overall === null
                                ? '#64748b'
                                : row.overall >= 75
                                ? '#1d4ed8'
                                : '#dc2626',
                          }}
                        >
                          {row.overall !== null ? row.overall : '—'}
                        </strong>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#334155', fontWeight: 700 }}>
                        {row.gpa}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: '999px',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            background: row.isDropped
                              ? '#fee2e2'
                              : row.overall === null
                              ? '#f1f5f9'
                              : row.overall >= 75
                              ? '#dcfce7'
                              : '#fef2f2',
                            color: row.isDropped
                              ? '#b91c1c'
                              : row.overall === null
                              ? '#64748b'
                              : row.overall >= 75
                              ? '#15803d'
                              : '#dc2626',
                            border: row.isDropped
                              ? '1px solid #fecaca'
                              : row.overall === null
                              ? '1px solid #cbd5e1'
                              : row.overall >= 75
                              ? '1px solid #bbf7d0'
                              : '1px solid #fecaca',
                          }}
                        >
                          {row.remarks}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}

export default AdminGrades

