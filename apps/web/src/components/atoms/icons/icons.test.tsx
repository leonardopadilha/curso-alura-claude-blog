import { render } from '@testing-library/react'
import {
  ArrowRightIcon,
  ChainLinkDecoration,
  ClipboardIcon,
  GithubIcon,
  GoogleIcon,
  LoginIcon,
} from './icons'

describe('icons', () => {
  it.each([
    ['GithubIcon', GithubIcon],
    ['GoogleIcon', GoogleIcon],
    ['ArrowRightIcon', ArrowRightIcon],
    ['ClipboardIcon', ClipboardIcon],
    ['LoginIcon', LoginIcon],
    ['ChainLinkDecoration', ChainLinkDecoration],
  ])('%s renders a decorative svg that accepts props', (_name, Icon) => {
    const { container } = render(<Icon className="size-4" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveClass('size-4')
  })
})
