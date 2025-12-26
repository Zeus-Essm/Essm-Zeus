import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://opuewdyvstcepgyattqg.supabase.co';
const supabaseAnonKey = 'sb_publishable_lopVw8ZFn4df_B6DjfP0kQ_R8PMyQcy';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);