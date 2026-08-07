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
    const { data, error } = await supabase
      .from('profiles')
      .insert([profile])
      .select()
      .single()
    if (error) throw error
    return data as Profile
  },

  async update(id: string, updates: Partial<Omit<Profile, 'id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
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
    const { data, error } = await supabase
      .from('students')
      .insert([student])
      .select()
      .single()
    if (error) throw error
    return data as Student
  },

  async update(id: string, updates: Partial<Omit<Student, 'id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
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
    const { data, error } = await supabase
      .from('subjects')
      .insert([subject])
      .select()
      .single()
    if (error) throw error
    return data as Subject
  },

  async update(id: string, updates: Partial<Omit<Subject, 'id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('subjects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Subject
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
      .select('*, class_students(student_id), subjects(*), sections(*), instructors(*)')
    if (error) throw error
    return (data ?? []).map((classItem: any) => ({
      ...classItem,
      studentIds: (classItem.class_students ?? []).map((enrollment: { student_id: string }) => enrollment.student_id),
    })) as (ClassRecord & {
      subjects?: Subject
      sections?: Section
      instructors?: Instructor
    })[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('classes')
      .select('*, class_students(student_id), subjects(*), sections(*), instructors(*)')
      .eq('id', id)
      .single()
    if (error) throw error
    return {
      ...data,
      studentIds: (data.class_students ?? []).map((enrollment: { student_id: string }) => enrollment.student_id),
    } as ClassRecord & {
      subjects?: Subject
      sections?: Section
      instructors?: Instructor
    }
  },

  async create(
    classData: Omit<ClassRecord, 'id' | 'created_at' | 'studentIds'>,
    studentIds?: string[]
  ) {
    const { studentIds: _studentIds, ...classColumns } = classData as ClassRecord
    const { data, error } = await supabase
      .from('classes')
      .insert([classColumns])
      .select()
      .single()
    if (error) throw error

    const uniqueStudentIds = [...new Set(studentIds ?? [])]
    if (uniqueStudentIds.length > 0) {
      const classStudents = uniqueStudentIds.map((studentId) => ({
        class_id: data.id,
        student_id: studentId,
      }))
      const { error: enrollmentError } = await supabase
        .from('class_students')
        .upsert(classStudents, { onConflict: 'class_id,student_id', ignoreDuplicates: true })
      if (enrollmentError) throw enrollmentError
    }

    return data as ClassRecord
  },

  async update(id: string, updates: Partial<Omit<ClassRecord, 'id' | 'created_at'>>) {
    const { studentIds: _studentIds, ...classColumns } = updates
    const { data, error } = await supabase
      .from('classes')
      .update(classColumns)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    if (Array.isArray(_studentIds)) {
      const { error: deleteEnrollmentError } = await supabase
        .from('class_students')
        .delete()
        .eq('class_id', id)
      if (deleteEnrollmentError) throw deleteEnrollmentError

      const uniqueStudentIds = [...new Set(_studentIds)]
      if (uniqueStudentIds.length > 0) {
        const { error: enrollmentError } = await supabase
          .from('class_students')
          .upsert(
            uniqueStudentIds.map((studentId) => ({ class_id: id, student_id: studentId })),
            { onConflict: 'class_id,student_id', ignoreDuplicates: true },
          )
        if (enrollmentError) throw enrollmentError
      }
    }

    return data as ClassRecord
  },

  async delete(id: string) {
    const { error } = await supabase.from('classes').delete().eq('id', id)
    if (error) throw error
  },

  async addStudent(classId: string, studentId: string) {
    const { error } = await supabase
      .from('class_students')
      .insert({ class_id: classId, student_id: studentId })
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

  async delete(id: string) {
    const { error } = await supabase.from('grades').delete().eq('id', id)
    if (error) throw error
  },
}

// ============================================
// GRADE SUMMARIES
// ============================================

export const dbGradeSummaries = {
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
      .single()
    if (error) throw error
    return data as GradeSummary
  },

  async upsert(summary: GradeSummary) {
    const { data, error } = await supabase
      .from('grade_summaries')
      .upsert([summary], { onConflict: 'class_id, student_id' })
      .select()
      .single()
    if (error) throw error
    return data as GradeSummary
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
