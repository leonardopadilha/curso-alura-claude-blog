import type { ComponentProps } from 'react'

type HeadingProps = ComponentProps<'h1'> & {
  as?: 'h1' | 'h2' | 'h3'
}

export function Heading({
  as: Tag = 'h1',
  className = '',
  ...props
}: HeadingProps) {
  return (
    <Tag
      className={`text-cc-title font-semibold text-cc-text ${className}`}
      {...props}
    />
  )
}
