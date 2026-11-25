import type { ReactNode } from 'react'
import { Link } from 'react-router'

type NavItemProps = {
  icon: ReactNode
  label: string
  /** Navega para uma rota. */
  to?: string
  /** Executa uma ação (ex.: sair). */
  onClick?: () => void
  /** Página atual. */
  active?: boolean
  /** Sem destino ainda: aparece apagado e não é clicável. */
  disabled?: boolean
}

const base = 'flex flex-col items-center gap-2 px-2 py-2 text-xs lg:px-4 lg:text-xl'

export function NavItem({ icon, label, to, onClick, active = false, disabled = false }: NavItemProps) {
  const color = active ? 'text-white' : 'text-cinza-medio'
  const content = (
    <>
      {icon}
      <span>{label}</span>
    </>
  )

  if (disabled) {
    return (
      <span aria-disabled="true" title="Em breve" className={`${base} ${color} opacity-60`}>
        {content}
      </span>
    )
  }

  const interactive = `${base} ${color} cursor-pointer transition hover:text-white`

  if (to) {
    return (
      <Link to={to} aria-current={active ? 'page' : undefined} className={interactive}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={interactive}>
      {content}
    </button>
  )
}
