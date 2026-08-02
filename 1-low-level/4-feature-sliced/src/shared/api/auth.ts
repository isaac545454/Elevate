import type { User } from '@/entities/user'
import { delay } from '@/shared/lib/delay'
import { clearSession, setSession } from '@/shared/lib/session'

/** Mock: qualquer email/senha com 6+ chars funciona. */
export async function login(email: string, password: string): Promise<User> {
  await delay()

  if (!email.includes('@') || password.length < 6) {
    throw new Error('Credenciais inválidas. Use um e-mail e senha com 6+ caracteres.')
  }

  const user: User = {
    id: '1',
    name: email.split('@')[0] ?? 'user',
    email,
  }

  setSession(user)
  return user
}

/** Mock: cria sessão a partir do formulário de cadastro. */
export async function register(
  name: string,
  email: string,
  password: string,
): Promise<User> {
  await delay()

  if (!name.trim()) {
    throw new Error('Informe o seu nome.')
  }

  if (!email.includes('@')) {
    throw new Error('Informe um e-mail válido.')
  }

  if (password.length < 6) {
    throw new Error('A senha precisa ter pelo menos 6 caracteres.')
  }

  const user: User = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email,
  }

  setSession(user)
  return user
}

/** Mock: só valida o e-mail e "envia" o link. */
export async function requestPasswordReset(email: string): Promise<void> {
  await delay()

  if (!email.includes('@')) {
    throw new Error('Informe um e-mail válido.')
  }
}

export function logout(): void {
  clearSession()
}
