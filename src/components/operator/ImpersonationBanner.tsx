import { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export const ImpersonationBanner = () => {
  const [session, setSession] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = () => {
      const storedSession = localStorage.getItem("impersonation_session");
      if (storedSession) {
        const sessionData = JSON.parse(storedSession);
        setSession(sessionData);
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleEndImpersonation = async () => {
    if (!session) return;

    try {
      const { error } = await supabase.functions.invoke("end-impersonation", {
        body: {
          session_id: session.session_id,
        },
      });

      if (error) throw error;

      localStorage.removeItem("impersonation_session");
      setSession(null);

      toast({
        title: "대리 로그인 세션 종료",
        description: "운영자 콘솔로 돌아갑니다.",
      });

      setTimeout(() => {
        window.location.href = "/operator/tenants";
      }, 1000);
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "대리 로그인 세션 종료에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  if (!session) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <div>
              <div className="font-semibold text-sm">
                대리 로그인 모드 활성화 - {session.tenant_name}
              </div>
              <div className="text-xs opacity-90">
                시작 시간: {new Date(session.started_at).toLocaleString("ko-KR")}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEndImpersonation}
            className={cn(
              "gap-2 text-white hover:bg-white/20 transition-colors"
            )}
          >
            <X className="h-4 w-4" />
            세션 종료
          </Button>
        </div>
      </div>
    </div>
  );
};
