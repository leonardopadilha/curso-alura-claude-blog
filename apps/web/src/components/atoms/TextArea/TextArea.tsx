import type { ComponentProps } from 'react'

export function TextArea({ className = '', ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      className={`w-full resize-y rounded-sm bg-cinza-medio px-4 py-2 text-base text-cinza-escuro placeholder:text-cinza-escuro focus:outline-2 focus:outline-verde-destaque ${className}`}
      {...props}
    />
  )
}
