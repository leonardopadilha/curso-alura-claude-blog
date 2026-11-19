import type { ComponentProps } from 'react'

export function Label({
  className = '',
  children,
  ...props
}: ComponentProps<'label'>) {
  return (
    <label className={`text-cc-base text-cc-text ${className}`} {...props}>
      {children}
    </label>
  )
}
