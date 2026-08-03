import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gwblbeaggzcbsfnklphz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3YmxiZWFnZ3pjYnNmbmtscGh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0ODA4NzYsImV4cCI6MjEwMTA1Njg3Nn0.UWpwSZ3UwLr4iaR6XtIbMvo6F8Eh5XSVfp7wOYDp9jo'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function populateUsers() {
    console.log('Inserting default users into Supabase...')
    const usersToInsert = [
        {
            id: 'user_admin_default',
            name: 'sakchawit',
            email: 'admin@system.com',
            password: 'password123',
            is_admin: true
        }
    ]

    const { data, error } = await supabase.from('users').upsert(usersToInsert).select()
    if (error) {
        console.error('Error inserting users into Supabase:', error.message, error.details, error.hint)
    } else {
        console.log('Successfully inserted users into Supabase:', data)
    }
}

populateUsers()
