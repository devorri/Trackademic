import React from 'react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null

  return (
    <div
      className="login-modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(5, 13, 26, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(8px)',
        padding: '20px',
      }}
    >
      <div
        className="login-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: '440px',
          width: '100%',
          margin: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  )
}
export default Modal
