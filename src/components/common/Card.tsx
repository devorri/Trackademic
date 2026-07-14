import React from 'react'

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => {
  return <div className={`panel ${className}`} {...props} />
}
export default Card
