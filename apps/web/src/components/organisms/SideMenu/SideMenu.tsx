import { Link, useLocation, useNavigate } from 'react-router'
import { Button } from '../../atoms/Button/Button'
import {
  FeedIcon,
  InfoIcon,
  LoginIcon,
  LogoutIcon,
  ProfileIcon,
} from '../../atoms/icons/icons'
import { Logo } from '../../atoms/Logo/Logo'
import { NavItem } from '../../molecules/NavItem/NavItem'

type SideMenuProps = {
  isLoggedIn: boolean
  onLogout: () => void
}

const iconClass = 'size-6 lg:size-8'

/**
 * Menu principal: coluna à esquerda no desktop e barra fixa embaixo no celular.
 * O último item muda com a sessão: "Sair" logado, "Login" como visitante.
 */
export function SideMenu({ isLoggedIn, onLogout }: SideMenuProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  function handlePublish() {
    // Visitante vai fazer login e volta para a publicação.
    if (isLoggedIn) void navigate('/publicar')
    else void navigate('/login', { state: { from: '/publicar' } })
  }

  return (
    <nav
      aria-label="Menu principal"
      className="fixed inset-x-0 bottom-0 z-10 bg-cinza-escuro px-2 py-2 lg:static lg:flex lg:w-44 lg:shrink-0 lg:flex-col lg:items-center lg:gap-20 lg:self-stretch lg:rounded-lg lg:px-4 lg:py-10"
    >
      <Link to="/" className="hidden lg:block">
        <Logo />
      </Link>
      <div className="flex items-center justify-around gap-1 lg:w-full lg:flex-col lg:gap-10">
        <Button
          variant="outline"
          onClick={handlePublish}
          className="w-auto px-3 py-2 text-base lg:w-full lg:px-4 lg:py-3 lg:text-xl lg:font-normal"
        >
          Publicar
        </Button>
        <NavItem
          icon={<FeedIcon className={iconClass} />}
          label="Feed"
          to="/"
          active={pathname === '/' || pathname.startsWith('/posts')}
        />
        <NavItem icon={<ProfileIcon className={iconClass} />} label="Perfil" disabled />
        <NavItem icon={<InfoIcon className={iconClass} />} label="Sobre nós" disabled />
        {isLoggedIn ? (
          <NavItem icon={<LogoutIcon className={iconClass} />} label="Sair" onClick={onLogout} />
        ) : (
          <NavItem icon={<LoginIcon className={iconClass} />} label="Login" to="/login" />
        )}
      </div>
    </nav>
  )
}
