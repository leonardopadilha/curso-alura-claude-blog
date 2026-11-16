import type { ComponentProps } from 'react'

export function Input({ className = '', ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={`w-full rounded-sm bg-cc-input px-3 py-1.5 text-xs text-cc-bg placeholder:text-cc-bg/60 focus:outline-2 focus:outline-cc-accent ${className}`}
      {...props}
    />
  )
}
