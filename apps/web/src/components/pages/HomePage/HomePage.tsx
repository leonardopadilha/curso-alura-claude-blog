import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { getApiErrorMessage, isUnauthorized } from '../../../services/api'
import { getCurrentUser, logout, type UserResponse } from '../../../services/auth'
import { Button } from '../../atoms/Button/Button'
import { Heading } from '../../atoms/Heading/Heading'
import { PageMeta } from '../../atoms/PageMeta/PageMeta'
import { Text } from '../../atoms/Text/Text'

export function HomePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<UserResponse>()
  const [error, setError] = useState<string>()

  useEffect(() => {
    let active = true
    getCurrentUser()
      .then((data) => {
        if (active) setUser(data)
      })
      .catch((e) => {
        if (!active) return
        if (isUnauthorized(e)) {
          logout()
          void navigate('/login', { replace: true })
        } else {
          setError(getApiErrorMessage(e))
        }
      })
    return () => {
      active = false
    }
  }, [navigate])

  function handleLogout() {
    logout()
    void navigate('/login', { replace: true })
  }

  return (
    <>
      <PageMeta title="Início | Code Connect" description="Área do usuário do Code Connect." />
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6">
        <Heading>{user ? `Olá, ${user.name}` : 'Início'}</Heading>
        {user && <Text>{user.email}</Text>}
        {error && (
          <p role="alert" className="text-base text-erro">
            {error}
          </p>
        )}
        <Button onClick={handleLogout}>Sair</Button>
      </main>
    </>
  )
}
