import { useId, type ComponentProps } from 'react'
import { Label } from '../../atoms/Label/Label'
import { TextArea } from '../../atoms/TextArea/TextArea'

type TextAreaFieldProps = ComponentProps<'textarea'> & {
  label: string
}

export function TextAreaField({ label, id, ...props }: TextAreaFieldProps) {
  const generatedId = useId()
  const textAreaId = id ?? generatedId

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={textAreaId}>{label}</Label>
      <TextArea id={textAreaId} {...props} />
    </div>
  )
}
