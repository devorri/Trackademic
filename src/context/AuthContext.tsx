import React, { createContext, useState, useContext, useEffect } from 'react'
import { supabase } from '../utils/supabase.ts'
import type { User } from '../utils/types'
import { roleEmails } from '../utils/constants'
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
  const { setActiveSection } = useData()
  
  const [activeUser, setActiveUser] = useState<User | null>(null)
  const [loginEmail, setLoginEmail] = useState(roleEmails.Administrator)
  const [loginPassword, setLoginPassword] = useState('admin123')
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
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please enter your email and password.')
      return
    }
    // Query Supabase accounts table
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id, email, role, status')
      .eq('email', loginEmail.trim().toLowerCase())
      .single();

    if (accountError || !account) {
      setLoginError('No account found with that email address.');
      return;
    }

    if (account.status.toLowerCase() !== 'active') {
      setLoginError('This account is inactive. Contact your administrator.');
      return;
    }

    const normalizedRole = account.role.charAt(0).toUpperCase() + account.role.slice(1).toLowerCase();
    const foundUser = {
      id: account.id,
      name: account.email.split('@')[0], // simple name fallback
      email: account.email,
      role: normalizedRole as any,
      status: account.status as any,
    };
    setActiveUser(foundUser)
    setActiveSection('overview')
    setIsLoginOpen(false)
    setLoginError('')
    setResetNotice('')
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
