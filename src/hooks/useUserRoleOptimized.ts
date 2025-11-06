import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserRoleData {
  role: 'student' | 'teacher' | 'admin' | 'operator' | null;
  tenantId: string | null;
  isOperator: boolean;
}

const fetchUserRole = async (): Promise<UserRoleData> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { role: null, tenantId: null, isOperator: false };
  }

  // Check memberships table first (new multi-tenant system)
  const { data: memberships, error: membershipsError } = await supabase
    .from('memberships')
    .select('role, tenant_id, is_active')
    .eq('user_id', user.id)
    .eq('is_active', true);

  if (membershipsError) throw membershipsError;

  // Check if user is platform operator (tenant_id is NULL and role is 'operator')
  const isPlatformOperator = memberships?.some(
    m => m.role === 'operator' && m.tenant_id === null
  ) || false;

  // Fallback to user_roles for backward compatibility
  let userRoles: any[] = [];
  if (!memberships || memberships.length === 0) {
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role, tenant_id')
      .eq('user_id', user.id);

    if (roleError) throw roleError;
    userRoles = roleData || [];
  }

  const allRoles = [...(memberships || []), ...userRoles];

  // Check if user has operator role (from either table)
  const hasOperatorRole = allRoles.some(r => r.role === 'operator');
  const hasAdminWithoutTenant = allRoles.some(r => r.role === 'admin' && !r.tenant_id);
  const isOperator = isPlatformOperator || hasOperatorRole || hasAdminWithoutTenant;

  // Get primary role (priority: operator > admin > instructor/teacher > student)
  let primaryRole: UserRoleData['role'] = null;
  let tenantId: string | null = null;

  if (isOperator) {
    primaryRole = 'operator';
  } else if (allRoles.find(r => r.role === 'admin')) {
    primaryRole = 'admin';
    tenantId = allRoles.find(r => r.role === 'admin')?.tenant_id || null;
  } else if (allRoles.find(r => r.role === 'instructor' || r.role === 'teacher')) {
    primaryRole = 'teacher';
    tenantId = allRoles.find(r => r.role === 'instructor' || r.role === 'teacher')?.tenant_id || null;
  } else if (allRoles.find(r => r.role === 'student')) {
    primaryRole = 'student';
    tenantId = allRoles.find(r => r.role === 'student')?.tenant_id || null;
  }

  return {
    role: primaryRole,
    tenantId,
    isOperator,
  };
};

export const useUserRoleOptimized = () => {
  return useQuery({
    queryKey: ['userRole'],
    queryFn: fetchUserRole,
    staleTime: 10 * 60 * 1000, // 10 minutes - role changes are rare
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
};
