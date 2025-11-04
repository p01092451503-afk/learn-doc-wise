import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EncouragementRule {
  id: string
  rule_name: string
  trigger_type: string
  days_threshold: number
  progress_threshold: number | null
  message_template: string
  target_role: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Starting auto-encouragement process...')

    // 활성화된 독려 규칙 가져오기
    const { data: rules, error: rulesError } = await supabase
      .from('auto_encouragement_rules')
      .select('*')
      .eq('is_active', true)

    if (rulesError) throw rulesError

    console.log(`Found ${rules?.length || 0} active rules`)

    for (const rule of rules || []) {
      await processRule(supabase, rule)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Auto-encouragement process completed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in auto-encouragement:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

async function processRule(supabase: any, rule: EncouragementRule) {
  console.log(`Processing rule: ${rule.rule_name}`)

  try {
    let targetUsers: any[] = []

    switch (rule.trigger_type) {
      case 'no_activity':
        targetUsers = await findInactiveUsers(supabase, rule.days_threshold)
        break
      case 'low_progress':
        targetUsers = await findLowProgressUsers(supabase, rule.progress_threshold || 20, rule.days_threshold)
        break
      case 'missed_deadline':
        targetUsers = await findMissedDeadlineUsers(supabase, rule.days_threshold)
        break
      case 'streak_broken':
        targetUsers = await findBrokenStreakUsers(supabase, rule.days_threshold)
        break
    }

    console.log(`Found ${targetUsers.length} users for rule: ${rule.rule_name}`)

    // 각 사용자에게 알림 전송
    for (const user of targetUsers) {
      await sendEncouragementNotification(supabase, user, rule)
    }
  } catch (error) {
    console.error(`Error processing rule ${rule.rule_name}:`, error)
  }
}

async function findInactiveUsers(supabase: any, daysThreshold: number) {
  const thresholdDate = new Date()
  thresholdDate.setDate(thresholdDate.getDate() - daysThreshold)

  const { data, error } = await supabase
    .from('content_progress')
    .select('user_id, last_accessed_at')
    .lt('last_accessed_at', thresholdDate.toISOString())
    .order('last_accessed_at', { ascending: true })

  if (error) {
    console.error('Error finding inactive users:', error)
    return []
  }

  // 중복 제거
  const uniqueUsers = Array.from(new Set(data?.map((d: any) => d.user_id) || []))
  return uniqueUsers.map(user_id => ({ user_id }))
}

async function findLowProgressUsers(supabase: any, progressThreshold: number, daysThreshold: number) {
  const thresholdDate = new Date()
  thresholdDate.setDate(thresholdDate.getDate() - daysThreshold)

  const { data, error } = await supabase
    .from('enrollments')
    .select('user_id, progress, enrolled_at')
    .lt('progress', progressThreshold)
    .lt('enrolled_at', thresholdDate.toISOString())

  if (error) {
    console.error('Error finding low progress users:', error)
    return []
  }

  return data || []
}

async function findMissedDeadlineUsers(supabase: any, daysThreshold: number) {
  const thresholdDate = new Date()
  thresholdDate.setDate(thresholdDate.getDate() - daysThreshold)

  const { data, error } = await supabase
    .from('assignment_submissions')
    .select(`
      student_id,
      assignments!inner(due_date)
    `)
    .eq('status', 'submitted')
    .gt('submitted_at', supabase.rpc('assignments.due_date'))

  if (error) {
    console.error('Error finding missed deadline users:', error)
    return []
  }

  return (data || []).map((d: any) => ({ user_id: d.student_id }))
}

async function findBrokenStreakUsers(supabase: any, daysThreshold: number) {
  const { data, error } = await supabase
    .from('user_gamification')
    .select('user_id, streak_days, last_activity_date')
    .gt('streak_days', 0)
    .lt('last_activity_date', new Date().toISOString())

  if (error) {
    console.error('Error finding broken streak users:', error)
    return []
  }

  return data || []
}

async function sendEncouragementNotification(supabase: any, user: any, rule: EncouragementRule) {
  try {
    // 최근 24시간 내 같은 규칙으로 발송한 이력 확인
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const { data: recentLog } = await supabase
      .from('encouragement_logs')
      .select('id')
      .eq('user_id', user.user_id)
      .eq('rule_id', rule.id)
      .gt('sent_at', oneDayAgo.toISOString())
      .limit(1)

    if (recentLog && recentLog.length > 0) {
      console.log(`Skipping duplicate notification for user ${user.user_id}`)
      return
    }

    // 사용자의 tenant_id 가져오기
    const { data: userData } = await supabase
      .from('user_roles')
      .select('tenant_id')
      .eq('user_id', user.user_id)
      .limit(1)
      .single()

    // 알림 생성
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: user.user_id,
        tenant_id: userData?.tenant_id,
        title: '학습 독려',
        message: rule.message_template,
        type: 'encouragement',
        priority: 'normal',
      })
      .select()
      .single()

    if (notificationError) throw notificationError

    // 발송 이력 기록
    await supabase
      .from('encouragement_logs')
      .insert({
        user_id: user.user_id,
        rule_id: rule.id,
        notification_id: notification.id,
        trigger_reason: rule.trigger_type,
      })

    console.log(`Sent encouragement notification to user ${user.user_id}`)
  } catch (error) {
    console.error(`Error sending notification to user ${user.user_id}:`, error)
  }
}
