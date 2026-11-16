import type { ComponentProps } from 'react'

type TextProps = ComponentProps<'p'> & {
  size?: 'xs' | 'sm'
}

const sizes = { xs: 'text-xs', sm: 'text-sm' } as const

export function Text({
  size = 'sm',
  className = '',
  ...props
}: TextProps) {
  return (
    <p className={`${sizes[size]} text-cc-text ${className}`} {...props} />
  )
}
