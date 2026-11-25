import type { ReactNode } from 'react'
import { CloseIcon } from '../icons/icons'

type TagProps = {
  children: ReactNode
  /** Com `onClick`, a tag vira um botão (filtro). */
  onClick?: () => void
  /** Só vale com `onClick`: tag de filtro ativa (mostra o botão de remover). */
  selected?: boolean
}

export function Tag({ children, onClick, selected = false }: TagProps) {
  const base = 'inline-flex items-center gap-2 rounded-sm px-2 py-1 text-lg text-cinza-escuro first-letter:uppercase'

  if (!onClick) {
    return <span className={`${base} bg-cinza-claro`}>{children}</span>
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`${base} cursor-pointer transition hover:brightness-110 ${selected ? 'bg-cinza-medio' : 'bg-cinza-claro'}`}
    >
      {children}
      {selected && <CloseIcon className="size-4" />}
    </button>
  )
}
