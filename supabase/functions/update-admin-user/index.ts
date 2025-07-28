import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting update-admin-user function')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { adminUserId, updates, requestingUserId } = await req.json()
    console.log('Request parsed, adminUserId:', adminUserId, 'requestingUserId:', requestingUserId)

    if (!adminUserId || !updates || !requestingUserId) {
      return new Response(
        JSON.stringify({ error: 'Admin user ID, updates, and requesting user ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the requesting user is an admin
    const { data: requestingUser } = await supabaseAdmin.auth.admin.getUserById(requestingUserId)
    if (!requestingUser?.user || requestingUser.user.email !== 'tyronenorris@gmail.com') {
      // For now, only super admin can edit other admins
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Only super admin can edit other admin accounts' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update the target admin user
    const updateData: any = {}
    
    if (updates.email) {
      updateData.email = updates.email
    }
    
    if (updates.password) {
      updateData.password = updates.password
    }
    
    if (updates.full_name) {
      updateData.user_metadata = {
        full_name: updates.full_name
      }
    }

    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      adminUserId,
      updateData
    )

    if (updateError) {
      console.error('Error updating admin user:', updateError)
      return new Response(
        JSON.stringify({ error: `Failed to update admin user: ${updateError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Admin user updated successfully:', updatedUser.user?.email)

    return new Response(
      JSON.stringify({ message: 'Admin user updated successfully', user: updatedUser.user }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in update-admin-user function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})