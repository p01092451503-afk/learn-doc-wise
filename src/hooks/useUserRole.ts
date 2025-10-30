import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserRoleData {
  role: 'student' | 'teacher' | 'admin' | 'operator' | null;
  tenantId: string | null;
  isOperator: boolean;
  loading: boolean;
}

export const useUserRole = () => {
  const [data, setData] = useState<UserRoleData>({
    role: null,
    tenantId: null,
    isOperator: false,
    loading: true,
  });

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setData({ role: null, tenantId: null, isOperator: false, loading: false });
          return;
        }

        const { data: roleData, error } = await supabase
          .from('user_roles')
          .select('role, tenant_id')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        const isOperator = roleData?.role === 'operator' || 
                          (roleData?.role === 'admin' && !roleData?.tenant_id);

        setData({
          role: roleData?.role as UserRoleData['role'],
          tenantId: roleData?.tenant_id || null,
          isOperator,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching user role:', error);
        setData({ role: null, tenantId: null, isOperator: false, loading: false });
      }
    };

    fetchUserRole();
  }, []);

  return data;
};
