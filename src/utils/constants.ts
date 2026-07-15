import type { Role, DashboardSection } from './types'
import type { LucideIcon } from 'lucide-react'
import {
  ShieldCheck,
  FileText,
  Calculator,
  TrendingUp,
  FileBarChart,
  UserCheck,
  Home,
  Users,
  ClipboardList,
  BookOpen,
} from 'lucide-react'

export type RoleNavItem = {
  id: DashboardSection
  label: string
  icon: LucideIcon
}

export const roleEmails: Record<Role, string> = {
  Administrator: 'admin@example.com',
  Instructor: 'instructor@example.com',
  Student: 'student1@example.com',
}

export type LandingFeature = {
  title: string
  icon: LucideIcon
  description: string
}

export const landingFeatures: LandingFeature[] = [
  {
    title: 'Role-based dashboards',
    icon: UserCheck,
    description: 'Administrators, instructors, and students each land on a focused workspace after email login.',
  },
  {
    title: 'Class record management',
    icon: FileText,
    description: 'Instructors can encode quizzes, assignments, activities, midterms, and final exam scores.',
  },
  {
    title: 'Automatic computation',
    icon: Calculator,
    description: 'Preliminary, midterm, final, and overall grades update as records are edited.',
  },
  {
    title: 'Predictive analytics',
    icon: TrendingUp,
    description: 'The system checks historical and current performance to flag Excellent, Good, Average, or At Risk.',
  },
  {
    title: 'Reports and exports',
    icon: FileBarChart,
    description: 'Generate class records, student grade reports, performance reports, and prediction reports.',
  },
  {
    title: 'Student portal',
    icon: ShieldCheck,
    description: 'Students can securely view their profile, subjects, grades, final status, and prediction result.',
  },
]

export const roleNavItems: Record<Role, RoleNavItem[]> = {
  Administrator: [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'students', label: 'Students', icon: UserCheck },
    { id: 'classes', label: 'Subjects & Classes', icon: ClipboardList },
    { id: 'reports', label: 'Reports', icon: FileText },
  ],
  Instructor: [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'classes', label: 'Classes', icon: BookOpen },
    { id: 'gradebook', label: 'Gradebook', icon: Calculator },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: FileText },
  ],
  Student: [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'grades', label: 'My Grades', icon: BookOpen },
    { id: 'analytics', label: 'Prediction', icon: TrendingUp },
  ],
}
