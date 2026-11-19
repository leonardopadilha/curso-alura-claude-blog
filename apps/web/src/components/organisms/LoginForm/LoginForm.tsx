import { useState, type SubmitEvent } from 'react'
import { ArrowRightIcon } from '../../atoms/icons/icons'
import { Button } from '../../atoms/Button/Button'
import { Checkbox } from '../../atoms/Checkbox/Checkbox'
import { TextLink } from '../../atoms/TextLink/TextLink'
import { AuthFormHeader } from '../../molecules/AuthFormHeader/AuthFormHeader'
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="flex flex-col gap-10">
        <AuthFormHeader title="Login" subtitle="Boas-vindas! Faça seu login." />

        <div className="flex flex-col gap-4">
          <FormField
            label="Email ou usuário"
            name="identifier"
            placeholder="usuario123"
            autoComplete="username"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <div className="flex flex-col gap-2">
            <FormField
              label="Senha"
              name="password"
              type="password"
              placeholder="******"
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
        </div>
      </div>

      <Button type="submit" icon={<ArrowRightIcon className="size-4.5" />}>
        Login
      </Button>
    </form>
  )
}
