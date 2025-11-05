import { createContext, useContext, ReactNode } from 'react';
import { useUserRoleOptimized } from '@/hooks/useUserRoleOptimized';
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

export const UserProvider = ({ children }: { children: ReactNode }) => {
  // Fetch user once and cache
  const { data: user, isLoading: userLoading, refetch: refetchUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
  });

  // Fetch role with optimized hook
  const { data: roleData, isLoading: roleLoading, refetch: refetchRole } = useUserRoleOptimized();

  const refetch = () => {
    refetchUser();
    refetchRole();
  };

  return (
    <UserContext.Provider
      value={{
        user: user || null,
        role: roleData?.role || null,
        tenantId: roleData?.tenantId || null,
        isOperator: roleData?.isOperator || false,
        loading: userLoading || roleLoading,
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
