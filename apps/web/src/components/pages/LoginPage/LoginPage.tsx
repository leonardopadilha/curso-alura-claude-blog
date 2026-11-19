import bannerLogin from '../../../assets/banner-login.jpg'
import { ClipboardIcon } from '../../atoms/icons/icons'
import { AuthSwitchPrompt } from '../../molecules/AuthSwitchPrompt/AuthSwitchPrompt'
import { LoginForm } from '../../organisms/LoginForm/LoginForm'
import { SocialLogin } from '../../organisms/SocialLogin/SocialLogin'
import { AuthTemplate } from '../../templates/AuthTemplate/AuthTemplate'

export function LoginPage() {
  // TODO: integrar com a API quando o endpoint de autenticação existir.
  return (
    <AuthTemplate
      banner={{ src: bannerLogin, alt: 'Mulher programando em frente a telas conectadas — Code Connect' }}
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
      <LoginForm onSubmit={() => {}} />
    </AuthTemplate>
  )
}
