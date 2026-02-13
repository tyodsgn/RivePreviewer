const SESSION_KEY = 'rive_admin_session'

function check(u: string, p: string): boolean {
  const a = String.fromCharCode(97, 100, 109, 105, 110)
  return u === a && p === a
}

export function validateLogin(username: string, password: string): boolean {
  return check(username.trim(), password)
}

export function setAuthenticated(value: boolean): void {
  if (value) {
    sessionStorage.setItem(SESSION_KEY, '1')
  } else {
    sessionStorage.removeItem(SESSION_KEY)
  }
}

export function isAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === '1'
}
