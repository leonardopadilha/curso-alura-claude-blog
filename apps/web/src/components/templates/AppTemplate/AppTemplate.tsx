import type { ReactNode } from 'react'

type AppTemplateProps = {
  /** Menu principal (coluna à esquerda no desktop, barra embaixo no celular). */
  menu: ReactNode
  /** Conteúdo da página: feed, detalhes do post, publicação... */
  children: ReactNode
}

/** Layout das páginas internas: menu lateral + coluna de conteúdo. */
export function AppTemplate({ menu, children }: AppTemplateProps) {
  return (
    <div className="min-h-svh bg-grafite font-sans">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 pt-8 pb-28 lg:flex-row lg:justify-between lg:px-0 lg:py-14">
        {menu}
        <main className="flex min-w-0 flex-1 flex-col gap-14 lg:max-w-[996px]">{children}</main>
      </div>
    </div>
  )
}
