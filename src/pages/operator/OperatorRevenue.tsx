import { useState, useEffect } from "react";
import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, TrendingUp, CreditCard, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import logoIcon from "@/assets/logo-icon.png";

interface RevenueData {
  tenant_id: string;
  tenant_name: string;
  plan: string;
  monthly_amount: number;
  total_paid: number;
  last_payment: string | null;
  status: string;
}

const OperatorRevenue = () => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("operator-theme");
    return (saved as "dark" | "light") || "dark";
  });
  const { toast } = useToast();

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("operator-theme");
      setTheme((saved as "dark" | "light") || "dark");
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(() => {
      const saved = localStorage.getItem("operator-theme");
      if (saved !== theme) {
        setTheme((saved as "dark" | "light") || "dark");
      }
    }, 100);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [theme]);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      const { data: tenants, error: tenantsError } = await supabase
        .from("tenants")
        .select("*")
        .eq("is_active", true);

      if (tenantsError) throw tenantsError;

      const { data: transactions, error: transactionsError } = await supabase
        .from("payment_transactions")
        .select("*")
        .eq("status", "approved");

      if (transactionsError) throw transactionsError;

      const planPrices: Record<string, number> = {
        starter: 0,
        standard: 150000,
        professional: 300000,
      };

      const revenue: RevenueData[] = (tenants || []).map((tenant) => {
        const tenantTransactions = transactions?.filter((t) => t.tenant_id === tenant.id) || [];
        const totalPaid = tenantTransactions.reduce((sum, t) => sum + t.amount, 0);
        const lastPayment = tenantTransactions.length > 0
          ? tenantTransactions.sort((a, b) => new Date(b.approved_at!).getTime() - new Date(a.approved_at!).getTime())[0].approved_at
          : null;

        return {
          tenant_id: tenant.id,
          tenant_name: tenant.name,
          plan: tenant.plan,
          monthly_amount: planPrices[tenant.plan as keyof typeof planPrices] || 0,
          total_paid: totalPaid,
          last_payment: lastPayment,
          status: tenant.billing_status || "pending",
        };
      });

      setRevenueData(revenue);
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "매출 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalMonthlyRevenue = revenueData.reduce((sum, r) => sum + r.monthly_amount, 0);
  const totalRevenue = revenueData.reduce((sum, r) => sum + r.total_paid, 0);
  const avgRevenuePerTenant = revenueData.length > 0 ? totalMonthlyRevenue / revenueData.length : 0;

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case "starter":
        return "bg-blue-500/10 text-blue-400 border-blue-500/50";
      case "standard":
        return "bg-violet-500/10 text-violet-400 border-violet-500/50";
      case "professional":
        return "bg-purple-500/10 text-purple-400 border-purple-500/50";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/50";
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case "starter":
        return "스타터";
      case "standard":
        return "스탠다드";
      case "professional":
        return "프로페셔널";
      default:
        return plan;
    }
  };

  return (
    <OperatorLayout>
      <div className="space-y-6">
        <div>
          <h1 className={cn(
            "text-3xl font-bold mb-2 transition-colors flex items-center gap-2",
            theme === "dark" ? "text-white" : "text-slate-900"
          )}>
            <img src={logoIcon} alt="atom" className="h-8 w-8" />
            매출 관리
          </h1>
          <p className={cn(
            "transition-colors",
            theme === "dark" ? "text-slate-400" : "text-slate-600"
          )}>전체 고객사의 매출 현황을 확인합니다</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className={cn(
            "transition-colors",
            theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/50 border-slate-300"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={cn(
                "text-sm font-medium transition-colors",
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              )}>월 구독 수익</CardTitle>
              <DollarSign className="h-4 w-4 text-violet-400" />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}>
                ₩{(totalMonthlyRevenue / 1000000).toFixed(2)}M
              </div>
              <p className="text-xs text-slate-500 mt-1">활성 구독</p>
            </CardContent>
          </Card>

          <Card className={cn(
            "transition-colors",
            theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/50 border-slate-300"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={cn(
                "text-sm font-medium transition-colors",
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              )}>총 수익</CardTitle>
              <TrendingUp className="h-4 w-4 text-violet-400" />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}>
                ₩{(totalRevenue / 1000000).toFixed(2)}M
              </div>
              <p className="text-xs text-slate-500 mt-1">누적</p>
            </CardContent>
          </Card>

          <Card className={cn(
            "transition-colors",
            theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/50 border-slate-300"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={cn(
                "text-sm font-medium transition-colors",
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              )}>평균 ARPU</CardTitle>
              <CreditCard className="h-4 w-4 text-violet-400" />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}>
                ₩{avgRevenuePerTenant.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">고객사당</p>
            </CardContent>
          </Card>

          <Card className={cn(
            "transition-colors",
            theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/50 border-slate-300"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={cn(
                "text-sm font-medium transition-colors",
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              )}>활성 고객사</CardTitle>
              <Calendar className="h-4 w-4 text-violet-400" />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}>{revenueData.length}</div>
              <p className="text-xs text-slate-500 mt-1">구독 중</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Table */}
        <Card className={cn(
          "transition-colors",
          theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/50 border-slate-300"
        )}>
          <CardHeader>
            <CardTitle className={cn(
              "transition-colors",
              theme === "dark" ? "text-white" : "text-slate-900"
            )}>고객사별 매출</CardTitle>
            <CardDescription className={cn(
              "transition-colors",
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            )}>구독 플랜 및 결제 현황</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className={cn(
                "text-center py-8 transition-colors",
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              )}>로딩 중...</div>
            ) : revenueData.length === 0 ? (
              <div className={cn(
                "text-center py-8 transition-colors",
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              )}>매출 데이터가 없습니다.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className={cn(
                    "transition-colors",
                    theme === "dark" ? "border-slate-800" : "border-slate-200"
                  )}>
                    <TableHead className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    )}>고객사</TableHead>
                    <TableHead className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    )}>플랜</TableHead>
                    <TableHead className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    )}>월 금액</TableHead>
                    <TableHead className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    )}>총 결제액</TableHead>
                    <TableHead className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    )}>최근 결제</TableHead>
                    <TableHead className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    )}>상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenueData.map((revenue) => (
                    <TableRow key={revenue.tenant_id} className={cn(
                      "transition-colors",
                      theme === "dark" ? "border-slate-800" : "border-slate-200"
                    )}>
                      <TableCell className={cn(
                        "font-medium transition-colors",
                        theme === "dark" ? "text-white" : "text-slate-900"
                      )}>{revenue.tenant_name}</TableCell>
                      <TableCell>
                        <Badge className={getPlanBadgeColor(revenue.plan)}>
                          {getPlanLabel(revenue.plan)}
                        </Badge>
                      </TableCell>
                      <TableCell className={cn(
                        "transition-colors",
                        theme === "dark" ? "text-slate-400" : "text-slate-600"
                      )}>
                        ₩{revenue.monthly_amount.toLocaleString()}
                      </TableCell>
                      <TableCell className={cn(
                        "transition-colors",
                        theme === "dark" ? "text-slate-400" : "text-slate-600"
                      )}>
                        ₩{revenue.total_paid.toLocaleString()}
                      </TableCell>
                      <TableCell className={cn(
                        "transition-colors",
                        theme === "dark" ? "text-slate-400" : "text-slate-600"
                      )}>
                        {revenue.last_payment
                          ? new Date(revenue.last_payment).toLocaleDateString("ko-KR")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            revenue.status === "active"
                              ? "bg-green-500/10 text-green-400 border-green-500/50"
                              : "bg-yellow-500/10 text-yellow-400 border-yellow-500/50"
                          }
                        >
                          {revenue.status === "active" ? "정상" : "대기"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </OperatorLayout>
  );
};

export default OperatorRevenue;
