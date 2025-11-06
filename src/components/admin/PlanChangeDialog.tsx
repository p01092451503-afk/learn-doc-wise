import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, TrendingUp, TrendingDown, Package, Users, HardDrive, Zap } from "lucide-react";
import { AtomLoader } from "@/components/AtomLoader";

interface PlanConfig {
  name: string;
  displayName: string;
  price: number;
  students: number;
  storage: number;
  aiTokens: number;
  features: string[];
}

const PLANS: Record<string, PlanConfig> = {
  starter: {
    name: "starter",
    displayName: "스타터",
    price: 100000,
    students: 50,
    storage: 10,
    aiTokens: 10000,
    features: ["기본 강의 관리", "학생 관리", "기본 통계", "이메일 지원"],
  },
  standard: {
    name: "standard",
    displayName: "스탠다드",
    price: 300000,
    students: 200,
    storage: 50,
    aiTokens: 50000,
    features: ["전체 강의 관리", "고급 분석", "AI 기능", "우선 지원", "맞춤형 브랜딩"],
  },
  professional: {
    name: "professional",
    displayName: "프로페셔널",
    price: 500000,
    students: 500,
    storage: 100,
    aiTokens: 100000,
    features: ["무제한 강의", "고급 AI 기능", "전담 지원", "API 액세스", "커스텀 개발"],
  },
  enterprise: {
    name: "enterprise",
    displayName: "엔터프라이즈",
    price: 1000000,
    students: 99999,
    storage: 500,
    aiTokens: 500000,
    features: ["모든 기능", "무제한 사용자", "24/7 지원", "온프레미스 옵션", "SLA 보장"],
  },
};

interface PlanChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: string;
  tenantId: string;
  onPlanChanged: () => void;
}

const PlanChangeDialog = ({
  open,
  onOpenChange,
  currentPlan,
  tenantId,
  onPlanChanged,
}: PlanChangeDialogProps) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePlanChange = async () => {
    if (!selectedPlan) return;

    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke("setup-tenant-plan", {
        body: {
          tenantId,
          plan: selectedPlan,
        },
      });

      if (error) throw error;

      toast({
        title: "플랜 변경 완료",
        description: `${PLANS[selectedPlan].displayName} 플랜으로 변경되었습니다.`,
      });

      onPlanChanged();
      onOpenChange(false);
      setSelectedPlan(null);
    } catch (error: any) {
      console.error("Error changing plan:", error);
      toast({
        title: "플랜 변경 실패",
        description: error.message || "플랜 변경 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlanChangeType = (newPlan: string) => {
    const planOrder = ["starter", "standard", "professional", "enterprise"];
    const currentIndex = planOrder.indexOf(currentPlan);
    const newIndex = planOrder.indexOf(newPlan);
    
    if (newIndex > currentIndex) return "upgrade";
    if (newIndex < currentIndex) return "downgrade";
    return "same";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            플랜 변경
          </DialogTitle>
          <DialogDescription>
            현재 플랜: <Badge>{PLANS[currentPlan]?.displayName}</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2 py-4">
          {Object.entries(PLANS).map(([key, plan]) => {
            const changeType = getPlanChangeType(key);
            const isCurrent = key === currentPlan;
            const isSelected = selectedPlan === key;

            return (
              <Card
                key={key}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isSelected ? "ring-2 ring-primary" : ""
                } ${isCurrent ? "border-primary" : ""}`}
                onClick={() => !isCurrent && setSelectedPlan(key)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {plan.displayName}
                        {isCurrent && <Badge variant="secondary">현재</Badge>}
                        {changeType === "upgrade" && !isCurrent && (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        )}
                        {changeType === "downgrade" && !isCurrent && (
                          <TrendingDown className="h-4 w-4 text-orange-500" />
                        )}
                      </CardTitle>
                      <CardDescription className="text-2xl font-bold mt-2">
                        ₩{plan.price.toLocaleString()}/월
                      </CardDescription>
                    </div>
                    {isSelected && (
                      <div className="bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>최대 {plan.students}명 학생</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                      <span>{plan.storage}GB 저장공간</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <span>{plan.aiTokens.toLocaleString()} AI 토큰</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm font-semibold mb-2">포함 기능:</p>
                    <ul className="space-y-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="text-sm flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            취소
          </Button>
          <Button
            onClick={handlePlanChange}
            disabled={!selectedPlan || selectedPlan === currentPlan || loading}
          >
            {loading ? (
              <>
                <AtomLoader />
                처리 중...
              </>
            ) : (
              "플랜 변경"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlanChangeDialog;
