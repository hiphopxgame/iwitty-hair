import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { email, password } = await req.json()

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(email)
    
    if (existingUser.user) {
      // Update existing user password
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.user.id,
        { 
          password,
          email_confirm: true
        }
      )
      
      if (updateError) {
        console.error('Error updating user:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update user password' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ message: 'User password updated successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Create new user if doesn't exist
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: 'Dale Norris'
        }
      })

      if (createError) {
        console.error('Error creating user:', createError)
        return new Response(
          JSON.stringify({ error: 'Failed to create user' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ message: 'User created successfully', user: newUser }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Error in setup-admin-user function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})