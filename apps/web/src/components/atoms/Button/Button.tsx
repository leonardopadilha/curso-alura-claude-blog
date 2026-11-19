import type { ComponentProps, ReactNode } from 'react'

type ButtonProps = ComponentProps<'button'> & {
  icon?: ReactNode
}

export function Button({
  icon,
  children,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-verde-destaque px-4 py-3 text-lg font-semibold text-verde-petroleo transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
      {icon}
    </button>
  )
}
