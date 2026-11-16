import type { ComponentProps } from 'react'

export function Label({
  className = '',
  children,
  ...props
}: ComponentProps<'label'>) {
  return (
    <label className={`text-xs font-medium text-cc-text ${className}`} {...props}>
      {children}
    </label>
  )
}
