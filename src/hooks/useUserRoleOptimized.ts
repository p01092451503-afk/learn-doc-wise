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

  const { data: roleData, error } = await supabase
    .from('user_roles')
    .select('role, tenant_id')
    .eq('user_id', user.id);

  if (error) throw error;

  // Check if user has operator role
  const hasOperatorRole = roleData?.some(r => r.role === 'operator');
  const hasAdminWithoutTenant = roleData?.some(r => r.role === 'admin' && !r.tenant_id);
  const isOperator = hasOperatorRole || hasAdminWithoutTenant;

  // Get primary role (priority: operator > admin > teacher > student)
  let primaryRole: UserRoleData['role'] = null;
  let tenantId: string | null = null;

  if (hasOperatorRole) {
    primaryRole = 'operator';
  } else if (roleData?.find(r => r.role === 'admin')) {
    primaryRole = 'admin';
    tenantId = roleData.find(r => r.role === 'admin')?.tenant_id || null;
  } else if (roleData?.find(r => r.role === 'teacher')) {
    primaryRole = 'teacher';
    tenantId = roleData.find(r => r.role === 'teacher')?.tenant_id || null;
  } else if (roleData?.find(r => r.role === 'student')) {
    primaryRole = 'student';
    tenantId = roleData.find(r => r.role === 'student')?.tenant_id || null;
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
