import type { ReactNode } from 'react'
import { Link } from 'react-router'

type StatButtonProps = {
  icon: ReactNode
  /** Nome acessível da ação (ex.: "Curtir"). */
  label: string
  count?: number
  /** Estado ligado (ex.: post curtido). Só vale com `onClick`. */
  active?: boolean
  onClick?: () => void
  /** Em vez de uma ação, leva a outra página/âncora. */
  to?: string
}

/** Ícone com contador embaixo, como as ações de um post (curtir, compartilhar, comentar). */
export function StatButton({ icon, label, count, active, onClick, to }: StatButtonProps) {
  const className = `flex cursor-pointer flex-col items-center text-base transition hover:text-offwhite ${
    active ? 'text-verde-destaque' : 'text-cinza-medio'
  }`
  const content = (
    <>
      {icon}
      {count !== undefined && <span>{count}</span>}
    </>
  )

  if (to) {
    return (
      <Link to={to} aria-label={count === undefined ? label : `${label} (${count})`} className={className}>
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={count === undefined ? label : `${label} (${count})`}
      aria-pressed={active}
      className={className}
    >
      {content}
    </button>
  )
}
