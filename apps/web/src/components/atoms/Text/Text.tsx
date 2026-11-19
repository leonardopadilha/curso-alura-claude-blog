import type { ComponentProps } from 'react'

type TextProps = ComponentProps<'p'> & {
  size?: 'sm' | 'base' | 'lg'
}

const sizes = {
  sm: 'text-base',
  base: 'text-lg',
  lg: 'text-xl',
} as const

export function Text({
  size = 'base',
  className = '',
  ...props
}: TextProps) {
  return (
    <p className={`${sizes[size]} text-offwhite ${className}`} {...props} />
  )
}
