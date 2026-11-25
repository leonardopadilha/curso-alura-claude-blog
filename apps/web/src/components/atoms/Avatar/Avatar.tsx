type AvatarProps = {
  /** Nome da pessoa: a inicial vira o avatar. */
  name: string
  className?: string
}

/** Avatar decorativo (a pessoa já aparece pelo nome ao lado). */
export function Avatar({ name, className = '' }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase()

  return (
    <span
      aria-hidden="true"
      className={`flex size-8 shrink-0 items-center justify-center rounded-full bg-offwhite text-xs font-semibold text-cinza-escuro ${className}`}
    >
      {initial}
    </span>
  )
}
