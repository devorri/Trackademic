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
  Bell,
  Activity,
  Settings,
  User,
  BarChart2,
} from 'lucide-react'

export type RoleNavItem = {
  id: DashboardSection
  label: string
  icon: LucideIcon
}

export const roleEmails: Record<Role, string> = {
  administrator: 'admin.test@example.com',
  instructor: 'phantomlordtagamolila@gmail.com',
  student: 'juan@gmail.com',
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
    description: 'Instructors can encode attendance, quizzes, activities, participation, and exam scores.',
  },
  {
    title: 'Automatic computation',
    icon: Calculator,
    description: 'Preliminary, midterm, pre-final, final, and cumulative grades update dynamically as records are encoded.',
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
    description: 'Students can securely view their profile, subjects, rounded grades, final status, and prediction result.',
  },
]

export const roleNavItems: Record<Role, RoleNavItem[]> = {
  administrator: [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'instructors', label: 'Instructors', icon: Users },
    { id: 'students', label: 'Students', icon: UserCheck },
    { id: 'classes', label: 'Subjects & Classes', icon: ClipboardList },
    { id: 'grades', label: 'Grades', icon: Calculator },
    { id: 'predictive_analytics', label: 'Predictive Analytics', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'activity_logs', label: 'Activity Logs', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ],
  instructor: [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'classes', label: 'Classes', icon: BookOpen },
    { id: 'gradebook', label: 'Gradebook', icon: Calculator },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
  ],
  student: [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'grades', label: 'My Grades', icon: BookOpen },
    { id: 'prediction', label: 'Prediction', icon: TrendingUp },
    { id: 'performance', label: 'Performance', icon: BarChart2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'My Profile', icon: User },
  ],
}
