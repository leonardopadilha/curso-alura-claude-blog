import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'

// Cada página vira um chunk próprio: /login não baixa o código do cadastro (e vice-versa).
const LoginPage = lazy(() =>
  import('./components/pages/LoginPage/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const SignupPage = lazy(() =>
  import('./components/pages/SignupPage/SignupPage').then((m) => ({ default: m.SignupPage })),
)

function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
