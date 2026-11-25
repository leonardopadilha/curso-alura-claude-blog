type TabsProps<T extends string> = {
  items: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  /** Nome acessível do grupo de abas. */
  label: string
}

export function Tabs<T extends string>({ items, value, onChange, label }: TabsProps<T>) {
  return (
    <div role="tablist" aria-label={label} className="flex justify-center gap-6">
      {items.map((item) => {
        const selected = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(item.value)}
            className={`cursor-pointer px-1 text-xl transition ${
              selected
                ? 'font-semibold text-verde-destaque underline'
                : 'text-cinza-medio hover:text-offwhite'
            }`}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
