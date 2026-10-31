import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import type { ClassRecord } from '../../utils/types';
import { getSubjectTitle, formatCourseSection, formatYearLevel } from '../../utils/helpers';
import { dbInstructors, dbSections } from '../../utils/db';
import {
  Plus,
  User,
  MapPin,
  Clock,
  Users,
  BookOpen,
  Pencil,
  Trash2,
  Search,
  CheckSquare
} from 'lucide-react';

export const ClassManagement: React.FC = () => {
  const {
    classes,
    subjects,
    instructors,
    students,
    sections,
    createClass,
    updateClass,
    deleteClass,
    setSelectedClassId,
    setActiveSection
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [classSearch, setClassSearch] = useState('');

  const [formSubjectId, setFormSubjectId] = useState<string>(subjects[0]?.id || '');
  const [formSection, setFormSection] = useState('');
  const [formInstructorId, setFormInstructorId] = useState<string>(instructors[0]?.id || '');
  const [formRoom, setFormRoom] = useState('');
  const [formSchedule, setFormSchedule] = useState('');
  const [formSchoolYear, setFormSchoolYear] = useState('2025-2026');
  const [formSemester, setFormSemester] = useState('1st Semester');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentModalSearch, setStudentModalSearch] = useState('');

  // Dynamic Course & Section suggestions strictly from database (sections, classes, students) — zero fake defaults
  const courseSectionSuggestions = useMemo(() => {
    const set = new Set<string>();
    sections.forEach((sec) => {
      const val = formatCourseSection(sec.course ? `${sec.course} ${sec.name}` : sec.name);
      if (val && val !== 'Unassigned') set.add(val);
    });
    classes.forEach((cls) => {
      const val = formatCourseSection(cls.section?.name || cls.section_id || '');
      if (val && val !== 'Unassigned') set.add(val);
    });
    students.forEach((stu) => {
      const val = formatCourseSection(stu.course, stu.section_label);
      if (val && val !== 'Unassigned') set.add(val);
    });
    return Array.from(set).sort();
  }, [sections, classes, students]);

  // Active students matching search inside the modal
  const activeStudents = useMemo(
    () => students.filter((s) => s.status !== 'dropped'),
    [students]
  );

  const filteredModalStudents = useMemo(() => {
    const q = studentModalSearch.trim().toLowerCase();
    return activeStudents.filter((st) => {
      if (!q) return true;
      const sec = formatCourseSection(st.course, st.section_label).toLowerCase();
      return (
        (st.name || '').toLowerCase().includes(q) ||
        (st.student_no || st.studentNo || '').toLowerCase().includes(q) ||
        sec.includes(q)
      );
    });
  }, [activeStudents, studentModalSearch]);

  function handleOpenCreateModal() {
    setEditingClassId(null);
    const defaultSec = courseSectionSuggestions[0] || '';
    setFormSubjectId(subjects[0]?.id || '');
    setFormSection(defaultSec);
    setFormInstructorId(instructors[0]?.id || '');
    setFormRoom('Room 201');
    setFormSchedule('MWF 9:00 AM - 10:30 AM');
    setFormSchoolYear('2025-2026');
    setFormSemester('1st Semester');
    setStudentModalSearch('');
    // Pre-select active students matching defaultSec
    const matchingIds = defaultSec
      ? activeStudents
        .filter(
          (s) =>
            formatCourseSection(s.course, s.section_label).toLowerCase() === defaultSec.toLowerCase()
        )
        .map((s) => s.id)
      : [];
    setSelectedStudentIds(matchingIds);
    setIsModalOpen(true);
  }

  function handleOpenEditModal(cls: ClassRecord) {
    setEditingClassId(cls.id);
    setFormSubjectId(cls.subject_id || '');
    setFormSection(formatCourseSection(cls.section?.name || ''));
    setFormInstructorId(cls.instructor_id || '');
    setFormRoom(cls.room || '');
    setFormSchedule(cls.schedule || '');
    setFormSchoolYear(cls.section?.school_year || '2025-2026');
    setFormSemester(cls.section?.semester || '1st Semester');
    setStudentModalSearch('');
    setSelectedStudentIds(cls.studentIds || cls.student_ids || []);
    setIsModalOpen(true);
  }

  function handleToggleStudent(studentId: string) {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  }

  function handleSelectAllVisibleStudents() {
    const visibleIds = filteredModalStudents.map((s) => s.id);
    const allVisibleSelected =
      visibleIds.length > 0 && visibleIds.every((id) => selectedStudentIds.includes(id));
    if (allVisibleSelected) {
      setSelectedStudentIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  }

  function handleSelectSectionStudents(targetSection: string) {
    const normalized = formatCourseSection(targetSection).toLowerCase();
    const matching = activeStudents
      .filter(
        (s) => formatCourseSection(s.course, s.section_label).toLowerCase() === normalized
      )
      .map((s) => s.id);
    setSelectedStudentIds(matching);
  }

  async function handleSubmitClass(e: React.FormEvent) {
    e.preventDefault();
    const cleanedSection = formatCourseSection(formSection);
    if (!formSubjectId || !cleanedSection || !formInstructorId) {
      alert('Please fill out Subject, Course & Section, and Instructor.');
      return;
    }

    try {
      let instructorIdToUse = formInstructorId;
      const existingInst = await dbInstructors.getById(formInstructorId).catch(() => null);
      if (existingInst) {
        instructorIdToUse = existingInst.id;
      } else {
        const matchedInst = instructors.find((i) => i.id === formInstructorId);
        const profileId = matchedInst?.profile_id || formInstructorId;
        const existingByProfile = await dbInstructors.getByProfileId(profileId).catch(() => null);
        if (existingByProfile) {
          instructorIdToUse = existingByProfile.id;
        } else if (
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId)
        ) {
          try {
            const created = await dbInstructors.create({
              profile_id: profileId,
              employee_no: `EMP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
              department: undefined
            });
            instructorIdToUse = created.id;
          } catch (err) {
            console.warn('Instructor creation fallback:', err);
          }
        }
      }

      const coursePrefix = cleanedSection.split(/[\s-]+/)[0] || '';

      if (editingClassId) {
        const cls = classes.find((c) => c.id === editingClassId);
        const sectionId = cls?.section_id || cls?.section?.id || 'sec-' + editingClassId;

        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sectionId)) {
          await dbSections
            .update(sectionId, {
              name: cleanedSection,
              course: coursePrefix,
              school_year: formSchoolYear,
              semester: formSemester
            })
            .catch(() => null);
        }

        await updateClass(editingClassId, {
          subject_id: formSubjectId,
          section_id: sectionId,
          instructor_id: instructorIdToUse,
          room: formRoom || 'TBA',
          schedule: formSchedule || 'TBA',
          studentIds: selectedStudentIds,
          section: {
            id: sectionId,
            name: cleanedSection,
            course: coursePrefix,
            school_year: formSchoolYear,
            semester: formSemester,
            created_at: cls?.section?.created_at || new Date().toISOString()
          }
        });
      } else {
        let sectionId: string = crypto.randomUUID();
        try {
          const section = await dbSections.create({
            name: cleanedSection,
            course: coursePrefix,
            school_year: formSchoolYear,
            semester: formSemester
          });
          if (section?.id) sectionId = section.id;
        } catch (err) {
          console.warn('Section create fallback:', err);
        }

        await createClass({
          subject_id: formSubjectId,
          section_id: sectionId,
          instructor_id: instructorIdToUse,
          room: formRoom || 'TBA',
          schedule: formSchedule || 'TBA',
          studentIds: selectedStudentIds,
          section: {
            id: sectionId,
            name: cleanedSection,
            course: coursePrefix,
            school_year: formSchoolYear,
            semester: formSemester,
            created_at: new Date().toISOString()
          }
        });
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error submitting class:', error);
      alert('Failed to save class: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  const filteredClasses = classes.filter((cls) => {
    const subjectTitle = getSubjectTitle(subjects, cls.subject_id);
    const subjectObj = subjects.find((s) => s.id === cls.subject_id);
    const instructorName =
      cls.instructor?.name ||
      instructors.find((i) => i.id === cls.instructor_id || i.profile_id === cls.instructor_id)
        ?.name ||
      '';
    return [
      subjectTitle,
      subjectObj?.code || '',
      cls.room || '',
      cls.schedule || '',
      cls.section?.name || '',
      instructorName
    ]
      .join(' ')
      .toLowerCase()
      .includes(classSearch.toLowerCase());
  });

  return (
    <div className="class-management-container">
      <div className="panel data-card">
        <div
          className="card-heading"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <h3>Class Creation &amp; Instructor Assignment</h3>
            <span className="chip">
              Assign subjects to instructors, set schedules, and enroll students from any Course &amp; Section
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              placeholder="Search class, section, instructor..."
              value={classSearch}
              onChange={(e) => setClassSearch(e.target.value)}
              style={{ maxWidth: '250px' }}
            />
            <button
              type="button"
              className="btn-primary"
              onClick={handleOpenCreateModal}
              style={{
                padding: '0.6rem 1.2rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Plus size={16} /> Create New Class
            </button>
          </div>
        </div>

        {filteredClasses.length === 0 ? (
          <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
            <p style={{ margin: 0, fontSize: '1rem' }}>
              {classes.length === 0
                ? 'No active classes created yet. Click "+ Create New Class" to assign an instructor and section.'
                : `No classes found matching "${classSearch}"`}
            </p>
          </div>
        ) : (
          <div
            className="classes-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.2rem',
              marginTop: '1.5rem'
            }}
          >
            {filteredClasses.map((cls) => {
              const subjectTitle = getSubjectTitle(subjects, cls.subject_id);
              const subjectObj = subjects.find((s) => s.id === cls.subject_id);
              const instructorName =
                cls.instructor?.name ||
                instructors.find(
                  (i) => i.id === cls.instructor_id || i.profile_id === cls.instructor_id
                )?.name ||
                'Unassigned';
              return (
                <div
                  key={cls.id}
                  className="class-card panel"
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: '#ffffff',
                    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.8rem'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <span
                          className="chip"
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #dbeafe',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '6px'
                          }}
                        >
                          {subjectObj?.code || cls.subject?.code || 'SUBJECT'}
                        </span>
                        <h4
                          style={{
                            margin: '0.5rem 0 0.25rem 0',
                            fontSize: '1.15rem',
                            color: '#0f172a',
                            fontWeight: 700,
                            lineHeight: 1.3
                          }}
                        >
                          {subjectTitle}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569' }}>
                          Course &amp; Section:{' '}
                          <strong style={{ color: '#0f172a' }}>
                            {formatCourseSection(cls.section?.name || '')}
                          </strong>
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.6rem',
                        margin: '0.8rem 0 1.2rem 0',
                        padding: '0.9rem 1rem',
                        background: '#f8fafc',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.55rem',
                          fontSize: '0.86rem',
                          color: '#334155'
                        }}
                      >
                        <User size={15} style={{ color: '#2563eb', flexShrink: 0 }} />
                        <span>
                          <strong style={{ color: '#0f172a' }}>Instructor:</strong> {instructorName}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.55rem',
                          fontSize: '0.86rem',
                          color: '#334155'
                        }}
                      >
                        <MapPin size={15} style={{ color: '#7c3aed', flexShrink: 0 }} />
                        <span>
                          <strong style={{ color: '#0f172a' }}>Room:</strong> {cls.room}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.55rem',
                          fontSize: '0.86rem',
                          color: '#334155'
                        }}
                      >
                        <Clock size={15} style={{ color: '#16a34a', flexShrink: 0 }} />
                        <span>
                          <strong style={{ color: '#0f172a' }}>Schedule:</strong> {cls.schedule}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.55rem',
                          fontSize: '0.86rem',
                          color: '#334155'
                        }}
                      >
                        <Users size={15} style={{ color: '#d97706', flexShrink: 0 }} />
                        <span>
                          <strong style={{ color: '#0f172a' }}>Enrolled:</strong>{' '}
                          <span
                            className="chip"
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.15rem 0.5rem',
                              background: '#e2e8f0',
                              color: '#0f172a',
                              fontWeight: 600
                            }}
                          >
                            {cls.studentIds?.length || cls.student_ids?.length || 0} Students
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="table-actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      style={{
                        flex: 1,
                        padding: '0.5rem 0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        fontSize: '0.82rem',
                        fontWeight: 600
                      }}
                      onClick={() => {
                        setSelectedClassId(cls.id);
                        setActiveSection('grades');
                      }}
                    >
                      <BookOpen size={14} /> View Grades
                    </button>
                    <button
                      type="button"
                      style={{
                        padding: '0.5rem 0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.82rem',
                        fontWeight: 600
                      }}
                      onClick={() => handleOpenEditModal(cls)}
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      type="button"
                      style={{
                        padding: '0.5rem 0.8rem',
                        cursor: 'pointer',
                        backgroundColor: '#fee2e2',
                        color: '#b91c1c',
                        border: '1px solid #fecaca',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.82rem',
                        fontWeight: 600
                      }}
                      onClick={() => {
                        if (
                          confirm(
                            `Delete class ${subjectObj?.code || cls.subject?.code} (${formatCourseSection(
                              cls.section?.name || ''
                            )})?`
                          )
                        ) {
                          deleteClass(cls.id);
                        }
                      }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '680px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              background: '#ffffff',
              border: '1px solid #e2e8f0'
            }}
          >
            <h3
              style={{
                marginTop: 0,
                fontSize: '1.3rem',
                color: '#0f172a',
                marginBottom: '1.2rem',
                fontWeight: 800
              }}
            >
              {editingClassId
                ? 'Edit Class & Instructor Assignment'
                : 'Create New Class & Assign Instructor'}
            </h3>

            <form
              onSubmit={handleSubmitClass}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.3rem',
                    fontSize: '0.82rem',
                    color: '#334155',
                    fontWeight: 600
                  }}
                >
                  Select Subject *
                </label>
                <select
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: '10px',
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1.5px solid #cbd5e1'
                  }}
                >
                  <option value="">Select a subject</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code} - {sub.title} ({sub.units} units)
                    </option>
                  ))}
                  {subjects.length === 0 && <option value="">No subjects created yet</option>}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.3rem',
                      fontSize: '0.82rem',
                      color: '#334155',
                      fontWeight: 600
                    }}
                  >
                    Assign Instructor *
                  </label>
                  <select
                    value={formInstructorId}
                    onChange={(e) => setFormInstructorId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: '10px',
                      background: '#ffffff',
                      color: '#0f172a',
                      border: '1.5px solid #cbd5e1'
                    }}
                  >
                    <option value="">Select an instructor</option>
                    {instructors.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} ({inst.email})
                      </option>
                    ))}
                    {instructors.length === 0 && <option value="">No instructors available</option>}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.3rem',
                      fontSize: '0.82rem',
                      color: '#334155',
                      fontWeight: 600
                    }}
                  >
                    Course &amp; Section (Searchable / Type Any) *
                  </label>
                  <input
                    type="text"
                    list="class-course-sections-datalist"
                    placeholder="Type any Course & Section (e.g. CIT 1A, CIT 1B, BSIT 1A)"
                    value={formSection}
                    onChange={(e) => {
                      const nextSec = e.target.value;
                      setFormSection(nextSec);
                      if (!editingClassId) {
                        handleSelectSectionStudents(nextSec);
                      }
                    }}
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: '10px',
                      background: '#ffffff',
                      color: '#0f172a',
                      border: '1.5px solid #cbd5e1',
                      fontWeight: 700,
                      boxSizing: 'border-box'
                    }}
                  />
                  <datalist id="class-course-sections-datalist">
                    {courseSectionSuggestions.map((sec) => (
                      <option key={sec} value={sec} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.3rem',
                      fontSize: '0.82rem',
                      color: '#334155',
                      fontWeight: 600
                    }}
                  >
                    School Year *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2025-2026"
                    value={formSchoolYear}
                    onChange={(e) => setFormSchoolYear(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: '10px',
                      background: '#ffffff',
                      color: '#0f172a',
                      border: '1.5px solid #cbd5e1',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.3rem',
                      fontSize: '0.82rem',
                      color: '#334155',
                      fontWeight: 600
                    }}
                  >
                    Semester *
                  </label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: '10px',
                      background: '#ffffff',
                      color: '#0f172a',
                      border: '1.5px solid #cbd5e1'
                    }}
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="Summer Term">Summer Term</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.3rem',
                      fontSize: '0.82rem',
                      color: '#334155',
                      fontWeight: 600
                    }}
                  >
                    Schedule
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MWF 9:00 AM - 10:30 AM"
                    value={formSchedule}
                    onChange={(e) => setFormSchedule(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: '10px',
                      background: '#ffffff',
                      color: '#0f172a',
                      border: '1.5px solid #cbd5e1',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.3rem',
                      fontSize: '0.82rem',
                      color: '#334155',
                      fontWeight: 600
                    }}
                  >
                    Room / Venue
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lab 302"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: '10px',
                      background: '#ffffff',
                      color: '#0f172a',
                      border: '1.5px solid #cbd5e1',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Enroll Students Section */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}
                >
                  <label style={{ fontSize: '0.84rem', color: '#0f172a', fontWeight: 700 }}>
                    Enroll Active Students ({selectedStudentIds.length} selected)
                  </label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {formSection.trim() && (
                      <button
                        type="button"
                        onClick={() => handleSelectSectionStudents(formSection)}
                        style={{
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          color: '#1d4ed8',
                          fontSize: '0.76rem',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <CheckSquare size={12} />
                        Select Only {formatCourseSection(formSection)}
                      </button>
                    )}
                    {filteredModalStudents.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSelectAllVisibleStudents}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563eb',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          fontWeight: 700
                        }}
                      >
                        {filteredModalStudents.every((s) => selectedStudentIds.includes(s.id))
                          ? 'Deselect Visible'
                          : 'Select All Visible'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Search students inside modal */}
                <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                  <Search
                    size={14}
                    style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#64748b'
                    }}
                  />
                  <input
                    type="search"
                    placeholder="Filter student roster by name, ID, or course & section..."
                    value={studentModalSearch}
                    onChange={(e) => setStudentModalSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem 0.5rem 2rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                      background: '#ffffff',
                      color: '#0f172a',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div
                  style={{
                    maxHeight: '190px',
                    overflowY: 'auto',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '0.6rem 0.8rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                    background: '#f8fafc'
                  }}
                >
                  {filteredModalStudents.length === 0 ? (
                    <span style={{ fontSize: '0.85rem', color: '#64748b', padding: '0.5rem 0' }}>
                      No active students match your filter.
                    </span>
                  ) : (
                    filteredModalStudents.map((st) => {
                      const isChecked = selectedStudentIds.includes(st.id);
                      const studentSec = formatCourseSection(st.course, st.section_label);
                      return (
                        <label
                          key={st.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.6rem',
                            fontSize: '0.86rem',
                            cursor: 'pointer',
                            color: '#0f172a',
                            padding: '0.4rem 0.55rem',
                            borderRadius: '8px',
                            background: isChecked ? '#eff6ff' : '#ffffff',
                            border: isChecked ? '1px solid #93c5fd' : '1px solid #e2e8f0'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleStudent(st.id)}
                              style={{
                                width: '18px',
                                height: '18px',
                                flexShrink: 0,
                                accentColor: '#2563eb',
                                cursor: 'pointer',
                                margin: 0
                              }}
                            />
                            <span>
                              <strong>{st.name}</strong>{' '}
                              <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                ({st.student_no || st.studentNo})
                              </span>
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '999px',
                              background: '#e0f2fe',
                              color: '#0369a1'
                            }}
                          >
                            {formatYearLevel(st.year || st.year_level, st.course)} • {studentSec}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.8rem',
                  marginTop: '1rem'
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.65rem 1.3rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: '#f1f5f9',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}
                >
                  {editingClassId ? 'Save Changes' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;
