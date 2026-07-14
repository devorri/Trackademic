import type { Role, DashboardSection } from './types'

export const roleEmails: Record<Role, string> = {
  Administrator: 'admin@example.com',
  Instructor: 'instructor@example.com',
  Student: 'student1@example.com',
}

export const landingFeatures = [
  {
    title: 'Role-based dashboards',
    description: 'Administrators, instructors, and students each land on a focused workspace after email login.',
  },
  {
    title: 'Class record management',
    description: 'Instructors can encode quizzes, assignments, activities, midterms, and final exam scores.',
  },
  {
    title: 'Automatic computation',
    description: 'Preliminary, midterm, final, and overall grades update as records are edited.',
  },
  {
    title: 'Predictive analytics',
    description: 'The system checks historical and current performance to flag Excellent, Good, Average, or At Risk.',
  },
  {
    title: 'Reports and exports',
    description: 'Generate class records, student grade reports, performance reports, and prediction reports.',
  },
  {
    title: 'Student portal',
    description: 'Students can securely view their profile, subjects, grades, final status, and prediction result.',
  },
]

export const roleNavItems: Record<Role, { id: DashboardSection; label: string }[]> = {
  Administrator: [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'students', label: 'Students' },
    { id: 'classes', label: 'Subjects & Classes' },
    { id: 'reports', label: 'Reports' },
  ],
  Instructor: [
    { id: 'overview', label: 'Overview' },
    { id: 'classes', label: 'Classes' },
    { id: 'gradebook', label: 'Gradebook' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'reports', label: 'Reports' },
  ],
  Student: [
    { id: 'overview', label: 'Overview' },
    { id: 'grades', label: 'My Grades' },
    { id: 'analytics', label: 'Prediction' },
  ],
}
