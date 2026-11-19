import type { ComponentProps, ReactNode } from 'react'

type SocialButtonProps = Omit<ComponentProps<'button'>, 'children'> & {
  icon: ReactNode
  label: string
}

export function SocialButton({ icon, label, ...props }: SocialButtonProps) {
  return (
    <button
      type="button"
      className="flex cursor-pointer flex-col items-center gap-1 text-cc-xs text-cc-text hover:opacity-80"
      {...props}
    >
      {icon}
      {label}
    </button>
  )
}
