import { useState, type SubmitEvent } from 'react'
import { ArrowRightIcon } from '../../atoms/icons/icons'
import { Button } from '../../atoms/Button/Button'
import { Checkbox } from '../../atoms/Checkbox/Checkbox'
import { AuthFormHeader } from '../../molecules/AuthFormHeader/AuthFormHeader'
import { FormField } from '../../molecules/FormField/FormField'

export type SignupValues = {
  name: string
  email: string
  password: string
  remember: boolean
}

type SignupFormProps = {
  onSubmit: (values: SignupValues) => void
}

export function SignupForm({ onSubmit }: SignupFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({ name, email, password, remember })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="flex flex-col gap-8">
        <AuthFormHeader title="Cadastro" subtitle="Olá! Preencha seus dados." />

        <div className="flex flex-col gap-4">
          <FormField
            label="Nome"
            name="name"
            placeholder="Nome completo"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            placeholder="Digite seu email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="flex flex-col gap-2">
            <FormField
              label="Senha"
              name="password"
              type="password"
              placeholder="******"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Checkbox
              label="Lembrar-me"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
          </div>
        </div>
      </div>

      <Button type="submit" icon={<ArrowRightIcon className="size-4.5" />}>
        Cadastrar
      </Button>
    </form>
  )
}
