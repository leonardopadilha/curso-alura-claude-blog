import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { AppLayout } from './routes/AppLayout'
import { RequireAuth } from './routes/RequireAuth'

// Cada página vira um chunk próprio: /login não baixa o código do feed (e vice-versa).
const LoginPage = lazy(() =>
  import('./components/pages/LoginPage/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const SignupPage = lazy(() =>
  import('./components/pages/SignupPage/SignupPage').then((m) => ({ default: m.SignupPage })),
)
const FeedPage = lazy(() =>
  import('./components/pages/FeedPage/FeedPage').then((m) => ({ default: m.FeedPage })),
)
const PostPage = lazy(() =>
  import('./components/pages/PostPage/PostPage').then((m) => ({ default: m.PostPage })),
)
const PublishPage = lazy(() =>
  import('./components/pages/PublishPage/PublishPage').then((m) => ({ default: m.PublishPage })),
)

function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        {/* Feed e detalhes são públicos; publicar exige login. Todos dividem o mesmo layout. */}
        <Route element={<AppLayout />}>
          <Route index element={<FeedPage />} />
          <Route path="posts/:id" element={<PostPage />} />
          <Route
            path="publicar"
            element={
              <RequireAuth>
                <PublishPage />
              </RequireAuth>
            }
          />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
