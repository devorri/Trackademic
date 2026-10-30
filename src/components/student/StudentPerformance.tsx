import React, { useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useData } from '../../context/DataContext'
import { isTermEncoded } from '../../utils/helpers'
import { Sparkles, Lightbulb, Calculator } from 'lucide-react'

export const StudentPerformance: React.FC = () => {
  const { activeUser } = useAuth()
  const { students, classes, subjects, detailedGradingSheets } = useData()

  const currentStudent = useMemo(
    () =>
      students.find(
        (s) =>
          s.profile_id === activeUser?.id ||
          s.id === activeUser?.id ||
          (activeUser?.email && s.email?.toLowerCase() === activeUser.email.toLowerCase()) ||
          (activeUser?.name && s.name?.toLowerCase() === activeUser.name.toLowerCase()),
      ),
    [students, activeUser],
  )

  const enrolledClasses = useMemo(() => {
    if (!currentStudent) return []
    return classes.filter((c) => (c.studentIds || []).includes(currentStudent.id))
  }, [classes, currentStudent])

  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all')

  const subjectTrajectories = useMemo(() => {
    if (!currentStudent) return []
    return enrolledClasses.map((cls) => {
      const subj = subjects.find((s) => s.id === cls.subject_id) || cls.subject
      const sheetRow = (detailedGradingSheets[cls.id] || []).find(
        (r) => r.studentId === currentStudent.id,
      )

      const prelimEncoded = isTermEncoded(sheetRow?.prelim)
      const midtermEncoded = isTermEncoded(sheetRow?.midterm)
      const prefinalEncoded = isTermEncoded(sheetRow?.prefinal)
      const finalEncoded = isTermEncoded(sheetRow?.final)

      const prelimGrade = prelimEncoded ? Math.round(sheetRow!.prelim.computedTermGrade) : null
      const midtermRaw = midtermEncoded
        ? Math.round(sheetRow!.midterm.rawGrade ?? sheetRow!.midterm.computedTermGrade)
        : null
      const midtermGrade = midtermEncoded ? Math.round(sheetRow!.midterm.computedTermGrade) : null
      const prefinalRaw = prefinalEncoded
        ? Math.round(sheetRow!.prefinal!.rawGrade ?? sheetRow!.prefinal!.computedTermGrade)
        : null
      const prefinalGrade = prefinalEncoded
        ? Math.round(sheetRow!.prefinal!.computedTermGrade)
        : null
      const finalRaw = finalEncoded
        ? Math.round(sheetRow!.final.rawGrade ?? sheetRow!.final.computedTermGrade)
        : null
      const finalGrade = finalEncoded ? Math.round(sheetRow!.final.computedTermGrade) : null

      const currentMark =
        finalGrade ?? prefinalGrade ?? midtermGrade ?? prelimGrade ?? null

      let previousMark: number | null = null
      if (finalGrade !== null) {
        previousMark = prefinalGrade ?? midtermGrade ?? prelimGrade
      } else if (prefinalGrade !== null) {
        previousMark = midtermGrade ?? prelimGrade
      } else if (midtermGrade !== null) {
        previousMark = prelimGrade
      }

      const diff =
        currentMark !== null && previousMark !== null ? currentMark - previousMark : null

      let status = 'Pending'
      if (currentMark !== null) {
        if (diff !== null) {
          if (diff > 0) status = 'Improved'
          else if (diff < 0) status = 'Declined'
          else status = 'Maintained'
        } else {
          status = currentMark >= 75 ? 'On Track' : 'At Risk'
        }
      }

      return {
        classId: cls.id,
        code: subj?.code || 'SUBJ',
        subject: subj?.title || 'Subject',
        section: cls.section?.name || '',
        prelimEncoded,
        midtermEncoded,
        prefinalEncoded,
        finalEncoded,
        prelimGrade,
        midtermRaw,
        midtermGrade,
        prefinalRaw,
        prefinalGrade,
        finalRaw,
        finalGrade,
        previousMark,
        currentMark,
        diff,
        status,
      }
    })
  }, [enrolledClasses, subjects, detailedGradingSheets, currentStudent])

  const filteredTrajectories = useMemo(() => {
    if (selectedClassFilter === 'all') return subjectTrajectories
    return subjectTrajectories.filter((t) => t.classId === selectedClassFilter)
  }, [subjectTrajectories, selectedClassFilter])

  // Aggregate Period Progression for Performance History
  const historySummary = useMemo(() => {
    const prelimList = filteredTrajectories.filter((t) => t.prelimGrade !== null)
    const midtermList = filteredTrajectories.filter((t) => t.midtermGrade !== null)
    const prefinalList = filteredTrajectories.filter((t) => t.prefinalGrade !== null)
    const finalList = filteredTrajectories.filter((t) => t.finalGrade !== null)

    const hasPrelim = prelimList.length > 0
    const hasMidterm = midtermList.length > 0
    const hasPrefinal = prefinalList.length > 0
    const hasFinal = finalList.length > 0

    const prelimAvg = hasPrelim
      ? Math.round(prelimList.reduce((acc, t) => acc + (t.prelimGrade || 0), 0) / prelimList.length)
      : null

    const midtermRawAvg = hasMidterm
      ? Math.round(midtermList.reduce((acc, t) => acc + (t.midtermRaw || 0), 0) / midtermList.length)
      : null
    const midtermCumulativeAvg = hasMidterm
      ? Math.round(
          midtermList.reduce((acc, t) => acc + (t.midtermGrade || 0), 0) / midtermList.length,
        )
      : null

    const prefinalRawAvg = hasPrefinal
      ? Math.round(
          prefinalList.reduce((acc, t) => acc + (t.prefinalRaw || 0), 0) / prefinalList.length,
        )
      : null
    const prefinalCumulativeAvg = hasPrefinal
      ? Math.round(
          prefinalList.reduce((acc, t) => acc + (t.prefinalGrade || 0), 0) / prefinalList.length,
        )
      : null

    const finalRawAvg = hasFinal
      ? Math.round(finalList.reduce((acc, t) => acc + (t.finalRaw || 0), 0) / finalList.length)
      : null
    const finalCumulativeAvg = hasFinal
      ? Math.round(finalList.reduce((acc, t) => acc + (t.finalGrade || 0), 0) / finalList.length)
      : null

    return {
      hasPrelim,
      hasMidterm,
      hasPrefinal,
      hasFinal,
      prelimAvg,
      midtermRawAvg,
      midtermCumulativeAvg,
      prefinalRawAvg,
      prefinalCumulativeAvg,
      finalRawAvg,
      finalCumulativeAvg,
    }
  }, [filteredTrajectories])

  // Dynamic Insight Text
  const insightData = useMemo(() => {
    const withCurrent = subjectTrajectories.filter((t) => t.currentMark !== null)
    if (withCurrent.length === 0) {
      return {
        headline: 'No grades have been encoded for your enrolled subjects yet.',
        suggestion:
          'Once your instructors encode your Prelim, Midterm, Pre-Final, or Final scores, your progression and trajectory will automatically appear here.',
      }
    }

    const withDiff = withCurrent.filter((t) => t.diff !== null)
    if (withDiff.length > 0) {
      const best = [...withDiff].sort((a, b) => (b.diff || 0) - (a.diff || 0))[0]
      if ((best.diff || 0) >= 0) {
        return {
          headline: `Your performance in ${best.subject} progressed from ${best.previousMark}% to ${best.currentMark}% (${best.diff! > 0 ? `+${best.diff}%` : '0%'}).`,
          suggestion:
            'Continue maintaining your attendance, quizzes, activities, participation, and exam preparation to keep your cumulative grade high.',
        }
      } else {
        return {
          headline: `Your cumulative grade in ${best.subject} changed from ${best.previousMark}% to ${best.currentMark}% (${best.diff}%).`,
          suggestion:
            'Focus on the next grading period (weighted 60% of the cumulative computation) to raise your overall standing.',
        }
      }
    }

    const topSubj = [...withCurrent].sort((a, b) => (b.currentMark || 0) - (a.currentMark || 0))[0]
    return {
      headline: `Your Prelim grade in ${topSubj.subject} is ${topSubj.currentMark}%.`,
      suggestion:
        'Remember: Midterm Grade is computed as 40% Prelim Grade + 60% Midterm Raw Grade. Aim high in your upcoming assessments!',
    }
  }, [subjectTrajectories])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
      {/* Performance Insight Banner */}
      <section
        style={{
          padding: '1.8rem 2rem',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#faf5ff',
                border: '1px solid #e9d5ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7c3aed',
              }}
            >
              <Sparkles size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a', fontWeight: 800 }}>
              Performance Insight
            </h3>
          </div>

          {subjectTrajectories.length > 0 && (
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              style={{
                padding: '0.55rem 0.9rem',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontWeight: 700,
                fontSize: '0.88rem',
              }}
            >
              <option value="all">All Enrolled Subjects ({subjectTrajectories.length})</option>
              {subjectTrajectories.map((t) => (
                <option key={t.classId} value={t.classId}>
                  {t.code} - {t.subject}
                </option>
              ))}
            </select>
          )}
        </div>

        <div style={{ margin: '1.2rem 0' }}>
          <p style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 700 }}>
            “{insightData.headline}”
          </p>
        </div>

        <div
          style={{
            background: '#fefce8',
            border: '1px solid #fef08a',
            borderRadius: '12px',
            padding: '1rem 1.4rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.8rem',
          }}
        >
          <Lightbulb size={20} color="#ca8a04" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
          <div>
            <strong style={{ color: '#854d0e', fontSize: '0.9rem', display: 'block', marginBottom: '0.2rem' }}>
              Actionable Suggestion:
            </strong>
            <p style={{ margin: 0, fontSize: '0.92rem', color: '#713f12', lineHeight: 1.45, fontWeight: 500 }}>
              {insightData.suggestion}
            </p>
          </div>
        </div>
      </section>

      {/* Performance History Section (Progressive Display per Period) */}
      <section
        style={{
          padding: '1.8rem 2rem',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#1d4ed8',
                background: '#eff6ff',
                border: '1px solid #dbeafe',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
              }}
            >
              Academic Trajectory
            </span>
            <h4 style={{ margin: '0.5rem 0 0.2rem 0', fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
              Performance History
            </h4>
            <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>
              Cumulative Computation: Previous Period Grade (40%) + Current Period Raw Grade (60%) = Current Grade
            </p>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '0.8rem',
              color: '#334155',
              fontWeight: 600,
            }}
          >
            <Calculator size={15} color="#2563eb" />
            <span>Att 10% • Quiz 20% • Act 20% • Part 10% • Exam 40%</span>
          </div>
        </div>

        {!historySummary.hasPrelim &&
        !historySummary.hasMidterm &&
        !historySummary.hasPrefinal &&
        !historySummary.hasFinal ? (
          <div
            style={{
              marginTop: '1.4rem',
              padding: '2.2rem',
              textAlign: 'center',
              background: '#f8fafc',
              borderRadius: '14px',
              border: '1px dashed #cbd5e1',
              color: '#64748b',
            }}
          >
            <strong style={{ display: 'block', color: '#0f172a', fontSize: '1.05rem', marginBottom: '0.3rem' }}>
              No Grading Period Encoded Yet
            </strong>
            <span>
              Your Prelim, Midterm, Pre-Final, and Final grades will appear here progressively as your instructors encode them.
            </span>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '1.2rem',
              marginTop: '1.4rem',
            }}
          >
            {/* 1. If ONLY PRELIM has grades: show ONLY PRELIM GRADE */}
            {historySummary.hasPrelim &&
              !historySummary.hasMidterm &&
              !historySummary.hasPrefinal &&
              !historySummary.hasFinal && (
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1.5px solid #bbf7d0',
                    borderRadius: '14px',
                    padding: '1.5rem',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>
                    PRELIM GRADES (CURRENT)
                  </span>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#15803d', marginTop: '0.4rem' }}>
                    {historySummary.prelimAvg}%
                  </div>
                  <small style={{ color: '#16a34a', fontWeight: 600 }}>
                    Encoded Prelim Grade (100% Raw)
                  </small>
                </div>
              )}

            {/* 2. When MIDTERM is the latest encoded period: show PRELIM GRADES, MIDTERM RAW GRADES, and CURRENT (40% Prelim + 60% Midterm Raw) */}
            {historySummary.hasMidterm &&
              !historySummary.hasPrefinal &&
              !historySummary.hasFinal && (
                <>
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '1.5rem',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      PRELIM GRADES (40%)
                    </span>
                    <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', marginTop: '0.4rem' }}>
                      {historySummary.prelimAvg !== null ? `${historySummary.prelimAvg}%` : '—'}
                    </div>
                    <small style={{ color: '#64748b', fontWeight: 600 }}>
                      40% Weight = {historySummary.prelimAvg !== null ? (historySummary.prelimAvg * 0.4).toFixed(1) : '0'} pts
                    </small>
                  </div>

                  <div
                    style={{
                      background: '#eff6ff',
                      border: '1px solid #dbeafe',
                      borderRadius: '14px',
                      padding: '1.5rem',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>
                      MIDTERM RAW GRADES (60%)
                    </span>
                    <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#1d4ed8', marginTop: '0.4rem' }}>
                      {historySummary.midtermRawAvg}%
                    </div>
                    <small style={{ color: '#2563eb', fontWeight: 600 }}>
                      60% Weight = {((historySummary.midtermRawAvg || 0) * 0.6).toFixed(1)} pts
                    </small>
                  </div>

                  <div
                    style={{
                      background: '#f0fdf4',
                      border: '1.5px solid #bbf7d0',
                      borderRadius: '14px',
                      padding: '1.5rem',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>
                      CURRENT (MIDTERM GRADE)
                    </span>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#15803d', marginTop: '0.4rem' }}>
                      {historySummary.midtermCumulativeAvg}%
                    </div>
                    <small style={{ color: '#16a34a', fontWeight: 700 }}>
                      Prelim (40%) + Midterm Raw (60%)
                    </small>
                  </div>
                </>
              )}

            {/* 3. When PRE-FINAL is the latest encoded period */}
            {historySummary.hasPrefinal && !historySummary.hasFinal && (
              <>
                {historySummary.hasPrelim && (
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '1.4rem',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      PRELIM GRADES
                    </span>
                    <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>
                      {historySummary.prelimAvg}%
                    </div>
                    <small style={{ color: '#64748b', fontWeight: 500 }}>Completed Period</small>
                  </div>
                )}

                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '1.4rem',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                    MIDTERM GRADES (40%)
                  </span>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>
                    {historySummary.midtermCumulativeAvg ?? historySummary.prelimAvg ?? '—'}%
                  </div>
                  <small style={{ color: '#64748b', fontWeight: 600 }}>
                    40% Weight in Pre-Final
                  </small>
                </div>

                <div
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #dbeafe',
                    borderRadius: '14px',
                    padding: '1.4rem',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>
                    PRE-FINAL RAW GRADES (60%)
                  </span>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1d4ed8', marginTop: '0.35rem' }}>
                    {historySummary.prefinalRawAvg}%
                  </div>
                  <small style={{ color: '#2563eb', fontWeight: 600 }}>
                    60% Weight = {((historySummary.prefinalRawAvg || 0) * 0.6).toFixed(1)} pts
                  </small>
                </div>

                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1.5px solid #bbf7d0',
                    borderRadius: '14px',
                    padding: '1.4rem',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>
                    CURRENT (PRE-FINAL GRADE)
                  </span>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#15803d', marginTop: '0.35rem' }}>
                    {historySummary.prefinalCumulativeAvg}%
                  </div>
                  <small style={{ color: '#16a34a', fontWeight: 700 }}>
                    Midterm (40%) + Pre-Final Raw (60%)
                  </small>
                </div>
              </>
            )}

            {/* 4. When FINAL is encoded */}
            {historySummary.hasFinal && (
              <>
                {historySummary.hasPrelim && (
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '1.3rem',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      PRELIM GRADES
                    </span>
                    <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', marginTop: '0.3rem' }}>
                      {historySummary.prelimAvg}%
                    </div>
                    <small style={{ color: '#64748b', fontWeight: 500 }}>1st Period</small>
                  </div>
                )}

                {historySummary.hasMidterm && (
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '1.3rem',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      MIDTERM GRADES
                    </span>
                    <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', marginTop: '0.3rem' }}>
                      {historySummary.midtermCumulativeAvg}%
                    </div>
                    <small style={{ color: '#64748b', fontWeight: 500 }}>40% Prelim + 60% Raw</small>
                  </div>
                )}

                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '1.3rem',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                    {historySummary.hasPrefinal ? 'PRE-FINAL GRADES (40%)' : 'PREVIOUS GRADE (40%)'}
                  </span>
                  <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', marginTop: '0.3rem' }}>
                    {historySummary.prefinalCumulativeAvg ??
                      historySummary.midtermCumulativeAvg ??
                      historySummary.prelimAvg ??
                      '—'}
                    %
                  </div>
                  <small style={{ color: '#64748b', fontWeight: 600 }}>40% Weight in Final</small>
                </div>

                <div
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #dbeafe',
                    borderRadius: '14px',
                    padding: '1.3rem',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>
                    FINAL RAW GRADES (60%)
                  </span>
                  <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#1d4ed8', marginTop: '0.3rem' }}>
                    {historySummary.finalRawAvg}%
                  </div>
                  <small style={{ color: '#2563eb', fontWeight: 600 }}>
                    60% Weight = {((historySummary.finalRawAvg || 0) * 0.6).toFixed(1)} pts
                  </small>
                </div>

                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1.5px solid #bbf7d0',
                    borderRadius: '14px',
                    padding: '1.3rem',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>
                    CURRENT (FINAL GRADE)
                  </span>
                  <div style={{ fontSize: '2.3rem', fontWeight: 800, color: '#15803d', marginTop: '0.3rem' }}>
                    {historySummary.finalCumulativeAvg}%
                  </div>
                  <small style={{ color: '#16a34a', fontWeight: 700 }}>
                    Previous (40%) + Final Raw (60%)
                  </small>
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* Course-by-Course Trajectory (Strictly Enrolled Subjects) */}
      <section
        style={{
          padding: '1.6rem 2rem',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
        }}
      >
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
            Course-by-Course Trajectory
          </h4>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
            Showing only your actual enrolled subjects ({subjectTrajectories.length} subject{subjectTrajectories.length === 1 ? '' : 's'})
          </p>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <table style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ color: '#0f172a', fontWeight: 700, padding: '0.85rem 1rem', textAlign: 'left' }}>Subject</th>
                <th style={{ color: '#0f172a', fontWeight: 700, padding: '0.85rem 1rem', textAlign: 'center' }}>Prelim</th>
                <th style={{ color: '#0f172a', fontWeight: 700, padding: '0.85rem 1rem', textAlign: 'center' }}>Midterm (Raw / Cum.)</th>
                <th style={{ color: '#0f172a', fontWeight: 700, padding: '0.85rem 1rem', textAlign: 'center' }}>Pre-Final (Raw / Cum.)</th>
                <th style={{ color: '#0f172a', fontWeight: 700, padding: '0.85rem 1rem', textAlign: 'center' }}>Final (Raw / Cum.)</th>
                <th style={{ color: '#0f172a', fontWeight: 700, padding: '0.85rem 1rem', textAlign: 'center' }}>Current Mark</th>
                <th style={{ color: '#0f172a', fontWeight: 700, padding: '0.85rem 1rem', textAlign: 'center' }}>Change</th>
                <th style={{ color: '#0f172a', fontWeight: 700, padding: '0.85rem 1rem', textAlign: 'center' }}>Trend</th>
              </tr>
            </thead>
            <tbody>
              {subjectTrajectories.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    You are not enrolled in any subjects yet.
                  </td>
                </tr>
              ) : (
                subjectTrajectories.map((item) => (
                  <tr key={item.classId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <strong style={{ color: '#0f172a', display: 'block' }}>
                        {item.code} - {item.subject}
                      </strong>
                      {item.section && (
                        <small style={{ color: '#64748b', fontWeight: 600 }}>Section: {item.section}</small>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', color: '#334155', fontWeight: 700 }}>
                      {item.prelimGrade !== null ? `${item.prelimGrade}%` : '—'}
                    </td>
                    <td style={{ textAlign: 'center', color: '#334155', fontWeight: 600 }}>
                      {item.midtermGrade !== null
                        ? `${item.midtermRaw}% / ${item.midtermGrade}%`
                        : '—'}
                    </td>
                    <td style={{ textAlign: 'center', color: '#334155', fontWeight: 600 }}>
                      {item.prefinalGrade !== null
                        ? `${item.prefinalRaw}% / ${item.prefinalGrade}%`
                        : '—'}
                    </td>
                    <td style={{ textAlign: 'center', color: '#334155', fontWeight: 600 }}>
                      {item.finalGrade !== null
                        ? `${item.finalRaw}% / ${item.finalGrade}%`
                        : '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <strong
                        style={{
                          color:
                            item.currentMark === null
                              ? '#64748b'
                              : item.currentMark >= 75
                              ? '#15803d'
                              : '#dc2626',
                          fontWeight: 800,
                        }}
                      >
                        {item.currentMark !== null ? `${item.currentMark}%` : '—'}
                      </strong>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span
                        style={{
                          color:
                            item.diff === null
                              ? '#64748b'
                              : item.diff >= 0
                              ? '#15803d'
                              : '#dc2626',
                          fontWeight: 800,
                        }}
                      >
                        {item.diff !== null ? (item.diff > 0 ? `+${item.diff}%` : `${item.diff}%`) : '—'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span
                        style={{
                          padding: '0.25rem 0.65rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background:
                            item.status === 'Improved' || item.status === 'On Track'
                              ? '#f0fdf4'
                              : item.status === 'Declined' || item.status === 'At Risk'
                              ? '#fef2f2'
                              : '#f8fafc',
                          color:
                            item.status === 'Improved' || item.status === 'On Track'
                              ? '#15803d'
                              : item.status === 'Declined' || item.status === 'At Risk'
                              ? '#dc2626'
                              : '#64748b',
                          border:
                            item.status === 'Improved' || item.status === 'On Track'
                              ? '1px solid #bbf7d0'
                              : item.status === 'Declined' || item.status === 'At Risk'
                              ? '1px solid #fecaca'
                              : '1px solid #e2e8f0',
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default StudentPerformance
