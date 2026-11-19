type DividerWithTextProps = {
  children: string
}

export function DividerWithText({ children }: DividerWithTextProps) {
  return (
    <div className="flex items-center gap-4" role="separator">
      <span className="h-px flex-1 bg-cc-text" />
      <span className="text-cc-sm text-cc-text">{children}</span>
      <span className="h-px flex-1 bg-cc-text" />
    </div>
  )
}
