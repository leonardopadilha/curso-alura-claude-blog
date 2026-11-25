import type { ComponentProps, ReactNode } from 'react'

type ButtonProps = ComponentProps<'button'> & {
  icon?: ReactNode
  /** `solid`: ação principal. `outline`: secundária. `neutral`: terciária (cinza). */
  variant?: 'solid' | 'outline' | 'neutral'
}

const variants = {
  solid: 'bg-verde-destaque text-verde-petroleo hover:brightness-110',
  outline: 'border border-verde-destaque text-verde-destaque hover:bg-verde-destaque/10',
  neutral: 'border border-cinza-medio text-cinza-medio hover:bg-cinza-medio/10',
} as const

export function Button({
  icon,
  variant = 'solid',
  children,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-3 text-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
      {icon}
    </button>
  )
}
