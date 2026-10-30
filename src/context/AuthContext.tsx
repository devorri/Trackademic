import React, { createContext, useState, useContext, useEffect } from 'react'
import { supabase } from '../utils/supabase.ts'
import type { User } from '../utils/types'
import { useData } from './DataContext'

interface AuthContextType {
  activeUser: User | null
  activeRole?: string
  setActiveUser: (user: User | null) => void
  loginEmail: string
  setLoginEmail: (email: string) => void
  loginPassword: string
  setLoginPassword: (password: string) => void
  loginError: string
  setLoginError: (error: string) => void
  resetNotice: string
  setResetNotice: (notice: string) => void
  isLoginOpen: boolean
  setIsLoginOpen: (open: boolean) => void
  handleLogin: (event: React.FormEvent) => void
  handleLogout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setActiveSection, users, students } = useData()

  const [activeUser, setActiveUser] = useState<User | null>(null)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [resetNotice, setResetNotice] = useState('')
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  useEffect(() => {
    if (!isLoginOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsLoginOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLoginOpen])

  useEffect(() => {
    if (isLoginOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
    return
  }, [isLoginOpen])

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault()
    setLoginError('')
    const trimmedEmail = loginEmail.trim().toLowerCase()
    const trimmedPass = loginPassword.trim()

    if (!trimmedEmail || !trimmedPass) {
      setLoginError('Please enter your email and password.')
      return
    }

    // 1. Try Supabase profiles table query
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, password_plain, first_name, last_name, role, status, avatar_url')
        .eq('email', trimmedEmail)
        .single()

      if (!profileError && profile) {
        if (profile.password_plain !== trimmedPass) {
          setLoginError('Incorrect password.')
          return
        }

        if (profile.avatar_url === 'DROPPED') {
          setLoginError('This student account is marked as Dropped Out. Contact your administrator.')
          return
        }

        if (profile.status.toLowerCase() !== 'active') {
          setLoginError('This account is inactive. Contact your administrator.')
          return
        }

        const normalizedRole =
          profile.role.toLowerCase() === 'faculty' || profile.role.toLowerCase() === 'instructor'
            ? 'instructor'
            : profile.role.toLowerCase() === 'admin' || profile.role.toLowerCase() === 'administrator'
            ? 'administrator'
            : 'student'

        const fullName =
          `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
          profile.email.split('@')[0]

        const foundUser: User = {
          id: profile.id,
          profile_id: profile.id,
          name: fullName,
          email: profile.email,
          role: normalizedRole as any,
          status: profile.status as any,
          password: profile.password_plain,
        }
        setActiveUser(foundUser)
        setActiveSection('overview')
        setIsLoginOpen(false)
        setLoginError('')
        setResetNotice('')
        return
      }
    } catch {
      // Fallback to local users/students state if offline
    }

    // 2. Check loaded users state
    const localUser = users.find((u) => u.email.toLowerCase() === trimmedEmail)
    if (localUser) {
      if (localUser.password && localUser.password !== trimmedPass) {
        setLoginError('Incorrect password.')
        return
      }
      if (localUser.status === 'dropped') {
        setLoginError('This student account is marked as Dropped Out. Contact your administrator.')
        return
      }
      if (localUser.status.toLowerCase() !== 'active') {
        setLoginError('This account is inactive. Contact your administrator.')
        return
      }
      setActiveUser(localUser)
      setActiveSection('overview')
      setIsLoginOpen(false)
      setLoginError('')
      setResetNotice('')
      return
    }

    // 3. Check loaded students state
    const localStudent = students.find((s) => s.email?.toLowerCase() === trimmedEmail)
    if (localStudent) {
      if (localStudent.password && localStudent.password !== trimmedPass) {
        setLoginError('Incorrect password.')
        return
      }
      if (localStudent.status === 'dropped') {
        setLoginError('This student account is marked as Dropped Out. Contact your administrator.')
        return
      }
      const studentUser: User = {
        id: localStudent.profile_id || localStudent.id,
        profile_id: localStudent.profile_id || localStudent.id,
        name: localStudent.name || localStudent.email || trimmedEmail,
        email: localStudent.email || trimmedEmail,
        role: 'student',
        status: localStudent.status || 'active',
      }
      setActiveUser(studentUser)
      setActiveSection('overview')
      setIsLoginOpen(false)
      setLoginError('')
      setResetNotice('')
      return
    }

    setLoginError('No account found with that email address.')
  }

  function handleLogout() {
    setActiveUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        activeUser,
        activeRole: activeUser?.role,
        setActiveUser,
        loginEmail,
        setLoginEmail,
        loginPassword,
        setLoginPassword,
        loginError,
        setLoginError,
        resetNotice,
        setResetNotice,
        isLoginOpen,
        setIsLoginOpen,
        handleLogin,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
