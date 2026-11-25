import type { ComponentProps } from 'react'
import { SearchIcon } from '../../atoms/icons/icons'

type SearchBoxProps = Omit<ComponentProps<'input'>, 'type'> & {
  /** Nome acessível do campo (não há rótulo visível). */
  label: string
}

export function SearchBox({ label, className = '', ...props }: SearchBoxProps) {
  return (
    <div
      role="search"
      className={`flex items-center gap-4 rounded-sm bg-cinza-escuro px-4 py-2 text-cinza-claro focus-within:outline-2 focus-within:outline-verde-destaque ${className}`}
    >
      <SearchIcon className="size-8 shrink-0" />
      <input
        type="search"
        aria-label={label}
        className="w-full bg-transparent text-xl text-cinza-claro outline-none placeholder:text-cinza-claro"
        {...props}
      />
    </div>
  )
}
