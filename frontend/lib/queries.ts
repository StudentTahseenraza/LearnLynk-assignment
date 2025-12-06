import { supabase } from './supabase'

export interface Task {
  id: string
  title: string
  type: 'call' | 'email' | 'review'
  description?: string
  due_at: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  related_id: string
  assigned_to?: string
  created_at: string
  updated_at: string
  applications?: {
    id: string
    lead_id: string
    leads?: {
      id: string
      first_name?: string
      last_name?: string
      email?: string
    }
  }
}

export interface Lead {
  id: string
  tenant_id: string
  owner_id?: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  stage: string
  source?: string
  notes?: string
  created_at: string
  updated_at: string
  applications_count?: number
  tasks_count?: number
}

export interface Application {
  id: string
  tenant_id: string
  lead_id: string
  program?: string
  intake?: string
  status: string
  documents?: any[]
  metadata?: any
  created_at: string
  updated_at: string
  leads?: Lead
  tasks?: Task[]
  tasks_count?: number
}

export interface TodayTasksResponse {
  tasks: Task[]
  total: number
  completed: number
  pending: number
}

// ==================== TASKS QUERIES ====================

export const fetchTodayTasks = async (): Promise<TodayTasksResponse> => {
  try {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)

    // First, get the basic tasks
    const { data: tasks, error, count } = await supabase
      .from('tasks')
      .select('*', { count: 'exact' })
      .gte('due_at', startOfDay.toISOString())
      .lte('due_at', endOfDay.toISOString())
      .order('due_at', { ascending: true })
      .order('priority', { ascending: false })

    if (error) throw error

    // Then fetch related application and lead data for each task
    const tasksWithRelations = await Promise.all(
      (tasks || []).map(async (task) => {
        if (!task.related_id) return task

        try {
          // Fetch application
          const { data: application } = await supabase
            .from('applications')
            .select('id, lead_id')
            .eq('id', task.related_id)
            .single()

          if (!application) return task

          // Fetch lead
          const { data: lead } = await supabase
            .from('leads')
            .select('id, first_name, last_name, email')
            .eq('id', application.lead_id)
            .single()

          return {
            ...task,
            applications: {
              id: application.id,
              lead_id: application.lead_id,
              leads: lead || undefined
            }
          }
        } catch (err) {
          // If any error occurs, return the task without relations
          return task
        }
      })
    )

    const completed = tasksWithRelations.filter(task => task.status === 'completed').length
    const pending = tasksWithRelations.filter(task => task.status !== 'completed').length

    return {
      tasks: tasksWithRelations,
      total: count || 0,
      completed,
      pending,
    }
  } catch (error: any) {
    console.error('Error fetching today tasks:', error)
    throw error
  }
}

export const markTaskComplete = async (taskId: string): Promise<void> => {
  const { error } = await supabase
    .from('tasks')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)

  if (error) throw error
}

