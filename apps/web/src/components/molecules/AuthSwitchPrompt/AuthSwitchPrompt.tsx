import type { ReactNode } from 'react'
import { Text } from '../../atoms/Text/Text'
import { TextLink } from '../../atoms/TextLink/TextLink'

type AuthSwitchPromptProps = {
  question: string
  linkLabel: string
  to: string
  icon?: ReactNode
}

export function AuthSwitchPrompt({
  question,
  linkLabel,
  to,
  icon,
}: AuthSwitchPromptProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Text size="xs">{question}</Text>
      <TextLink to={to} variant="accent">
        {linkLabel}
        {icon}
      </TextLink>
    </div>
  )
}
