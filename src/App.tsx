import { DataProvider, useData } from './context/DataContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import LandingPage from './components/landing/LandingPage'
import { Sidebar } from './components/layout/Sidebar'
import { DashboardHeader } from './components/layout/DashboardHeader'

// Admin Components
import { AdminOverview } from './components/admin/AdminOverview'
import { InstructorManagement } from './components/admin/InstructorManagement'
import { StudentManagement } from './components/admin/StudentManagement'
import { SubjectManagement } from './components/admin/SubjectManagement'
import { AdminGrades } from './components/admin/AdminGrades'
import { AdminPredictiveAnalytics } from './components/admin/AdminPredictiveAnalytics'
import { AdminNotifications } from './components/admin/AdminNotifications'
import { ActivityLogs } from './components/admin/ActivityLogs'
import { AdminSettings } from './components/admin/AdminSettings'

// Instructor Components
import { InstructorOverview } from './components/instructor/InstructorOverview'
import { ClassList } from './components/instructor/ClassList'
import { Gradebook } from './components/instructor/Gradebook'
import { Analytics } from './components/instructor/Analytics'
import { InstructorNotifications } from './components/instructor/InstructorNotifications'
import { InstructorProfile } from './components/instructor/InstructorProfile'

// Student Components
import { StudentOverview } from './components/student/StudentOverview'
import { StudentGrades } from './components/student/StudentGrades'
import { StudentPrediction } from './components/student/StudentPrediction'
import { StudentPerformance } from './components/student/StudentPerformance'
import { StudentNotifications } from './components/student/StudentNotifications'
import { StudentProfile } from './components/student/StudentProfile'

// Shared Reports Component
import { ReportPanel } from './components/reports/ReportPanel'

import './App.css'

function DashboardContent() {
  const { activeUser } = useAuth()
  const { activeSection } = useData()

  if (!activeUser) {
    return <LandingPage />
  }

  return (
    <section className="dashboard-shell" aria-label={`${activeUser.role} dashboard`}>
      <Sidebar />

      <div className="dashboard-content">
        <DashboardHeader />

        {/* Administrator Workspace */}
        {activeUser.role === 'administrator' && (
          <div className="workspace">
            {activeSection === 'overview' && <AdminOverview />}
            {(activeSection === 'instructors' || activeSection === 'users') && <InstructorManagement />}
            {activeSection === 'students' && <StudentManagement />}
            {activeSection === 'classes' && <SubjectManagement />}
            {(activeSection === 'grades' || activeSection === 'gradebook') && <AdminGrades />}
            {activeSection === 'predictive_analytics' && <AdminPredictiveAnalytics />}
            {activeSection === 'reports' && <ReportPanel />}
            {activeSection === 'notifications' && <AdminNotifications />}
            {activeSection === 'activity_logs' && <ActivityLogs />}
            {activeSection === 'settings' && <AdminSettings />}
          </div>
        )}

        {/* Instructor Workspace */}
        {activeUser.role === 'instructor' && (
          <div className="workspace">
            {activeSection === 'overview' && <InstructorOverview />}
            {activeSection === 'classes' && <ClassList />}
            {activeSection === 'gradebook' && <Gradebook />}
            {activeSection === 'analytics' && <Analytics />}
            {activeSection === 'reports' && <ReportPanel />}
            {activeSection === 'notifications' && <InstructorNotifications />}
            {activeSection === 'profile' && <InstructorProfile />}
          </div>
        )}

        {/* Student Workspace */}
        {activeUser.role === 'student' && (
          <div className="workspace">
            {activeSection === 'overview' && <StudentOverview />}
            {activeSection === 'grades' && <StudentGrades />}
            {activeSection === 'prediction' && <StudentPrediction />}
            {activeSection === 'performance' && <StudentPerformance />}
            {activeSection === 'notifications' && <StudentNotifications />}
            {activeSection === 'profile' && <StudentProfile />}
          </div>
        )}
      </div>
    </section>
  )
}

function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <main className="app-shell">
          <DashboardContent />
        </main>
      </AuthProvider>
    </DataProvider>
  )
}

export default App
