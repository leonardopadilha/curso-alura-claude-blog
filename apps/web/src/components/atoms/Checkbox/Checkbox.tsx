import { useId, type ComponentProps } from 'react'

type CheckboxProps = Omit<ComponentProps<'input'>, 'type'> & {
  label: string
}

export function Checkbox({ label, id, className = '', ...props }: CheckboxProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <input
        id={inputId}
        type="checkbox"
        className="size-3.5 cursor-pointer accent-cc-accent"
        {...props}
      />
      <label htmlFor={inputId} className="cursor-pointer text-xs text-cc-muted">
        {label}
      </label>
    </div>
  )
}
