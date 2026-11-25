import { Tag } from '../../atoms/Tag/Tag'

type TagFiltersProps = {
  /** Tags sugeridas (as mais usadas) e as já escolhidas, mesmo que fora das sugestões. */
  tags: string[]
  selected: string[]
  onToggle: (tag: string) => void
  onClear: () => void
  /** Mostra "Limpar tudo" quando há algum filtro (tags ou busca) ativo. */
  canClear: boolean
}

export function TagFilters({ tags, selected, onToggle, onClear, canClear }: TagFiltersProps) {
  // Escolhidas primeiro, como no layout; depois as demais sugestões.
  const ordered = [...selected, ...tags.filter((tag) => !selected.includes(tag))]

  return (
    <div className="flex items-center justify-between gap-6">
      <ul aria-label="Filtrar por tag" className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {ordered.map((tag) => (
          <li key={tag}>
            <Tag selected={selected.includes(tag)} onClick={() => onToggle(tag)}>
              {tag}
            </Tag>
          </li>
        ))}
      </ul>
      {canClear && (
        <button
          type="button"
          onClick={onClear}
          className="shrink-0 cursor-pointer text-lg text-cinza-medio transition hover:text-offwhite"
        >
          Limpar tudo
        </button>
      )}
    </div>
  )
}
