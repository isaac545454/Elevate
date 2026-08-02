import { Link } from 'react-router-dom'

import { LoginForm } from './ui'

/** Página da feature login (layout da rota). */
export function LoginPage() {
  return (
    <section className="page auth-page">
      <header className="page__header">
        <p className="eyebrow">features / login</p>
        <h1>Login</h1>
        <p className="page__lead">
          Entre com e-mail e senha (mock). Qualquer e-mail válido + senha com 6+
          caracteres funciona.
        </p>
      </header>

      <LoginForm />

      <p className="auth-links">
        <Link to="/register">Criar conta</Link>
        <Link to="/forgot-password">Esqueci a senha</Link>
      </p>
    </section>
  )
}
