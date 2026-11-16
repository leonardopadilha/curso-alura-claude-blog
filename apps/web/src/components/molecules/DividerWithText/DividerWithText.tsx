type DividerWithTextProps = {
  children: string
}

export function DividerWithText({ children }: DividerWithTextProps) {
  return (
    <div className="flex items-center gap-2" role="separator">
      <span className="h-px flex-1 bg-cc-muted/60" />
      <span className="text-[10px] text-cc-muted">{children}</span>
      <span className="h-px flex-1 bg-cc-muted/60" />
    </div>
  )
}
