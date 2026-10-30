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
  Prediction,
} from './types'

const isUuid = (val?: string | null): boolean =>
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val))

// ============================================
// PROFILES (Users)
// ============================================

export const dbProfiles = {
  async getAll() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map((p: any) => ({
      ...p,
      status: p.avatar_url === 'DROPPED' ? 'dropped' : p.status,
    })) as Profile[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return {
      ...data,
      status: data.avatar_url === 'DROPPED' ? 'dropped' : data.status,
    } as Profile
  },

  async getByEmail(email: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()
    if (error) throw error
    return {
      ...data,
      status: data.avatar_url === 'DROPPED' ? 'dropped' : data.status,
    } as Profile
  },

  async create(profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) {
    const isDropped = profile.status === 'dropped'
    const dbStatus = isDropped ? 'inactive' : profile.status === 'inactive' ? 'inactive' : 'active'
    const payload: Record<string, any> = {
      email: profile.email,
      password_plain: profile.password_plain || 'password123',
      first_name: profile.first_name || profile.name?.split(' ')[0] || 'User',
      last_name: profile.last_name ?? (profile.name?.split(' ').slice(1).join(' ') || ''),
      role: profile.role || 'student',
      status: dbStatus,
    }
    if (isDropped) {
      payload.avatar_url = 'DROPPED'
    } else if (profile.avatar_url) {
      payload.avatar_url = profile.avatar_url
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert([payload])
      .select()
      .single()
    if (error) throw error
    return {
      ...data,
      status: data.avatar_url === 'DROPPED' ? 'dropped' : data.status,
    } as Profile
  },

  async update(id: string, updates: Partial<Omit<Profile, 'id' | 'created_at'>>) {
    const { name: _name, face_embedding: _fe, camera_status: _cs, ...validUpdates } = updates as any
    const payload: Record<string, any> = {
      ...validUpdates,
      updated_at: new Date().toISOString(),
    }
    if (payload.status === 'dropped') {
      payload.status = 'inactive'
      payload.avatar_url = 'DROPPED'
    } else if (payload.status === 'active' && updates.avatar_url === undefined) {
      payload.avatar_url = null
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return {
      ...data,
      status: data.avatar_url === 'DROPPED' ? 'dropped' : data.status,
    } as Profile
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
      .order('created_at', { ascending: false })
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
      .order('created_at', { ascending: false })
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
      course: student.course || 'BSIT',
      year_level: student.year_level || 1,
      section_label: student.section_label || '1A',
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
    if (isUuid(updates.profile_id)) {
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
    await supabase.from('class_students').delete().eq('student_id', id)
    await supabase.from('grades').delete().eq('student_id', id)
    await supabase.from('grade_summaries').delete().eq('student_id', id)
    await supabase.from('predictions').delete().eq('student_id', id)
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
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('created_at', { ascending: false })
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
      code: subject.code.trim(),
      title: subject.title.trim(),
      units: Number(subject.units) || 3,
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
    if (updates.code !== undefined) payload.code = updates.code.trim()
    if (updates.title !== undefined) payload.title = updates.title.trim()
    if (updates.units !== undefined) payload.units = Number(updates.units) || 3

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
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .order('created_at', { ascending: false })
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
      .order('created_at', { ascending: false })
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

    const uniqueStudentIds = [...new Set(studentIds ?? [])].filter((sid) => isUuid(sid))
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

      const uniqueStudentIds = [...new Set(_studentIds)].filter((sid) => isUuid(sid))
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
    await supabase.from('class_students').delete().eq('class_id', id)
    await supabase.from('grade_summaries').delete().eq('class_id', id)
    await supabase.from('predictions').delete().eq('class_id', id)
    const { data: comps } = await supabase.from('grade_components').select('id').eq('class_id', id)
    if (comps && comps.length > 0) {
      await supabase
        .from('grades')
        .delete()
        .in(
          'component_id',
          comps.map((c: any) => c.id),
        )
      await supabase.from('grade_components').delete().eq('class_id', id)
    }
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
            weight: Math.max(1, Math.min(100, params.weight || 10)),
            max_score: 100,
          },
        ])
        .select()
        .single()
      if (compErr) throw compErr
      componentId = createdComp.id
    }

    const { data: existingGrade } = await supabase
      .from('grades')
      .select('*')
      .eq('component_id', componentId)
      .eq('student_id', params.studentId)
      .maybeSingle()

    if (existingGrade?.id) {
      const { data, error } = await supabase
        .from('grades')
        .update({ score: Math.max(0, params.score), updated_at: new Date().toISOString() })
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
            score: Math.max(0, params.score),
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
      preliminary_grade: summary.preliminary_grade ?? null,
      midterm_grade: summary.midterm_grade ?? null,
      final_grade: summary.final_grade ?? null,
      overall_grade: summary.overall_grade ?? null,
      remarks: summary.remarks ?? null,
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
// PREDICTIONS (Also stores full itemized sheet basis JSONB)
// ============================================

export const dbPredictions = {
  async getAll() {
    const { data, error } = await supabase.from('predictions').select('*')
    if (error) throw error
    return data as Prediction[]
  },

  async upsert(prediction: {
    class_id: string
    student_id: string
    status: string
    confidence: number
    basis: Record<string, any>
    current_grade?: number
    predicted_grade?: number
  }) {
    const { data: existing } = await supabase
      .from('predictions')
      .select('id')
      .eq('class_id', prediction.class_id)
      .eq('student_id', prediction.student_id)
      .maybeSingle()

    const payload = {
      class_id: prediction.class_id,
      student_id: prediction.student_id,
      status: prediction.status || 'Pending',
      confidence: Math.max(0, Math.min(100, prediction.confidence || 0)),
      basis: prediction.basis || {},
      current_grade: prediction.current_grade ?? null,
      predicted_grade: prediction.predicted_grade ?? null,
      generated_at: new Date().toISOString(),
    }

    if (existing?.id) {
      const { data, error } = await supabase
        .from('predictions')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw error
      return data as Prediction
    } else {
      const { data, error } = await supabase
        .from('predictions')
        .insert([payload])
        .select()
        .single()
      if (error) throw error
      return data as Prediction
    }
  },
}

// ============================================
// NOTIFICATIONS
// ============================================

export const dbNotifications = {
  async getAll() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async create(notif: {
    user_id?: string | null
    role: string
    title: string
    message: string
    category?: string
  }) {
    const payload: Record<string, any> = {
      role: notif.role || 'all',
      title: notif.title,
      message: notif.message,
      category: notif.category || 'system',
      is_read: false,
    }
    if (isUuid(notif.user_id)) {
      payload.user_id = notif.user_id
    }
    const { data, error } = await supabase
      .from('notifications')
      .insert([payload])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async markRead(id: string) {
    if (!isUuid(id)) return
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
    if (error) throw error
  },

  async delete(id: string) {
    if (!isUuid(id)) return
    const { error } = await supabase.from('notifications').delete().eq('id', id)
    if (error) throw error
  },
}

// ============================================
// ACTIVITY LOGS
// ============================================

export const dbActivityLogs = {
  async getAll() {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) throw error
    return data ?? []
  },

  async create(log: {
    actor_id?: string | null
    action: string
    table_name?: string
    record_id?: string | null
    metadata?: Record<string, any>
  }) {
    const payload: Record<string, any> = {
      action: log.action,
      table_name: log.table_name || null,
      metadata: log.metadata || {},
    }
    if (isUuid(log.actor_id)) payload.actor_id = log.actor_id
    if (isUuid(log.record_id)) payload.record_id = log.record_id

    const { data, error } = await supabase
      .from('activity_logs')
      .insert([payload])
      .select()
      .single()
    if (error) throw error
    return data
  },
}

// ============================================
// SYSTEM SETTINGS
// ============================================

export const dbSystemSettings = {
  async get() {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw error
    return data
  },

  async upsert(settings: {
    school_year: string
    semester: string
    passing_grade: number
    prelim_weight?: number
    midterm_weight?: number
    final_weight?: number
    exam_weight: number
    quiz_weight: number
    activity_weight: number
    email_alerts: boolean
  }) {
    const existing = await this.get().catch(() => null)
    const payload = {
      school_year: settings.school_year,
      semester: settings.semester,
      passing_grade: settings.passing_grade,
      prelim_weight: settings.prelim_weight ?? 40,
      midterm_weight: settings.midterm_weight ?? 60,
      final_weight: settings.final_weight ?? 60,
      exam_weight: settings.exam_weight,
      quiz_weight: settings.quiz_weight,
      activity_weight: settings.activity_weight,
      email_alerts: settings.email_alerts,
      updated_at: new Date().toISOString(),
    }
    if (existing?.id) {
      const { data, error } = await supabase
        .from('system_settings')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw error
      return data
    } else {
      const { data, error } = await supabase
        .from('system_settings')
        .insert([payload])
        .select()
        .single()
      if (error) throw error
      return data
    }
  },

  async save(settings: {
    school_year: string
    semester: string
    passing_grade: number
    prelim_weight?: number
    midterm_weight?: number
    final_weight?: number
    exam_weight: number
    quiz_weight: number
    activity_weight: number
    email_alerts: boolean
  }) {
    return this.upsert(settings)
  },
}

// ============================================
// REPORTS
// ============================================

export const dbReports = {
  async getAll() {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
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
    const payload: Record<string, any> = {
      type: report.type,
      title: report.title,
      export_format: report.export_format || 'view',
      file_url: report.file_url || null,
    }
    if (isUuid(report.class_id)) payload.class_id = report.class_id
    if (isUuid(report.student_id)) payload.student_id = report.student_id
    if (isUuid(report.generated_by)) payload.generated_by = report.generated_by

    const { data, error } = await supabase
      .from('reports')
      .insert([payload])
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
