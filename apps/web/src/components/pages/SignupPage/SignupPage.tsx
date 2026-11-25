import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import bannerCadastro from '../../../assets/banner-cadastro.jpg'
import { getRedirectTarget } from '../../../lib/redirect'
import { getApiErrorMessage } from '../../../services/api'
import { login, signup } from '../../../services/auth'
import { setToken } from '../../../services/tokenStorage'
import { LoginIcon } from '../../atoms/icons/icons'
import { PageMeta } from '../../atoms/PageMeta/PageMeta'
import { AuthSwitchPrompt } from '../../molecules/AuthSwitchPrompt/AuthSwitchPrompt'
import { SignupForm, type SignupValues } from '../../organisms/SignupForm/SignupForm'
import { SocialLogin } from '../../organisms/SocialLogin/SocialLogin'
import { AuthTemplate } from '../../templates/AuthTemplate/AuthTemplate'

export function SignupPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit({ name, email, password, remember }: SignupValues) {
    setError(undefined)
    setSubmitting(true)
    try {
      await signup({ name, email, password })
      const { accessToken } = await login({ email, password })
      setToken(accessToken, remember)
      await navigate(getRedirectTarget(location.state), { replace: true })
    } catch (e) {
      setError(getApiErrorMessage(e))
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageMeta
        title="Cadastro | Code Connect"
        description="Crie sua conta no Code Connect com nome, email e senha, ou com Github e Gmail."
      />
      <AuthTemplate
        banner={{
          src: bannerCadastro,
          alt: 'Mulher programando em frente a telas conectadas — Code Connect',
          width: 814,
          height: 1366,
        }}
        footer={
          <>
            <SocialLogin />
            <AuthSwitchPrompt
              layout="inline"
              question="Já tem conta?"
              linkLabel="Faça seu login!"
              to="/login"
              icon={<LoginIcon className="size-6" />}
            />
          </>
        }
      >
        <SignupForm onSubmit={handleSubmit} error={error} submitting={submitting} />
      </AuthTemplate>
    </>
  )
}
