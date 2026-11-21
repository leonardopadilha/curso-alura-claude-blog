import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { RequireAuth } from './routes/RequireAuth'

// Cada página vira um chunk próprio: /login não baixa o código do cadastro (e vice-versa).
const LoginPage = lazy(() =>
  import('./components/pages/LoginPage/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const SignupPage = lazy(() =>
  import('./components/pages/SignupPage/SignupPage').then((m) => ({ default: m.SignupPage })),
)
const HomePage = lazy(() =>
  import('./components/pages/HomePage/HomePage').then((m) => ({ default: m.HomePage })),
)

function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route
          path="/inicio"
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
