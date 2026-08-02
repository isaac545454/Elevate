import { useState, type FormEvent } from 'react'

import type { User } from '@/entities/user'
import { logout, register } from '@/shared/api/auth'
import { getSession } from '@/shared/lib/session'

/** Feature: interação de cadastrar (UI + estado + submit). */
export function RegisterForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(() => getSession())

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const session = await register(name, email, password)
      setUser(session)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao cadastrar.')
    } finally {
      setLoading(false)
    }
  }

  if (user) {
    return (
      <div className="auth-form">
        <p className="status">
          Conta criada. Autenticado como <strong>{user.name}</strong>.
        </p>
        <button
          className="btn btn--ghost"
          type="button"
          onClick={() => {
            logout()
            setUser(null)
          }}
        >
          Sair
        </button>
      </div>
    )
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Nome</span>
        <input
          type="text"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </label>

      <label className="field">
        <span>E-mail</span>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      <label className="field">
        <span>Senha</span>
        <input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={6}
        />
      </label>

      {error ? <p className="status status--error">{error}</p> : null}

      <button className="btn" type="submit" disabled={loading}>
        {loading ? 'Criando…' : 'Cadastrar'}
      </button>
    </form>
  )
}
