import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import bannerLogin from '../../../assets/banner-login.jpg'
import { getRedirectTarget } from '../../../lib/redirect'
import { getApiErrorMessage } from '../../../services/api'
import { login } from '../../../services/auth'
import { setToken } from '../../../services/tokenStorage'
import { ClipboardIcon } from '../../atoms/icons/icons'
import { PageMeta } from '../../atoms/PageMeta/PageMeta'
import { AuthSwitchPrompt } from '../../molecules/AuthSwitchPrompt/AuthSwitchPrompt'
import { LoginForm, type LoginValues } from '../../organisms/LoginForm/LoginForm'
import { SocialLogin } from '../../organisms/SocialLogin/SocialLogin'
import { AuthTemplate } from '../../templates/AuthTemplate/AuthTemplate'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit({ email, password, remember }: LoginValues) {
    setError(undefined)
    setSubmitting(true)
    try {
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
        title="Login | Code Connect"
        description="Entre na sua conta do Code Connect com email ou usuário, ou com Github e Gmail."
      />
      <AuthTemplate
        banner={{
          src: bannerLogin,
          alt: 'Mulher programando em frente a telas conectadas — Code Connect',
          width: 407,
          height: 628,
        }}
        footer={
          <>
            <SocialLogin />
            <AuthSwitchPrompt
              question="Ainda não tem conta?"
              linkLabel="Crie seu cadastro!"
              to="/cadastro"
              icon={<ClipboardIcon className="size-6" />}
            />
          </>
        }
      >
        <LoginForm onSubmit={handleSubmit} error={error} submitting={submitting} />
      </AuthTemplate>
    </>
  )
}
