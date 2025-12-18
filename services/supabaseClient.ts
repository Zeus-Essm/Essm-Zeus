
import { createClient } from '@supabase/supabase-js'

// Credenciais fornecidas para integração oficial
const supabaseUrl = 'https://ogyzxyomlrhqlvmqexew.supabase.co'
const supabaseAnonKey = 'sb_publishable_TgSz6YeUi6AG8ROK8VFOCQ_JfiFrlKj'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
