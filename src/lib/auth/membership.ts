/**
 * Membership & Role Management
 * 
 * Handles tenant-scoped user roles and permissions
 */

import { supabase } from "@/integrations/supabase/client";

export type MembershipRole = 'student' | 'instructor' | 'admin' | 'operator';

export interface Membership {
  id: string;
  tenant_id: string;
  user_id: string;
  role: MembershipRole;
  is_active: boolean;
  joined_at: string;
  metadata?: any;
}

/**
 * Get user's memberships (all tenants they belong to)
 */
export async function getUserMemberships(userId: string): Promise<Membership[]> {
  try {
    const { data, error } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user memberships:', error);
    return [];
  }
}

/**
 * Get user's role in a specific tenant
 */
export async function getUserRoleInTenant(
  userId: string,
  tenantId: string
): Promise<MembershipRole | null> {
  try {
    const { data, error } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data?.role || null;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
}

/**
 * Check if user has specific role in tenant
 */
export async function hasRole(
  userId: string,
  tenantId: string,
  role: MembershipRole
): Promise<boolean> {
  const userRole = await getUserRoleInTenant(userId, tenantId);
  return userRole === role;
}

/**
 * Check if user is operator (platform-wide role)
 */
export async function isOperator(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'operator')
      .eq('is_active', true)
      .limit(1);

    if (error) throw error;
    return (data?.length || 0) > 0;
  } catch (error) {
    console.error('Error checking operator status:', error);
    return false;
  }
}

/**
 * Check if user has admin privileges in tenant
 */
export async function isTenantAdmin(userId: string, tenantId: string): Promise<boolean> {
  return hasRole(userId, tenantId, 'admin');
}

/**
 * Check if user has instructor privileges in tenant
 */
export async function isTenantInstructor(userId: string, tenantId: string): Promise<boolean> {
  const role = await getUserRoleInTenant(userId, tenantId);
  return role === 'instructor' || role === 'admin';
}

/**
 * Add user to tenant with role
 */
export async function addMembership(
  tenantId: string,
  userId: string,
  role: MembershipRole,
  invitedBy?: string
): Promise<Membership | null> {
  try {
    const { data, error } = await supabase
      .from('memberships')
      .insert({
        tenant_id: tenantId,
        user_id: userId,
        role,
        invited_by: invitedBy,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding membership:', error);
    return null;
  }
}

/**
 * Update user's role in tenant
 */
export async function updateMembershipRole(
  membershipId: string,
  newRole: MembershipRole
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('memberships')
      .update({ role: newRole })
      .eq('id', membershipId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating membership role:', error);
    return false;
  }
}

/**
 * Deactivate membership (soft delete)
 */
export async function deactivateMembership(membershipId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('memberships')
      .update({ is_active: false })
      .eq('id', membershipId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deactivating membership:', error);
    return false;
  }
}

/**
 * Get all members of a tenant
 */
export async function getTenantMembers(tenantId: string): Promise<Membership[]> {
  try {
    const { data, error } = await supabase
      .from('memberships')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('joined_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching tenant members:', error);
    return [];
  }
}
