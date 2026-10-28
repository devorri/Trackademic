import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import { clampScore, getSubjectTitle, ensureTermScores } from '../../utils/helpers'
import { Save, CheckCircle, Printer, FlaskConical, BookOpen, Layers, Plus, Minus } from 'lucide-react'
import type { GradingPeriodKey, TermComponentField } from '../../utils/types'

export const Gradebook: React.FC = () => {
  const {
    classes,
    subjects,
    selectedClass,
    setSelectedClassId,
    detailedGradingSheets,
    updateComponentItemScore,
    addComponentColumn,
    removeComponentColumn,
    printClassGradeReport,
    addNotification,
    addActivityLog,
  } = useData()

  const [saveSuccess, setSaveSuccess] = useState(false)
  // Default to Prelim Record Book so the Instructor immediately sees individual Quizzes, Activities, Labs, Attendance & Exams
  const [activePeriodTab, setActivePeriodTab] = useState<GradingPeriodKey | 'ALL' | 'SUMMARY'>('prelim')

  const currentSubject = subjects.find((s) => s.id === selectedClass?.subject_id)
  const hasLab = currentSubject?.has_laboratory ?? selectedClass?.subject?.has_laboratory ?? false

  const classSheet = selectedClass ? detailedGradingSheets[selectedClass.id] ?? [] : []

  // Determine how many items exist in each category for the active period
  const activePeriodKey: GradingPeriodKey =
    activePeriodTab === 'midterm' ? 'midterm' : activePeriodTab === 'final' ? 'final' : 'prelim'

  const sampleTerm =
    classSheet.length > 0
      ? ensureTermScores(
          activePeriodKey === 'prelim'
            ? classSheet[0].prelim
            : activePeriodKey === 'midterm'
            ? classSheet[0].midterm
            : classSheet[0].final,
          82,
          hasLab,
        )
      : ensureTermScores(undefined, 82, hasLab)

  const attCount = Math.max(1, sampleTerm.items?.attendance?.length || 2)
  const quizCount = Math.max(1, sampleTerm.items?.quiz?.length || 3)
  const labCount = hasLab ? Math.max(1, sampleTerm.items?.labActivity?.length || 2) : 1
  const actCount = Math.max(1, sampleTerm.items?.activity?.length || 2)
  const examCount = Math.max(1, sampleTerm.items?.exam?.length || 1)

  function handleManualSave() {
    setSaveSuccess(true)
    addActivityLog(
      'Instructor',
      `Saved itemized Class Record Book (Quizzes, Activities, Lab, Attendance, Exam) for ${
        selectedClass ? getSubjectTitle(subjects, selectedClass.subject_id) : 'Class'
      }`,
      'Gradebook',
    )
    addNotification({
      title: 'Class Record Book saved',
      message:
        'All individual quiz, activity, lab, attendance, and exam scores have been averaged and synced.',
      role: 'instructor',
      category: 'grades',
    })
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const periodColors: Record<
    GradingPeriodKey,
    { headerBg: string; subHeaderBg: string; avgBg: string; accent: string; label: string; weight: string }
  > = {
    prelim: {
      headerBg: '#1e3a8a',
      subHeaderBg: '#1d4ed8',
      avgBg: '#eff6ff',
      accent: '#1e40af',
      label: 'PRELIMINARY PERIOD',
      weight: '30%',
    },
    midterm: {
      headerBg: '#4c1d95',
      subHeaderBg: '#6d28d9',
      avgBg: '#f5f3ff',
      accent: '#5b21b6',
      label: 'MIDTERM PERIOD',
      weight: '30%',
    },
    final: {
      headerBg: '#065f46',
      subHeaderBg: '#059669',
      avgBg: '#ecfdf5',
      accent: '#047857',
      label: 'FINAL PERIOD',
      weight: '40%',
    },
  }

  const currentTheme = periodColors[activePeriodKey]

  const renderCategoryHeaderControls = (field: TermComponentField, count: number, label: string) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
      <span>{label}</span>
      {selectedClass && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
          <button
            type="button"
            title={`Add another ${label} column`}
            onClick={() => addComponentColumn(selectedClass.id, activePeriodKey, field)}
            style={{
              background: 'rgba(255,255,255,0.22)',
              border: '1px solid rgba(255,255,255,0.45)',
              color: '#ffffff',
              borderRadius: '4px',
              padding: '0.1rem 0.35rem',
              fontSize: '0.7rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.15rem',
            }}
          >
            <Plus size={11} /> Add
          </button>
          {count > 1 && (
            <button
              type="button"
              title={`Remove last ${label} column`}
              onClick={() => removeComponentColumn(selectedClass.id, activePeriodKey, field)}
              style={{
                background: 'rgba(239,68,68,0.35)',
                border: '1px solid rgba(255,255,255,0.4)',
                color: '#ffffff',
                borderRadius: '4px',
                padding: '0.1rem 0.3rem',
                fontSize: '0.7rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <Minus size={11} />
            </button>
          )}
        </span>
      )}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
      {/* Top Banner & Controls */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
          borderRadius: '16px',
          padding: '1.5rem 2rem',
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
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#1d4ed8',
                background: '#eff6ff',
                border: '1px solid #dbeafe',
                padding: '0.25rem 0.65rem',
                borderRadius: '999px',
              }}
            >
              Instructor Class Record Book
            </span>

            {hasLab ? (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#6b21a8',
                  background: '#faf5ff',
                  border: '1px solid #e9d5ff',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <FlaskConical size={13} /> With Laboratory (Att 10% • Quiz 20% • Lab 20% • Act 10% • Exam 40%)
              </span>
            ) : (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#475569',
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <BookOpen size={13} /> Lecture-Only (Att 10% • Quiz 25% • Act 25% • Exam 40% • Lab: N/A)
              </span>
            )}
          </div>

          <h3 style={{ margin: '0.5rem 0 0.2rem 0', fontSize: '1.5rem', color: '#0f172a', fontWeight: 800 }}>
            {selectedClass ? getSubjectTitle(subjects, selectedClass.subject_id) : 'Select a Class'} —{' '}
            {selectedClass?.section?.name || 'CIT A'}
          </h3>
          <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>
            Encode individual <strong>Quizzes (Q1, Q2, Q3...)</strong>, <strong>Activities</strong>,{' '}
            <strong>Lab Activities</strong>, <strong>Attendance</strong>, and <strong>Exams</strong> per period. Category averages & term grades compute automatically!
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={selectedClass?.id ?? ''}
            onChange={(event) => setSelectedClassId(event.target.value)}
            aria-label="Select class for gradebook"
            style={{
              minWidth: '250px',
              background: '#f8fafc',
              color: '#0f172a',
              border: '1.5px solid #cbd5e1',
              borderRadius: '10px',
              padding: '0.65rem 1rem',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
          >
            {classes.map((classItem) => {
              const sub = subjects.find((s) => s.id === classItem.subject_id)
              return (
                <option key={classItem.id} value={classItem.id}>
                  {sub?.code} - {getSubjectTitle(subjects, classItem.subject_id)} ({classItem.section?.name || 'CIT A'})
                </option>
              )
            })}
          </select>

          <button
            type="button"
            onClick={() => printClassGradeReport(selectedClass?.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.65rem 1.2rem',
              borderRadius: '10px',
              fontWeight: 800,
              background: '#f8fafc',
              color: '#1e3a8a',
              border: '1.5px solid #cbd5e1',
              cursor: 'pointer',
            }}
          >
            <Printer size={16} /> Print Class Record PDF
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={handleManualSave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.65rem 1.3rem',
              borderRadius: '10px',
              fontWeight: 800,
              background: saveSuccess ? '#16a34a' : '#2563eb',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
            }}
          >
            {saveSuccess ? <CheckCircle size={16} /> : <Save size={16} />}
            {saveSuccess ? 'Grades Saved!' : 'Save Record Book'}
          </button>
        </div>
      </div>

      {/* Period Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.6rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          background: '#ffffff',
          padding: '0.85rem 1.25rem',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
        }}
      >
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            marginRight: '0.4rem',
          }}
        >
          <Layers size={15} color="#2563eb" /> Grading Period Record Book:
        </span>
        {[
          { key: 'prelim', label: 'Prelim Record Book (30%)', color: '#1d4ed8', bg: '#eff6ff' },
          { key: 'midterm', label: 'Midterm Record Book (30%)', color: '#7c3aed', bg: '#f5f3ff' },
          { key: 'final', label: 'Final Record Book (40%)', color: '#047857', bg: '#ecfdf5' },
          { key: 'ALL', label: 'All Periods Category Summary', color: '#1e3a8a', bg: '#eff6ff' },
          { key: 'SUMMARY', label: 'Term Grades Overview', color: '#b45309', bg: '#fffbeb' },
        ].map((tab) => {
          const isActive = activePeriodTab === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActivePeriodTab(tab.key as any)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                border: isActive ? `2px solid ${tab.color}` : '1px solid #cbd5e1',
                background: isActive ? tab.bg : '#ffffff',
                color: isActive ? tab.color : '#475569',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Main Gradebook Table */}
      <section
        style={{
          padding: '1.5rem 1.8rem',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
        }}
      >
        {/* Record Book Explanation Banner when in Prelim / Midterm / Final Record Book */}
        {(activePeriodTab === 'prelim' || activePeriodTab === 'midterm' || activePeriodTab === 'final') && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.85rem 1.1rem',
              borderRadius: '12px',
              background: currentTheme.avgBg,
              border: `1px solid ${currentTheme.subHeaderBg}33`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ fontSize: '0.85rem', color: '#1e293b' }}>
              <strong style={{ color: currentTheme.accent }}>
                {currentTheme.label} RECORD BOOK ({currentTheme.weight} of Final Grade):
              </strong>{' '}
              Input all individual scores (e.g., <strong>Q1, Q2, Q3...</strong>) — the system automatically computes each category’s{' '}
              <strong>Avg</strong> and the <strong>{activePeriodKey.toUpperCase()} Term Grade</strong>. Use{' '}
              <strong>+ Add</strong> / <strong>-</strong> in any category header to add or remove assessment items.
            </div>
          </div>
        )}

        <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '12px' }}>
          {/* CASE 1: ITEMIZED RECORD BOOK FOR PRELIM, MIDTERM, OR FINAL */}
          {(activePeriodTab === 'prelim' || activePeriodTab === 'midterm' || activePeriodTab === 'final') && (
            <table style={{ margin: 0, width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                {/* Category Group Header Row */}
                <tr style={{ background: currentTheme.headerBg, color: '#ffffff' }}>
                  <th
                    rowSpan={2}
                    style={{
                      color: '#ffffff',
                      fontWeight: 800,
                      padding: '0.75rem',
                      textAlign: 'left',
                      minWidth: '175px',
                      border: '1px solid #334155',
                      position: 'sticky',
                      left: 0,
                      background: currentTheme.headerBg,
                      zIndex: 2,
                    }}
                  >
                    Student Name & ID
                  </th>

                  {/* Attendance Group */}
                  <th
                    colSpan={attCount + 1}
                    style={{
                      color: '#ffffff',
                      fontWeight: 800,
                      padding: '0.55rem',
                      textAlign: 'center',
                      background: '#0f172a',
                      border: '1px solid #334155',
                    }}
                  >
                    {renderCategoryHeaderControls('attendance', attCount, 'ATTENDANCE (10%)')}
                  </th>

                  {/* Quizzes Group */}
                  <th
                    colSpan={quizCount + 1}
                    style={{
                      color: '#ffffff',
                      fontWeight: 800,
                      padding: '0.55rem',
                      textAlign: 'center',
                      background: currentTheme.headerBg,
                      border: '1px solid #334155',
                    }}
                  >
                    {renderCategoryHeaderControls('quiz', quizCount, `QUIZZES (${hasLab ? '20%' : '25%'})`)}
                  </th>

                  {/* Lab Activities Group */}
                  <th
                    colSpan={hasLab ? labCount + 1 : 1}
                    style={{
                      color: '#ffffff',
                      fontWeight: 800,
                      padding: '0.55rem',
                      textAlign: 'center',
                      background: '#581c87',
                      border: '1px solid #334155',
                    }}
                  >
                    {hasLab
                      ? renderCategoryHeaderControls('labActivity', labCount, 'LAB ACTIVITIES (20%)')
                      : 'LAB ACTIVITY (N/A)'}
                  </th>

                  {/* Activities Group */}
                  <th
                    colSpan={actCount + 1}
                    style={{
                      color: '#ffffff',
                      fontWeight: 800,
                      padding: '0.55rem',
                      textAlign: 'center',
                      background: '#0f766e',
                      border: '1px solid #334155',
                    }}
                  >
                    {renderCategoryHeaderControls('activity', actCount, `ACTIVITIES (${hasLab ? '10%' : '25%'})`)}
                  </th>

                  {/* Exam Group */}
                  <th
                    colSpan={examCount + 1}
                    style={{
                      color: '#ffffff',
                      fontWeight: 800,
                      padding: '0.55rem',
                      textAlign: 'center',
                      background: '#9a3412',
                      border: '1px solid #334155',
                    }}
                  >
                    {renderCategoryHeaderControls('exam', examCount, 'EXAM (40%)')}
                  </th>

                  {/* Computed Term Grade & Overall */}
                  <th
                    rowSpan={2}
                    style={{
                      color: '#ffffff',
                      fontWeight: 900,
                      padding: '0.65rem',
                      textAlign: 'center',
                      background: currentTheme.subHeaderBg,
                      border: '1px solid #334155',
                      minWidth: '88px',
                    }}
                  >
                    {activePeriodKey.toUpperCase()} GRADE
                  </th>
                  <th
                    rowSpan={2}
                    style={{
                      color: '#ffffff',
                      fontWeight: 900,
                      padding: '0.65rem',
                      textAlign: 'center',
                      background: '#0f766e',
                      border: '1px solid #334155',
                      minWidth: '88px',
                    }}
                  >
                    OVERALL AVG
                  </th>
                  <th
                    rowSpan={2}
                    style={{
                      color: '#ffffff',
                      fontWeight: 800,
                      padding: '0.65rem',
                      textAlign: 'center',
                      background: '#0f172a',
                      border: '1px solid #334155',
                      minWidth: '90px',
                    }}
                  >
                    STATUS
                  </th>
                </tr>

                {/* Individual Item Columns Sub-Header Row */}
                <tr style={{ background: '#1e293b', color: '#ffffff' }}>
                  {/* Attendance Items + Avg */}
                  {Array.from({ length: attCount }).map((_, idx) => (
                    <th key={`att-h-${idx}`} style={{ color: '#e2e8f0', fontWeight: 700, padding: '0.45rem', textAlign: 'center', border: '1px solid #334155' }}>
                      Att {idx + 1}
                    </th>
                  ))}
                  <th style={{ color: '#fde047', fontWeight: 900, padding: '0.45rem', textAlign: 'center', background: '#0f172a', border: '1px solid #334155' }}>
                    Att Avg
                  </th>

                  {/* Quiz Items + Avg */}
                  {Array.from({ length: quizCount }).map((_, idx) => (
                    <th key={`qz-h-${idx}`} style={{ color: '#e2e8f0', fontWeight: 700, padding: '0.45rem', textAlign: 'center', border: '1px solid #334155' }}>
                      Q{idx + 1}
                    </th>
                  ))}
                  <th style={{ color: '#fde047', fontWeight: 900, padding: '0.45rem', textAlign: 'center', background: currentTheme.headerBg, border: '1px solid #334155' }}>
                    Quiz Avg
                  </th>

                  {/* Lab Items + Avg */}
                  {hasLab ? (
                    <>
                      {Array.from({ length: labCount }).map((_, idx) => (
                        <th key={`lab-h-${idx}`} style={{ color: '#e2e8f0', fontWeight: 700, padding: '0.45rem', textAlign: 'center', border: '1px solid #334155' }}>
                          Lab {idx + 1}
                        </th>
                      ))}
                      <th style={{ color: '#fde047', fontWeight: 900, padding: '0.45rem', textAlign: 'center', background: '#581c87', border: '1px solid #334155' }}>
                        Lab Avg
                      </th>
                    </>
                  ) : (
                    <th style={{ color: '#94a3b8', fontWeight: 700, padding: '0.45rem', textAlign: 'center', border: '1px solid #334155' }}>
                      Lab
                    </th>
                  )}

                  {/* Activity Items + Avg */}
                  {Array.from({ length: actCount }).map((_, idx) => (
                    <th key={`act-h-${idx}`} style={{ color: '#e2e8f0', fontWeight: 700, padding: '0.45rem', textAlign: 'center', border: '1px solid #334155' }}>
                      Act {idx + 1}
                    </th>
                  ))}
                  <th style={{ color: '#fde047', fontWeight: 900, padding: '0.45rem', textAlign: 'center', background: '#0f766e', border: '1px solid #334155' }}>
                    Act Avg
                  </th>

                  {/* Exam Items + Avg */}
                  {Array.from({ length: examCount }).map((_, idx) => (
                    <th key={`ex-h-${idx}`} style={{ color: '#e2e8f0', fontWeight: 700, padding: '0.45rem', textAlign: 'center', border: '1px solid #334155' }}>
                      Exam {idx + 1}
                    </th>
                  ))}
                  <th style={{ color: '#fde047', fontWeight: 900, padding: '0.45rem', textAlign: 'center', background: '#9a3412', border: '1px solid #334155' }}>
                    Exam Avg
                  </th>
                </tr>
              </thead>
              <tbody>
                {classSheet.map((row) => {
                  const isAtRisk = row.status === 'At Risk' || row.status === 'Bound to Fail'
                  const termData = ensureTermScores(
                    activePeriodKey === 'prelim'
                      ? row.prelim
                      : activePeriodKey === 'midterm'
                      ? row.midterm
                      : row.final,
                    82,
                    hasLab,
                  )
                  const items = termData.items!

                  const inputStyle: React.CSSProperties = {
                    width: '50px',
                    textAlign: 'center',
                    fontWeight: 700,
                    padding: '0.3rem 0.2rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: '0.8rem',
                  }

                  return (
                    <tr
                      key={row.studentId}
                      style={{
                        borderBottom: '1px solid #cbd5e1',
                        background: isAtRisk ? '#fff5f5' : '#ffffff',
                      }}
                    >
                      <td
                        style={{
                          padding: '0.65rem 0.75rem',
                          borderRight: '1px solid #cbd5e1',
                          position: 'sticky',
                          left: 0,
                          background: isAtRisk ? '#fff5f5' : '#ffffff',
                          zIndex: 1,
                        }}
                      >
                        <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.88rem' }}>{row.studentName}</strong>
                        <small style={{ color: '#64748b', fontSize: '0.73rem' }}>ID: {row.studentNo}</small>
                      </td>

                      {/* Attendance Item Inputs + Computed Average */}
                      {Array.from({ length: attCount }).map((_, idx) => (
                        <td key={`att-${idx}`} style={{ padding: '0.35rem', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={items.attendance[idx] ?? 85}
                            onChange={(e) =>
                              selectedClass &&
                              updateComponentItemScore(
                                selectedClass.id,
                                row.studentId,
                                activePeriodKey,
                                'attendance',
                                idx,
                                clampScore(e.target.value),
                              )
                            }
                            style={inputStyle}
                          />
                        </td>
                      ))}
                      <td
                        style={{
                          padding: '0.4rem 0.5rem',
                          textAlign: 'center',
                          fontWeight: 900,
                          background: '#f1f5f9',
                          color: '#0f172a',
                          borderRight: '2px solid #94a3b8',
                        }}
                        title={`Computed Average of ${attCount} Attendance record(s)`}
                      >
                        {termData.attendance.toFixed(1)}%
                      </td>

                      {/* Quiz Item Inputs + Computed Average */}
                      {Array.from({ length: quizCount }).map((_, idx) => (
                        <td key={`qz-${idx}`} style={{ padding: '0.35rem', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={items.quiz[idx] ?? 84}
                            onChange={(e) =>
                              selectedClass &&
                              updateComponentItemScore(
                                selectedClass.id,
                                row.studentId,
                                activePeriodKey,
                                'quiz',
                                idx,
                                clampScore(e.target.value),
                              )
                            }
                            style={inputStyle}
                          />
                        </td>
                      ))}
                      <td
                        style={{
                          padding: '0.4rem 0.5rem',
                          textAlign: 'center',
                          fontWeight: 900,
                          background: currentTheme.avgBg,
                          color: currentTheme.accent,
                          borderRight: '2px solid #94a3b8',
                        }}
                        title={`Computed Average of ${quizCount} Quiz(zes)`}
                      >
                        {termData.quiz.toFixed(1)}%
                      </td>

                      {/* Lab Activity Item Inputs + Computed Average */}
                      {hasLab ? (
                        <>
                          {Array.from({ length: labCount }).map((_, idx) => (
                            <td key={`lab-${idx}`} style={{ padding: '0.35rem', textAlign: 'center', borderRight: '1px solid #e2e8f0', background: '#faf5ff' }}>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={items.labActivity[idx] ?? 85}
                                onChange={(e) =>
                                  selectedClass &&
                                  updateComponentItemScore(
                                    selectedClass.id,
                                    row.studentId,
                                    activePeriodKey,
                                    'labActivity',
                                    idx,
                                    clampScore(e.target.value),
                                  )
                                }
                                style={{ ...inputStyle, border: '1px solid #d8b4fe', color: '#6b21a8' }}
                              />
                            </td>
                          ))}
                          <td
                            style={{
                              padding: '0.4rem 0.5rem',
                              textAlign: 'center',
                              fontWeight: 900,
                              background: '#f3e8ff',
                              color: '#6b21a8',
                              borderRight: '2px solid #94a3b8',
                            }}
                            title={`Computed Average of ${labCount} Lab Activity(ies)`}
                          >
                            {(termData.labActivity ?? 0).toFixed(1)}%
                          </td>
                        </>
                      ) : (
                        <td style={{ padding: '0.35rem', textAlign: 'center', borderRight: '2px solid #94a3b8' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.15rem 0.45rem',
                              background: '#e2e8f0',
                              color: '#64748b',
                              borderRadius: '4px',
                              fontWeight: 800,
                              fontSize: '0.72rem',
                            }}
                          >
                            N/A
                          </span>
                        </td>
                      )}

                      {/* Activity Item Inputs + Computed Average */}
                      {Array.from({ length: actCount }).map((_, idx) => (
                        <td key={`act-${idx}`} style={{ padding: '0.35rem', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={items.activity[idx] ?? 85}
                            onChange={(e) =>
                              selectedClass &&
                              updateComponentItemScore(
                                selectedClass.id,
                                row.studentId,
                                activePeriodKey,
                                'activity',
                                idx,
                                clampScore(e.target.value),
                              )
                            }
                            style={inputStyle}
                          />
                        </td>
                      ))}
                      <td
                        style={{
                          padding: '0.4rem 0.5rem',
                          textAlign: 'center',
                          fontWeight: 900,
                          background: '#f0fdfa',
                          color: '#0f766e',
                          borderRight: '2px solid #94a3b8',
                        }}
                        title={`Computed Average of ${actCount} Activity(ies)`}
                      >
                        {termData.activity.toFixed(1)}%
                      </td>

                      {/* Exam Item Inputs + Computed Average */}
                      {Array.from({ length: examCount }).map((_, idx) => (
                        <td key={`ex-${idx}`} style={{ padding: '0.35rem', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={items.exam[idx] ?? 82}
                            onChange={(e) =>
                              selectedClass &&
                              updateComponentItemScore(
                                selectedClass.id,
                                row.studentId,
                                activePeriodKey,
                                'exam',
                                idx,
                                clampScore(e.target.value),
                              )
                            }
                            style={inputStyle}
                          />
                        </td>
                      ))}
                      <td
                        style={{
                          padding: '0.4rem 0.5rem',
                          textAlign: 'center',
                          fontWeight: 900,
                          background: '#fff7ed',
                          color: '#9a3412',
                          borderRight: '2px solid #94a3b8',
                        }}
                        title={`Computed Average of ${examCount} Exam(s)`}
                      >
                        {termData.exam.toFixed(1)}%
                      </td>

                      {/* Computed Term Grade */}
                      <td
                        style={{
                          padding: '0.5rem',
                          textAlign: 'center',
                          fontWeight: 900,
                          fontSize: '0.96rem',
                          background: currentTheme.avgBg,
                          color: currentTheme.accent,
                          borderRight: '1px solid #cbd5e1',
                        }}
                      >
                        {termData.computedTermGrade.toFixed(1)}%
                      </td>

                      {/* Overall Average */}
                      <td
                        style={{
                          padding: '0.5rem',
                          textAlign: 'center',
                          fontWeight: 900,
                          fontSize: '0.96rem',
                          background: '#ecfdf5',
                          color: isAtRisk ? '#b91c1c' : '#065f46',
                          borderRight: '1px solid #cbd5e1',
                        }}
                      >
                        {row.average.toFixed(1)}%
                      </td>

                      {/* Status */}
                      <td style={{ textAlign: 'center', padding: '0.45rem' }}>
                        <span
                          style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: '999px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background: isAtRisk ? '#fee2e2' : '#dcfce7',
                            color: isAtRisk ? '#b91c1c' : '#15803d',
                            border: isAtRisk ? '1px solid #fecaca' : '1px solid #bbf7d0',
                          }}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          {/* CASE 2: ALL PERIODS CATEGORY SUMMARY OR TERM SUMMARY */}
          {(activePeriodTab === 'ALL' || activePeriodTab === 'SUMMARY') && (
            <table style={{ margin: 0, width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                {activePeriodTab === 'ALL' && (
                  <tr style={{ background: '#0f172a', color: '#ffffff' }}>
                    <th style={{ color: '#ffffff', fontWeight: 800, padding: '0.6rem 0.8rem', textAlign: 'left', border: '1px solid #334155' }}>
                      Student Information
                    </th>
                    <th
                      colSpan={6}
                      onClick={() => setActivePeriodTab('prelim')}
                      style={{ color: '#ffffff', fontWeight: 800, padding: '0.6rem', textAlign: 'center', background: '#1e3a8a', border: '1px solid #334155', cursor: 'pointer' }}
                    >
                      PRELIMINARY AVERAGES (Click to Open Record Book)
                    </th>
                    <th
                      colSpan={6}
                      onClick={() => setActivePeriodTab('midterm')}
                      style={{ color: '#ffffff', fontWeight: 800, padding: '0.6rem', textAlign: 'center', background: '#4c1d95', border: '1px solid #334155', cursor: 'pointer' }}
                    >
                      MIDTERM AVERAGES (Click to Open Record Book)
                    </th>
                    <th
                      colSpan={6}
                      onClick={() => setActivePeriodTab('final')}
                      style={{ color: '#ffffff', fontWeight: 800, padding: '0.6rem', textAlign: 'center', background: '#065f46', border: '1px solid #334155', cursor: 'pointer' }}
                    >
                      FINAL AVERAGES (Click to Open Record Book)
                    </th>
                    <th colSpan={2} style={{ color: '#ffffff', fontWeight: 800, padding: '0.6rem', textAlign: 'center', background: '#0f172a', border: '1px solid #334155' }}>
                      OVERALL STANDING
                    </th>
                  </tr>
                )}
                <tr style={{ background: '#1e3a8a', color: '#ffffff' }}>
                  <th style={{ color: '#ffffff', fontWeight: 800, padding: '0.7rem', textAlign: 'left', minWidth: '170px', border: '1px solid #1e3a8a' }}>
                    Student Name & ID
                  </th>
                  {activePeriodTab === 'ALL' && (
                    <>
                      {/* Prelim Averages */}
                      <th style={{ color: '#ffffff', fontWeight: 700, textAlign: 'center', padding: '0.5rem', background: '#1e40af', border: '1px solid #1e3a8a' }}>Att Avg</th>
                      <th style={{ color: '#ffffff', fontWeight: 700, textAlign: 'center', padding: '0.5rem', background: '#1e40af', border: '1px solid #1e3a8a' }}>Quiz Avg</th>
                      <th style={{ color: '#ffffff', fontWeight: 700, textAlign: 'center', padding: '0.5rem', background: '#1e40af', border: '1px solid #1e3a8a' }}>Lab Avg</th>
                      <th style={{ color: '#ffffff', fontWeight: 700, textAlign: 'center', padding: '0.5rem', background: '#1e40af', border: '1px solid #1e3a8a' }}>Act Avg</th>
                      <th style={{ color: '#ffffff', fontWeight: 700, textAlign: 'center', padding: '0.5rem', background: '#1e40af', border: '1px solid #1e3a8a' }}>Exam Avg</th>
                      <th style={{ color: '#ffffff', fontWeight: 800, textAlign: 'center', padding: '0.5rem', background: '#1d4ed8', border: '1px solid #1e3a8a' }}>Prelim</th>

                      {/* Midterm Averages */}
                      <th style={{ color: '#ffffff', fontWeight: 700, textAlign: 'center', padding: '0.5rem', background: '#5b21b6', border: '1px solid #4c1d95' }}>Att Avg</th>
                      <th style={{ color: '#ffffff', fontWeight: 700, textAlign: 'center', padding: '0.5rem', background: '#5b21b6', border: '1px solid #4c1d95' }}>Quiz Avg</th>
                      <th style={{ color: '#ffffff', fontWeight: 700, textAlign: 'center', padding: '0.5rem', background: '#5b21b6', border: '1px solid #4c1d95' }}>Lab Avg</th>
                      <th style={{ color: '#ffffff', fontWeight: 700, textAlign: 'center', padding: '0.5rem', background: '#5b21b6', border: '1px solid #4c1d95' }}>Act Avg</th>
                      <th style={{ color: '#ffffff', fontWeight: 700, textAlign: 'center', padding: '0.5rem', background: '#5b21b6', border: '1px solid #4c1d95' }}>Exam Avg</th>
                      <th style={{ color: '#ffffff', fontWeight: 800, textAlign: 'center', padding: '0.5rem', background: '#6d28d9', border: '1px solid #4c1d95' }}>Midterm</th>

                      {/* Final Averages */}
                      <th style={{ color: '#ffffff', fontWeight: 700, textAlign: 'center', padding: '0.5rem', background: '#047857', border: '1px solid #065f46' }}>Att Avg</th>
                      <th style={{ color: '#ffffff', fontWeight: 700, textAlign: 'center', padding: '0.5rem', background: '#047857', border: '1px solid #065f46' }}>Quiz Avg</th>
                      <th style={{ color: '#ffffff', fontWeight: 700, textAlign: 'center', padding: '0.5rem', background: '#047857', border: '1px solid #065f46' }}>Lab Avg</th>
                      <th style={{ color: '#ffffff', fontWeight: 700, textAlign: 'center', padding: '0.5rem', background: '#047857', border: '1px solid #065f46' }}>Act Avg</th>
                      <th style={{ color: '#ffffff', fontWeight: 700, textAlign: 'center', padding: '0.5rem', background: '#047857', border: '1px solid #065f46' }}>Exam Avg</th>
                      <th style={{ color: '#ffffff', fontWeight: 800, textAlign: 'center', padding: '0.5rem', background: '#059669', border: '1px solid #065f46' }}>Final</th>
                    </>
                  )}
                  {activePeriodTab === 'SUMMARY' && (
                    <>
                      <th style={{ color: '#ffffff', fontWeight: 800, textAlign: 'center', padding: '0.65rem', background: '#1d4ed8', border: '1px solid #1e3a8a' }}>Prelim Grade (30%)</th>
                      <th style={{ color: '#ffffff', fontWeight: 800, textAlign: 'center', padding: '0.65rem', background: '#6d28d9', border: '1px solid #4c1d95' }}>Midterm Grade (30%)</th>
                      <th style={{ color: '#ffffff', fontWeight: 800, textAlign: 'center', padding: '0.65rem', background: '#059669', border: '1px solid #065f46' }}>Final Grade (40%)</th>
                    </>
                  )}
                  <th style={{ color: '#ffffff', fontWeight: 800, textAlign: 'center', padding: '0.65rem', background: '#0f766e', border: '1px solid #1e3a8a' }}>
                    Overall Avg
                  </th>
                  <th style={{ color: '#ffffff', fontWeight: 800, textAlign: 'center', padding: '0.65rem', border: '1px solid #1e3a8a' }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {classSheet.map((row) => {
                  const isAtRisk = row.status === 'At Risk' || row.status === 'Bound to Fail'
                  const p = ensureTermScores(row.prelim, 82, hasLab)
                  const m = ensureTermScores(row.midterm, 83, hasLab)
                  const f = ensureTermScores(row.final, 85, hasLab)

                  const renderSummaryBlock = (term: typeof p, accentBg: string, accentColor: string) => (
                    <>
                      <td style={{ textAlign: 'center', padding: '0.55rem', borderRight: '1px solid #e2e8f0', fontWeight: 600 }}>{term.attendance.toFixed(1)}</td>
                      <td style={{ textAlign: 'center', padding: '0.55rem', borderRight: '1px solid #e2e8f0', fontWeight: 600 }}>{term.quiz.toFixed(1)}</td>
                      <td style={{ textAlign: 'center', padding: '0.55rem', borderRight: '1px solid #e2e8f0', fontWeight: 600 }}>
                        {hasLab ? (term.labActivity ?? 0).toFixed(1) : 'N/A'}
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.55rem', borderRight: '1px solid #e2e8f0', fontWeight: 600 }}>{term.activity.toFixed(1)}</td>
                      <td style={{ textAlign: 'center', padding: '0.55rem', borderRight: '1px solid #e2e8f0', fontWeight: 600 }}>{term.exam.toFixed(1)}</td>
                      <td style={{ textAlign: 'center', padding: '0.55rem', borderRight: '2px solid #94a3b8', fontWeight: 900, background: accentBg, color: accentColor }}>
                        {term.computedTermGrade.toFixed(1)}%
                      </td>
                    </>
                  )

                  return (
                    <tr key={row.studentId} style={{ borderBottom: '1px solid #cbd5e1', background: isAtRisk ? '#fff5f5' : '#ffffff' }}>
                      <td style={{ padding: '0.65rem 0.75rem', borderRight: '1px solid #cbd5e1' }}>
                        <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.88rem' }}>{row.studentName}</strong>
                        <small style={{ color: '#64748b', fontSize: '0.73rem' }}>ID: {row.studentNo}</small>
                      </td>
                      {activePeriodTab === 'ALL' && (
                        <>
                          {renderSummaryBlock(p, '#eff6ff', '#1e40af')}
                          {renderSummaryBlock(m, '#f5f3ff', '#5b21b6')}
                          {renderSummaryBlock(f, '#ecfdf5', '#065f46')}
                        </>
                      )}
                      {activePeriodTab === 'SUMMARY' && (
                        <>
                          <td style={{ textAlign: 'center', fontWeight: 800, color: '#1e40af', background: '#eff6ff', borderRight: '1px solid #cbd5e1' }}>
                            {p.computedTermGrade.toFixed(1)}%
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 800, color: '#5b21b6', background: '#f5f3ff', borderRight: '1px solid #cbd5e1' }}>
                            {m.computedTermGrade.toFixed(1)}%
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 800, color: '#065f46', background: '#ecfdf5', borderRight: '1px solid #cbd5e1' }}>
                            {f.computedTermGrade.toFixed(1)}%
                          </td>
                        </>
                      )}
                      <td style={{ textAlign: 'center', background: '#ecfdf5', fontWeight: 900, color: isAtRisk ? '#b91c1c' : '#065f46', fontSize: '0.96rem', borderRight: '1px solid #cbd5e1' }}>
                        {row.average.toFixed(1)}%
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.45rem' }}>
                        <span
                          style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: '999px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background: isAtRisk ? '#fee2e2' : '#dcfce7',
                            color: isAtRisk ? '#b91c1c' : '#15803d',
                            border: isAtRisk ? '1px solid #fecaca' : '1px solid #bbf7d0',
                          }}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  )
}

export default Gradebook
