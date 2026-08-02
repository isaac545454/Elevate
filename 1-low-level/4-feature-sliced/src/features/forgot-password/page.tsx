import { Link } from 'react-router-dom'

import { ForgotPasswordForm } from './ui'

/** Página da feature forgot-password (layout da rota). */
export function ForgotPasswordPage() {
  return (
    <section className="page auth-page">
      <header className="page__header">
        <p className="eyebrow">features / forgot-password</p>
        <h1>Esqueci a senha</h1>
        <p className="page__lead">
          Mock de reset: valida o e-mail e simula o envio do link.
        </p>
      </header>

      <ForgotPasswordForm />

      <p className="auth-links">
        <Link to="/login">Voltar ao login</Link>
      </p>
    </section>
  )
}
