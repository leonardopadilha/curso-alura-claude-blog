import type { ComponentProps } from 'react'

export function Label({
  className = '',
  children,
  ...props
}: ComponentProps<'label'>) {
  return (
    <label className={`text-lg text-offwhite ${className}`} {...props}>
      {children}
    </label>
  )
}
