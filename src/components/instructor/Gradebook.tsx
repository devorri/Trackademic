import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../hooks/useAuth'
import { getSubjectTitle, clampScore, ensureTermScores } from '../../utils/helpers'
import type { GradingPeriodKey, TermComponentField, DetailedTermScores } from '../../utils/types'
import {
  Save,
  Printer,
  Search,
  Layers,
  FileSpreadsheet,
  Check,
  Info,
  FlaskConical,
  BookOpen,
  Calendar,
} from 'lucide-react'

export const Gradebook: React.FC = () => {
  const { activeUser } = useAuth()
  const {
    classes,
    subjects,
    selectedClass,
    setSelectedClassId,
    instructors,
    students,
    gradebook,
    selectedClassAverages,
    detailedGradingSheets,
    updateDetailedGrade,
    generateReport,
    printReport,
    printStudentGradingBookReport,
  } = useData()

  const [activePeriodTab, setActivePeriodTab] = useState<'prelim' | 'midterm' | 'final' | 'all_periods' | 'summary'>('all_periods')
  const [studentSearch, setStudentSearch] = useState('')
  const [saveToast, setSaveToast] = useState(false)

  if (!selectedClass) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '3rem',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
        }}
      >
        <p style={{ color: '#64748b' }}>No classes selected. Please create or assign a class first.</p>
      </div>
    )
  }

  const instructorName =
    instructors.find((i) => i.id === selectedClass.instructor_id)?.name || 'Prof. Ochavilla'
  const currentSubject = subjects.find((s) => s.id === selectedClass.subject_id)
  const subjectTitle = getSubjectTitle(subjects, selectedClass.subject_id)
  const hasLaboratory =
    currentSubject?.has_laboratory ?? selectedClass.subject?.has_laboratory ?? true

  const currentDetailedSheet =
    detailedGradingSheets[selectedClass.id] ||
    selectedClass.studentIds?.map((stId) => {
      const st = students.find((s) => s.id === stId)
      const prelim = ensureTermScores(
        { attendance: 90, quiz: 84, labActivity: hasLaboratory ? 86 : 85, activity: 85, exam: 82 },
        82,
        hasLaboratory,
      )
      const midterm = ensureTermScores(
        { attendance: 91, quiz: 85, labActivity: hasLaboratory ? 87 : 86, activity: 86, exam: 84 },
        84,
        hasLaboratory,
      )
      const final = ensureTermScores(
        { attendance: 92, quiz: 86, labActivity: hasLaboratory ? 88 : 87, activity: 87, exam: 86 },
        86,
        hasLaboratory,
      )
      return {
        studentId: stId,
        studentName: st?.name || 'Student',
        studentNo: st?.student_no || '2026-001',
        prelim,
        midterm,
        final,
        average: 85.4,
        status: 'On Track' as any,
      }
    }) ||
    []

  const filteredDetailedSheet = currentDetailedSheet.filter(
    (row) =>
      (row.studentName || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
      (row.studentNo || '').toLowerCase().includes(studentSearch.toLowerCase()),
  )

  const filteredSummaryGradebook = gradebook.filter(
    (item) =>
      (item.student?.name || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
      (item.student?.student_no || item.student?.studentNo || '')
        .toLowerCase()
        .includes(studentSearch.toLowerCase()),
  )

  function handleSaveGrades() {
    generateReport('Class Record', activeUser?.name ?? 'Instructor')
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 3000)
  }

  function renderScoreInput(
    studentId: string,
    period: GradingPeriodKey,
    field: TermComponentField,
    value: number | null | undefined,
    accentBorder: string = '#cbd5e1',
    compact: boolean = false,
  ) {
    return (
      <input
        type="number"
        min="0"
        max="100"
        placeholder="-"
        value={value ?? ''}
        onChange={(e) =>
          updateDetailedGrade(
            selectedClass!.id,
            studentId,
            period,
            field,
            clampScore(e.target.value),
          )
        }
        style={{
          width: compact ? '48px' : '62px',
          textAlign: 'center',
          padding: compact ? '0.3rem 0.15rem' : '0.42rem 0.25rem',
          borderRadius: '7px',
          border: `1.5px solid ${accentBorder}`,
          background: '#ffffff',
          color: '#0f172a',
          fontWeight: 700,
          fontSize: compact ? '0.8rem' : '0.88rem',
        }}
      />
    )
  }

  const periodConfig: Record<
    GradingPeriodKey,
    { title: string; weightLabel: string; color: string; bg: string; border: string; examLabel: string }
  > = {
    prelim: {
      title: 'Preliminary Period',
      weightLabel: '30% Weight',
      color: '#1d4ed8',
      bg: '#eff6ff',
      border: '#bfdbfe',
      examLabel: 'Prelim Exam',
    },
    midterm: {
      title: 'Midterm Period',
      weightLabel: '30% Weight',
      color: '#047857',
      bg: '#ecfdf5',
      border: '#a7f3d0',
      examLabel: 'Midterm Exam',
    },
    final: {
      title: 'Final Period',
      weightLabel: '40% Weight',
      color: '#6d28d9',
      bg: '#f5f3ff',
      border: '#ddd6fe',
      examLabel: 'Final Exam',
    },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
      {/* Top Banner / Selector */}
      <section
        style={{
          padding: '1.6rem 2rem',
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
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #dbeafe',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                }}
              >
                Official Instructor Grading Book
              </span>
              <span
                style={{
                  background: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #e2e8f0',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                Section: {selectedClass.section?.name || 'CIT A'}
              </span>

              {hasLaboratory ? (
                <span
                  style={{
                    background: '#e0e7ff',
                    color: '#3730a3',
                    border: '1px solid #c7d2fe',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <FlaskConical size={12} /> With Lab Activity Component
                </span>
              ) : (
                <span
                  style={{
                    background: '#f8fafc',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <BookOpen size={12} /> Lecture & Activity Subject
                </span>
              )}
            </div>

            <h3 style={{ margin: '0.6rem 0 0.25rem 0', fontSize: '1.6rem', color: '#0f172a', fontWeight: 800 }}>
              {currentSubject?.code ? `${currentSubject.code} — ` : ''}
              {subjectTitle}
            </h3>
            <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>
              Instructor / Trainer: <strong style={{ color: '#0f172a' }}>{instructorName}</strong> • Room:{' '}
              {selectedClass.room || 'Computer Lab 1'} • Schedule: {selectedClass.schedule}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.7rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Class Selector Dropdown */}
            <select
              value={selectedClass.id}
              onChange={(e) => setSelectedClassId(e.target.value)}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                background: '#ffffff',
                color: '#0f172a',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {classes.map((c) => {
                const s = subjects.find((subj) => subj.id === c.subject_id)
                return (
                  <option key={c.id} value={c.id}>
                    {s?.code || 'SUBJ'} - {getSubjectTitle(subjects, c.subject_id)} ({c.section?.name || 'CIT A'})
                  </option>
                )
              })}
            </select>

            <button
              type="button"
              className="btn-primary"
              onClick={handleSaveGrades}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1.1rem',
                fontWeight: 700,
                borderRadius: '10px',
              }}
            >
              <Save size={16} /> Save Grades
            </button>

            <button
              type="button"
              onClick={printReport}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1.1rem',
                background: '#ffffff',
                color: '#1e3a8a',
                border: '1.5px solid #bfdbfe',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              <Printer size={16} color="#2563eb" /> Print Class Record (PDF)
            </button>

            <button
              type="button"
              onClick={() => printStudentGradingBookReport()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1.1rem',
                background: '#f8fafc',
                color: '#047857',
                border: '1.5px solid #a7f3d0',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              <FileSpreadsheet size={16} color="#059669" /> Print Student Grade Book (PDF)
            </button>
          </div>
        </div>

        {saveToast && (
          <div
            style={{
              marginTop: '1.2rem',
              padding: '0.8rem 1.2rem',
              borderRadius: '10px',
              background: '#dcfce7',
              border: '1px solid #bbf7d0',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            <Check size={18} /> All Prelim, Midterm, and Final component scores and computations successfully saved!
          </div>
        )}
      </section>

      {/* Period / View Switcher & Student Search */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            background: '#f1f5f9',
            padding: '0.35rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            flexWrap: 'wrap',
            gap: '0.25rem',
          }}
        >
          <button
            type="button"
            onClick={() => setActivePeriodTab('all_periods')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '9px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: activePeriodTab === 'all_periods' ? '#ffffff' : 'transparent',
              color: activePeriodTab === 'all_periods' ? '#1d4ed8' : '#64748b',
              boxShadow: activePeriodTab === 'all_periods' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
            }}
          >
            <FileSpreadsheet size={15} /> All Periods (Prelim • Midterm • Final)
          </button>

          <button
            type="button"
            onClick={() => setActivePeriodTab('prelim')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '9px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: activePeriodTab === 'prelim' ? '#ffffff' : 'transparent',
              color: activePeriodTab === 'prelim' ? '#1d4ed8' : '#64748b',
              boxShadow: activePeriodTab === 'prelim' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
            }}
          >
            <Calendar size={15} /> Prelim Period
          </button>

          <button
            type="button"
            onClick={() => setActivePeriodTab('midterm')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '9px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: activePeriodTab === 'midterm' ? '#ffffff' : 'transparent',
              color: activePeriodTab === 'midterm' ? '#047857' : '#64748b',
              boxShadow: activePeriodTab === 'midterm' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
            }}
          >
            <Calendar size={15} /> Midterm Period
          </button>

          <button
            type="button"
            onClick={() => setActivePeriodTab('final')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '9px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: activePeriodTab === 'final' ? '#ffffff' : 'transparent',
              color: activePeriodTab === 'final' ? '#6d28d9' : '#64748b',
              boxShadow: activePeriodTab === 'final' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
            }}
          >
            <Calendar size={15} /> Final Period
          </button>

          <button
            type="button"
            onClick={() => setActivePeriodTab('summary')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '9px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: activePeriodTab === 'summary' ? '#ffffff' : 'transparent',
              color: activePeriodTab === 'summary' ? '#0f172a' : '#64748b',
              boxShadow: activePeriodTab === 'summary' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
            }}
          >
            <Layers size={15} /> Term Summary View
          </button>
        </div>

        {/* Student Search */}
        <div style={{ position: 'relative', width: '260px' }}>
          <input
            placeholder="Search student name..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '2.4rem',
              paddingRight: '0.8rem',
              paddingTop: '0.6rem',
              paddingBottom: '0.6rem',
              background: '#ffffff',
              color: '#0f172a',
              border: '1.5px solid #cbd5e1',
              borderRadius: '10px',
              fontSize: '0.88rem',
            }}
          />
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b',
            }}
          />
        </div>
      </div>

      {/* 1. ALL PERIODS COMPLETE SHEET: Prelim, Midterm, and Final side-by-side */}
      {activePeriodTab === 'all_periods' && (
        <section
          style={{
            padding: '1.6rem',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.2rem',
              flexWrap: 'wrap',
              gap: '0.8rem',
            }}
          >
            <div>
              <h4 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 800 }}>
                Complete Assessment Sheet — Preliminary, Midterm & Final Component Scores
              </h4>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.86rem', color: '#475569' }}>
                Instructor inputs <strong>Attendance, Quiz, Lab Activity, Activity, and Exam</strong> for each period (Prelim, Midterm, Final). Term grades and Overall Average compute automatically.
              </p>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#eff6ff',
                border: '1px solid #dbeafe',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                color: '#1d4ed8',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              <Info size={15} /> Weights per Term: Att 10% • Quiz 20% • Lab Act 20% • Act 10% • Exam 40%
            </div>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '12px' }}>
            <table style={{ borderCollapse: 'collapse', margin: 0, width: '100%', fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th
                    rowSpan={2}
                    style={{
                      background: '#0f172a',
                      color: '#ffffff',
                      minWidth: '165px',
                      padding: '0.7rem 0.8rem',
                      textAlign: 'left',
                      border: '1px solid #334155',
                    }}
                  >
                    Student Name
                  </th>
                  <th
                    colSpan={6}
                    style={{
                      background: '#1d4ed8',
                      color: '#ffffff',
                      textAlign: 'center',
                      padding: '0.55rem',
                      fontWeight: 800,
                      border: '1px solid #1e40af',
                    }}
                  >
                    PRELIMINARY PERIOD (30%)
                  </th>
                  <th
                    colSpan={6}
                    style={{
                      background: '#047857',
                      color: '#ffffff',
                      textAlign: 'center',
                      padding: '0.55rem',
                      fontWeight: 800,
                      border: '1px solid #065f46',
                    }}
                  >
                    MIDTERM PERIOD (30%)
                  </th>
                  <th
                    colSpan={6}
                    style={{
                      background: '#6d28d9',
                      color: '#ffffff',
                      textAlign: 'center',
                      padding: '0.55rem',
                      fontWeight: 800,
                      border: '1px solid #5b21b6',
                    }}
                  >
                    FINAL PERIOD (40%)
                  </th>
                  <th
                    rowSpan={2}
                    style={{
                      background: '#b45309',
                      color: '#ffffff',
                      textAlign: 'center',
                      padding: '0.55rem',
                      fontWeight: 800,
                      border: '1px solid #92400e',
                    }}
                  >
                    Overall Avg
                  </th>
                  <th
                    rowSpan={2}
                    style={{
                      background: '#0f172a',
                      color: '#ffffff',
                      textAlign: 'center',
                      padding: '0.55rem',
                      fontWeight: 800,
                      border: '1px solid #334155',
                    }}
                  >
                    Status
                  </th>
                </tr>
                <tr style={{ background: '#f8fafc', fontSize: '0.74rem' }}>
                  {/* Prelim subheaders */}
                  <th style={{ textAlign: 'center', padding: '0.45rem 0.25rem', border: '1px solid #cbd5e1', color: '#1e40af' }}>Attendance</th>
                  <th style={{ textAlign: 'center', padding: '0.45rem 0.25rem', border: '1px solid #cbd5e1', color: '#1e40af' }}>Quiz</th>
                  <th style={{ textAlign: 'center', padding: '0.45rem 0.25rem', border: '1px solid #cbd5e1', color: '#1e40af' }}>Lab Activity</th>
                  <th style={{ textAlign: 'center', padding: '0.45rem 0.25rem', border: '1px solid #cbd5e1', color: '#1e40af' }}>Activity</th>
                  <th style={{ textAlign: 'center', padding: '0.45rem 0.25rem', border: '1px solid #cbd5e1', color: '#1e40af' }}>Exam</th>
                  <th style={{ textAlign: 'center', padding: '0.45rem 0.35rem', border: '1px solid #cbd5e1', background: '#dbeafe', color: '#1e3a8a', fontWeight: 800 }}>Prelim</th>

                  {/* Midterm subheaders */}
                  <th style={{ textAlign: 'center', padding: '0.45rem 0.25rem', border: '1px solid #cbd5e1', color: '#065f46' }}>Attendance</th>
                  <th style={{ textAlign: 'center', padding: '0.45rem 0.25rem', border: '1px solid #cbd5e1', color: '#065f46' }}>Quiz</th>
                  <th style={{ textAlign: 'center', padding: '0.45rem 0.25rem', border: '1px solid #cbd5e1', color: '#065f46' }}>Lab Activity</th>
                  <th style={{ textAlign: 'center', padding: '0.45rem 0.25rem', border: '1px solid #cbd5e1', color: '#065f46' }}>Activity</th>
                  <th style={{ textAlign: 'center', padding: '0.45rem 0.25rem', border: '1px solid #cbd5e1', color: '#065f46' }}>Exam</th>
                  <th style={{ textAlign: 'center', padding: '0.45rem 0.35rem', border: '1px solid #cbd5e1', background: '#d1fae5', color: '#065f46', fontWeight: 800 }}>Midterm</th>

                  {/* Final subheaders */}
                  <th style={{ textAlign: 'center', padding: '0.45rem 0.25rem', border: '1px solid #cbd5e1', color: '#5b21b6' }}>Attendance</th>
                  <th style={{ textAlign: 'center', padding: '0.45rem 0.25rem', border: '1px solid #cbd5e1', color: '#5b21b6' }}>Quiz</th>
                  <th style={{ textAlign: 'center', padding: '0.45rem 0.25rem', border: '1px solid #cbd5e1', color: '#5b21b6' }}>Lab Activity</th>
                  <th style={{ textAlign: 'center', padding: '0.45rem 0.25rem', border: '1px solid #cbd5e1', color: '#5b21b6' }}>Activity</th>
                  <th style={{ textAlign: 'center', padding: '0.45rem 0.25rem', border: '1px solid #cbd5e1', color: '#5b21b6' }}>Exam</th>
                  <th style={{ textAlign: 'center', padding: '0.45rem 0.35rem', border: '1px solid #cbd5e1', background: '#ede9fe', color: '#5b21b6', fontWeight: 800 }}>Final</th>
                </tr>
              </thead>
              <tbody>
                {filteredDetailedSheet.map((item) => {
                  const p: DetailedTermScores = ensureTermScores(item.prelim, 82, hasLaboratory)
                  const m: DetailedTermScores = ensureTermScores(item.midterm, 83, hasLaboratory)
                  const f: DetailedTermScores = ensureTermScores(item.final, 85, hasLaboratory)

                  return (
                    <tr key={item.studentId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.65rem 0.8rem', borderRight: '1px solid #cbd5e1' }}>
                        <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.88rem' }}>
                          {item.studentName || 'Student'}
                        </strong>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {item.studentNo || 'Enrolled'}
                        </span>
                      </td>

                      {/* PRELIM INPUTS */}
                      <td style={{ textAlign: 'center', padding: '0.35rem 0.2rem' }}>
                        {renderScoreInput(item.studentId, 'prelim', 'attendance', p.attendance, '#93c5fd', true)}
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.35rem 0.2rem' }}>
                        {renderScoreInput(item.studentId, 'prelim', 'quiz', p.quiz, '#93c5fd', true)}
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.35rem 0.2rem' }}>
                        {renderScoreInput(item.studentId, 'prelim', 'labActivity', p.labActivity ?? 0, '#93c5fd', true)}
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.35rem 0.2rem' }}>
                        {renderScoreInput(item.studentId, 'prelim', 'activity', p.activity, '#93c5fd', true)}
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.35rem 0.2rem' }}>
                        {renderScoreInput(item.studentId, 'prelim', 'exam', p.exam, '#93c5fd', true)}
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          fontWeight: 800,
                          color: '#1e3a8a',
                          background: '#eff6ff',
                          borderRight: '2px solid #93c5fd',
                          padding: '0.35rem 0.4rem',
                        }}
                      >
                        {p.computedTermGrade.toFixed(1)}%
                      </td>

                      {/* MIDTERM INPUTS */}
                      <td style={{ textAlign: 'center', padding: '0.35rem 0.2rem' }}>
                        {renderScoreInput(item.studentId, 'midterm', 'attendance', m.attendance, '#6ee7b7', true)}
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.35rem 0.2rem' }}>
                        {renderScoreInput(item.studentId, 'midterm', 'quiz', m.quiz, '#6ee7b7', true)}
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.35rem 0.2rem' }}>
                        {renderScoreInput(item.studentId, 'midterm', 'labActivity', m.labActivity ?? 0, '#6ee7b7', true)}
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.35rem 0.2rem' }}>
                        {renderScoreInput(item.studentId, 'midterm', 'activity', m.activity, '#6ee7b7', true)}
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.35rem 0.2rem' }}>
                        {renderScoreInput(item.studentId, 'midterm', 'exam', m.exam, '#6ee7b7', true)}
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          fontWeight: 800,
                          color: '#065f46',
                          background: '#ecfdf5',
                          borderRight: '2px solid #6ee7b7',
                          padding: '0.35rem 0.4rem',
                        }}
                      >
                        {m.computedTermGrade.toFixed(1)}%
                      </td>

                      {/* FINAL INPUTS */}
                      <td style={{ textAlign: 'center', padding: '0.35rem 0.2rem' }}>
                        {renderScoreInput(item.studentId, 'final', 'attendance', f.attendance, '#c4b5fd', true)}
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.35rem 0.2rem' }}>
                        {renderScoreInput(item.studentId, 'final', 'quiz', f.quiz, '#c4b5fd', true)}
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.35rem 0.2rem' }}>
                        {renderScoreInput(item.studentId, 'final', 'labActivity', f.labActivity ?? 0, '#c4b5fd', true)}
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.35rem 0.2rem' }}>
                        {renderScoreInput(item.studentId, 'final', 'activity', f.activity, '#c4b5fd', true)}
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.35rem 0.2rem' }}>
                        {renderScoreInput(item.studentId, 'final', 'exam', f.exam, '#c4b5fd', true)}
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          fontWeight: 800,
                          color: '#5b21b6',
                          background: '#f5f3ff',
                          borderRight: '2px solid #c4b5fd',
                          padding: '0.35rem 0.4rem',
                        }}
                      >
                        {f.computedTermGrade.toFixed(1)}%
                      </td>

                      {/* OVERALL AVERAGE */}
                      <td
                        style={{
                          textAlign: 'center',
                          fontWeight: 900,
                          fontSize: '0.95rem',
                          color: '#92400e',
                          background: '#fef3c7',
                          padding: '0.35rem 0.5rem',
                        }}
                      >
                        {item.average ? item.average.toFixed(1) : '0.0'}%
                      </td>

                      {/* STATUS */}
                      <td style={{ textAlign: 'center', padding: '0.35rem 0.4rem' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '999px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background:
                              item.status === 'Bound to Fail'
                                ? '#fee2e2'
                                : item.status === 'At Risk'
                                ? '#ffedd5'
                                : '#dcfce7',
                            color:
                              item.status === 'Bound to Fail'
                                ? '#991b1b'
                                : item.status === 'At Risk'
                                ? '#9a3412'
                                : '#166534',
                          }}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 2. SINGLE PERIOD FOCUSED INPUT VIEW (Prelim, Midterm, or Final) */}
      {(activePeriodTab === 'prelim' || activePeriodTab === 'midterm' || activePeriodTab === 'final') && (
        <section
          style={{
            padding: '1.6rem',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
          }}
        >
          {(() => {
            const cfg = periodConfig[activePeriodTab]
            return (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.2rem',
                    flexWrap: 'wrap',
                    gap: '0.8rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          background: cfg.bg,
                          color: cfg.color,
                          border: `1px solid ${cfg.border}`,
                          padding: '0.2rem 0.65rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                        }}
                      >
                        {cfg.title} ({cfg.weightLabel})
                      </span>
                    </div>
                    <h4 style={{ margin: '0.4rem 0 0 0', fontSize: '1.18rem', color: '#0f172a', fontWeight: 800 }}>
                      {cfg.title} Score Encoding — Attendance, Quiz, Lab Activity, Activity & {cfg.examLabel}
                    </h4>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: cfg.bg,
                      border: `1px solid ${cfg.border}`,
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      color: cfg.color,
                      fontSize: '0.82rem',
                      fontWeight: 700,
                    }}
                  >
                    <Info size={15} /> Input raw scores (0–100) for {cfg.title}
                  </div>
                </div>

                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <table style={{ borderCollapse: 'separate', borderSpacing: 0, margin: 0, width: '100%' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ borderBottom: '2px solid #cbd5e1', minWidth: '180px', color: '#0f172a', fontWeight: 800 }}>
                          Student Name
                        </th>
                        <th style={{ borderBottom: `2px solid ${cfg.color}`, color: cfg.color, textAlign: 'center', fontWeight: 700 }}>
                          Attendance (10%)
                        </th>
                        <th style={{ borderBottom: `2px solid ${cfg.color}`, color: cfg.color, textAlign: 'center', fontWeight: 700 }}>
                          Quiz (20%)
                        </th>
                        <th style={{ borderBottom: `2px solid ${cfg.color}`, color: cfg.color, textAlign: 'center', fontWeight: 700 }}>
                          Lab Activity (20%)
                        </th>
                        <th style={{ borderBottom: `2px solid ${cfg.color}`, color: cfg.color, textAlign: 'center', fontWeight: 700 }}>
                          Activity (10%)
                        </th>
                        <th style={{ borderBottom: `2px solid ${cfg.color}`, color: cfg.color, textAlign: 'center', fontWeight: 700 }}>
                          {cfg.examLabel} (40%)
                        </th>
                        <th
                          style={{
                            borderBottom: `2px solid ${cfg.color}`,
                            color: cfg.color,
                            background: cfg.bg,
                            textAlign: 'center',
                            fontWeight: 800,
                          }}
                        >
                          {cfg.title} Grade
                        </th>
                        <th
                          style={{
                            borderBottom: '2px solid #d97706',
                            color: '#b45309',
                            textAlign: 'center',
                            background: '#fef3c7',
                            fontWeight: 800,
                          }}
                        >
                          Overall Subject Avg
                        </th>
                        <th style={{ borderBottom: '2px solid #cbd5e1', color: '#334155', textAlign: 'center', fontWeight: 700 }}>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDetailedSheet.map((item) => {
                        const termScores = ensureTermScores(
                          item[activePeriodTab],
                          82,
                          hasLaboratory,
                        )
                        return (
                          <tr key={item.studentId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.96rem' }}>
                                {item.studentName || 'Student'}
                              </strong>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {item.studentNo || 'Enrolled Student'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                              {renderScoreInput(item.studentId, activePeriodTab, 'attendance', termScores.attendance, cfg.border)}
                            </td>
                            <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                              {renderScoreInput(item.studentId, activePeriodTab, 'quiz', termScores.quiz, cfg.border)}
                            </td>
                            <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                              {renderScoreInput(
                                item.studentId,
                                activePeriodTab,
                                'labActivity',
                                termScores.labActivity ?? 0,
                                cfg.border,
                              )}
                            </td>
                            <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                              {renderScoreInput(item.studentId, activePeriodTab, 'activity', termScores.activity, cfg.border)}
                            </td>
                            <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                              {renderScoreInput(item.studentId, activePeriodTab, 'exam', termScores.exam, cfg.border)}
                            </td>
                            <td
                              style={{
                                textAlign: 'center',
                                fontWeight: 900,
                                fontSize: '1.05rem',
                                color: cfg.color,
                                background: cfg.bg,
                              }}
                            >
                              {termScores.computedTermGrade.toFixed(1)}%
                            </td>
                            <td
                              style={{
                                textAlign: 'center',
                                fontWeight: 900,
                                fontSize: '1.05rem',
                                color: '#92400e',
                                background: '#fef3c7',
                              }}
                            >
                              {item.average ? item.average.toFixed(1) : '0.0'}%
                            </td>
                            <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '0.25rem 0.65rem',
                                  borderRadius: '999px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  background:
                                    item.status === 'Bound to Fail'
                                      ? '#fee2e2'
                                      : item.status === 'At Risk'
                                      ? '#ffedd5'
                                      : '#dcfce7',
                                  color:
                                    item.status === 'Bound to Fail'
                                      ? '#991b1b'
                                      : item.status === 'At Risk'
                                      ? '#9a3412'
                                      : '#166534',
                                }}
                              >
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )
          })()}
        </section>
      )}

      {/* 3. TERM SUMMARY VIEW WITH COMPONENT SCORES VISIBLE */}
      {activePeriodTab === 'summary' && (
        <section
          style={{
            padding: '1.6rem',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
          }}
        >
          <h4 style={{ margin: '0 0 1.2rem 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: 800 }}>
            Term Grades Summary with Component Score Breakdown
          </h4>

          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <table style={{ margin: 0, width: '100%' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ color: '#0f172a', fontWeight: 700 }}>Student Name</th>
                  <th style={{ color: '#1d4ed8', fontWeight: 700 }}>Prelim (Att / Quiz / Lab / Act / Exam)</th>
                  <th style={{ color: '#047857', fontWeight: 700 }}>Midterm (Att / Quiz / Lab / Act / Exam)</th>
                  <th style={{ color: '#6d28d9', fontWeight: 700 }}>Final (Att / Quiz / Lab / Act / Exam)</th>
                  <th style={{ color: '#0f172a', fontWeight: 700 }}>Overall Average</th>
                  <th style={{ color: '#0f172a', fontWeight: 700 }}>GPA Equiv</th>
                  <th style={{ color: '#0f172a', fontWeight: 700 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSummaryGradebook.map((item) => {
                  const isRisk =
                    item.computed.status === 'Bound to Fail' || item.computed.status === 'At Risk'
                  const p = ensureTermScores(item.row.prelim, item.computed.preliminary, hasLaboratory)
                  const m = ensureTermScores(item.row.midterm, item.computed.midterm, hasLaboratory)
                  const f = ensureTermScores(item.row.final, item.computed.final, hasLaboratory)

                  return (
                    <tr key={item.row.studentId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <strong style={{ color: '#0f172a', display: 'block' }}>
                          {item.student?.name || 'Student'}
                        </strong>
                        <small style={{ color: '#64748b' }}>
                          {item.student?.student_no || 'Enrolled Student'}
                        </small>
                      </td>
                      <td>
                        <strong style={{ color: '#1d4ed8', fontSize: '0.95rem', display: 'block' }}>
                          {p.computedTermGrade.toFixed(1)}%
                        </strong>
                        <small style={{ color: '#475569', fontSize: '0.74rem' }}>
                          Att:{p.attendance} • Qz:{p.quiz} • Lab:{p.labActivity ?? 'N/A'} • Act:{p.activity} • Ex:{p.exam}
                        </small>
                      </td>
                      <td>
                        <strong style={{ color: '#047857', fontSize: '0.95rem', display: 'block' }}>
                          {m.computedTermGrade.toFixed(1)}%
                        </strong>
                        <small style={{ color: '#475569', fontSize: '0.74rem' }}>
                          Att:{m.attendance} • Qz:{m.quiz} • Lab:{m.labActivity ?? 'N/A'} • Act:{m.activity} • Ex:{m.exam}
                        </small>
                      </td>
                      <td>
                        <strong style={{ color: '#6d28d9', fontSize: '0.95rem', display: 'block' }}>
                          {f.computedTermGrade.toFixed(1)}%
                        </strong>
                        <small style={{ color: '#475569', fontSize: '0.74rem' }}>
                          Att:{f.attendance} • Qz:{f.quiz} • Lab:{f.labActivity ?? 'N/A'} • Act:{f.activity} • Ex:{f.exam}
                        </small>
                      </td>
                      <td>
                        <strong style={{ fontSize: '1.05rem', color: '#1d4ed8', fontWeight: 800 }}>
                          {item.computed.overall}%
                        </strong>
                      </td>
                      <td>
                        <span
                          style={{
                            background: '#f1f5f9',
                            color: '#334155',
                            border: '1px solid #e2e8f0',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                          }}
                        >
                          {item.computed.gpaEquiv}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: '999px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            background: isRisk ? '#fee2e2' : '#dcfce7',
                            color: isRisk ? '#991b1b' : '#166534',
                          }}
                        >
                          {item.computed.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Class Statistics Footer */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <div style={{ background: '#ffffff', padding: '1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            Class Batch Average
          </span>
          <h3 style={{ margin: '0.4rem 0 0 0', color: '#1e3a8a', fontSize: '1.5rem', fontWeight: 800 }}>
            {selectedClassAverages.overallAvg}%
          </h3>
        </div>
        <div style={{ background: '#ffffff', padding: '1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            GPA Equivalent
          </span>
          <h3 style={{ margin: '0.4rem 0 0 0', color: '#047857', fontSize: '1.5rem', fontWeight: 800 }}>
            {selectedClassAverages.gpaAvg}
          </h3>
        </div>
        <div style={{ background: '#ffffff', padding: '1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Enrolled
          </span>
          <h3 style={{ margin: '0.4rem 0 0 0', color: '#0f172a', fontSize: '1.5rem', fontWeight: 800 }}>
            {filteredDetailedSheet.length} Students
          </h3>
        </div>
        <div style={{ background: '#ffffff', padding: '1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            Passing / Safe Count
          </span>
          <h3 style={{ margin: '0.4rem 0 0 0', color: '#16a34a', fontSize: '1.5rem', fontWeight: 800 }}>
            {selectedClassAverages.safeCount} Students
          </h3>
        </div>
      </section>
    </div>
  )
}
