import { useState, type FormEvent } from 'react'

import { requestPasswordReset } from '@/shared/api/auth'

/** Feature: interação de pedir reset de senha (UI + estado + submit). */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await requestPasswordReset(email)
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao enviar.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <p className="status">
        Se existir uma conta para <strong>{email}</strong>, enviamos o link de
        redefinição.
      </p>
    )
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
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

      {error ? <p className="status status--error">{error}</p> : null}

      <button className="btn" type="submit" disabled={loading}>
        {loading ? 'Enviando…' : 'Enviar link'}
      </button>
    </form>
  )
}
