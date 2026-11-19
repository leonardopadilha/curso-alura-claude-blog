import type { ComponentProps } from 'react'
import { Link } from 'react-router'

type TextLinkProps = ComponentProps<typeof Link> & {
  variant?: 'underline' | 'accent'
}

const variants = {
  underline: 'text-base text-offwhite underline',
  accent: 'text-lg text-verde-destaque',
} as const

export function TextLink({
  variant = 'underline',
  className = '',
  ...props
}: TextLinkProps) {
  return (
    <Link
      className={`inline-flex items-center gap-3 ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
