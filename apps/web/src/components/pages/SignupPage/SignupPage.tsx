import bannerCadastro from '../../../assets/banner-cadastro.jpg'
import { LoginIcon } from '../../atoms/icons/icons'
import { AuthSwitchPrompt } from '../../molecules/AuthSwitchPrompt/AuthSwitchPrompt'
import { SignupForm } from '../../organisms/SignupForm/SignupForm'
import { SocialLogin } from '../../organisms/SocialLogin/SocialLogin'
import { AuthTemplate } from '../../templates/AuthTemplate/AuthTemplate'

export function SignupPage() {
  // TODO: integrar com a API quando o endpoint de cadastro existir.
  return (
    <AuthTemplate
      banner={{ src: bannerCadastro, alt: 'Mulher programando em frente a telas conectadas — Code Connect' }}
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
      <SignupForm onSubmit={() => {}} />
    </AuthTemplate>
  )
}
