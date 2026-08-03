import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gwblbeaggzcbsfnklphz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3YmxiZWFnZ3pjYnNmbmtscGh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0ODA4NzYsImV4cCI6MjEwMTA1Njg3Nn0.UWpwSZ3UwLr4iaR6XtIbMvo6F8Eh5XSVfp7wOYDp9jo'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkSupabaseUsers() {
    console.log('Querying public.users from Supabase...')
    const { data, error } = await supabase.from('users').select('*')
    if (error) {
        console.error('Error fetching users:', error)
    } else {
        console.log('Current rows in Supabase users table:', data.length)
        console.log(data)
    }
}

checkSupabaseUsers()
