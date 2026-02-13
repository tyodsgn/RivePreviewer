import { supabase } from './lib/supabase'
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js'

export async function signUp(
  email: string,
  password: string,
): Promise<{ user: User | null; error: string | null }> {
  const { data, error } = await supabase.auth.signUp({ email, password })
  return {
    user: data.user,
    error: error?.message ?? null,
  }
}

export async function signIn(
  email: string,
  password: string,
): Promise<{ user: User | null; error: string | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return {
    user: data.user,
    error: error?.message ?? null,
  }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export function onAuthChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback)
  return () => subscription.unsubscribe()
}
