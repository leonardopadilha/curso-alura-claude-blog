import type { ComponentProps } from 'react'

export function Input({ className = '', ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={`w-full rounded-sm bg-cc-input px-4 py-2 text-cc-sm text-cc-bg placeholder:text-cc-surface focus:outline-2 focus:outline-cc-accent ${className}`}
      {...props}
    />
  )
}
