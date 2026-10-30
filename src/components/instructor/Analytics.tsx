import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../hooks/useAuth';
import { getSubjectTitle, formatCourseSection, isTermEncoded } from '../../utils/helpers';
import { TrendingUp, AlertTriangle, ArrowRight, Search, FileText } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { classes, selectedClass, setSelectedClassId, subjects, detailedGradingSheets, setActiveSection } =
    useData();
  const { activeUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'AT_RISK' | 'ON_TRACK' | 'GOOD'>('ALL');

  const instructorClasses = useMemo(() => {
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
    if (selectedClass && instructorClasses.some((c) => c.id === selectedClass.id)) {
      return selectedClass;
    }
    return instructorClasses[0] || null;
  }, [selectedClass, instructorClasses]);

  const subjectTitle = activeClass
    ? getSubjectTitle(subjects, activeClass.subject_id)
    : 'No Assigned Class';

  const classSheets = useMemo(() => {
    if (!activeClass) return [];
    return detailedGradingSheets[activeClass.id] || [];
  }, [activeClass, detailedGradingSheets]);

  // Compute real period averages for the selected class
  const { prelimTrend, midtermTrend, prefinalTrend, currentTrend } = useMemo(() => {
    const pRows = classSheets.filter((s) => isTermEncoded(s.prelim));
    const mRows = classSheets.filter((s) => isTermEncoded(s.midterm));
    const pfRows = classSheets.filter((s) => isTermEncoded(s.prefinal));
    const curRows = classSheets.filter((s) => s.overallGrade > 0);

    return {
      prelimTrend:
        pRows.length > 0
          ? Math.round(pRows.reduce((a, b) => a + Math.round(b.prelim.termGrade), 0) / pRows.length)
          : null,
      midtermTrend:
        mRows.length > 0
          ? Math.round(
              mRows.reduce((a, b) => a + Math.round(b.midterm.termGrade), 0) / mRows.length
            )
          : null,
      prefinalTrend:
        pfRows.length > 0
          ? Math.round(
              pfRows.reduce((a, b) => a + Math.round(b.prefinal?.termGrade || 0), 0) /
                pfRows.length
            )
          : null,
      currentTrend:
        curRows.length > 0
          ? Math.round(curRows.reduce((a, b) => a + Math.round(b.overallGrade), 0) / curRows.length)
          : null
    };
  }, [classSheets]);

  // Real student rows for the active class (zero fake Student A/B/C)
  const classStudentAnalytics = useMemo(() => {
    return classSheets.map((sheet) => {
      const hasAny =
        isTermEncoded(sheet.prelim) ||
        isTermEncoded(sheet.midterm) ||
        isTermEncoded(sheet.prefinal) ||
        isTermEncoded(sheet.final);
      const currentGrade = hasAny && sheet.overallGrade > 0 ? Math.round(sheet.overallGrade) : null;
      const predictedPerformance =
        currentGrade !== null
          ? Math.round(sheet.predictedFinal || currentGrade)
          : null;

      let status: 'At Risk' | 'On Track' | 'Good' | 'Pending' = 'Pending';
      if (currentGrade !== null) {
        if (currentGrade < 75) status = 'At Risk';
        else if (currentGrade >= 85) status = 'Good';
        else status = 'On Track';
      }

      const guidance =
        status === 'Pending'
          ? 'Awaiting grade encoding in Gradebook.'
          : status === 'At Risk'
          ? 'Below passing threshold (75%). Immediate academic intervention recommended.'
          : status === 'Good'
          ? 'Strong academic standing (85% and above).'
          : 'Maintaining passing performance (75%–84%).';

      return {
        studentId: sheet.studentId,
        studentName: sheet.studentName,
        studentNo: sheet.studentNo,
        currentGrade,
        predictedPerformance,
        status,
        guidance
      };
    });
  }, [classSheets]);

  const atRiskCount = classStudentAnalytics.filter((s) => s.status === 'At Risk').length;

  const filteredList = classStudentAnalytics.filter((item) => {
    if (filter === 'AT_RISK' && item.status !== 'At Risk') return false;
    if (filter === 'ON_TRACK' && item.status !== 'On Track') return false;
    if (filter === 'GOOD' && item.status !== 'Good') return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        (item.studentName || '').toLowerCase().includes(q) || (item.studentNo || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
      {/* Header */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
          borderRadius: '16px',
          padding: '1.6rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
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
              padding: '0.25rem 0.65rem',
              borderRadius: '999px'
            }}
          >
            {subjectTitle} ({formatCourseSection(activeClass?.section?.name || '')})
          </span>
          <h3
            style={{
              margin: '0.5rem 0 0.25rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '1.5rem',
              color: '#0f172a',
              fontWeight: 800
            }}
          >
            <TrendingUp size={22} color="#2563eb" /> Class Analytics &amp; Performance Forecasting
          </h3>
          <p style={{ margin: 0, color: '#475569', fontSize: '0.92rem' }}>
            Real-time student grade forecasting and trajectory based on actual encoded class scores.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {instructorClasses.length > 1 && (
            <select
              value={activeClass?.id || ''}
              onChange={(e) => setSelectedClassId(e.target.value)}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                background: '#f8fafc',
                color: '#0f172a',
                fontWeight: 700,
                fontSize: '0.88rem'
              }}
            >
              {instructorClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.subject?.code} — {getSubjectTitle(subjects, cls.subject_id)} (
                  {formatCourseSection(cls.section?.name || '')})
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            className="btn-primary"
            onClick={() => setActiveSection('reports')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.65rem 1.2rem',
              fontWeight: 700,
              borderRadius: '10px'
            }}
          >
            <FileText size={16} /> Generate Analytics Report
          </button>
        </div>
      </div>

      {/* Performance Trend & At-Risk Alert Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.4rem'
        }}
      >
        <section
          style={{
            padding: '1.6rem 2rem',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
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
                borderRadius: '999px'
              }}
            >
              PERFORMANCE TREND
            </span>
            <h4
              style={{
                margin: '0.6rem 0 1rem 0',
                fontSize: '1.25rem',
                color: '#0f172a',
                fontWeight: 800
              }}
            >
              Class Progress Trajectory (Rounded)
            </h4>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                padding: '1.2rem',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    fontWeight: 700
                  }}
                >
                  Prelim
                </span>
                <div
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    marginTop: '0.2rem'
                  }}
                >
                  {prelimTrend !== null ? `${prelimTrend}%` : '—'}
                </div>
              </div>

              <ArrowRight size={18} color="#2563eb" />

              <div style={{ textAlign: 'center' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#1d4ed8',
                    textTransform: 'uppercase',
                    fontWeight: 700
                  }}
                >
                  Midterm
                </span>
                <div
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: '#1d4ed8',
                    marginTop: '0.2rem'
                  }}
                >
                  {midtermTrend !== null ? `${midtermTrend}%` : '—'}
                </div>
              </div>

              <ArrowRight size={18} color="#c2410c" />

              <div style={{ textAlign: 'center' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#c2410c',
                    textTransform: 'uppercase',
                    fontWeight: 700
                  }}
                >
                  Pre-Final
                </span>
                <div
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: '#c2410c',
                    marginTop: '0.2rem'
                  }}
                >
                  {prefinalTrend !== null ? `${prefinalTrend}%` : '—'}
                </div>
              </div>

              <ArrowRight size={18} color="#059669" />

              <div style={{ textAlign: 'center' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#047857',
                    textTransform: 'uppercase',
                    fontWeight: 700
                  }}
                >
                  Current Avg
                </span>
                <div
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: '#059669',
                    marginTop: '0.2rem'
                  }}
                >
                  {currentTrend !== null ? `${currentTrend}%` : '—'}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: '1rem',
              padding: '0.65rem 1rem',
              borderRadius: '10px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#334155',
              fontSize: '0.84rem',
              fontWeight: 600,
              textAlign: 'center'
            }}
          >
            {currentTrend !== null
              ? `Active Class Standing: ${currentTrend}% across encoded students`
              : 'Encode student scores in the Gradebook to populate the class trajectory'}
          </div>
        </section>

        {/* At-Risk Students Alert Card */}
        <section
          style={{
            padding: '1.6rem 2rem',
            background: '#fff5f5',
            borderRadius: '16px',
            border: '1.5px solid #fecaca',
            boxShadow: '0 4px 16px -2px rgba(239, 68, 68, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                background: '#fee2e2',
                color: '#b91c1c',
                border: '1px solid #fca5a5',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px'
              }}
            >
              AT-RISK STUDENTS ALERT
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                marginTop: '0.6rem'
              }}
            >
              <AlertTriangle size={28} color="#dc2626" />
              <h4 style={{ margin: 0, fontSize: '1.4rem', color: '#991b1b', fontWeight: 800 }}>
                {atRiskCount} {atRiskCount === 1 ? 'Student' : 'Students'} At Risk
              </h4>
            </div>
            <p
              style={{
                margin: '0.8rem 0 1.2rem 0',
                fontSize: '0.9rem',
                color: '#7f1d1d',
                lineHeight: 1.5
              }}
            >
              Students whose encoded cumulative grade is below 75% are flagged here for early academic intervention.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setFilter('AT_RISK')}
            style={{
              padding: '0.7rem 1.2rem',
              borderRadius: '10px',
              background: '#ef4444',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.9rem',
              width: '100%'
            }}
          >
            Filter At-Risk Students Only
          </button>
        </section>
      </div>

      {/* Student Predictive Analytics Breakdown Table */}
      <section
        style={{
          padding: '1.6rem 2rem',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <h4 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
              Student Predictive Analytics Breakdown ({classStudentAnalytics.length})
            </h4>
            <p style={{ margin: '0.2rem 0 0 0', color: '#475569', fontSize: '0.9rem' }}>
              Showing actual enrolled students in {subjectTitle}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              style={{
                cursor: 'pointer',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: filter === 'ALL' ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                background: filter === 'ALL' ? '#eff6ff' : '#f8fafc',
                color: filter === 'ALL' ? '#1d4ed8' : '#475569'
              }}
            >
              All ({classStudentAnalytics.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('AT_RISK')}
              style={{
                cursor: 'pointer',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: filter === 'AT_RISK' ? '1.5px solid #ef4444' : '1px solid #fecaca',
                background: filter === 'AT_RISK' ? '#fee2e2' : '#fff5f5',
                color: '#b91c1c'
              }}
            >
              At Risk ({atRiskCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('ON_TRACK')}
              style={{
                cursor: 'pointer',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: filter === 'ON_TRACK' ? '1.5px solid #059669' : '1px solid #bbf7d0',
                background: filter === 'ON_TRACK' ? '#f0fdf4' : '#ffffff',
                color: '#15803d'
              }}
            >
              On Track
            </button>
            <button
              type="button"
              onClick={() => setFilter('GOOD')}
              style={{
                cursor: 'pointer',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: filter === 'GOOD' ? '1.5px solid #7c3aed' : '1px solid #e9d5ff',
                background: filter === 'GOOD' ? '#faf5ff' : '#ffffff',
                color: '#7e22ce'
              }}
            >
              Good
            </button>

            <div style={{ position: 'relative', width: '230px' }}>
              <input
                placeholder="Search student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '2.2rem',
                  paddingRight: '0.8rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  borderRadius: '10px',
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.86rem',
                  boxSizing: 'border-box'
                }}
              />
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b'
                }}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            overflowX: 'auto',
            marginTop: '1.2rem',
            border: '1px solid #e2e8f0',
            borderRadius: '12px'
          }}
        >
          <table style={{ margin: 0, width: '100%' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ color: '#0f172a', fontWeight: 700 }}>Student</th>
                <th style={{ color: '#0f172a', fontWeight: 700 }}>Current Rounded Grade</th>
                <th style={{ color: '#0f172a', fontWeight: 700 }}>Predicted Final</th>
                <th style={{ color: '#0f172a', fontWeight: 700 }}>Status</th>
                <th style={{ color: '#0f172a', fontWeight: 700 }}>Guidance / Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: 'center', padding: '1.8rem', color: '#64748b' }}
                  >
                    No students match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const isAtRisk = item.status === 'At Risk';
                  const isGood = item.status === 'Good';
                  const isPending = item.status === 'Pending';

                  return (
                    <tr
                      key={item.studentId}
                      style={{
                        background: isAtRisk ? '#fff5f5' : '#ffffff',
                        borderBottom: '1px solid #f1f5f9'
                      }}
                    >
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <strong style={{ color: '#0f172a', display: 'block' }}>
                          {item.studentName}
                        </strong>
                        <small style={{ color: '#64748b' }}>{item.studentNo}</small>
                      </td>
                      <td>
                        <strong
                          style={{
                            fontSize: '1rem',
                            color: isAtRisk ? '#dc2626' : '#0f172a',
                            fontWeight: 800
                          }}
                        >
                          {item.currentGrade !== null ? `${item.currentGrade}%` : '—'}
                        </strong>
                      </td>
                      <td>
                        <strong
                          style={{
                            fontSize: '1rem',
                            color: isAtRisk ? '#d97706' : '#1d4ed8',
                            fontWeight: 800
                          }}
                        >
                          {item.predictedPerformance !== null
                            ? `${item.predictedPerformance}%`
                            : '—'}
                        </strong>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '0.25rem 0.7rem',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: isPending
                              ? '#f1f5f9'
                              : isAtRisk
                              ? '#fee2e2'
                              : isGood
                              ? '#faf5ff'
                              : '#f0fdf4',
                            color: isPending
                              ? '#64748b'
                              : isAtRisk
                              ? '#b91c1c'
                              : isGood
                              ? '#7e22ce'
                              : '#15803d',
                            border: isPending
                              ? '1px solid #cbd5e1'
                              : isAtRisk
                              ? '1px solid #fecaca'
                              : isGood
                              ? '1px solid #e9d5ff'
                              : '1px solid #bbf7d0'
                          }}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <small
                          style={{
                            color: isAtRisk ? '#991b1b' : '#64748b',
                            fontWeight: isAtRisk ? 600 : 500
                          }}
                        >
                          {item.guidance}
                        </small>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Analytics;