export const createTask = async (taskData: {
  related_id: string
  type: 'call' | 'email' | 'review'
  title: string
  description?: string
  due_at: string
  priority?: 'low' | 'medium' | 'high'
  assigned_to?: string
}): Promise<Task> => {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      tenant_id: process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || '11111111-1111-1111-1111-111111111111', // Default tenant
      ...taskData,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const fetchAllTasks = async (options?: {
  limit?: number
  offset?: number
  status?: string
  priority?: string
  type?: string
}) => {
  let query = supabase
    .from('tasks')
    .select(`
      *,
      applications:related_id (
        id,
        lead_id,
        leads:lead_id (
          id,
          first_name,
          last_name,
          email
        )
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (options?.status) {
    query = query.eq('status', options.status)
  }
  
  if (options?.priority) {
    query = query.eq('priority', options.priority)
  }
  
  if (options?.type) {
    query = query.eq('type', options.type)
  }
  
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error, count } = await query

  if (error) throw error

  return {
    tasks: data || [],
    total: count || 0,
  }
}

// ==================== LEADS QUERIES ====================

export const fetchLeads = async (options?: {
  limit?: number
  offset?: number
  stage?: string
  search?: string
}) => {
  // First, get the leads
  let query = supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (options?.stage) {
    query = query.eq('stage', options.stage)
  }
  
  if (options?.search) {
    query = query.or(`first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%,email.ilike.%${options.search}%`)
  }
  
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data: leads, error, count } = await query

  if (error) throw error

  // Get counts separately
  const leadsWithCounts = await Promise.all(
    leads?.map(async (lead) => {
      // Get applications count
      const { count: applicationsCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('lead_id', lead.id)

      // Get tasks count
      const { count: tasksCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('related_id', lead.id)

      return {
        ...lead,
        applications_count: applicationsCount || 0,
        tasks_count: tasksCount || 0,
      }
    }) || []
  )

  return {
    leads: leadsWithCounts,
    total: count || 0,
  }
}

export const createLead = async (leadData: {
  first_name: string
  last_name: string
  email: string
  phone?: string
  stage?: string
  source?: string
  notes?: string
}): Promise<Lead> => {
  const { data, error } = await supabase
    .from('leads')
    .insert({
      tenant_id: '11111111-1111-1111-1111-111111111111',
      stage: 'new',
      ...leadData,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateLead = async (leadId: string, updates: Partial<Lead>): Promise<Lead> => {
  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', leadId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const fetchLeadStats = async () => {
  const { data: leads, error } = await supabase
    .from('leads')
    .select('stage')

  if (error) throw error

  const stages = {
    new: 0,
    contacted: 0,
    qualified: 0,
    proposal: 0,
    closed: 0,
  }

  leads?.forEach(lead => {
    const stage = lead.stage as keyof typeof stages
    if (stage in stages) {
      stages[stage]++
    }
  })

  return {
    total: leads?.length || 0,
    ...stages,
  }
}

// ==================== APPLICATIONS QUERIES ====================

export const fetchApplications = async (options?: {
  limit?: number
  offset?: number
  status?: string
  program?: string
}) => {
  let query = supabase
    .from('applications')
    .select(`
      *,
      leads!inner (
        id,
        first_name,
        last_name,
        email,
        phone
      ),
      tasks(count)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (options?.status) {
    query = query.eq('status', options.status)
  }
  
  if (options?.program) {
    query = query.eq('program', options.program)
  }
  
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error, count } = await query

  if (error) throw error

  return {
    applications: data || [],
    total: count || 0,
  }
}

export const createApplication = async (applicationData: {
  lead_id: string
  program: string
  intake: string
  status?: string
}): Promise<Application> => {
  const { data, error } = await supabase
    .from('applications')
    .insert({
      tenant_id: '11111111-1111-1111-1111-111111111111',
      status: 'pending',
      ...applicationData,
    })
    .select(`
      *,
      leads!inner (
        id,
        first_name,
        last_name,
        email,
        phone
      )
    `)
    .single()

  if (error) throw error
  return data
}

export const updateApplication = async (applicationId: string, updates: Partial<Application>): Promise<Application> => {
  const { data, error } = await supabase
    .from('applications')
    .update(updates)
    .eq('id', applicationId)
    .select(`
      *,
      leads!inner (
        id,
        first_name,
        last_name,
        email,
        phone
      )
    `)
    .single()

  if (error) throw error
  return data
}

export const fetchApplicationStats = async () => {
  const { data, error } = await supabase
    .from('applications')
    .select('status, program')

  if (error) throw error

  const statuses = {
    pending: 0,
    under_review: 0,
    documents_pending: 0,
    accepted: 0,
    rejected: 0,
  }

  const programs: Record<string, number> = {}

  data?.forEach(app => {
    // Count by status
    if (statuses[app.status as keyof typeof statuses] !== undefined) {
      statuses[app.status as keyof typeof statuses]++
    }

    // Count by program
    if (app.program) {
      programs[app.program] = (programs[app.program] || 0) + 1
    }
  })

  return {
    total: data?.length || 0,
    byStatus: statuses,
    byProgram: programs,
  }
}

// ==================== ANALYTICS QUERIES ====================

export const fetchDashboardStats = async () => {
  // Fetch counts
  const [
    { count: leadsCount },
    { count: applicationsCount },
    { count: tasksCount },
    { count: tasksTodayCount },
  ] = await Promise.all([
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('*', { count: 'exact', head: true }),
    supabase.from('tasks').select('*', { count: 'exact', head: true }),
    supabase.from('tasks')
      .select('*', { count: 'exact', head: true })
      .gte('due_at', new Date().toISOString().split('T')[0])
      .lt('due_at', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
  ])

  // Fetch conversion rate
  const { data: leadsData } = await supabase
    .from('leads')
    .select('stage')

  const { data: applicationsData } = await supabase
    .from('applications')
    .select('status')

  const qualifiedLeads = leadsData?.filter(lead => lead.stage === 'qualified').length || 0
  const acceptedApplications = applicationsData?.filter(app => app.status === 'accepted').length || 0
  const conversionRate = qualifiedLeads > 0 ? (acceptedApplications / qualifiedLeads) * 100 : 0

  // Fetch recent activity
  const { data: recentTasks } = await supabase
    .from('tasks')
    .select(`
      *,
      applications:related_id (
        leads!inner (
          first_name,
          last_name
        )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch monthly trends
  const currentDate = new Date()
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(currentDate.getMonth() - 6)

  const { data: monthlyData } = await supabase
    .from('leads')
    .select('created_at')
    .gte('created_at', sixMonthsAgo.toISOString())

  const monthlyTrends: Record<string, number> = {}
  monthlyData?.forEach(lead => {
    const month = new Date(lead.created_at).toLocaleString('default', { month: 'short', year: '2-digit' })
    monthlyTrends[month] = (monthlyTrends[month] || 0) + 1
  })

  return {
    leads: leadsCount || 0,
    applications: applicationsCount || 0,
    tasks: tasksCount || 0,
    tasksToday: tasksTodayCount || 0,
    conversionRate: Math.round(conversionRate),
    recentActivity: recentTasks || [],
    monthlyTrends,
  }
}

// Create a demo task (for testing when no tasks exist)
export const createDemoTask = async (): Promise<Task | null> => {
  try {
    // First, check if we have any leads
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id, first_name, last_name')
      .limit(1)

    if (leadsError) {
      console.error('Error fetching leads:', leadsError)
      return null
    }

    let leadId: string
    let leadName = 'Demo Lead'

    if (!leads || leads.length === 0) {
      console.log('No leads found. Creating a lead first...')
      
      // Create a demo lead first
      const demoLead = {
        tenant_id: '11111111-1111-1111-1111-111111111111',
        first_name: 'Demo',
        last_name: 'Lead',
        email: 'demo@example.com',
        phone: '+1234567890',
        stage: 'new',
        source: 'demo',
      }

      const { data: createdLead, error: createLeadError } = await supabase
        .from('leads')
        .insert(demoLead)
        .select()
        .single()

      if (createLeadError) {
        console.error('Error creating demo lead:', createLeadError)
        return null
      }

      leadId = createdLead.id
      leadName = `${createdLead.first_name} ${createdLead.last_name}`
    } else {
      leadId = leads[0].id
      leadName = `${leads[0].first_name} ${leads[0].last_name}`
    }

    // Check if there's an application for this lead
    const { data: existingApps, error: appsError } = await supabase
      .from('applications')
      .select('id')
      .eq('lead_id', leadId)
      .limit(1)

    let applicationId: string

    if (appsError || !existingApps || existingApps.length === 0) {
      // Create a demo application for this lead
      const demoApplication = {
        tenant_id: '11111111-1111-1111-1111-111111111111',
        lead_id: leadId,
        program: 'Computer Science',
        intake: 'Fall 2024',
        status: 'pending',
      }

      const { data: createdApp, error: createAppError } = await supabase
        .from('applications')
        .insert(demoApplication)
        .select()
        .single()

      if (createAppError) {
        console.error('Error creating demo application:', createAppError)
        return null
      }

      applicationId = createdApp.id
    } else {
      applicationId = existingApps[0].id
    }

    // Create the demo task
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(14, 0, 0, 0) // 2 PM tomorrow

    const demoTask = {
      tenant_id: '11111111-1111-1111-1111-111111111111',
      related_id: applicationId,
      type: 'call' as const,
      title: `Follow-up Call with ${leadName}`,
      description: 'This is a demo task created to show the functionality. Please contact to discuss program options.',
      due_at: tomorrow.toISOString(),
      status: 'pending' as const,
      priority: 'medium' as const,
      assigned_to: 'Demo Counselor',
    }

    // First insert the task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert(demoTask)
      .select()
      .single()

    if (taskError) {
      console.error('Error creating demo task:', taskError)
      return null
    }

    // Now fetch the task with related data separately
    const { data: taskWithRelations, error: fetchError } = await supabase
      .from('tasks')
      .select(`
        *,
        applications:related_id (
          id,
          lead_id,
          leads:lead_id (
            id,
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('id', task.id)
      .single()

    if (fetchError) {
      console.error('Error fetching task with relations:', fetchError)
      // Return the basic task if we can't get relations
      return {
        ...task,
        applications: undefined
      } as Task
    }

    console.log('✅ Demo task created successfully:', taskWithRelations)
    return taskWithRelations as Task
  } catch (error) {
    console.error('Unexpected error in createDemoTask:', error)
    return null
  }
}