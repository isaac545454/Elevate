import type { RouteObject } from 'react-router-dom'

import { ForgotPasswordPage } from './page'

export const forgotPasswordRoute: RouteObject = {
  path: '/forgot-password',
  element: <ForgotPasswordPage />,
}
