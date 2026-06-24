export interface AuthUser {
  username: string
}

const AUTH_BASE = import.meta.env.VITE_AUTH_BASE
  ?? (import.meta.env.DEV ? '/api/auth' : '/mikro-drommeplan/api/auth')

async function authRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    credentials: 'include',
    ...init,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed (${res.status})`)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return (await res.json()) as T
}

export function login(username: string, password: string) {
  return authRequest<AuthUser>(`${AUTH_BASE}/login`, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function logout() {
  return authRequest<{ ok: boolean }>(`${AUTH_BASE}/logout`, {
    method: 'POST',
  })
}

export function me() {
  return authRequest<AuthUser>(`${AUTH_BASE}/me`)
}
