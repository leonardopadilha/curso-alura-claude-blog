import { toHandle } from '../../../lib/handle'
import { Avatar } from '../../atoms/Avatar/Avatar'

type AuthorBadgeProps = {
  name: string
  /** `dark`: texto escuro, para fundos claros (ex.: painel de comentários). */
  tone?: 'default' | 'dark'
}

/** Avatar e @usuário de quem publicou ou comentou. */
export function AuthorBadge({ name, tone = 'default' }: AuthorBadgeProps) {
  return (
    <span
      className={`flex items-center gap-2 text-base font-semibold ${
        tone === 'dark' ? 'text-cinza-escuro' : 'text-cinza-medio'
      }`}
    >
      <Avatar name={name} />
      {toHandle(name)}
    </span>
  )
}
