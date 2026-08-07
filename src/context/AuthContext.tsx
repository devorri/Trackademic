import React, { createContext, useState, useContext, useEffect } from 'react'
import { supabase } from '../utils/supabase.ts'
import type { User } from '../utils/types'
import { useData } from './DataContext'

interface AuthContextType {
  activeUser: User | null
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
        .select('id, email, password_plain, role, status')
        .eq('email', trimmedEmail)
        .single();

      if (!profileError && profile) {
        if (profile.password_plain !== trimmedPass) {
          setLoginError('Incorrect password.');
          return;
        }

        if (profile.status.toLowerCase() !== 'active') {
          setLoginError('This account is inactive. Contact your administrator.');
          return;
        }

        const normalizedRole = profile.role.toLowerCase();
        const foundUser = {
          id: profile.id,
          name: profile.email.split('@')[0],
          email: profile.email,
          role: normalizedRole as any,
          status: profile.status as any,
        };
        setActiveUser(foundUser)
        setActiveSection('overview')
        setIsLoginOpen(false)
        setLoginError('')
        setResetNotice('')
        return
      }
    } catch {
      // Supabase query failed or unavailable, fallback to local users/students
    }

    // 2. Check local users state
    const localUser = users.find((u) => u.email.toLowerCase() === trimmedEmail)
    if (localUser) {
      if (localUser.password && localUser.password !== trimmedPass) {
        setLoginError('Incorrect password.')
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

    // 3. Check local students state
    const localStudent = students.find((s) => s.email?.toLowerCase() === trimmedEmail)
    if (localStudent) {
      if (localStudent.password && localStudent.password !== trimmedPass) {
        setLoginError('Incorrect password.')
        return
      }
      const studentUser: User = {
        id: localStudent.id,
        name: localStudent.name || localStudent.email || trimmedEmail,
        email: localStudent.email || trimmedEmail,
        role: 'student',
        status: 'active',
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
