
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ogyzxyomlrhqlvmqexew.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9neXp4eW9tbHJocWx2bXFleGV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzcyNDgsImV4cCI6MjA3MDc1MzI0OH0.9Vh8fyonr57JEsMrJvn5FmFp51lBNvVtRpWlS0YT0Zg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)