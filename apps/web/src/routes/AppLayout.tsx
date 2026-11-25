import { Outlet, useNavigate } from 'react-router'
import { SideMenu } from '../components/organisms/SideMenu/SideMenu'
import { AppTemplate } from '../components/templates/AppTemplate/AppTemplate'
import { useSession } from '../hooks/useSession'
import { logout } from '../services/auth'

/** Layout compartilhado por feed, detalhes do post e publicação: menu + página. */
export function AppLayout() {
  const { isLoggedIn } = useSession()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    void navigate('/')
  }

  return (
    <AppTemplate menu={<SideMenu isLoggedIn={isLoggedIn} onLogout={handleLogout} />}>
      <Outlet />
    </AppTemplate>
  )
}
