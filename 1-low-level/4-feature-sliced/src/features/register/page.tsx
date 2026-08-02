import { Link } from 'react-router-dom'

import { RegisterForm } from './ui'

/** Página da feature register (layout da rota). */
export function RegisterPage() {
  return (
    <section className="page auth-page">
      <header className="page__header">
        <p className="eyebrow">features / register</p>
        <h1>Criar conta</h1>
        <p className="page__lead">
          Cadastro mock: cria a sessão e mostra o estado autenticado.
        </p>
      </header>

      <RegisterForm />

      <p className="auth-links">
        <Link to="/login">Já tenho conta</Link>
      </p>
    </section>
  )
}
