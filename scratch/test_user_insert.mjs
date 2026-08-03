import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gwblbeaggzcbsfnklphz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3YmxiZWFnZ3pjYnNmbmtscGh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0ODA4NzYsImV4cCI6MjEwMTA1Njg3Nn0.UWpwSZ3UwLr4iaR6XtIbMvo6F8Eh5XSVfp7wOYDp9jo'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testUserInsert() {
    console.log('Testing connection to Supabase...')
    const testUser = {
        id: `user_test_${Date.now()}`,
        name: 'ทดสอบสมัครสมาชิก',
        email: 'testuser@system.com',
        password: 'password123',
        is_admin: false
    }

    const { data, error } = await supabase.from('users').insert([testUser]).select()
    if (error) {
        console.error('FAILED to insert into Supabase users table:', error.message, error.details, error.hint)
    } else {
        console.log('SUCCESS! Inserted test user into Supabase users table:', data)
    }
}

testUserInsert()
