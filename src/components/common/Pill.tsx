import React from 'react'

export const Pill: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ className = '', ...props }) => {
  return <span className={`pill ${className}`} {...props} />
}
export default Pill
