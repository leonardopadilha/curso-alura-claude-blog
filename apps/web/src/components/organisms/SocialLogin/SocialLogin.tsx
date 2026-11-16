import { GithubIcon, GoogleIcon } from '../../atoms/icons/icons'
import { DividerWithText } from '../../molecules/DividerWithText/DividerWithText'
import { SocialButton } from '../../molecules/SocialButton/SocialButton'

type SocialLoginProps = {
  onGithub?: () => void
  onGoogle?: () => void
}

export function SocialLogin({ onGithub, onGoogle }: SocialLoginProps) {
  return (
    <div className="flex flex-col gap-3">
      <DividerWithText>ou entre com outras contas</DividerWithText>
      <div className="flex justify-center gap-4">
        <SocialButton
          icon={<GithubIcon className="size-full text-white" />}
          label="Github"
          onClick={onGithub}
        />
        <SocialButton
          icon={<GoogleIcon className="size-full" />}
          label="Gmail"
          onClick={onGoogle}
        />
      </div>
    </div>
  )
}
