import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { assertEmailAllowed, isEmailAllowed } from '../lib/authAllowlist'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const nextSession = data.session
      if (nextSession?.user.email && !isEmailAllowed(nextSession.user.email)) {
        supabase.auth.signOut()
        setSession(null)
      } else {
        setSession(nextSession)
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (nextSession?.user.email && !isEmailAllowed(nextSession.user.email)) {
        supabase.auth.signOut()
        setSession(null)
      } else {
        setSession(nextSession)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const normalized = email.trim().toLowerCase()
    assertEmailAllowed(normalized)

    const { error } = await supabase.auth.signInWithPassword({
      email: normalized,
      password,
    })
    if (error) {
      if (error.message.toLowerCase().includes('invalid login credentials')) {
        throw new Error('メールアドレスまたはパスワードが正しくありません')
      }
      throw error
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return { session, loading, signIn, signOut }
}
