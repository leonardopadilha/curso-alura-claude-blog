import type { ComponentProps } from 'react'

type TextProps = ComponentProps<'p'> & {
  size?: 'sm' | 'base' | 'lg'
}

const sizes = {
  sm: 'text-cc-sm',
  base: 'text-cc-base',
  lg: 'text-cc-lg',
} as const

export function Text({
  size = 'base',
  className = '',
  ...props
}: TextProps) {
  return (
    <p className={`${sizes[size]} text-cc-text ${className}`} {...props} />
  )
}
