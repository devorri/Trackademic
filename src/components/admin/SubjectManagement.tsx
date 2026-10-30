import React, { useState } from 'react';
import { BookOpen, Edit3, Trash2, X, Search, ClipboardList } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { ClassManagement } from './ClassManagement';

export const SubjectManagement: React.FC = () => {
  const {
    subjects,
    classes,
    subjectForm,
    setSubjectForm,
    editingSubjectId,
    handleSaveSubject,
    handleEditSubject,
    deleteSubject,
    resetSubjectForm,
    subjectQuery,
    setSubjectQuery,
    filteredSubjects
  } = useData();

  const [activeTab, setActiveTab] = useState<'classes' | 'subjects'>('classes');

  return (
    <section className="content-section">
      <div className="section-header">
        <div>
          <h1>Subjects &amp; Classes</h1>
          <p className="section-subtitle">
            Manage curriculum subjects, assign instructors, schedule classes, and enroll students.
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'inline-flex',
            background: '#e2e8f0',
            padding: '4px',
            borderRadius: '10px',
            gap: '4px'
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('classes')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '7px',
              border: 'none',
              background: activeTab === 'classes' ? '#ffffff' : 'transparent',
              color: activeTab === 'classes' ? '#1d4ed8' : '#475569',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'classes' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <ClipboardList size={16} />
            <span>Class &amp; Instructor Assignments ({classes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('subjects')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '7px',
              border: 'none',
              background: activeTab === 'subjects' ? '#ffffff' : 'transparent',
              color: activeTab === 'subjects' ? '#1d4ed8' : '#475569',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'subjects' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <BookOpen size={16} />
            <span>Curriculum Subjects Catalog ({subjects.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'classes' ? (
        <ClassManagement />
      ) : (
        <>
          {/* Add / Edit Subject Form */}
          <article className="panel" style={{ marginBottom: '24px' }}>
            <div className="panel-header">
              <div>
                <h2>{editingSubjectId ? 'Edit Subject' : 'Create New Subject'}</h2>
                <p>Add a new course offering to the academic catalog.</p>
              </div>
              {editingSubjectId && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={resetSubjectForm}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    color: '#334155',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  <X size={15} />
                  Cancel Edit
                </button>
              )}
            </div>

            <form className="entity-form" onSubmit={handleSaveSubject}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', width: '100%' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                    Subject Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CS101, IT202, GE7"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm((cur) => ({ ...cur, code: e.target.value.toUpperCase() }))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      fontSize: '0.95rem',
                      fontWeight: 700
                    }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                    Descriptive Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Data Structures and Algorithms"
                    value={subjectForm.title}
                    onChange={(e) => setSubjectForm((cur) => ({ ...cur, title: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      fontSize: '0.95rem'
                    }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                    Credit Units *
                  </label>
                  <select
                    value={subjectForm.units}
                    onChange={(e) => setSubjectForm((cur) => ({ ...cur, units: Number(e.target.value) }))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      fontSize: '0.95rem',
                      fontWeight: 500
                    }}
                  >
                    <option value={1}>1.0 Unit</option>
                    <option value={2}>2.0 Units</option>
                    <option value={3}>3.0 Units</option>
                    <option value={4}>4.0 Units</option>
                    <option value={5}>5.0 Units</option>
                    <option value={6}>6.0 Units</option>
                  </select>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      padding: '10px 14px',
                      background: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '8px',
                      height: '42px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(subjectForm.hasLab)}
                      onChange={(e) => setSubjectForm((cur) => ({ ...cur, hasLab: e.target.checked }))}
                      style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <span style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>
                      With Laboratory Component
                    </span>
                  </label>
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="submit" className="primary-btn">
                  <BookOpen size={16} />
                  <span>{editingSubjectId ? 'Update Subject' : 'Add Subject'}</span>
                </button>
              </div>
            </form>
          </article>

          {/* Subjects Table */}
          <article className="panel">
            <div className="panel-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2>Curriculum Subjects Directory</h2>
                <p>Showing {filteredSubjects.length} accredited subject(s)</p>
              </div>

              <div style={{ position: 'relative', minWidth: '240px' }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b'
                  }}
                />
                <input
                  type="search"
                  placeholder="Search code or title..."
                  value={subjectQuery}
                  onChange={(e) => setSubjectQuery(e.target.value)}
                  style={{
                    paddingLeft: '36px',
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    color: '#0f172a'
                  }}
                />
              </div>
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Subject Code</th>
                    <th>Descriptive Title</th>
                    <th>Units</th>
                    <th>Components</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubjects.map((subject) => {
                    const isLab =
                      Boolean(subject.has_laboratory ?? subject.hasLab) ||
                      subject.title.toLowerCase().includes('lab') ||
                      subject.code.toLowerCase().includes('it') ||
                      subject.code.toLowerCase().includes('cs');
                    return (
                      <tr key={subject.id}>
                        <td>
                          <strong style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 700 }}>
                            {subject.code}
                          </strong>
                        </td>
                        <td>
                          <span style={{ color: '#1e293b', fontWeight: 600, fontSize: '0.92rem' }}>
                            {subject.title}
                          </span>
                        </td>
                        <td style={{ color: '#334155', fontWeight: 600 }}>{subject.units}.0</td>
                        <td>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '999px',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              background: isLab ? '#eff6ff' : '#f0fdf4',
                              color: isLab ? '#1d4ed8' : '#15803d',
                              border: isLab ? '1px solid #bfdbfe' : '1px solid #bbf7d0'
                            }}
                          >
                            {isLab ? 'Lecture + Lab' : 'Lecture Only'}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              type="button"
                              className="ghost-btn"
                              onClick={() => handleEditSubject(subject)}
                            >
                              <Edit3 size={14} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              className="danger-btn"
                              onClick={() => deleteSubject(subject.id)}
                            >
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredSubjects.length === 0 && (
                    <tr>
                      <td colSpan={5} className="empty-cell">
                        No subjects match your current search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </>
      )}
    </section>
  );
};

export default SubjectManagement;
