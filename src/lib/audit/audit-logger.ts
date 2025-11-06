/**
 * Audit Logger
 * 
 * Logs all important actions for security and compliance
 */

import { supabase } from "@/integrations/supabase/client";

export interface AuditLogEntry {
  tenant_id?: string;
  actor_user_id: string;
  impersonated_by?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Log an audit entry
 */
export async function logAudit(entry: AuditLogEntry): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('audit_logs_v2')
      .insert({
        tenant_id: entry.tenant_id,
        actor_user_id: entry.actor_user_id,
        impersonated_by: entry.impersonated_by,
        action: entry.action,
        entity_type: entry.entity_type,
        entity_id: entry.entity_id,
        changes: entry.changes,
        metadata: entry.metadata || {},
        ip_address: entry.ip_address,
        user_agent: entry.user_agent || navigator.userAgent,
      });

    if (error) {
      console.error('Failed to log audit entry:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error logging audit:', error);
    return false;
  }
}

/**
 * Log user login
 */
export function logLogin(userId: string, tenantId?: string): Promise<boolean> {
  return logAudit({
    tenant_id: tenantId,
    actor_user_id: userId,
    action: 'user.login',
    entity_type: 'user',
    entity_id: userId,
  });
}

/**
 * Log user logout
 */
export function logLogout(userId: string, tenantId?: string): Promise<boolean> {
  return logAudit({
    tenant_id: tenantId,
    actor_user_id: userId,
    action: 'user.logout',
    entity_type: 'user',
    entity_id: userId,
  });
}

/**
 * Log resource creation
 */
export function logCreate(
  userId: string,
  tenantId: string,
  entityType: string,
  entityId: string,
  data: Record<string, any>
): Promise<boolean> {
  return logAudit({
    tenant_id: tenantId,
    actor_user_id: userId,
    action: `${entityType}.create`,
    entity_type: entityType,
    entity_id: entityId,
    changes: { created: data },
  });
}

/**
 * Log resource update
 */
export function logUpdate(
  userId: string,
  tenantId: string,
  entityType: string,
  entityId: string,
  before: Record<string, any>,
  after: Record<string, any>
): Promise<boolean> {
  return logAudit({
    tenant_id: tenantId,
    actor_user_id: userId,
    action: `${entityType}.update`,
    entity_type: entityType,
    entity_id: entityId,
    changes: { before, after },
  });
}

/**
 * Log resource deletion
 */
export function logDelete(
  userId: string,
  tenantId: string,
  entityType: string,
  entityId: string,
  data: Record<string, any>
): Promise<boolean> {
  return logAudit({
    tenant_id: tenantId,
    actor_user_id: userId,
    action: `${entityType}.delete`,
    entity_type: entityType,
    entity_id: entityId,
    changes: { deleted: data },
  });
}

/**
 * Log operator impersonation
 */
export function logImpersonation(
  operatorId: string,
  targetUserId: string,
  tenantId: string
): Promise<boolean> {
  return logAudit({
    tenant_id: tenantId,
    actor_user_id: targetUserId,
    impersonated_by: operatorId,
    action: 'operator.impersonate',
    entity_type: 'user',
    entity_id: targetUserId,
    metadata: { operator_id: operatorId },
  });
}

/**
 * Get audit logs for a tenant
 */
export async function getTenantAuditLogs(
  tenantId: string,
  limit: number = 100,
  offset: number = 0
) {
  try {
    const { data, error } = await supabase
      .from('audit_logs_v2')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
}
