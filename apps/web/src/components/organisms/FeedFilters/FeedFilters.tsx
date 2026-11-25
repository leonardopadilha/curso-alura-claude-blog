import { SearchBox } from '../../molecules/SearchBox/SearchBox'
import { TagFilters } from '../../molecules/TagFilters/TagFilters'

type FeedFiltersProps = {
  search: string
  onSearchChange: (value: string) => void
  /** Tags sugeridas (as mais usadas). */
  tags: string[]
  selectedTags: string[]
  onToggleTag: (tag: string) => void
  onClear: () => void
}

/** Busca full text e filtro por tags do feed. */
export function FeedFilters({
  search,
  onSearchChange,
  tags,
  selectedTags,
  onToggleTag,
  onClear,
}: FeedFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      <SearchBox
        label="Buscar posts"
        placeholder="Digite o que você procura"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <TagFilters
        tags={tags}
        selected={selectedTags}
        onToggle={onToggleTag}
        onClear={onClear}
        canClear={selectedTags.length > 0 || search.trim() !== ''}
      />
    </div>
  )
}
