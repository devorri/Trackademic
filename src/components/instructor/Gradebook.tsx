import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../hooks/useAuth';
import {
  clampScore,
  getSubjectTitle,
  ensureTermScores,
  formatCourseSection,
  isTermEncoded,
  getDefaultTermMaxItems
} from '../../utils/helpers';
import {
  Save,
  CheckCircle,
  Printer,
  BookOpen,
  Layers,
  Plus,
  Minus,
  Send
} from 'lucide-react';
import type { GradingPeriodKey, TermComponentField } from '../../utils/types';

export const Gradebook: React.FC = () => {
  const {
    classes,
    subjects,
    selectedClass,
    setSelectedClassId,
    detailedGradingSheets,
    updateComponentMaxScore,
    updateComponentTotalItems,
    getClassPeriodMaxItems,
    updateComponentItemScore,
    addComponentColumn,
    removeComponentColumn,
    printClassGradeReport,
    submitClassGradesToAdmin,
    saveClassGradeDraft
  } = useData();
  const { activeUser } = useAuth();

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePeriodTab, setActivePeriodTab] = useState<GradingPeriodKey | 'ALL' | 'SUMMARY'>(
    'prelim'
  );

  // Filter classes strictly for the logged-in instructor (if role is instructor)
  const availableClasses = useMemo(() => {
    if (!activeUser || activeUser.role === 'administrator') return classes;
    return classes.filter(
      (c) =>
        c.instructor_id === activeUser.id ||
        c.instructor?.id === activeUser.id ||
        c.instructor?.profile_id === activeUser.id ||
        (activeUser.email &&
          c.instructor?.email &&
          c.instructor.email.toLowerCase() === activeUser.email.toLowerCase())
    );
  }, [classes, activeUser]);

  const activeClass = useMemo(() => {
    if (selectedClass && availableClasses.some((c) => c.id === selectedClass.id)) {
      return selectedClass;
    }
    return availableClasses[0] || null;
  }, [selectedClass, availableClasses]);

  useEffect(() => {
    if (activeClass && selectedClass?.id !== activeClass.id) {
      setSelectedClassId(activeClass.id);
    }
  }, [activeClass, selectedClass, setSelectedClassId]);

  const classSheet = activeClass ? detailedGradingSheets[activeClass.id] ?? [] : [];
  const isSubmittedToAdmin = classSheet.some((s) => s.submittedToAdmin);

  const activePeriodKey: GradingPeriodKey =
    activePeriodTab === 'midterm'
      ? 'midterm'
      : activePeriodTab === 'prefinal'
      ? 'prefinal'
      : activePeriodTab === 'final'
      ? 'final'
      : 'prelim';

  const sampleTerm =
    classSheet.length > 0
      ? ensureTermScores(classSheet[0][activePeriodKey])
      : ensureTermScores(undefined);

  const attCount = Math.max(1, sampleTerm.items?.attendance?.length || 2);
  const quizCount = Math.max(1, sampleTerm.items?.quiz?.length || 2);
  const actCount = Math.max(1, sampleTerm.items?.activity?.length || 2);
  const partCount = Math.max(1, sampleTerm.items?.participation?.length || 1);
  const examCount = Math.max(1, sampleTerm.items?.exam?.length || 1);

  const periodMaxItems = activeClass
    ? getClassPeriodMaxItems(activeClass.id, activePeriodKey, {
        attendance: attCount,
        quiz: quizCount,
        activity: actCount,
        participation: partCount,
        exam: examCount
      })
    : getDefaultTermMaxItems({
        attendance: attCount,
        quiz: quizCount,
        activity: actCount,
        participation: partCount,
        exam: examCount
      });

  const quizTotalItems = periodMaxItems.quiz
    .slice(0, quizCount)
    .reduce((a, b) => a + (b || 0), 0);
  const actTotalItems = periodMaxItems.activity
    .slice(0, actCount)
    .reduce((a, b) => a + (b || 0), 0);
  const partTotalItems = periodMaxItems.participation
    .slice(0, partCount)
    .reduce((a, b) => a + (b || 0), 0);
  const examTotalItems = periodMaxItems.exam
    .slice(0, examCount)
    .reduce((a, b) => a + (b || 0), 0);
  const attTotalItems =
    periodMaxItems.attendanceTotal ??
    periodMaxItems.attendance.slice(0, attCount).reduce((a, b) => a + (b || 0), 0);

  async function handleManualSave() {
    if (!activeClass) return;
    setSaveSuccess(true);
    await saveClassGradeDraft(activeClass.id, activeUser?.name || 'Instructor');
    setTimeout(() => setSaveSuccess(false), 3000);
  }

  async function handleSubmitToAdmin() {
    if (!activeClass) return;
    setIsSubmitting(true);
    try {
      await submitClassGradesToAdmin(activeClass.id, activeUser?.name || 'Instructor');
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 4000);
    } finally {
      setIsSubmitting(false);
    }
  }

  const periodColors: Record<
    GradingPeriodKey,
    {
      headerBg: string;
      subHeaderBg: string;
      avgBg: string;
      accent: string;
      label: string;
      formulaNote: string;
    }
  > = {
    prelim: {
      headerBg: '#1e3a8a',
      subHeaderBg: '#1d4ed8',
      avgBg: '#eff6ff',
      accent: '#1e40af',
      label: 'PRELIM PERIOD',
      formulaNote: 'Prelim Grade = 100% Prelim Raw Grade'
    },
    midterm: {
      headerBg: '#4c1d95',
      subHeaderBg: '#6d28d9',
      avgBg: '#f5f3ff',
      accent: '#5b21b6',
      label: 'MIDTERM PERIOD',
      formulaNote: 'Midterm Grade = Prelim Grade (40%) + Midterm Raw Grade (60%)'
    },
    prefinal: {
      headerBg: '#7c2d12',
      subHeaderBg: '#c2410c',
      avgBg: '#fff7ed',
      accent: '#9a3412',
      label: 'PRE-FINAL PERIOD',
      formulaNote: 'Pre-Final Grade = Midterm Grade (40%) + Pre-Final Raw Grade (60%)'
    },
    final: {
      headerBg: '#065f46',
      subHeaderBg: '#059669',
      avgBg: '#ecfdf5',
      accent: '#047857',
      label: 'FINAL PERIOD',
      formulaNote: 'Final Grade = Pre-Final Grade (40%) + Final Raw Grade (60%)'
    }
  };

  const currentTheme = periodColors[activePeriodKey];

  const renderCategoryHeaderControls = (
    field: TermComponentField,
    count: number,
    label: string
  ) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.35rem',
        flexWrap: 'wrap'
      }}
    >
      <span>{label}</span>
      {activeClass && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
          <button
            type="button"
            title={`Add another ${label} column`}
            onClick={() => addComponentColumn(activeClass.id, activePeriodKey, field)}
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
              gap: '0.15rem'
            }}
          >
            <Plus size={11} /> Add
          </button>
          {count > 1 && (
            <button
              type="button"
              title={`Remove last ${label} column`}
              onClick={() => removeComponentColumn(activeClass.id, activePeriodKey, field)}
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
                alignItems: 'center'
              }}
            >
              <Minus size={11} />
            </button>
          )}
        </span>
      )}
    </div>
  );

  if (availableClasses.length === 0) {
    return (
      <div
        style={{
          background: '#ffffff',
          border: '1px dashed #cbd5e1',
          borderRadius: '16px',
          padding: '3rem 2rem',
          textAlign: 'center',
          color: '#64748b'
        }}
      >
        <BookOpen size={42} style={{ margin: '0 auto 12px', opacity: 0.45, color: '#2563eb' }} />
        <h3 style={{ margin: '0 0 6px 0', color: '#0f172a' }}>No Assigned Classes</h3>
        <p style={{ margin: 0 }}>
          You do not have any assigned classes yet. Once the Administrator assigns a class to you, you can encode and submit grades here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
          gap: '1rem'
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
                borderRadius: '999px'
              }}
            >
              Instructor Class Record Book
            </span>

            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#334155',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '0.25rem 0.65rem',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <BookOpen size={13} /> Raw = Att 10% • Quiz 20% • Act 20% • Part 10% • Exam 40% | Cumulative = 40% Prev + 60% Raw
            </span>

            {isSubmittedToAdmin && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#15803d',
                  background: '#dcfce7',
                  border: '1px solid #86efac',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '999px'
                }}
              >
                ✓ Submitted to Admin
              </span>
            )}
          </div>

          <h3
            style={{
              margin: '0.5rem 0 0.2rem 0',
              fontSize: '1.45rem',
              color: '#0f172a',
              fontWeight: 800
            }}
          >
            {activeClass ? getSubjectTitle(subjects, activeClass.subject_id) : 'Select a Class'} —{' '}
            {formatCourseSection(activeClass?.section?.name || '')}
          </h3>
          <p style={{ margin: 0, color: '#475569', fontSize: '0.88rem' }}>
            Encode scores for <strong>Prelim</strong>, <strong>Midterm</strong>,{' '}
            <strong>Pre-Final</strong>, and <strong>Final</strong>. Unencoded periods stay blank (no auto-filled grades). Click <strong>Submit Grades to Admin</strong> to notify the Administrator.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={activeClass?.id ?? ''}
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
              fontSize: '0.88rem'
            }}
          >
            {availableClasses.map((classItem) => {
              const sub = subjects.find((s) => s.id === classItem.subject_id);
              return (
                <option key={classItem.id} value={classItem.id}>
                  {sub?.code} - {getSubjectTitle(subjects, classItem.subject_id)} (
                  {formatCourseSection(classItem.section?.name || '')})
                </option>
              );
            })}
          </select>

          <button
            type="button"
            onClick={() => printClassGradeReport(activeClass?.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.65rem 1.05rem',
              borderRadius: '10px',
              fontWeight: 700,
              background: '#f8fafc',
              color: '#1e3a8a',
              border: '1.5px solid #cbd5e1',
              cursor: 'pointer',
              fontSize: '0.84rem'
            }}
          >
            <Printer size={15} /> Print Record
          </button>

          <button
            type="button"
            onClick={handleManualSave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.65rem 1.1rem',
              borderRadius: '10px',
              fontWeight: 700,
              background: saveSuccess ? '#16a34a' : '#eff6ff',
              color: saveSuccess ? '#ffffff' : '#1d4ed8',
              border: saveSuccess ? '1.5px solid #16a34a' : '1.5px solid #93c5fd',
              cursor: 'pointer',
              fontSize: '0.84rem'
            }}
          >
            {saveSuccess ? <CheckCircle size={15} /> : <Save size={15} />}
            {saveSuccess ? 'Saved!' : 'Save Draft'}
          </button>

          <button
            type="button"
            className="btn-primary"
            disabled={isSubmitting}
            onClick={handleSubmitToAdmin}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              fontWeight: 800,
              background: submitSuccess ? '#16a34a' : '#2563eb',
              color: '#ffffff',
              border: 'none',
              cursor: isSubmitting ? 'wait' : 'pointer',
              fontSize: '0.86rem',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.22)'
            }}
          >
            {submitSuccess ? <CheckCircle size={16} /> : <Send size={16} />}
            {submitSuccess
              ? 'Submitted & Admin Notified!'
              : isSubmitting
              ? 'Submitting...'
              : 'Submit Grades to Admin'}
          </button>
        </div>
      </div>

      {/* Period Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.55rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          background: '#ffffff',
          padding: '0.85rem 1.25rem',
          borderRadius: '14px',
          border: '1px solid #e2e8f0'
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
            marginRight: '0.4rem'
          }}
        >
          <Layers size={15} color="#2563eb" /> Grading Period:
        </span>
        {[
          { key: 'prelim', label: '1. Prelim (100% Raw)', color: '#1d4ed8', bg: '#eff6ff' },
          {
            key: 'midterm',
            label: '2. Midterm (40% Prelim + 60% Raw)',
            color: '#6d28d9',
            bg: '#f5f3ff'
          },
          {
            key: 'prefinal',
            label: '3. Pre-Final (40% Midterm + 60% Raw)',
            color: '#c2410c',
            bg: '#fff7ed'
          },
          {
            key: 'final',
            label: '4. Final (40% Pre-Final + 60% Raw)',
            color: '#047857',
            bg: '#ecfdf5'
          },
          { key: 'ALL', label: 'All Periods Breakdown', color: '#1e3a8a', bg: '#eff6ff' },
          {
            key: 'SUMMARY',
            label: 'Rounded Summary (Prelim → Final)',
            color: '#b45309',
            bg: '#fffbeb'
          }
        ].map((tab) => {
          const isActive = activePeriodTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActivePeriodTab(tab.key as any)}
              style={{
                padding: '0.5rem 0.95rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer',
                border: isActive ? `2px solid ${tab.color}` : '1px solid #cbd5e1',
                background: isActive ? tab.bg : '#ffffff',
                color: isActive ? tab.color : '#475569',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Gradebook Table */}
      <section
        style={{
          padding: '1.4rem 1.6rem',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)'
        }}
      >
        {(activePeriodTab === 'prelim' ||
          activePeriodTab === 'midterm' ||
          activePeriodTab === 'prefinal' ||
          activePeriodTab === 'final') && (
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
              gap: '0.75rem'
            }}
          >
            <div style={{ fontSize: '0.85rem', color: '#1e293b' }}>
              <strong style={{ color: currentTheme.accent }}>
                {currentTheme.label} RECORD BOOK:
              </strong>{' '}
              Period Raw Grade = <strong>Attendance (10%)</strong> + <strong>Quizzes (20%)</strong>{' '}
              + <strong>Activities (20%)</strong> + <strong>Participation (10%)</strong> +{' '}
              <strong>Exam (40%)</strong>. &nbsp;|&nbsp;{' '}
              <strong style={{ color: currentTheme.accent }}>{currentTheme.formulaNote}</strong>
            </div>
          </div>
        )}

        <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '12px' }}>
          {/* CASE 1: ITEMIZED RECORD BOOK FOR PRELIM, MIDTERM, PRE-FINAL, OR FINAL */}
          {(activePeriodTab === 'prelim' ||
            activePeriodTab === 'midterm' ||
            activePeriodTab === 'prefinal' ||
            activePeriodTab === 'final') && (
            <table
              style={{
                margin: 0,
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.82rem'
              }}
            >
              <thead>
                <tr style={{ background: currentTheme.headerBg, color: '#ffffff' }}>
                  <th
                    rowSpan={3}
                    style={{
                      color: '#ffffff',
                      fontWeight: 800,
                      padding: '0.75rem',
                      textAlign: 'left',
                      minWidth: '180px',
                      border: '1px solid #334155',
                      position: 'sticky',
                      left: 0,
                      background: currentTheme.headerBg,
                      zIndex: 2
                    }}
                  >
                    Student Name &amp; ID
                  </th>

                  {/* Attendance (10%) */}
                  <th
                    colSpan={attCount + 2}
                    style={{
                      color: '#ffffff',
                      fontWeight: 800,
                      padding: '0.55rem',
                      textAlign: 'center',
                      background: '#0f172a',
                      border: '1px solid #334155'
                    }}
                  >
                    {renderCategoryHeaderControls('attendance', attCount, 'ATTENDANCE (10%)')}
                  </th>

                  {/* Quizzes (20%) */}
                  <th
                    colSpan={quizCount + 2}
                    style={{
                      color: '#ffffff',
                      fontWeight: 800,
                      padding: '0.55rem',
                      textAlign: 'center',
                      background: currentTheme.headerBg,
                      border: '1px solid #334155'
                    }}
                  >
                    {renderCategoryHeaderControls('quiz', quizCount, 'QUIZZES (20%)')}
                  </th>

                  {/* Activities (20%) */}
                  <th
                    colSpan={actCount + 2}
                    style={{
                      color: '#ffffff',
                      fontWeight: 800,
                      padding: '0.55rem',
                      textAlign: 'center',
                      background: '#0f766e',
                      border: '1px solid #334155'
                    }}
                  >
                    {renderCategoryHeaderControls('activity', actCount, 'ACTIVITIES (20%)')}
                  </th>

                  {/* Participation (10%) */}
                  <th
                    colSpan={partCount + 2}
                    style={{
                      color: '#ffffff',
                      fontWeight: 800,
                      padding: '0.55rem',
                      textAlign: 'center',
                      background: '#581c87',
                      border: '1px solid #334155'
                    }}
                  >
                    {renderCategoryHeaderControls(
                      'participation',
                      partCount,
                      'PARTICIPATION (10%)'
                    )}
                  </th>

                  {/* Exam (40%) */}
                  <th
                    colSpan={examCount + 2}
                    style={{
                      color: '#ffffff',
                      fontWeight: 800,
                      padding: '0.55rem',
                      textAlign: 'center',
                      background: '#9a3412',
                      border: '1px solid #334155'
                    }}
                  >
                    {renderCategoryHeaderControls('exam', examCount, 'EXAM (40%)')}
                  </th>

                  {/* Period Raw Grade */}
                  <th
                    rowSpan={3}
                    style={{
                      color: '#ffffff',
                      fontWeight: 800,
                      padding: '0.55rem',
                      textAlign: 'center',
                      background: '#334155',
                      border: '1px solid #475569',
                      minWidth: '82px'
                    }}
                  >
                    {activePeriodKey === 'prelim' ? 'RAW (100%)' : 'RAW (60%)'}
                  </th>

                  {/* Previous Period Grade (Auto-synced from previous period) */}
                  {activePeriodKey !== 'prelim' && (
                    <th
                      rowSpan={3}
                      style={{
                        color: '#ffffff',
                        fontWeight: 900,
                        padding: '0.55rem',
                        textAlign: 'center',
                        background:
                          activePeriodKey === 'midterm'
                            ? '#1e3a8a'
                            : activePeriodKey === 'prefinal'
                            ? '#4c1d95'
                            : '#7c2d12',
                        border: '1px solid #334155',
                        minWidth: '98px'
                      }}
                      title={`Automatically populated from ${
                        activePeriodKey === 'midterm'
                          ? 'Prelim'
                          : activePeriodKey === 'prefinal'
                          ? 'Midterm'
                          : 'Pre-Final'
                      } final grade`}
                    >
                      {activePeriodKey === 'midterm'
                        ? 'PRELIM (40%)'
                        : activePeriodKey === 'prefinal'
                        ? 'MIDTERM (40%)'
                        : 'PRE-FINAL (40%)'}
                    </th>
                  )}

                  {/* Cumulative Period Grade */}
                  <th
                    rowSpan={3}
                    style={{
                      color: '#ffffff',
                      fontWeight: 900,
                      padding: '0.65rem',
                      textAlign: 'center',
                      background: currentTheme.subHeaderBg,
                      border: '1px solid #334155',
                      minWidth: '92px'
                    }}
                  >
                    {activePeriodKey === 'prefinal'
                      ? 'PRE-FINAL'
                      : activePeriodKey.toUpperCase()}{' '}
                    GRADE
                  </th>

                  {/* Rounded Overall */}
                  <th
                    rowSpan={3}
                    style={{
                      color: '#ffffff',
                      fontWeight: 900,
                      padding: '0.65rem',
                      textAlign: 'center',
                      background: '#0f766e',
                      border: '1px solid #334155',
                      minWidth: '88px'
                    }}
                  >
                    ROUNDED AVG
                  </th>

                  <th
                    rowSpan={3}
                    style={{
                      color: '#ffffff',
                      fontWeight: 800,
                      padding: '0.65rem',
                      textAlign: 'center',
                      background: '#0f172a',
                      border: '1px solid #334155',
                      minWidth: '90px'
                    }}
                  >
                    STATUS
                  </th>
                </tr>

                {/* Sub-header row */}
                <tr style={{ background: '#1e293b', color: '#ffffff' }}>
                  {Array.from({ length: attCount }).map((_, idx) => (
                    <th
                      key={`att-h-${idx}`}
                      style={{
                        color: '#e2e8f0',
                        fontWeight: 700,
                        padding: '0.45rem',
                        textAlign: 'center',
                        border: '1px solid #334155'
                      }}
                    >
                      Att {idx + 1}
                    </th>
                  ))}
                  <th
                    style={{
                      color: '#38bdf8',
                      fontWeight: 900,
                      padding: '0.45rem',
                      textAlign: 'center',
                      background: '#0f172a',
                      border: '1px solid #334155'
                    }}
                    title="Total Attendance Score"
                  >
                    Total
                  </th>
                  <th
                    style={{
                      color: '#fde047',
                      fontWeight: 900,
                      padding: '0.45rem',
                      textAlign: 'center',
                      background: '#0f172a',
                      border: '1px solid #334155'
                    }}
                    title="Attendance %"
                  >
                    Avg
                  </th>

                  {Array.from({ length: quizCount }).map((_, idx) => (
                    <th
                      key={`qz-h-${idx}`}
                      style={{
                        color: '#e2e8f0',
                        fontWeight: 700,
                        padding: '0.45rem',
                        textAlign: 'center',
                        border: '1px solid #334155'
                      }}
                    >
                      Q{idx + 1}
                    </th>
                  ))}
                  <th
                    style={{
                      color: '#38bdf8',
                      fontWeight: 900,
                      padding: '0.45rem',
                      textAlign: 'center',
                      background: currentTheme.headerBg,
                      border: '1px solid #334155'
                    }}
                    title="Total Quiz Score"
                  >
                    Total
                  </th>
                  <th
                    style={{
                      color: '#fde047',
                      fontWeight: 900,
                      padding: '0.45rem',
                      textAlign: 'center',
                      background: currentTheme.headerBg,
                      border: '1px solid #334155'
                    }}
                    title="Quiz %"
                  >
                    Avg
                  </th>

                  {Array.from({ length: actCount }).map((_, idx) => (
                    <th
                      key={`act-h-${idx}`}
                      style={{
                        color: '#e2e8f0',
                        fontWeight: 700,
                        padding: '0.45rem',
                        textAlign: 'center',
                        border: '1px solid #334155'
                      }}
                    >
                      Act {idx + 1}
                    </th>
                  ))}
                  <th
                    style={{
                      color: '#38bdf8',
                      fontWeight: 900,
                      padding: '0.45rem',
                      textAlign: 'center',
                      background: '#0f766e',
                      border: '1px solid #334155'
                    }}
                    title="Total Activities Score"
                  >
                    Total
                  </th>
                  <th
                    style={{
                      color: '#fde047',
                      fontWeight: 900,
                      padding: '0.45rem',
                      textAlign: 'center',
                      background: '#0f766e',
                      border: '1px solid #334155'
                    }}
                    title="Activities %"
                  >
                    Avg
                  </th>

                  {Array.from({ length: partCount }).map((_, idx) => (
                    <th
                      key={`part-h-${idx}`}
                      style={{
                        color: '#e2e8f0',
                        fontWeight: 700,
                        padding: '0.45rem',
                        textAlign: 'center',
                        border: '1px solid #334155'
                      }}
                    >
                      Part {idx + 1}
                    </th>
                  ))}
                  <th
                    style={{
                      color: '#38bdf8',
                      fontWeight: 900,
                      padding: '0.45rem',
                      textAlign: 'center',
                      background: '#581c87',
                      border: '1px solid #334155'
                    }}
                    title="Total Participation Score"
                  >
                    Total
                  </th>
                  <th
                    style={{
                      color: '#fde047',
                      fontWeight: 900,
                      padding: '0.45rem',
                      textAlign: 'center',
                      background: '#581c87',
                      border: '1px solid #334155'
                    }}
                    title="Participation %"
                  >
                    Avg
                  </th>

                  {Array.from({ length: examCount }).map((_, idx) => (
                    <th
                      key={`ex-h-${idx}`}
                      style={{
                        color: '#e2e8f0',
                        fontWeight: 700,
                        padding: '0.45rem',
                        textAlign: 'center',
                        border: '1px solid #334155'
                      }}
                    >
                      Exam {idx + 1}
                    </th>
                  ))}
                  <th
                    style={{
                      color: '#38bdf8',
                      fontWeight: 900,
                      padding: '0.45rem',
                      textAlign: 'center',
                      background: '#9a3412',
                      border: '1px solid #334155'
                    }}
                    title="Total Exam Score"
                  >
                    Total
                  </th>
                  <th
                    style={{
                      color: '#fde047',
                      fontWeight: 900,
                      padding: '0.45rem',
                      textAlign: 'center',
                      background: '#9a3412',
                      border: '1px solid #334155'
                    }}
                    title="Exam %"
                  >
                    Avg
                  </th>
                </tr>

                {/* Total Items / Number of Items Row */}
                <tr style={{ background: '#f8fafc', color: '#0f172a', borderBottom: '2px solid #cbd5e1' }}>
                  <th
                    style={{
                      padding: '0.4rem 0.65rem',
                      textAlign: 'left',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      position: 'sticky',
                      left: 0,
                      zIndex: 2
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span
                        style={{
                          background: '#1e3a8a',
                          color: '#ffffff',
                          fontSize: '0.64rem',
                          fontWeight: 900,
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                          letterSpacing: '0.04em'
                        }}
                      >
                        ITEMS
                      </span>
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155' }}>
                        No. of Items
                      </span>
                    </div>
                  </th>

                  {/* Attendance Items */}
                  {Array.from({ length: attCount }).map((_, idx) => (
                    <th
                      key={`att-max-${idx}`}
                      style={{
                        padding: '0.25rem',
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        textAlign: 'center'
                      }}
                    >
                      <input
                        type="number"
                        min={1}
                        max={999}
                        value={periodMaxItems.attendance[idx] ?? 10}
                        onChange={(e) =>
                          activeClass &&
                          updateComponentMaxScore(
                            activeClass.id,
                            activePeriodKey,
                            'attendance',
                            idx,
                            Number(e.target.value) || 10
                          )
                        }
                        title={`Number of items for Attendance ${idx + 1}`}
                        style={{
                          width: '46px',
                          textAlign: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '0.2rem',
                          borderRadius: '4px',
                          border: '1.5px solid #94a3b8',
                          background: '#ffffff',
                          color: '#0f172a'
                        }}
                      />
                    </th>
                  ))}
                  {/* Attendance Total Items (direct input by instructor) */}
                  <th
                    style={{
                      padding: '0.25rem',
                      border: '1px solid #cbd5e1',
                      background: '#f1f5f9',
                      textAlign: 'center'
                    }}
                  >
                    <input
                      type="number"
                      min={1}
                      max={999}
                      value={attTotalItems}
                      onChange={(e) =>
                        activeClass &&
                        updateComponentTotalItems(
                          activeClass.id,
                          activePeriodKey,
                          'attendance',
                          Number(e.target.value) || 1
                        )
                      }
                      title="Attendance Total Items (Directly editable)"
                      style={{
                        width: '48px',
                        textAlign: 'center',
                        fontSize: '0.78rem',
                        fontWeight: 900,
                        padding: '0.2rem',
                        borderRadius: '4px',
                        border: '2px solid #2563eb',
                        background: '#eff6ff',
                        color: '#1d4ed8'
                      }}
                    />
                  </th>
                  <th
                    style={{
                      padding: '0.25rem',
                      border: '1px solid #cbd5e1',
                      background: '#e2e8f0',
                      color: '#475569',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textAlign: 'center'
                    }}
                  >
                    100%
                  </th>

                  {/* Quizzes Items (e input lang din) */}
                  {Array.from({ length: quizCount }).map((_, idx) => (
                    <th
                      key={`qz-max-${idx}`}
                      style={{
                        padding: '0.25rem',
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        textAlign: 'center'
                      }}
                    >
                      <input
                        type="number"
                        min={1}
                        max={999}
                        value={periodMaxItems.quiz[idx] ?? 20}
                        onChange={(e) =>
                          activeClass &&
                          updateComponentMaxScore(
                            activeClass.id,
                            activePeriodKey,
                            'quiz',
                            idx,
                            Number(e.target.value) || 20
                          )
                        }
                        title={`Number of items for Quiz ${idx + 1}`}
                        style={{
                          width: '46px',
                          textAlign: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '0.2rem',
                          borderRadius: '4px',
                          border: '1.5px solid #94a3b8',
                          background: '#ffffff',
                          color: '#0f172a'
                        }}
                      />
                    </th>
                  ))}
                  {/* Quizzes Total Items (automatic computation) */}
                  <th
                    style={{
                      padding: '0.25rem',
                      border: '1px solid #cbd5e1',
                      background: '#eff6ff',
                      textAlign: 'center'
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.18rem 0.45rem',
                        borderRadius: '5px',
                        background: currentTheme.headerBg,
                        color: '#ffffff',
                        fontWeight: 900,
                        fontSize: '0.78rem',
                        minWidth: '38px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                      title="Total Quiz Items (Automatically computed from sum of all quizzes)"
                    >
                      {quizTotalItems}
                    </span>
                  </th>
                  <th
                    style={{
                      padding: '0.25rem',
                      border: '1px solid #cbd5e1',
                      background: '#e2e8f0',
                      color: '#475569',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textAlign: 'center'
                    }}
                  >
                    100%
                  </th>

                  {/* Activities Items */}
                  {Array.from({ length: actCount }).map((_, idx) => (
                    <th
                      key={`act-max-${idx}`}
                      style={{
                        padding: '0.25rem',
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        textAlign: 'center'
                      }}
                    >
                      <input
                        type="number"
                        min={1}
                        max={999}
                        value={periodMaxItems.activity[idx] ?? 50}
                        onChange={(e) =>
                          activeClass &&
                          updateComponentMaxScore(
                            activeClass.id,
                            activePeriodKey,
                            'activity',
                            idx,
                            Number(e.target.value) || 50
                          )
                        }
                        title={`Number of items for Activity ${idx + 1}`}
                        style={{
                          width: '46px',
                          textAlign: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '0.2rem',
                          borderRadius: '4px',
                          border: '1.5px solid #94a3b8',
                          background: '#ffffff',
                          color: '#0f172a'
                        }}
                      />
                    </th>
                  ))}
                  {/* Activities Total Items (automatic computation) */}
                  <th
                    style={{
                      padding: '0.25rem',
                      border: '1px solid #cbd5e1',
                      background: '#f0fdfa',
                      textAlign: 'center'
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.18rem 0.45rem',
                        borderRadius: '5px',
                        background: '#0f766e',
                        color: '#ffffff',
                        fontWeight: 900,
                        fontSize: '0.78rem',
                        minWidth: '38px'
                      }}
                      title="Total Activity Items (Automatically computed)"
                    >
                      {actTotalItems}
                    </span>
                  </th>
                  <th
                    style={{
                      padding: '0.25rem',
                      border: '1px solid #cbd5e1',
                      background: '#e2e8f0',
                      color: '#475569',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textAlign: 'center'
                    }}
                  >
                    100%
                  </th>

                  {/* Participation Items */}
                  {Array.from({ length: partCount }).map((_, idx) => (
                    <th
                      key={`part-max-${idx}`}
                      style={{
                        padding: '0.25rem',
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        textAlign: 'center'
                      }}
                    >
                      <input
                        type="number"
                        min={1}
                        max={999}
                        value={periodMaxItems.participation[idx] ?? 20}
                        onChange={(e) =>
                          activeClass &&
                          updateComponentMaxScore(
                            activeClass.id,
                            activePeriodKey,
                            'participation',
                            idx,
                            Number(e.target.value) || 20
                          )
                        }
                        title={`Number of items for Participation ${idx + 1}`}
                        style={{
                          width: '46px',
                          textAlign: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '0.2rem',
                          borderRadius: '4px',
                          border: '1.5px solid #94a3b8',
                          background: '#ffffff',
                          color: '#0f172a'
                        }}
                      />
                    </th>
                  ))}
                  {/* Participation Total Items (automatic computation) */}
                  <th
                    style={{
                      padding: '0.25rem',
                      border: '1px solid #cbd5e1',
                      background: '#f3e8ff',
                      textAlign: 'center'
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.18rem 0.45rem',
                        borderRadius: '5px',
                        background: '#581c87',
                        color: '#ffffff',
                        fontWeight: 900,
                        fontSize: '0.78rem',
                        minWidth: '38px'
                      }}
                      title="Total Participation Items (Automatically computed)"
                    >
                      {partTotalItems}
                    </span>
                  </th>
                  <th
                    style={{
                      padding: '0.25rem',
                      border: '1px solid #cbd5e1',
                      background: '#e2e8f0',
                      color: '#475569',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textAlign: 'center'
                    }}
                  >
                    100%
                  </th>

                  {/* Exam Items */}
                  {Array.from({ length: examCount }).map((_, idx) => (
                    <th
                      key={`ex-max-${idx}`}
                      style={{
                        padding: '0.25rem',
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        textAlign: 'center'
                      }}
                    >
                      <input
                        type="number"
                        min={1}
                        max={999}
                        value={periodMaxItems.exam[idx] ?? 100}
                        onChange={(e) =>
                          activeClass &&
                          updateComponentMaxScore(
                            activeClass.id,
                            activePeriodKey,
                            'exam',
                            idx,
                            Number(e.target.value) || 100
                          )
                        }
                        title={`Number of items for Exam ${idx + 1}`}
                        style={{
                          width: '46px',
                          textAlign: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '0.2rem',
                          borderRadius: '4px',
                          border: '1.5px solid #94a3b8',
                          background: '#ffffff',
                          color: '#0f172a'
                        }}
                      />
                    </th>
                  ))}
                  {/* Exam Total Items (automatic computation) */}
                  <th
                    style={{
                      padding: '0.25rem',
                      border: '1px solid #cbd5e1',
                      background: '#fff7ed',
                      textAlign: 'center'
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.18rem 0.45rem',
                        borderRadius: '5px',
                        background: '#9a3412',
                        color: '#ffffff',
                        fontWeight: 900,
                        fontSize: '0.78rem',
                        minWidth: '38px'
                      }}
                      title="Total Exam Items (Automatically computed)"
                    >
                      {examTotalItems}
                    </span>
                  </th>
                  <th
                    style={{
                      padding: '0.25rem',
                      border: '1px solid #cbd5e1',
                      background: '#e2e8f0',
                      color: '#475569',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textAlign: 'center'
                    }}
                  >
                    100%
                  </th>

                  {/* Summary Benchmarks */}
                  <th
                    style={{
                      padding: '0.25rem',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      color: '#64748b',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textAlign: 'center'
                    }}
                  >
                    {activePeriodKey === 'prelim' ? '100%' : '60%'}
                  </th>
                  {activePeriodKey !== 'prelim' && (
                    <th
                      style={{
                        padding: '0.25rem',
                        border: '1px solid #cbd5e1',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        fontSize: '0.72rem',
                        fontWeight: 900,
                        textAlign: 'center'
                      }}
                      title="Auto-synced from previous period"
                    >
                      40%
                    </th>
                  )}
                  <th
                    style={{
                      padding: '0.25rem',
                      border: '1px solid #cbd5e1',
                      background: currentTheme.avgBg,
                      color: currentTheme.accent,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textAlign: 'center'
                    }}
                  >
                    100%
                  </th>
                  <th
                    style={{
                      padding: '0.25rem',
                      border: '1px solid #cbd5e1',
                      background: '#ecfdf5',
                      color: '#047857',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textAlign: 'center'
                    }}
                  >
                    100%
                  </th>
                  <th
                    style={{
                      padding: '0.25rem',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      color: '#64748b',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textAlign: 'center'
                    }}
                  >
                    Target
                  </th>
                </tr>
              </thead>
              <tbody>
                {classSheet.length === 0 ? (
                  <tr>
                    <td
                      colSpan={20}
                      style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}
                    >
                      No students enrolled in this class yet.
                    </td>
                  </tr>
                ) : (
                  classSheet.map((row) => {
                    const termObj = row[activePeriodKey];
                    const hasEncodedPeriod = isTermEncoded(termObj);
                    const termData = ensureTermScores(termObj);
                    const items = termData.items!;
                    const hasAnyOverall = row.average > 0;
                    const roundedOverall = hasAnyOverall ? Math.round(row.average) : null;
                    const isAtRisk =
                      hasAnyOverall &&
                      (row.status === 'At Risk' ||
                        row.status === 'Bound to Fail' ||
                        (roundedOverall !== null && roundedOverall < 75));

                    const inputStyle: React.CSSProperties = {
                      width: '52px',
                      textAlign: 'center',
                      fontWeight: 700,
                      padding: '0.3rem 0.2rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: '0.8rem'
                    };

                    return (
                      <tr
                        key={row.studentId}
                        style={{
                          borderBottom: '1px solid #cbd5e1',
                          background: isAtRisk ? '#fff5f5' : '#ffffff'
                        }}
                      >
                        <td
                          style={{
                            padding: '0.65rem 0.75rem',
                            borderRight: '1px solid #cbd5e1',
                            position: 'sticky',
                            left: 0,
                            background: isAtRisk ? '#fff5f5' : '#ffffff',
                            zIndex: 1
                          }}
                        >
                          <strong
                            style={{ color: '#0f172a', display: 'block', fontSize: '0.88rem' }}
                          >
                            {row.studentName}
                          </strong>
                          <small style={{ color: '#64748b', fontSize: '0.73rem' }}>
                            ID: {row.studentNo}
                          </small>
                        </td>

                        {/* Attendance */}
                        {Array.from({ length: attCount }).map((_, idx) => {
                          const val = items.attendance[idx] ?? 0;
                          return (
                            <td
                              key={`att-${idx}`}
                              style={{
                                padding: '0.35rem',
                                textAlign: 'center',
                                borderRight: '1px solid #e2e8f0'
                              }}
                            >
                              <input
                                type="number"
                                min={0}
                                max={periodMaxItems.attendance[idx] ?? 100}
                                placeholder="-"
                                value={val === 0 && !hasEncodedPeriod ? '' : val}
                                onChange={(e) =>
                                  activeClass &&
                                  updateComponentItemScore(
                                    activeClass.id,
                                    row.studentId,
                                    activePeriodKey,
                                    'attendance',
                                    idx,
                                    clampScore(e.target.value)
                                  )
                                }
                                style={inputStyle}
                              />
                            </td>
                          );
                        })}
                        {/* Attendance Total */}
                        <td
                          style={{
                            padding: '0.4rem 0.5rem',
                            textAlign: 'center',
                            fontWeight: 800,
                            background: '#f8fafc',
                            color: '#0f172a',
                            borderRight: '1px solid #cbd5e1'
                          }}
                        >
                          {hasEncodedPeriod ? (
                            <span style={{ fontWeight: 800 }}>
                              {items.attendance.slice(0, attCount).reduce((a, b) => a + (b || 0), 0)}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td
                          style={{
                            padding: '0.4rem 0.5rem',
                            textAlign: 'center',
                            fontWeight: 900,
                            background: '#f1f5f9',
                            color: '#0f172a',
                            borderRight: '2px solid #94a3b8'
                          }}
                        >
                          {hasEncodedPeriod ? `${Math.round(termData.attendance)}%` : '—'}
                        </td>

                        {/* Quizzes */}
                        {Array.from({ length: quizCount }).map((_, idx) => {
                          const val = items.quiz[idx] ?? 0;
                          return (
                            <td
                              key={`qz-${idx}`}
                              style={{
                                padding: '0.35rem',
                                textAlign: 'center',
                                borderRight: '1px solid #e2e8f0'
                              }}
                            >
                              <input
                                type="number"
                                min={0}
                                max={periodMaxItems.quiz[idx] ?? 100}
                                placeholder="-"
                                value={val === 0 && !hasEncodedPeriod ? '' : val}
                                onChange={(e) =>
                                  activeClass &&
                                  updateComponentItemScore(
                                    activeClass.id,
                                    row.studentId,
                                    activePeriodKey,
                                    'quiz',
                                    idx,
                                    clampScore(e.target.value)
                                  )
                                }
                                style={inputStyle}
                              />
                            </td>
                          );
                        })}
                        {/* Quizzes Total (Automatic computation of student's total quiz score) */}
                        <td
                          style={{
                            padding: '0.4rem 0.5rem',
                            textAlign: 'center',
                            fontWeight: 800,
                            background: '#eff6ff',
                            color: '#1e3a8a',
                            borderRight: '1px solid #bfdbfe'
                          }}
                        >
                          {hasEncodedPeriod ? (
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                background: '#dbeafe',
                                color: '#1e40af',
                                fontWeight: 900
                              }}
                            >
                              {items.quiz.slice(0, quizCount).reduce((a, b) => a + (b || 0), 0)}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td
                          style={{
                            padding: '0.4rem 0.5rem',
                            textAlign: 'center',
                            fontWeight: 900,
                            background: currentTheme.avgBg,
                            color: currentTheme.accent,
                            borderRight: '2px solid #94a3b8'
                          }}
                        >
                          {hasEncodedPeriod ? `${Math.round(termData.quiz)}%` : '—'}
                        </td>

                        {/* Activities */}
                        {Array.from({ length: actCount }).map((_, idx) => {
                          const val = items.activity[idx] ?? 0;
                          return (
                            <td
                              key={`act-${idx}`}
                              style={{
                                padding: '0.35rem',
                                textAlign: 'center',
                                borderRight: '1px solid #e2e8f0'
                              }}
                            >
                              <input
                                type="number"
                                min={0}
                                max={periodMaxItems.activity[idx] ?? 100}
                                placeholder="-"
                                value={val === 0 && !hasEncodedPeriod ? '' : val}
                                onChange={(e) =>
                                  activeClass &&
                                  updateComponentItemScore(
                                    activeClass.id,
                                    row.studentId,
                                    activePeriodKey,
                                    'activity',
                                    idx,
                                    clampScore(e.target.value)
                                  )
                                }
                                style={inputStyle}
                              />
                            </td>
                          );
                        })}
                        {/* Activities Total */}
                        <td
                          style={{
                            padding: '0.4rem 0.5rem',
                            textAlign: 'center',
                            fontWeight: 800,
                            background: '#f0fdfa',
                            color: '#0f766e',
                            borderRight: '1px solid #99f6e4'
                          }}
                        >
                          {hasEncodedPeriod ? (
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                background: '#ccfbf1',
                                color: '#0f766e',
                                fontWeight: 900
                              }}
                            >
                              {items.activity.slice(0, actCount).reduce((a, b) => a + (b || 0), 0)}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td
                          style={{
                            padding: '0.4rem 0.5rem',
                            textAlign: 'center',
                            fontWeight: 900,
                            background: '#f0fdfa',
                            color: '#0f766e',
                            borderRight: '2px solid #94a3b8'
                          }}
                        >
                          {hasEncodedPeriod ? `${Math.round(termData.activity)}%` : '—'}
                        </td>

                        {/* Participation */}
                        {Array.from({ length: partCount }).map((_, idx) => {
                          const val = items.participation?.[idx] ?? 0;
                          return (
                            <td
                              key={`part-${idx}`}
                              style={{
                                padding: '0.35rem',
                                textAlign: 'center',
                                borderRight: '1px solid #e2e8f0'
                              }}
                            >
                              <input
                                type="number"
                                min={0}
                                max={periodMaxItems.participation[idx] ?? 100}
                                placeholder="-"
                                value={val === 0 && !hasEncodedPeriod ? '' : val}
                                onChange={(e) =>
                                  activeClass &&
                                  updateComponentItemScore(
                                    activeClass.id,
                                    row.studentId,
                                    activePeriodKey,
                                    'participation',
                                    idx,
                                    clampScore(e.target.value)
                                  )
                                }
                                style={inputStyle}
                              />
                            </td>
                          );
                        })}
                        {/* Participation Total */}
                        <td
                          style={{
                            padding: '0.4rem 0.5rem',
                            textAlign: 'center',
                            fontWeight: 800,
                            background: '#faf5ff',
                            color: '#6b21a8',
                            borderRight: '1px solid #e9d5ff'
                          }}
                        >
                          {hasEncodedPeriod ? (
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                background: '#f3e8ff',
                                color: '#6b21a8',
                                fontWeight: 900
                              }}
                            >
                              {items.participation.slice(0, partCount).reduce((a, b) => a + (b || 0), 0)}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td
                          style={{
                            padding: '0.4rem 0.5rem',
                            textAlign: 'center',
                            fontWeight: 900,
                            background: '#f3e8ff',
                            color: '#6b21a8',
                            borderRight: '2px solid #94a3b8'
                          }}
                        >
                          {hasEncodedPeriod ? `${Math.round(termData.participation)}%` : '—'}
                        </td>

                        {/* Exam */}
                        {Array.from({ length: examCount }).map((_, idx) => {
                          const val = items.exam[idx] ?? 0;
                          return (
                            <td
                              key={`ex-${idx}`}
                              style={{
                                padding: '0.35rem',
                                textAlign: 'center',
                                borderRight: '1px solid #e2e8f0'
                              }}
                            >
                              <input
                                type="number"
                                min={0}
                                max={periodMaxItems.exam[idx] ?? 100}
                                placeholder="-"
                                value={val === 0 && !hasEncodedPeriod ? '' : val}
                                onChange={(e) =>
                                  activeClass &&
                                  updateComponentItemScore(
                                    activeClass.id,
                                    row.studentId,
                                    activePeriodKey,
                                    'exam',
                                    idx,
                                    clampScore(e.target.value)
                                  )
                                }
                                style={inputStyle}
                              />
                            </td>
                          );
                        })}
                        {/* Exam Total */}
                        <td
                          style={{
                            padding: '0.4rem 0.5rem',
                            textAlign: 'center',
                            fontWeight: 800,
                            background: '#fff7ed',
                            color: '#9a3412',
                            borderRight: '1px solid #fed7aa'
                          }}
                        >
                          {hasEncodedPeriod ? (
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                background: '#ffedd5',
                                color: '#9a3412',
                                fontWeight: 900
                              }}
                            >
                              {items.exam.slice(0, examCount).reduce((a, b) => a + (b || 0), 0)}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td
                          style={{
                            padding: '0.4rem 0.5rem',
                            textAlign: 'center',
                            fontWeight: 900,
                            background: '#fff7ed',
                            color: '#9a3412',
                            borderRight: '2px solid #94a3b8'
                          }}
                        >
                          {hasEncodedPeriod ? `${Math.round(termData.exam)}%` : '—'}
                        </td>

                        {/* Period Raw Grade */}
                        <td
                          style={{
                            padding: '0.5rem',
                            textAlign: 'center',
                            fontWeight: 800,
                            fontSize: '0.88rem',
                            background: '#f8fafc',
                            color: '#334155',
                            borderRight: '1px solid #cbd5e1'
                          }}
                        >
                          {hasEncodedPeriod ? `${Math.round(termData.rawGrade || 0)}%` : '—'}
                        </td>

                        {/* Previous Period Grade (Auto-synced from previous period) */}
                        {activePeriodKey !== 'prelim' && (
                          <td
                            style={{
                              padding: '0.5rem',
                              textAlign: 'center',
                              fontWeight: 800,
                              fontSize: '0.88rem',
                              background: '#eff6ff',
                              color: '#1e40af',
                              borderRight: '1px solid #bfdbfe'
                            }}
                          >
                            {(() => {
                              const prevTermObj =
                                activePeriodKey === 'midterm'
                                  ? row.prelim
                                  : activePeriodKey === 'prefinal'
                                  ? row.midterm
                                  : row.prefinal || row.midterm;
                              const isPrevEncoded = isTermEncoded(prevTermObj);
                              if (!isPrevEncoded) return '—';
                              const prevTermData = ensureTermScores(prevTermObj);
                              const prevGradeVal = Math.round(
                                prevTermData.computedTermGrade ||
                                  prevTermData.termGrade ||
                                  prevTermData.rawGrade ||
                                  0
                              );
                              return (
                                <span
                                  style={{
                                    display: 'inline-block',
                                    padding: '0.15rem 0.45rem',
                                    borderRadius: '4px',
                                    background: '#dbeafe',
                                    color: '#1d4ed8',
                                    fontWeight: 900
                                  }}
                                  title={`Auto-synced ${
                                    activePeriodKey === 'midterm'
                                      ? 'Prelim'
                                      : activePeriodKey === 'prefinal'
                                      ? 'Midterm'
                                      : 'Pre-Final'
                                  } Grade`}
                                >
                                  {prevGradeVal}%
                                </span>
                              );
                            })()}
                          </td>
                        )}

                        {/* Cumulative Period Grade */}
                        <td
                          style={{
                            padding: '0.5rem',
                            textAlign: 'center',
                            fontWeight: 900,
                            fontSize: '0.95rem',
                            background: currentTheme.avgBg,
                            color: currentTheme.accent,
                            borderRight: '1px solid #cbd5e1'
                          }}
                        >
                          {hasEncodedPeriod
                            ? `${Math.round(termData.computedTermGrade)}%`
                            : '—'}
                        </td>

                        {/* Rounded Overall Average */}
                        <td
                          style={{
                            padding: '0.5rem',
                            textAlign: 'center',
                            fontWeight: 900,
                            fontSize: '0.96rem',
                            background: '#ecfdf5',
                            color:
                              roundedOverall === null
                                ? '#64748b'
                                : isAtRisk
                                ? '#b91c1c'
                                : '#065f46',
                            borderRight: '1px solid #cbd5e1'
                          }}
                        >
                          {roundedOverall !== null ? `${roundedOverall}%` : '—'}
                        </td>

                        {/* Status */}
                        <td style={{ textAlign: 'center', padding: '0.45rem' }}>
                          <span
                            style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: '999px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              background:
                                roundedOverall === null
                                  ? '#f1f5f9'
                                  : isAtRisk
                                  ? '#fee2e2'
                                  : '#dcfce7',
                              color:
                                roundedOverall === null
                                  ? '#64748b'
                                  : isAtRisk
                                  ? '#b91c1c'
                                  : '#15803d',
                              border:
                                roundedOverall === null
                                  ? '1px solid #cbd5e1'
                                  : isAtRisk
                                  ? '1px solid #fecaca'
                                  : '1px solid #bbf7d0'
                            }}
                          >
                            {roundedOverall === null
                              ? 'Pending'
                              : isAtRisk
                              ? 'At Risk'
                              : 'Passing'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {/* CASE 2: ALL PERIODS BREAKDOWN OR ROUNDED SUMMARY */}
          {(activePeriodTab === 'ALL' || activePeriodTab === 'SUMMARY') && (
            <table
              style={{
                margin: 0,
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.84rem'
              }}
            >
              <thead>
                <tr style={{ background: '#1e3a8a', color: '#ffffff' }}>
                  <th
                    style={{
                      color: '#ffffff',
                      fontWeight: 800,
                      padding: '0.75rem',
                      textAlign: 'left',
                      minWidth: '180px',
                      border: '1px solid #1e3a8a'
                    }}
                  >
                    Student Name &amp; ID
                  </th>
                  <th
                    style={{
                      color: '#ffffff',
                      fontWeight: 800,
                      textAlign: 'center',
                      padding: '0.65rem',
                      background: '#1d4ed8',
                      border: '1px solid #1e3a8a'
                    }}
                  >
                    Prelim (100% Raw)
                  </th>
                  <th
                    style={{
                      color: '#ffffff',
                      fontWeight: 800,
                      textAlign: 'center',
                      padding: '0.65rem',
                      background: '#6d28d9',
                      border: '1px solid #4c1d95'
                    }}
                  >
                    Midterm (40% P + 60% Raw)
                  </th>
                  <th
                    style={{
                      color: '#ffffff',
                      fontWeight: 800,
                      textAlign: 'center',
                      padding: '0.65rem',
                      background: '#c2410c',
                      border: '1px solid #7c2d12'
                    }}
                  >
                    Pre-Final (40% M + 60% Raw)
                  </th>
                  <th
                    style={{
                      color: '#ffffff',
                      fontWeight: 800,
                      textAlign: 'center',
                      padding: '0.65rem',
                      background: '#059669',
                      border: '1px solid #065f46'
                    }}
                  >
                    Final (40% PF + 60% Raw)
                  </th>
                  <th
                    style={{
                      color: '#ffffff',
                      fontWeight: 900,
                      textAlign: 'center',
                      padding: '0.65rem',
                      background: '#0f766e',
                      border: '1px solid #1e3a8a'
                    }}
                  >
                    Rounded Overall
                  </th>
                  <th
                    style={{
                      color: '#ffffff',
                      fontWeight: 800,
                      textAlign: 'center',
                      padding: '0.65rem',
                      border: '1px solid #1e3a8a'
                    }}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {classSheet.map((row) => {
                  const hasP = isTermEncoded(row.prelim);
                  const hasM = isTermEncoded(row.midterm);
                  const hasPF = isTermEncoded(row.prefinal);
                  const hasF = isTermEncoded(row.final);
                  const hasAny = hasP || hasM || hasPF || hasF;
                  const roundedOverall =
                    hasAny && row.average > 0 ? Math.round(row.average) : null;
                  const isAtRisk = roundedOverall !== null && roundedOverall < 75;

                  return (
                    <tr
                      key={row.studentId}
                      style={{
                        borderBottom: '1px solid #cbd5e1',
                        background: isAtRisk ? '#fff5f5' : '#ffffff'
                      }}
                    >
                      <td
                        style={{
                          padding: '0.65rem 0.75rem',
                          borderRight: '1px solid #cbd5e1'
                        }}
                      >
                        <strong
                          style={{ color: '#0f172a', display: 'block', fontSize: '0.88rem' }}
                        >
                          {row.studentName}
                        </strong>
                        <small style={{ color: '#64748b', fontSize: '0.73rem' }}>
                          ID: {row.studentNo}
                        </small>
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          fontWeight: 800,
                          color: '#1e40af',
                          background: '#eff6ff',
                          borderRight: '1px solid #cbd5e1',
                          padding: '0.6rem'
                        }}
                      >
                        {hasP ? (
                          <div>
                            <div style={{ fontSize: '0.95rem' }}>
                              {Math.round(row.prelim.termGrade)}%
                            </div>
                            {activePeriodTab === 'ALL' && (
                              <small style={{ color: '#64748b', fontWeight: 500 }}>
                                Raw: {Math.round(row.prelim.rawGrade || row.prelim.termGrade)}%
                              </small>
                            )}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          fontWeight: 800,
                          color: '#5b21b6',
                          background: '#f5f3ff',
                          borderRight: '1px solid #cbd5e1',
                          padding: '0.6rem'
                        }}
                      >
                        {hasM ? (
                          <div>
                            <div style={{ fontSize: '0.95rem' }}>
                              {Math.round(row.midterm.termGrade)}%
                            </div>
                            {activePeriodTab === 'ALL' && (
                              <small style={{ color: '#64748b', fontWeight: 500 }}>
                                Raw: {Math.round(row.midterm.rawGrade || 0)}%
                              </small>
                            )}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          fontWeight: 800,
                          color: '#9a3412',
                          background: '#fff7ed',
                          borderRight: '1px solid #cbd5e1',
                          padding: '0.6rem'
                        }}
                      >
                        {hasPF && row.prefinal ? (
                          <div>
                            <div style={{ fontSize: '0.95rem' }}>
                              {Math.round(row.prefinal.termGrade)}%
                            </div>
                            {activePeriodTab === 'ALL' && (
                              <small style={{ color: '#64748b', fontWeight: 500 }}>
                                Raw: {Math.round(row.prefinal.rawGrade || 0)}%
                              </small>
                            )}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          fontWeight: 800,
                          color: '#065f46',
                          background: '#ecfdf5',
                          borderRight: '1px solid #cbd5e1',
                          padding: '0.6rem'
                        }}
                      >
                        {hasF ? (
                          <div>
                            <div style={{ fontSize: '0.95rem' }}>
                              {Math.round(row.final.termGrade)}%
                            </div>
                            {activePeriodTab === 'ALL' && (
                              <small style={{ color: '#64748b', fontWeight: 500 }}>
                                Raw: {Math.round(row.final.rawGrade || 0)}%
                              </small>
                            )}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          background: '#ecfdf5',
                          fontWeight: 900,
                          color:
                            roundedOverall === null
                              ? '#64748b'
                              : isAtRisk
                              ? '#b91c1c'
                              : '#065f46',
                          fontSize: '0.98rem',
                          borderRight: '1px solid #cbd5e1'
                        }}
                      >
                        {roundedOverall !== null ? `${roundedOverall}%` : '—'}
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.45rem' }}>
                        <span
                          style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: '999px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background:
                              roundedOverall === null
                                ? '#f1f5f9'
                                : isAtRisk
                                ? '#fee2e2'
                                : '#dcfce7',
                            color:
                              roundedOverall === null
                                ? '#64748b'
                                : isAtRisk
                                ? '#b91c1c'
                                : '#15803d',
                            border:
                              roundedOverall === null
                                ? '1px solid #cbd5e1'
                                : isAtRisk
                                ? '1px solid #fecaca'
                                : '1px solid #bbf7d0'
                          }}
                        >
                          {roundedOverall === null
                            ? 'Pending'
                            : isAtRisk
                            ? 'At Risk'
                            : 'Passing'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

export default Gradebook;
