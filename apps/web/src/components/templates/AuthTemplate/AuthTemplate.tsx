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

      <div className="relative flex w-full max-w-[434px] overflow-hidden rounded-2xl bg-cc-surface p-4 md:max-w-[700px] md:gap-8 md:p-8">
        <img
          src={banner.src}
          alt={banner.alt}
          className="hidden w-[180px] shrink-0 rounded-sm object-cover md:block"
        />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-6">
          {children}
          {footer}
        </div>
      </div>
    </main>
  )
}
