import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { resolveTenant, applyTenantBranding, Tenant } from "@/lib/tenant-resolver";
import { AtomSpinner } from "@/components/AtomSpinner";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface TenantContextType {
  tenant: Tenant | null;
  loading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeTenant = async () => {
      try {
        const resolvedTenant = await resolveTenant();
        
        if (resolvedTenant) {
          setTenant(resolvedTenant);
          applyTenantBranding(resolvedTenant);
        } else {
          // 테넌트를 찾을 수 없는 경우 - public 페이지는 계속 진행
          const currentPath = window.location.pathname;
          const isPublicRoute = 
            currentPath === "/" ||
            currentPath === "/landing" ||
            currentPath === "/auth" ||
            currentPath === "/features" ||
            currentPath === "/pricing" ||
            currentPath === "/main" ||
            currentPath.startsWith("/courses") ||
            currentPath.startsWith("/admin") ||
            currentPath.startsWith("/teacher") ||
            currentPath.startsWith("/student") ||
            currentPath.startsWith("/operator");
          
          if (!isPublicRoute && currentPath.startsWith("/tenant/")) {
            setError("테넌트를 찾을 수 없습니다");
          }
        }
      } catch (err) {
        console.error("Error initializing tenant:", err);
        setError("테넌트 정보를 불러오는 중 오류가 발생했습니다");
      } finally {
        setLoading(false);
      }
    };

    initializeTenant();
  }, []);

  // 로딩 중
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AtomSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">플랫폼을 준비하고 있습니다...</p>
        </div>
      </div>
    );
  }

  // 테넌트 에러 (tenant 경로에서만)
  if (error && window.location.pathname.startsWith("/tenant/")) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>기관을 찾을 수 없습니다</CardTitle>
            <CardDescription>
              요청하신 교육기관이 존재하지 않거나 비활성화되었습니다.
              <br />
              도메인 또는 URL을 확인해주세요.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <TenantContext.Provider value={{ tenant, loading, error }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
};
