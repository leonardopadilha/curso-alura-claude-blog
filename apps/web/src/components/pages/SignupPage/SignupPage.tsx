import bannerCadastro from '../../../assets/banner-cadastro.jpg'
import { LoginIcon } from '../../atoms/icons/icons'
import { PageMeta } from '../../atoms/PageMeta/PageMeta'
import { AuthSwitchPrompt } from '../../molecules/AuthSwitchPrompt/AuthSwitchPrompt'
import { SignupForm } from '../../organisms/SignupForm/SignupForm'
import { SocialLogin } from '../../organisms/SocialLogin/SocialLogin'
import { AuthTemplate } from '../../templates/AuthTemplate/AuthTemplate'

export function SignupPage() {
  // TODO: integrar com a API quando o endpoint de cadastro existir.
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
        <SignupForm onSubmit={() => {}} />
      </AuthTemplate>
    </>
  )
}
