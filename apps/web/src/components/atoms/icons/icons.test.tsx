import { render } from '@testing-library/react'
import {
  ArrowRightIcon,
  ChainLinkDecoration,
  ChatIcon,
  ClipboardIcon,
  CloseIcon,
  CodeIcon,
  DeleteIcon,
  FeedIcon,
  GithubIcon,
  GoogleIcon,
  InfoIcon,
  LoginIcon,
  LogoutIcon,
  ProfileIcon,
  PublishIcon,
  SearchIcon,
  ShareIcon,
  UploadIcon,
} from './icons'

describe('icons', () => {
  it.each([
    ['GithubIcon', GithubIcon],
    ['GoogleIcon', GoogleIcon],
    ['ArrowRightIcon', ArrowRightIcon],
    ['ClipboardIcon', ClipboardIcon],
    ['LoginIcon', LoginIcon],
    ['ChainLinkDecoration', ChainLinkDecoration],
    ['SearchIcon', SearchIcon],
    ['FeedIcon', FeedIcon],
    ['ProfileIcon', ProfileIcon],
    ['InfoIcon', InfoIcon],
    ['LogoutIcon', LogoutIcon],
    ['CodeIcon', CodeIcon],
    ['ShareIcon', ShareIcon],
    ['ChatIcon', ChatIcon],
    ['CloseIcon', CloseIcon],
    ['UploadIcon', UploadIcon],
    ['DeleteIcon', DeleteIcon],
    ['PublishIcon', PublishIcon],
  ])('%s renders a decorative svg that accepts props', (_name, Icon) => {
    const { container } = render(<Icon className="size-4" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveClass('size-4')
  })
})
