import { Heading } from '../../atoms/Heading/Heading'
import { Text } from '../../atoms/Text/Text'

type AuthFormHeaderProps = {
  title: string
  subtitle: string
}

export function AuthFormHeader({ title, subtitle }: AuthFormHeaderProps) {
  return (
    <div className="flex flex-col gap-6">
      <Heading>{title}</Heading>
      <Text size="lg">{subtitle}</Text>
    </div>
  )
}
