import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'student' | 'teacher' | 'admin' | 'operator';

interface UserRolesData {
  roles: UserRole[];
  primaryRole: UserRole | null;
  tenantId: string | null;
  isOperator: boolean;
  loading: boolean;
}

export const useUserRoles = () => {
  const [data, setData] = useState<UserRolesData>({
    roles: [],
    primaryRole: null,
    tenantId: null,
    isOperator: false,
    loading: true,
  });

  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setData({ roles: [], primaryRole: null, tenantId: null, isOperator: false, loading: false });
          return;
        }

        const { data: roleData, error } = await supabase
          .from('user_roles')
          .select('role, tenant_id')
          .eq('user_id', user.id);

        if (error) throw error;

        // Get all unique roles
        const allRoles = Array.from(new Set(roleData?.map(r => r.role as UserRole) || []));

        // Check if user has operator role
        const hasOperatorRole = roleData?.some(r => r.role === 'operator');
        const hasAdminWithoutTenant = roleData?.some(r => r.role === 'admin' && !r.tenant_id);
        const isOperator = hasOperatorRole || hasAdminWithoutTenant;

        // Get primary role (priority: operator > admin > teacher > student)
        let primaryRole: UserRole | null = null;
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

        setData({
          roles: allRoles,
          primaryRole,
          tenantId,
          isOperator,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setData({ roles: [], primaryRole: null, tenantId: null, isOperator: false, loading: false });
      }
    };

    fetchUserRoles();
  }, []);

  return data;
};
