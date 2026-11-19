import type { ReactNode } from 'react'
import { ChainLinkDecoration } from '../../atoms/icons/icons'

type AuthTemplateProps = {
  banner: { src: string; alt: string }
  /** Formulário principal (Login, Cadastro...). */
  children: ReactNode
  /** Área abaixo do formulário (login social, link de troca de página). */
  footer?: ReactNode
}

export function AuthTemplate({ banner, children, footer }: AuthTemplateProps) {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-cc-bg px-4 py-8 font-sans">
      <ChainLinkDecoration className="absolute -top-10 left-[5%] hidden h-[45vh] text-cc-decoration md:block" />
      <ChainLinkDecoration className="absolute -right-4 -bottom-10 hidden h-[45vh] text-cc-decoration md:block" />

      <div className="relative flex w-full max-w-[434px] overflow-hidden rounded-2xl border border-cc-bg bg-cc-surface p-4 lg:max-w-[996px] lg:justify-between lg:gap-6 lg:rounded-4xl lg:px-[78px] lg:py-14">
        <img
          src={banner.src}
          alt={banner.alt}
          className="hidden w-[407px] shrink-0 object-cover lg:block"
        />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-8 lg:w-[410px] lg:flex-none lg:px-8">
          {children}
          {footer && <div className="flex flex-col gap-6">{footer}</div>}
        </div>
      </div>
    </main>
  )
}
