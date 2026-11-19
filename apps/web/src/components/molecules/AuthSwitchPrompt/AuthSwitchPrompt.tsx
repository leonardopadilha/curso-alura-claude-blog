import type { ReactNode } from 'react'
import { Text } from '../../atoms/Text/Text'
import { TextLink } from '../../atoms/TextLink/TextLink'

type AuthSwitchPromptProps = {
  question: string
  linkLabel: string
  to: string
  icon?: ReactNode
  /** `stacked`: pergunta acima do link, centralizados. `inline`: pergunta e link na mesma linha. */
  layout?: 'stacked' | 'inline'
}

const layouts = {
  stacked: 'flex-col items-center',
  inline: 'items-center',
} as const

export function AuthSwitchPrompt({
  question,
  linkLabel,
  to,
  icon,
  layout = 'stacked',
}: AuthSwitchPromptProps) {
  return (
    <div className={`flex gap-2 ${layouts[layout]}`}>
      <Text size={layout === 'inline' ? 'base' : 'sm'}>{question}</Text>
      <TextLink to={to} variant="accent">
        {linkLabel}
        {icon}
      </TextLink>
    </div>
  )
}
