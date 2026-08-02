import type { RouteObject } from 'react-router-dom'

import { RegisterPage } from './page'

export const registerRoute: RouteObject = {
  path: '/register',
  element: <RegisterPage />,
}
