import { useId, type ComponentProps } from 'react'
import { Input } from '../../atoms/Input/Input'
import { Label } from '../../atoms/Label/Label'

type FormFieldProps = ComponentProps<'input'> & {
  label: string
}

export function FormField({ label, id, ...props }: FormFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={inputId}>{label}</Label>
      <Input id={inputId} {...props} />
    </div>
  )
}
