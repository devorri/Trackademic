import React from 'react'

export const Chip: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ className = '', ...props }) => {
  return <span className={`chip ${className}`} {...props} />
}
export default Chip
