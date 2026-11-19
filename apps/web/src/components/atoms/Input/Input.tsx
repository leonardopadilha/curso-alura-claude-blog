import type { ComponentProps } from 'react'

export function Input({ className = '', ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={`w-full rounded-sm bg-cinza-medio px-4 py-2 text-base text-cinza-escuro placeholder:text-cinza-escuro focus:outline-2 focus:outline-verde-destaque ${className}`}
      {...props}
    />
  )
}
