import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create Supabase client (or null if not configured)
// This allows graceful fallback during development
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

// Database Types (to be extended as schema evolves)
export type Client = {
  id: string
  created_at: string
  email: string
  company_name?: string
  contact_name?: string
  phone?: string
  project_type?: string
  budget?: string
  message?: string
  status: 'new' | 'contacted' | 'proposal_sent' | 'won' | 'lost'
}

export type ChatLog = {
  id: string
  created_at: string
  session_id: string
  user_message: string
  bot_response: string
  user_ip?: string
  user_agent?: string
}

export type AutomationRun = {
  id: string
  created_at: string
  platform: 'twitter' | 'telegram' | 'youtube' | 'snapchat' | 'linkedin'
  post_type: string
  post_content: string
  media_url?: string
  status: 'scheduled' | 'posted' | 'failed'
  error_message?: string
}

// Helper functions for common operations
export const clientsTable = {
  // Create new client inquiry
  async create(data: Omit<Client, 'id' | 'created_at' | 'status'>) {
    const { data: client, error } = await supabase
      .from('clients')
      .insert([{ ...data, status: 'new' }])
      .select()
      .single()

    if (error) throw error
    return client
  },

  // Get all clients
  async getAll() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Update client status
  async updateStatus(id: string, status: Client['status']) {
    const { data, error } = await supabase
      .from('clients')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

export const chatLogsTable = {
  // Log chat interaction
  async create(data: Omit<ChatLog, 'id' | 'created_at'>) {
    const { data: log, error } = await supabase
      .from('chat_logs')
      .insert([data])
      .select()
      .single()

    if (error) throw error
    return log
  },

  // Get recent chats by session
  async getBySession(sessionId: string, limit = 50) {
    const { data, error } = await supabase
      .from('chat_logs')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error) throw error
    return data
  },
}

export const automationRunsTable = {
  // Log automation run
  async create(data: Omit<AutomationRun, 'id' | 'created_at'>) {
    const { data: run, error } = await supabase
      .from('automation_runs')
      .insert([data])
      .select()
      .single()

    if (error) throw error
    return run
  },

  // Get recent runs by platform
  async getByPlatform(platform: AutomationRun['platform'], limit = 100) {
    const { data, error } = await supabase
      .from('automation_runs')
      .select('*')
      .eq('platform', platform)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },

  // Get failed runs for debugging
  async getFailed(limit = 50) {
    const { data, error } = await supabase
      .from('automation_runs')
      .select('*')
      .eq('status', 'failed')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },
}
