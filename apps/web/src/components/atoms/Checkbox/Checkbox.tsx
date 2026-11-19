import { useId, type ComponentProps } from 'react'

type CheckboxProps = Omit<ComponentProps<'input'>, 'type'> & {
  label: string
}

export function Checkbox({ label, id, className = '', ...props }: CheckboxProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="relative inline-flex size-6 shrink-0">
        <input
          id={inputId}
          type="checkbox"
          className="peer size-full cursor-pointer appearance-none rounded-sm border-2 border-cinza-medio bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verde-destaque"
          {...props}
        />
        <svg
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden size-full p-1 text-verde-destaque peer-checked:block"
        >
          <path
            fillRule="evenodd"
            d="M13.65 3.1c.35.19.45.6.24.9l-5.68 8.27a1.84 1.84 0 0 1-2.5.43L2.3 10.44a.62.62 0 0 1-.15-.93.67.67 0 0 1 1.03-.14l3.4 2.26a.3.3 0 0 0 .36-.07l5.68-8.26c.21-.31.67-.4 1.03-.2Z"
            clipRule="evenodd"
          />
        </svg>
      </span>
      <label htmlFor={inputId} className="cursor-pointer text-base text-cinza-medio">
        {label}
      </label>
    </div>
  )
}
