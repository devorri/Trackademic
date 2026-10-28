import { supabase } from './supabase'
import type {
  Profile,
  Student,
  Subject,
  Section,
  ClassRecord,
  Grade,
  GradeComponent,
  GradeSummary,
  Report,
  Instructor,
} from './types'

// ============================================
// PROFILES (Users)
// ============================================

export const dbProfiles = {
  async getAll() {
    const { data, error } = await supabase.from('profiles').select('*')
    if (error) throw error
    return data as Profile[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as Profile
  },

  async getByEmail(email: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()
    if (error) throw error
    return data as Profile
  },

  async create(profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) {
    const payload: Record<string, any> = {
      email: profile.email,
      password_plain: profile.password_plain || 'password123',
      first_name: profile.first_name || profile.name?.split(' ')[0] || 'User',
      last_name: profile.last_name ?? (profile.name?.split(' ').slice(1).join(' ') || ''),
      role: profile.role || 'student',
      status: profile.status || 'active',
    }
    if (profile.avatar_url) payload.avatar_url = profile.avatar_url

    const { data, error } = await supabase
      .from('profiles')
      .insert([payload])
      .select()
      .single()
    if (error) throw error
    return data as Profile
  },

  async update(id: string, updates: Partial<Omit<Profile, 'id' | 'created_at'>>) {
    const { name: _name, face_embedding: _fe, camera_status: _cs, ...validUpdates } = updates as any
    const payload: Record<string, any> = {
      ...validUpdates,
      updated_at: new Date().toISOString(),
    }
    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Profile
  },

  async delete(id: string) {
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (error) throw error
  },
}

// ============================================
// INSTRUCTORS
// ============================================

export const dbInstructors = {
  async getAll() {
    const { data, error } = await supabase
      .from('instructors')
      .select('*, profiles(*)')
    if (error) throw error
    return data as (Instructor & { profiles: Profile })[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('instructors')
      .select('*, profiles(*)')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as Instructor & { profiles: Profile }
  },

  async getByProfileId(profileId: string) {
    const { data, error } = await supabase
      .from('instructors')
      .select('*')
      .eq('profile_id', profileId)
      .maybeSingle()
    if (error) throw error
    return data as Instructor | null
  },

  async create(instructor: Omit<Instructor, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('instructors')
      .insert([instructor])
      .select()
      .single()
    if (error) throw error
    return data as Instructor
  },

  async update(id: string, updates: Partial<Omit<Instructor, 'id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('instructors')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Instructor
  },

  async delete(id: string) {
    const { error } = await supabase.from('instructors').delete().eq('id', id)
    if (error) throw error
  },
}

// ============================================
// STUDENTS
// ============================================

export const dbStudents = {
  async getAll() {
    const { data, error } = await supabase
      .from('students')
      .select('*, profiles(*)')
    if (error) throw error
    return data as (Student & { profiles: Profile })[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('students')
      .select('*, profiles(*)')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as Student & { profiles: Profile }
  },

  async create(student: Omit<Student, 'id' | 'created_at'>) {
    const payload = {
      profile_id: student.profile_id,
      student_no: student.student_no,
      course: student.course || 'CIT',
      year_level: student.year_level || 1,
      section_label: student.section_label || 'A',
    }
    const { data, error } = await supabase
      .from('students')
      .insert([payload])
      .select()
      .single()
    if (error) throw error
    return data as Student
  },

  async update(id: string, updates: Partial<Omit<Student, 'id' | 'created_at'>>) {
    const cleanUpdates: Record<string, any> = {}
    if (updates.student_no !== undefined) cleanUpdates.student_no = updates.student_no
    if (updates.course !== undefined) cleanUpdates.course = updates.course
    if (updates.year_level !== undefined) cleanUpdates.year_level = updates.year_level
    if (updates.section_label !== undefined) cleanUpdates.section_label = updates.section_label
    if (
      updates.profile_id &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(updates.profile_id)
    ) {
      cleanUpdates.profile_id = updates.profile_id
    }

    const { data, error } = await supabase
      .from('students')
      .update(cleanUpdates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Student
  },

  async delete(id: string) {
    const { error } = await supabase.from('students').delete().eq('id', id)
    if (error) throw error
  },

  async getByClass(classId: string) {
    const { data, error } = await supabase
      .from('class_students')
      .select('students(*, profiles(*))')
      .eq('class_id', classId)
    if (error) throw error
    return data?.map((item: any) => item.students) as (Student & { profiles: Profile })[]
  },
}

// ============================================
// SUBJECTS
// ============================================

export const dbSubjects = {
  async getAll() {
    const { data, error } = await supabase.from('subjects').select('*')
    if (error) throw error
    return data as Subject[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as Subject
  },

  async create(subject: Omit<Subject, 'id' | 'created_at'>) {
    const payload = {
      code: subject.code,
      title: subject.title,
      units: subject.units,
    }
    const { data, error } = await supabase
      .from('subjects')
      .insert([payload])
      .select()
      .single()
    if (error) throw error
    return { ...subject, ...data } as Subject
  },

  async update(id: string, updates: Partial<Omit<Subject, 'id' | 'created_at'>>) {
    const payload: Record<string, any> = {}
    if (updates.code !== undefined) payload.code = updates.code
    if (updates.title !== undefined) payload.title = updates.title
    if (updates.units !== undefined) payload.units = updates.units

    const { data, error } = await supabase
      .from('subjects')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return { ...updates, ...data } as Subject
  },

  async delete(id: string) {
    const { error } = await supabase.from('subjects').delete().eq('id', id)
    if (error) throw error
  },
}

// ============================================
// SECTIONS
// ============================================

export const dbSections = {
  async getAll() {
    const { data, error } = await supabase.from('sections').select('*')
    if (error) throw error
    return data as Section[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as Section
  },

  async create(section: Omit<Section, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('sections')
      .insert([section])
      .select()
      .single()
    if (error) throw error
    return data as Section
  },

  async update(id: string, updates: Partial<Omit<Section, 'id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('sections')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Section
  },

  async delete(id: string) {
    const { error } = await supabase.from('sections').delete().eq('id', id)
    if (error) throw error
  },
}

// ============================================
// CLASSES
// ============================================

export const dbClasses = {
  async getAll() {
    const { data, error } = await supabase
      .from('classes')
      .select('*, class_students(student_id), subjects(*), sections(*), instructors(*, profiles(*))')
    if (error) throw error
    return (data ?? []).map((classItem: any) => ({
      ...classItem,
      subject: classItem.subjects,
      section: classItem.sections,
      instructor: classItem.instructors
        ? {
            ...classItem.instructors,
            name:
              `${classItem.instructors.profiles?.first_name || ''} ${classItem.instructors.profiles?.last_name || ''}`.trim() ||
              'Instructor',
            email: classItem.instructors.profiles?.email,
          }
        : undefined,
      studentIds: (classItem.class_students ?? []).map(
        (enrollment: { student_id: string }) => enrollment.student_id,
      ),
    })) as (ClassRecord & {
      subjects?: Subject
      sections?: Section
      instructors?: Instructor
    })[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('classes')
      .select('*, class_students(student_id), subjects(*), sections(*), instructors(*, profiles(*))')
      .eq('id', id)
      .single()
    if (error) throw error
    return {
      ...data,
      subject: (data as any).subjects,
      section: (data as any).sections,
      instructor: (data as any).instructors
        ? {
            ...(data as any).instructors,
            name:
              `${(data as any).instructors.profiles?.first_name || ''} ${(data as any).instructors.profiles?.last_name || ''}`.trim() ||
              'Instructor',
            email: (data as any).instructors.profiles?.email,
          }
        : undefined,
      studentIds: (data.class_students ?? []).map(
        (enrollment: { student_id: string }) => enrollment.student_id,
      ),
    } as ClassRecord & {
      subjects?: Subject
      sections?: Section
      instructors?: Instructor
    }
  },

  async create(
    classData: Omit<ClassRecord, 'id' | 'created_at' | 'studentIds'>,
    studentIds?: string[],
  ) {
    const {
      studentIds: _studentIds,
      section: _sec,
      subject: _sub,
      instructor: _inst,
      sections: _secs,
      subjects: _subs,
      instructors: _insts,
      class_students: _cs,
      ...classColumns
    } = classData as any

    const { data, error } = await supabase
      .from('classes')
      .insert([classColumns])
      .select()
      .single()
    if (error) throw error

    const uniqueStudentIds = [...new Set(studentIds ?? [])].filter((sid) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sid),
    )
    if (uniqueStudentIds.length > 0) {
      const classStudents = uniqueStudentIds.map((studentId) => ({
        class_id: data.id,
        student_id: studentId,
      }))
      const { error: enrollmentError } = await supabase
        .from('class_students')
        .upsert(classStudents, { onConflict: 'class_id,student_id', ignoreDuplicates: true })
      if (enrollmentError) console.warn('Class enrollment upsert warning:', enrollmentError)
    }

    return { ...data, studentIds: uniqueStudentIds } as ClassRecord
  },

  async update(id: string, updates: Partial<Omit<ClassRecord, 'id' | 'created_at'>>) {
    const {
      studentIds: _studentIds,
      section: _sec,
      subject: _sub,
      instructor: _inst,
      sections: _secs,
      subjects: _subs,
      instructors: _insts,
      class_students: _cs,
      ...classColumns
    } = updates as any

    if (Object.keys(classColumns).length > 0) {
      const { error } = await supabase
        .from('classes')
        .update(classColumns)
        .eq('id', id)
      if (error) console.warn('Class update DB warning:', error)
    }

    if (Array.isArray(_studentIds)) {
      const { error: deleteEnrollmentError } = await supabase
        .from('class_students')
        .delete()
        .eq('class_id', id)
      if (deleteEnrollmentError) console.warn('Delete enrollment error:', deleteEnrollmentError)

      const uniqueStudentIds = [...new Set(_studentIds)].filter((sid) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sid),
      )
      if (uniqueStudentIds.length > 0) {
        const { error: enrollmentError } = await supabase
          .from('class_students')
          .upsert(
            uniqueStudentIds.map((studentId) => ({ class_id: id, student_id: studentId })),
            { onConflict: 'class_id,student_id', ignoreDuplicates: true },
          )
        if (enrollmentError) console.warn('Enrollment upsert warning:', enrollmentError)
      }
    }

    return { id, ...updates } as ClassRecord
  },

  async delete(id: string) {
    const { error } = await supabase.from('classes').delete().eq('id', id)
    if (error) throw error
  },

  async addStudent(classId: string, studentId: string) {
    const { error } = await supabase
      .from('class_students')
      .upsert(
        { class_id: classId, student_id: studentId },
        { onConflict: 'class_id,student_id', ignoreDuplicates: true },
      )
    if (error) throw error
  },

  async removeStudent(classId: string, studentId: string) {
    const { error } = await supabase
      .from('class_students')
      .delete()
      .eq('class_id', classId)
      .eq('student_id', studentId)
    if (error) throw error
  },
}

// ============================================
// GRADE COMPONENTS
// ============================================

export const dbGradeComponents = {
  async getAll() {
    const { data, error } = await supabase.from('grade_components').select('*')
    if (error) throw error
    return data as GradeComponent[]
  },

  async getByClassId(classId: string) {
    const { data, error } = await supabase
      .from('grade_components')
      .select('*')
      .eq('class_id', classId)
    if (error) throw error
    return data as GradeComponent[]
  },

  async create(component: Omit<GradeComponent, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('grade_components')
      .insert([component])
      .select()
      .single()
    if (error) throw error
    return data as GradeComponent
  },

  async update(id: string, updates: Partial<Omit<GradeComponent, 'id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('grade_components')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as GradeComponent
  },

  async delete(id: string) {
    const { error } = await supabase.from('grade_components').delete().eq('id', id)
    if (error) throw error
  },
}

// ============================================
// GRADES
// ============================================

export const dbGrades = {
  async getAll() {
    const { data, error } = await supabase.from('grades').select('*')
    if (error) throw error
    return data as Grade[]
  },

  async getByComponentId(componentId: string) {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('component_id', componentId)
    if (error) throw error
    return data as Grade[]
  },

  async getByClassAndStudent(classId: string, studentId: string) {
    const { data: components, error: compError } = await supabase
      .from('grade_components')
      .select('id')
      .eq('class_id', classId)
    if (compError) throw compError

    const componentIds = components?.map((c: { id: string }) => c.id) || []
    if (componentIds.length === 0) return []

    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .in('component_id', componentIds)
      .eq('student_id', studentId)
    if (error) throw error
    return data as Grade[]
  },

  async create(grade: Omit<Grade, 'id' | 'encoded_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('grades')
      .insert([grade])
      .select()
      .single()
    if (error) throw error
    return data as Grade
  },

  async update(id: string, score: number) {
    const { data, error } = await supabase
      .from('grades')
      .update({ score, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Grade
  },

  async upsertComponentScore(params: {
    classId: string
    studentId: string
    gradingPeriod: 'Preliminary' | 'Midterm' | 'Final'
    componentName: string
    weight: number
    score: number
  }) {
    // 1. Find or create grade_component
    const { data: existingComp } = await supabase
      .from('grade_components')
      .select('*')
      .eq('class_id', params.classId)
      .eq('grading_period', params.gradingPeriod)
      .eq('name', params.componentName)
      .maybeSingle()

    let componentId = existingComp?.id
    if (!componentId) {
      const { data: createdComp, error: compErr } = await supabase
        .from('grade_components')
        .insert([
          {
            class_id: params.classId,
            name: params.componentName,
            grading_period: params.gradingPeriod,
            weight: params.weight,
            max_score: 100,
          },
        ])
        .select()
        .single()
      if (compErr) throw compErr
      componentId = createdComp.id
    }

    // 2. Find or create grade record
    const { data: existingGrade } = await supabase
      .from('grades')
      .select('*')
      .eq('component_id', componentId)
      .eq('student_id', params.studentId)
      .maybeSingle()

    if (existingGrade?.id) {
      const { data, error } = await supabase
        .from('grades')
        .update({ score: params.score, updated_at: new Date().toISOString() })
        .eq('id', existingGrade.id)
        .select()
        .single()
      if (error) throw error
      return data as Grade
    } else {
      const { data, error } = await supabase
        .from('grades')
        .insert([
          {
            component_id: componentId,
            student_id: params.studentId,
            score: params.score,
          },
        ])
        .select()
        .single()
      if (error) throw error
      return data as Grade
    }
  },

  async delete(id: string) {
    const { error } = await supabase.from('grades').delete().eq('id', id)
    if (error) throw error
  },
}

// ============================================
// GRADE SUMMARIES
// ============================================

export const dbGradeSummaries = {
  async getAll() {
    const { data, error } = await supabase.from('grade_summaries').select('*')
    if (error) throw error
    return data as GradeSummary[]
  },

  async getByClass(classId: string) {
    const { data, error } = await supabase
      .from('grade_summaries')
      .select('*')
      .eq('class_id', classId)
    if (error) throw error
    return data as GradeSummary[]
  },

  async getByClassAndStudent(classId: string, studentId: string) {
    const { data, error } = await supabase
      .from('grade_summaries')
      .select('*')
      .eq('class_id', classId)
      .eq('student_id', studentId)
      .maybeSingle()
    if (error) throw error
    return data as GradeSummary | null
  },

  async upsert(summary: Omit<GradeSummary, 'id'> & { id?: string }) {
    const { data: existing } = await supabase
      .from('grade_summaries')
      .select('id')
      .eq('class_id', summary.class_id)
      .eq('student_id', summary.student_id)
      .maybeSingle()

    const payload = {
      class_id: summary.class_id,
      student_id: summary.student_id,
      preliminary_grade: summary.preliminary_grade,
      midterm_grade: summary.midterm_grade,
      final_grade: summary.final_grade,
      overall_grade: summary.overall_grade,
      remarks: summary.remarks,
      computed_at: new Date().toISOString(),
    }

    if (existing?.id) {
      const { data, error } = await supabase
        .from('grade_summaries')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw error
      return data as GradeSummary
    } else {
      const { data, error } = await supabase
        .from('grade_summaries')
        .insert([payload])
        .select()
        .single()
      if (error) throw error
      return data as GradeSummary
    }
  },
}

// ============================================
// REPORTS
// ============================================

export const dbReports = {
  async getAll() {
    const { data, error } = await supabase.from('reports').select('*')
    if (error) throw error
    return data as Report[]
  },

  async getByClass(classId: string) {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('class_id', classId)
    if (error) throw error
    return data as Report[]
  },

  async getByStudent(studentId: string) {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('student_id', studentId)
    if (error) throw error
    return data as Report[]
  },

  async create(report: Omit<Report, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('reports')
      .insert([report])
      .select()
      .single()
    if (error) throw error
    return data as Report
  },

  async update(id: string, updates: Partial<Omit<Report, 'id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Report
  },

  async delete(id: string) {
    const { error } = await supabase.from('reports').delete().eq('id', id)
    if (error) throw error
  },
}
