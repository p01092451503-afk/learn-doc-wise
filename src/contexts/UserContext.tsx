import { createContext, useContext, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface UserContextType {
  user: User | null;
  role: 'student' | 'teacher' | 'admin' | 'operator' | null;
  tenantId: string | null;
  isOperator: boolean;
  loading: boolean;
  refetch: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Optimized: Fetch user + role in ONE query to eliminate duplicate auth.getUser() calls
const fetchUserAndRole = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { user: null, role: null, tenantId: null, isOperator: false };
  }

  // Fetch memberships in parallel with minimal data
  const { data: memberships } = await supabase
    .from('memberships')
    .select('role, tenant_id')
    .eq('user_id', user.id)
    .eq('is_active', true);

  const isPlatformOperator = memberships?.some(
    m => m.role === 'operator' && m.tenant_id === null
  ) || false;

  // Only fallback to user_roles if no memberships
  let allRoles: any[] = memberships || [];
  if (!memberships || memberships.length === 0) {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role, tenant_id')
      .eq('user_id', user.id);
    allRoles = roleData || [];
  }

  const hasOperatorRole = allRoles.some(r => r.role === 'operator');
  const hasAdminWithoutTenant = allRoles.some(r => r.role === 'admin' && !r.tenant_id);
  const isOperator = isPlatformOperator || hasOperatorRole || hasAdminWithoutTenant;

  let primaryRole: 'student' | 'teacher' | 'admin' | 'operator' | null = null;
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

  return { user, role: primaryRole, tenantId, isOperator };
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  // Single query for user + role data
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['userWithRole'],
    queryFn: fetchUserAndRole,
    staleTime: 30 * 60 * 1000, // 30 minutes - aggressive caching
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
  });

  return (
    <UserContext.Provider
      value={{
        user: data?.user || null,
        role: data?.role || null,
        tenantId: data?.tenantId || null,
        isOperator: data?.isOperator || false,
        loading: isLoading,
        refetch,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
