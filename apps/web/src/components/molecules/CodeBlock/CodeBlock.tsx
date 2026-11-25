/** Trecho de código do post, com o rótulo "Código:". */
export function CodeBlock({ code }: { code: string }) {
  return (
    <section aria-labelledby="codigo" className="flex flex-col gap-2">
      <h2 id="codigo" className="text-xl font-semibold text-cinza-medio">
        Código:
      </h2>
      <pre
        tabIndex={0}
        className="overflow-x-auto rounded-lg bg-cinza-escuro p-4 font-mono text-base text-cinza-claro shadow-lg"
      >
        <code>{code}</code>
      </pre>
    </section>
  )
}
