import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vhxcusucgfauwbevqcrv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeGN1c3VjZ2ZhdXdiZXZxY3J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1OTI0MzksImV4cCI6MjA5MTE2ODQzOX0.hSFhkmRriW1Yzd5RdR80IOL_UERY7AhHARo61PveQ6I'

export const supabase = createClient(supabaseUrl, supabaseKey)
