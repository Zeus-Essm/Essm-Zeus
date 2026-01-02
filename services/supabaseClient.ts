
import { createClient } from '@supabase/supabase-js';

// Novas credenciais do projeto PUMP (evqhudhmfhjhalkirzhk)
const supabaseUrl = 'https://evqhudhmfhjhalkirzhk.supabase.co';
const supabaseAnonKey = 'sb_publishable_TB52obVseFwx7xHGENnosw_swBAglAh';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
