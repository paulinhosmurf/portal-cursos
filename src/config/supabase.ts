import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vhxcusucgfauwbevqcrv.supabase.co'
const supabaseKey = 'sb_publishable_LYJ8NY_z0gcyKbra8btXFg_gnwHgFQE'

export const supabase = createClient(supabaseUrl, supabaseKey)
