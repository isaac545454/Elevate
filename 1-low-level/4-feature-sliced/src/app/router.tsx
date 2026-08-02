import { Navigate, useRoutes } from 'react-router-dom'

import { forgotPasswordRoute } from '@/features/forgot-password'
import { loginRoute } from '@/features/login'
import { registerRoute } from '@/features/register'

/** App só agrega as rotas que cada feature monta. */
export function AppRouter() {
  return useRoutes([
    { path: '/', element: <Navigate to="/login" replace /> },
    loginRoute,
    registerRoute,
    forgotPasswordRoute,
  ])
}
