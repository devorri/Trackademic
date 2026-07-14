import { DataProvider, useData } from './context/DataContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import LandingPage from './components/landing/LandingPage'
import { Sidebar } from './components/layout/Sidebar'
import { DashboardHeader } from './components/layout/DashboardHeader'
import { AdminOverview } from './components/admin/AdminOverview'
import { UserManagement } from './components/admin/UserManagement'
import { StudentManagement } from './components/admin/StudentManagement'
import { SubjectManagement } from './components/admin/SubjectManagement'
import { InstructorOverview } from './components/instructor/InstructorOverview'
import { ClassList } from './components/instructor/ClassList'
import { Gradebook } from './components/instructor/Gradebook'
import { Analytics } from './components/instructor/Analytics'
import { StudentOverview } from './components/student/StudentOverview'
import { StudentGrades } from './components/student/StudentGrades'
import { ReportPanel } from './components/reports/ReportPanel'
import './App.css'

function DashboardContent() {
  const { activeUser } = useAuth()
  const { activeSection, selectedClass } = useData()

  if (!activeUser) {
    return <LandingPage />
  }

  return (
    <section className="dashboard-shell" aria-label={`${activeUser.role} dashboard`}>
      <Sidebar />

      <div className="dashboard-content">
        <DashboardHeader />

        {activeUser.role === 'Administrator' && (
          <div className="workspace">
            {activeSection === 'overview' && <AdminOverview />}
            {activeSection === 'users' && <UserManagement />}
            {activeSection === 'students' && <StudentManagement />}
            {activeSection === 'classes' && <SubjectManagement />}
            {activeSection === 'reports' && <ReportPanel />}
          </div>
        )}

        {activeUser.role === 'Instructor' && selectedClass && (
          <div className="workspace">
            {activeSection === 'overview' && <InstructorOverview />}
            {activeSection === 'classes' && <ClassList />}
            {activeSection === 'gradebook' && <Gradebook />}
            {activeSection === 'analytics' && <Analytics />}
            {activeSection === 'reports' && <ReportPanel />}
          </div>
        )}

        {activeUser.role === 'Student' && (
          <div className="workspace">
            {activeSection === 'overview' && <StudentOverview />}
            {(activeSection === 'grades' || activeSection === 'analytics') && <StudentGrades />}
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