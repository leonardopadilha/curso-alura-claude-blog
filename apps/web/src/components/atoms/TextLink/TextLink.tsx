import type { ComponentProps } from 'react'
import { Link } from 'react-router'

type TextLinkProps = ComponentProps<typeof Link> & {
  variant?: 'underline' | 'accent'
}

const variants = {
  underline: 'text-cc-text underline',
  accent: 'text-cc-accent font-medium',
} as const

export function TextLink({
  variant = 'underline',
  className = '',
  ...props
}: TextLinkProps) {
  return (
    <Link
      className={`inline-flex items-center gap-1.5 text-xs ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
