import { useState, type SubmitEvent } from 'react'
import { ArrowRightIcon } from '../../atoms/icons/icons'
import { Button } from '../../atoms/Button/Button'
import { Checkbox } from '../../atoms/Checkbox/Checkbox'
import { Heading } from '../../atoms/Heading/Heading'
import { Text } from '../../atoms/Text/Text'
import { TextLink } from '../../atoms/TextLink/TextLink'
import { FormField } from '../../molecules/FormField/FormField'

export type LoginValues = {
  identifier: string
  password: string
  remember: boolean
}

type LoginFormProps = {
  onSubmit: (values: LoginValues) => void
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({ identifier, password, remember })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <Heading>Login</Heading>
        <Text>Boas-vindas! Faça seu login.</Text>
      </div>

      <div className="flex flex-col gap-3">
        <FormField
          label="Email ou usuário"
          name="identifier"
          placeholder="usuario123"
          autoComplete="username"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <FormField
          label="Senha"
          name="password"
          type="password"
          placeholder="••••••"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex items-center justify-between">
          <Checkbox
            label="Lembrar-me"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <TextLink to="/esqueci-a-senha">Esqueci a senha</TextLink>
        </div>
      </div>

      <Button type="submit" icon={<ArrowRightIcon className="size-3.5" />}>
        Login
      </Button>
    </form>
  )
}
