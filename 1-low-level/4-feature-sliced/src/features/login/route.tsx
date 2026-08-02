import type { RouteObject } from 'react-router-dom'

import { LoginPage } from './page'

export const loginRoute: RouteObject = {
  path: '/login',
  element: <LoginPage />,
}
