import { useState, useEffect } from "react";
import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Building2, Plus, Search, Filter, CreditCard, X, Settings, CheckCircle2, AlertCircle } from "lucide-react";
import TossPaymentDialog from "@/components/admin/TossPaymentDialog";
import { EmptyState } from "@/components/operator/EmptyState";
import { cn } from "@/lib/utils";

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  custom_domain?: string;
  plan: string;
  status: "active" | "suspended" | "terminated" | "trial";
  is_active: boolean;
  max_students: number;
  max_storage_gb: number;
  max_bandwidth_gb: number;
  features_enabled: {
    ai: boolean;
    analytics: boolean;
    community: boolean;
    gamification: boolean;
    certificates: boolean;
  };
  contract_end_date?: string;
  trial_end_date?: string;
  suspended_reason?: string;
  created_at: string;
}

interface UsageMetrics {
  student_count: number;
  storage_used_gb: number;
  bandwidth_gb: number;
  ai_tokens_used: number;
}

const OperatorTenants = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [specDialogOpen, setSpecDialogOpen] = useState(false);
  const [planChangeDialogOpen, setPlanChangeDialogOpen] = useState(false);
  const [newPlan, setNewPlan] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [planFilter, setPlanFilter] = useState<"all" | "starter" | "standard" | "professional">("all");
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("operator-theme");
    return (saved as "dark" | "light") || "dark";
  });
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
    custom_domain: "",
    plan: "starter",
    status: "trial" as "active" | "suspended" | "terminated" | "trial",
    max_students: 50,
    max_storage_gb: 10,
    max_bandwidth_gb: 100,
    contract_end_date: "",
    trial_end_date: "",
    features_enabled: {
      ai: true,
      analytics: true,
      community: true,
      gamification: true,
      certificates: true,
    },
  });

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
    fetchTenants();
  }, []);

  useEffect(() => {
    filterTenants();
  }, [tenants, searchQuery, statusFilter, planFilter]);

  const filterTenants = () => {
    let filtered = [...tenants];

    if (searchQuery) {
      filtered = filtered.filter(
        (tenant) =>
          tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tenant.subdomain.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((tenant) =>
        statusFilter === "active" ? tenant.is_active : !tenant.is_active
      );
    }

    if (planFilter !== "all") {
      filtered = filtered.filter((tenant) => tenant.plan === planFilter);
    }

    setFilteredTenants(filtered);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPlanFilter("all");
  };

  const fetchTenants = async () => {
    try {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Type conversion for features_enabled
      const typedData = (data || []).map(tenant => ({
        ...tenant,
        features_enabled: typeof tenant.features_enabled === 'object' && tenant.features_enabled !== null
          ? tenant.features_enabled as any
          : {
              ai: true,
              analytics: true,
              community: true,
              gamification: true,
              certificates: true,
            }
      })) as Tenant[];
      
      setTenants(typedData);
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "고객사 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: newTenant, error } = await supabase.from("tenants").insert([
        {
          name: formData.name,
          subdomain: formData.subdomain,
          custom_domain: formData.custom_domain || null,
          plan: formData.plan as "starter" | "standard" | "professional",
          status: formData.status,
          contract_end_date: formData.contract_end_date || null,
          trial_end_date: formData.trial_end_date || null,
          is_active: true,
        },
      ]).select().single();

      if (error) throw error;

      // 요금제에 따라 자동으로 스펙 설정
      const { error: setupError } = await supabase.functions.invoke('setup-tenant-plan', {
        body: {
          tenantId: newTenant.id,
          plan: formData.plan
        }
      });

      if (setupError) {
        console.error("요금제 설정 오류:", setupError);
        toast({
          title: "경고",
          description: "고객사는 생성되었으나 요금제 설정에 실패했습니다. 수동으로 설정해주세요.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "성공",
          description: "새 고객사가 추가되고 요금제가 설정되었습니다.",
        });
      }

      setIsDialogOpen(false);
      fetchTenants();
      setFormData({
        name: "",
        subdomain: "",
        custom_domain: "",
        plan: "starter",
        status: "trial",
        max_students: 50,
        max_storage_gb: 10,
        max_bandwidth_gb: 100,
        contract_end_date: "",
        trial_end_date: "",
        features_enabled: {
          ai: true,
          analytics: true,
          community: true,
          gamification: true,
          certificates: true,
        },
      });
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "고객사 추가에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleSuspendTenant = async (tenant: Tenant, reason: string) => {
    try {
      const { error } = await supabase
        .from("tenants")
        .update({ 
          status: "suspended",
          suspended_reason: reason,
          is_active: false
        })
        .eq("id", tenant.id);

      if (error) throw error;

      await supabase.from("tenant_access_logs").insert({
        tenant_id: tenant.id,
        action: "suspended",
        reason: reason,
      });

      toast({
        title: "성공",
        description: `${tenant.name}의 접속이 차단되었습니다.`,
      });

      fetchTenants();
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "차단 처리에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleReactivateTenant = async (tenant: Tenant) => {
    try {
      const { error } = await supabase
        .from("tenants")
        .update({ 
          status: "active",
          suspended_reason: null,
          is_active: true
        })
        .eq("id", tenant.id);

      if (error) throw error;

      await supabase.from("tenant_access_logs").insert({
        tenant_id: tenant.id,
        action: "allowed",
        reason: "Reactivated by operator",
      });

      toast({
        title: "성공",
        description: `${tenant.name}의 접속이 재개되었습니다.`,
      });

      fetchTenants();
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "재개 처리에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (tenant: Tenant) => {
    try {
      const { error } = await supabase
        .from("tenants")
        .update({ is_active: !tenant.is_active })
        .eq("id", tenant.id);

      if (error) throw error;

      toast({
        title: "성공",
        description: `고객사 상태가 ${!tenant.is_active ? "활성화" : "비활성화"}되었습니다.`,
      });

      fetchTenants();
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "상태 변경에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

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

  const getPlanAmount = (plan: string) => {
    switch (plan) {
      case "starter":
        return 0;
      case "standard":
        return 150000;
      case "professional":
        return 300000;
      default:
        return 0;
    }
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all" || planFilter !== "all";

  const handleChangePlan = async () => {
    if (!selectedTenant || !newPlan) return;
    
    try {
      const { error: setupError } = await supabase.functions.invoke('setup-tenant-plan', {
        body: {
          tenantId: selectedTenant.id,
          plan: newPlan
        }
      });

      if (setupError) throw setupError;

      toast({
        title: "성공",
        description: `${selectedTenant.name}의 요금제가 ${getPlanLabel(newPlan)}(으)로 변경되었습니다.`,
      });

      setPlanChangeDialogOpen(false);
      setSelectedTenant(null);
      setNewPlan("");
      fetchTenants();
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "요금제 변경에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const getExpectedSpecs = (plan: string) => {
    switch (plan) {
      case "starter":
        return { max_students: 50, max_storage_gb: 10, ai_tokens_monthly: 10000 };
      case "standard":
        return { max_students: 200, max_storage_gb: 50, ai_tokens_monthly: 50000 };
      case "pro":
        return { max_students: 500, max_storage_gb: 200, ai_tokens_monthly: 200000 };
      case "professional":
        return { max_students: 1000, max_storage_gb: 500, ai_tokens_monthly: 500000 };
      case "enterprise":
        return { max_students: 5000, max_storage_gb: 2000, ai_tokens_monthly: 2000000 };
      case "enterprise_hrd":
        return { max_students: 10000, max_storage_gb: 5000, ai_tokens_monthly: 5000000 };
      default:
        return { max_students: 50, max_storage_gb: 10, ai_tokens_monthly: 10000 };
    }
  };

  const validateSpecs = (tenant: Tenant) => {
    const expected = getExpectedSpecs(tenant.plan);
    return {
      students: tenant.max_students === expected.max_students,
      storage: tenant.max_storage_gb === expected.max_storage_gb,
      allValid: tenant.max_students === expected.max_students && 
                tenant.max_storage_gb === expected.max_storage_gb
    };
  };

  return (
    <OperatorLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className={cn(
              "text-3xl font-bold mb-2 transition-colors flex items-center gap-3",
              theme === "dark" ? "text-white" : "text-slate-900"
            )}>
              <Building2 className="h-8 w-8" />
              고객사 관리
            </h1>
            <p className={cn(
              "transition-colors",
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            )}>등록된 고객사를 관리하고 모니터링합니다</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-violet-500 hover:bg-violet-600">
                <Plus className="h-4 w-4" />
                새 고객사 추가
              </Button>
            </DialogTrigger>
            <DialogContent className={cn(
              "transition-colors",
              theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            )}>
              <DialogHeader>
                <DialogTitle className={cn(
                  "transition-colors",
                  theme === "dark" ? "text-white" : "text-slate-900"
                )}>새 고객사 추가</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className={cn(
                    "transition-colors",
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  )}>고객사명</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className={cn(
                      "transition-colors",
                      theme === "dark"
                        ? "bg-slate-800 border-slate-700 text-white"
                        : "bg-slate-50 border-slate-300 text-slate-900"
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subdomain" className={cn(
                    "transition-colors",
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  )}>서브도메인</Label>
                  <Input
                    id="subdomain"
                    value={formData.subdomain}
                    onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                    required
                    placeholder="company"
                    className={cn(
                      "transition-colors",
                      theme === "dark"
                        ? "bg-slate-800 border-slate-700 text-white"
                        : "bg-slate-50 border-slate-300 text-slate-900"
                    )}
                  />
                  <p className={cn("text-xs", theme === "dark" ? "text-slate-500" : "text-slate-600")}>
                    company.yourdomain.com
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom_domain" className={cn(
                    "transition-colors",
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  )}>커스텀 도메인 (선택)</Label>
                  <Input
                    id="custom_domain"
                    value={formData.custom_domain}
                    onChange={(e) => setFormData({ ...formData, custom_domain: e.target.value })}
                    placeholder="www.company.com"
                    className={cn(
                      "transition-colors",
                      theme === "dark"
                        ? "bg-slate-800 border-slate-700 text-white"
                        : "bg-slate-50 border-slate-300 text-slate-900"
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plan" className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-300" : "text-slate-700"
                    )}>플랜</Label>
                    <Select value={formData.plan} onValueChange={(value) => setFormData({ ...formData, plan: value })}>
                      <SelectTrigger className={cn(
                        "transition-colors",
                        theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                      )}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={cn(
                        "transition-colors",
                        theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                      )}>
                        <SelectItem value="starter">스타터</SelectItem>
                        <SelectItem value="standard">스탠다드</SelectItem>
                        <SelectItem value="professional">프로페셔널</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-300" : "text-slate-700"
                    )}>상태</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger className={cn(
                        "transition-colors",
                        theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                      )}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={cn(
                        "transition-colors",
                        theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                      )}>
                        <SelectItem value="trial">트라이얼</SelectItem>
                        <SelectItem value="active">활성</SelectItem>
                        <SelectItem value="suspended">일시중단</SelectItem>
                        <SelectItem value="terminated">종료</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max_students" className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-300" : "text-slate-700"
                    )}>최대 학생</Label>
                    <Input
                      id="max_students"
                      type="number"
                      value={formData.max_students}
                      onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) })}
                      required
                      className={cn(
                        "transition-colors",
                        theme === "dark"
                          ? "bg-slate-800 border-slate-700 text-white"
                          : "bg-slate-50 border-slate-300 text-slate-900"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_storage_gb" className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-300" : "text-slate-700"
                    )}>저장소 (GB)</Label>
                    <Input
                      id="max_storage_gb"
                      type="number"
                      value={formData.max_storage_gb}
                      onChange={(e) => setFormData({ ...formData, max_storage_gb: parseInt(e.target.value) })}
                      required
                      className={cn(
                        "transition-colors",
                        theme === "dark"
                          ? "bg-slate-800 border-slate-700 text-white"
                          : "bg-slate-50 border-slate-300 text-slate-900"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_bandwidth_gb" className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-300" : "text-slate-700"
                    )}>전송량 (GB)</Label>
                    <Input
                      id="max_bandwidth_gb"
                      type="number"
                      value={formData.max_bandwidth_gb}
                      onChange={(e) => setFormData({ ...formData, max_bandwidth_gb: parseInt(e.target.value) })}
                      required
                      className={cn(
                        "transition-colors",
                        theme === "dark"
                          ? "bg-slate-800 border-slate-700 text-white"
                          : "bg-slate-50 border-slate-300 text-slate-900"
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contract_end_date" className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-300" : "text-slate-700"
                    )}>계약 종료일</Label>
                    <Input
                      id="contract_end_date"
                      type="date"
                      value={formData.contract_end_date}
                      onChange={(e) => setFormData({ ...formData, contract_end_date: e.target.value })}
                      className={cn(
                        "transition-colors",
                        theme === "dark"
                          ? "bg-slate-800 border-slate-700 text-white"
                          : "bg-slate-50 border-slate-300 text-slate-900"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trial_end_date" className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-300" : "text-slate-700"
                    )}>트라이얼 종료일</Label>
                    <Input
                      id="trial_end_date"
                      type="date"
                      value={formData.trial_end_date}
                      onChange={(e) => setFormData({ ...formData, trial_end_date: e.target.value })}
                      className={cn(
                        "transition-colors",
                        theme === "dark"
                          ? "bg-slate-800 border-slate-700 text-white"
                          : "bg-slate-50 border-slate-300 text-slate-900"
                      )}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className={cn(
                    "transition-colors",
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  )}>활성화 기능</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(formData.features_enabled).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`feature_${key}`}
                          checked={value}
                          onChange={(e) => setFormData({
                            ...formData,
                            features_enabled: {
                              ...formData.features_enabled,
                              [key]: e.target.checked
                            }
                          })}
                          className="rounded border-slate-700"
                        />
                        <Label htmlFor={`feature_${key}`} className={cn(
                          "text-sm cursor-pointer",
                          theme === "dark" ? "text-slate-400" : "text-slate-600"
                        )}>
                          {key === 'ai' ? 'AI 기능' : 
                           key === 'analytics' ? '분석' :
                           key === 'community' ? '커뮤니티' :
                           key === 'gamification' ? '게이미피케이션' :
                           '수료증'}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-violet-500 hover:bg-violet-600">추가하기</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter Section */}
        <Card className={cn(
          "bg-slate-900/50 border-slate-800 transition-colors",
          theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/50 border-slate-300"
        )}>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="고객사명 또는 서브도메인 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "pl-10 bg-slate-800 border-slate-700 text-white transition-colors",
                    theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                  )}
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger className={cn(
                    "w-[140px] bg-slate-800 border-slate-700 text-white transition-colors",
                    theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                  )}>
                    <SelectValue placeholder="상태" />
                  </SelectTrigger>
                  <SelectContent className={cn(
                    "bg-slate-800 border-slate-700 transition-colors",
                    theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                  )}>
                    <SelectItem value="all">전체 상태</SelectItem>
                    <SelectItem value="active">활성</SelectItem>
                    <SelectItem value="inactive">비활성</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={planFilter} onValueChange={(value: any) => setPlanFilter(value)}>
                  <SelectTrigger className={cn(
                    "w-[140px] bg-slate-800 border-slate-700 text-white transition-colors",
                    theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                  )}>
                    <SelectValue placeholder="플랜" />
                  </SelectTrigger>
                  <SelectContent className={cn(
                    "bg-slate-800 border-slate-700 transition-colors",
                    theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                  )}>
                    <SelectItem value="all">전체 플랜</SelectItem>
                    <SelectItem value="starter">스타터</SelectItem>
                    <SelectItem value="standard">스탠다드</SelectItem>
                    <SelectItem value="professional">프로페셔널</SelectItem>
                  </SelectContent>
                </Select>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={clearFilters}
                    className={cn(
                      "border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors",
                      theme === "dark" ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-300 text-slate-500 hover:bg-slate-100"
                    )}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tenants Table */}
        <Card className={cn(
          "bg-slate-900/50 border-slate-800 transition-colors",
          theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/50 border-slate-300"
        )}>
          <CardHeader>
            <CardTitle className={cn(
              "text-white transition-colors",
              theme === "dark" ? "text-white" : "text-slate-900"
            )}>고객사 목록</CardTitle>
            <CardDescription className={cn(
              "text-slate-400 transition-colors",
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            )}>
              {filteredTenants.length}개 고객사 {hasActiveFilters && `(전체 ${tenants.length}개 중)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-400">로딩 중...</div>
            ) : filteredTenants.length === 0 ? (
              <EmptyState
                icon={Building2}
                title={hasActiveFilters ? "검색 결과 없음" : "등록된 고객사가 없습니다"}
                description={
                  hasActiveFilters
                    ? "검색 조건에 맞는 고객사가 없습니다. 다른 조건으로 검색해보세요."
                    : "새 고객사를 추가하여 시작하세요."
                }
                action={
                  hasActiveFilters
                    ? { label: "필터 초기화", onClick: clearFilters }
                    : { label: "고객사 추가", onClick: () => setIsDialogOpen(true) }
                }
              />
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
                    )}>고객사명</TableHead>
                    <TableHead className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    )}>도메인</TableHead>
                    <TableHead className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    )}>플랜</TableHead>
                    <TableHead className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    )}>리소스</TableHead>
                    <TableHead className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    )}>상태</TableHead>
                    <TableHead className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    )}>계약</TableHead>
                    <TableHead className={cn(
                      "transition-colors",
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    )}>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTenants.map((tenant) => (
                    <TableRow key={tenant.id} className={cn(
                      "transition-colors",
                      theme === "dark" ? "border-slate-800" : "border-slate-200"
                    )}>
                      <TableCell className={cn(
                        "font-medium transition-colors",
                        theme === "dark" ? "text-white" : "text-slate-900"
                      )}>{tenant.name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className={cn(
                            "text-sm transition-colors",
                            theme === "dark" ? "text-slate-400" : "text-slate-600"
                          )}>{tenant.subdomain}</div>
                          {tenant.custom_domain && (
                            <div className={cn(
                              "text-xs transition-colors",
                              theme === "dark" ? "text-violet-400" : "text-violet-600"
                            )}>{tenant.custom_domain}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPlanBadgeColor(tenant.plan)}>
                          {getPlanLabel(tenant.plan)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs">
                          <div className={cn(
                            "transition-colors",
                            theme === "dark" ? "text-slate-400" : "text-slate-600"
                          )}>학생: {tenant.max_students}</div>
                          <div className={cn(
                            "transition-colors",
                            theme === "dark" ? "text-slate-400" : "text-slate-600"
                          )}>저장소: {tenant.max_storage_gb}GB</div>
                          <div className={cn(
                            "transition-colors",
                            theme === "dark" ? "text-slate-400" : "text-slate-600"
                          )}>전송량: {tenant.max_bandwidth_gb}GB</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          tenant.status === 'active' ? "bg-green-500/10 text-green-400 border-green-500/50" :
                          tenant.status === 'trial' ? "bg-blue-500/10 text-blue-400 border-blue-500/50" :
                          tenant.status === 'suspended' ? "bg-orange-500/10 text-orange-400 border-orange-500/50" :
                          "bg-red-500/10 text-red-400 border-red-500/50"
                        }>
                          {tenant.status === 'active' ? '활성' :
                           tenant.status === 'trial' ? '트라이얼' :
                           tenant.status === 'suspended' ? '일시중단' : '종료'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs">
                          {tenant.contract_end_date && (
                            <div className={cn(
                              "transition-colors",
                              theme === "dark" ? "text-slate-400" : "text-slate-600"
                            )}>계약: {new Date(tenant.contract_end_date).toLocaleDateString('ko-KR')}</div>
                          )}
                          {tenant.trial_end_date && (
                            <div className={cn(
                              "transition-colors",
                              theme === "dark" ? "text-blue-400" : "text-blue-600"
                            )}>트라이얼: {new Date(tenant.trial_end_date).toLocaleDateString('ko-KR')}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTenant(tenant);
                              setSpecDialogOpen(true);
                            }}
                            className={cn(
                              "gap-1 transition-colors",
                              theme === "dark" ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-300 text-slate-600 hover:bg-slate-100"
                            )}
                          >
                            {validateSpecs(tenant).allValid ? (
                              <CheckCircle2 className="h-3 w-3 text-green-400" />
                            ) : (
                              <AlertCircle className="h-3 w-3 text-orange-400" />
                            )}
                            <span className="text-xs">검수</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTenant(tenant);
                              setNewPlan(tenant.plan);
                              setPlanChangeDialogOpen(true);
                            }}
                            className={cn(
                              "gap-1 transition-colors",
                              theme === "dark" ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-300 text-slate-600 hover:bg-slate-100"
                            )}
                          >
                            <Settings className="h-3 w-3" />
                          </Button>
                          {tenant.status === 'suspended' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReactivateTenant(tenant)}
                              className={cn(
                                "transition-colors",
                                theme === "dark" ? "border-green-700 text-green-400 hover:bg-green-900/20" : "border-green-300 text-green-600 hover:bg-green-50"
                              )}
                            >
                              재개
                            </Button>
                          ) : tenant.status !== 'terminated' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const reason = prompt("차단 사유를 입력하세요:");
                                if (reason) handleSuspendTenant(tenant, reason);
                              }}
                              className={cn(
                                "transition-colors",
                                theme === "dark" ? "border-orange-700 text-orange-400 hover:bg-orange-900/20" : "border-orange-300 text-orange-600 hover:bg-orange-50"
                              )}
                            >
                              차단
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTenant(tenant);
                              setPaymentDialogOpen(true);
                            }}
                            className={cn(
                              "transition-colors",
                              theme === "dark" ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-300 text-slate-500 hover:bg-slate-100"
                            )}
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <TossPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        tenantId={selectedTenant?.id || ""}
        tenantName={selectedTenant?.name || ""}
        amount={getPlanAmount(selectedTenant?.plan || "")}
      />

      {/* 스펙 검수 다이얼로그 */}
      <Dialog open={specDialogOpen} onOpenChange={setSpecDialogOpen}>
        <DialogContent className={cn(
          "sm:max-w-[600px] transition-colors",
          theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        )}>
          <DialogHeader>
            <DialogTitle className={cn(
              "transition-colors",
              theme === "dark" ? "text-white" : "text-slate-900"
            )}>스펙 검수: {selectedTenant?.name}</DialogTitle>
          </DialogHeader>
          {selectedTenant && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card className={cn(
                  "transition-colors",
                  theme === "dark" ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"
                )}>
                  <CardHeader className="pb-3">
                    <CardTitle className={cn(
                      "text-sm transition-colors",
                      theme === "dark" ? "text-slate-300" : "text-slate-700"
                    )}>현재 요금제</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge className={getPlanBadgeColor(selectedTenant.plan)}>
                      {getPlanLabel(selectedTenant.plan)}
                    </Badge>
                  </CardContent>
                </Card>
                <Card className={cn(
                  "transition-colors",
                  theme === "dark" ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"
                )}>
                  <CardHeader className="pb-3">
                    <CardTitle className={cn(
                      "text-sm transition-colors",
                      theme === "dark" ? "text-slate-300" : "text-slate-700"
                    )}>전체 검수 상태</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {validateSpecs(selectedTenant).allValid ? (
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="text-sm font-medium">정상</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-orange-400">
                        <AlertCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">불일치</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <div className={cn(
                  "text-sm font-medium transition-colors",
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                )}>세부 스펙 비교</div>
                
                {(() => {
                  const expected = getExpectedSpecs(selectedTenant.plan);
                  const validation = validateSpecs(selectedTenant);
                  
                  return (
                    <div className="space-y-3">
                      <Card className={cn(
                        "transition-colors",
                        validation.students
                          ? theme === "dark" ? "bg-green-900/20 border-green-800" : "bg-green-50 border-green-200"
                          : theme === "dark" ? "bg-orange-900/20 border-orange-800" : "bg-orange-50 border-orange-200"
                      )}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className={cn(
                              "text-sm transition-colors",
                              validation.students
                                ? "text-green-400"
                                : "text-orange-400"
                            )}>최대 학생 수</CardTitle>
                            {validation.students ? (
                              <CheckCircle2 className="h-4 w-4 text-green-400" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-orange-400" />
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className={cn(
                            "text-sm transition-colors",
                            theme === "dark" ? "text-slate-300" : "text-slate-700"
                          )}>
                            기대값: <span className="font-semibold">{expected.max_students}명</span>
                          </div>
                          <div className={cn(
                            "text-sm transition-colors",
                            validation.students
                              ? theme === "dark" ? "text-green-400" : "text-green-600"
                              : theme === "dark" ? "text-orange-400" : "text-orange-600"
                          )}>
                            실제값: <span className="font-semibold">{selectedTenant.max_students}명</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className={cn(
                        "transition-colors",
                        validation.storage
                          ? theme === "dark" ? "bg-green-900/20 border-green-800" : "bg-green-50 border-green-200"
                          : theme === "dark" ? "bg-orange-900/20 border-orange-800" : "bg-orange-50 border-orange-200"
                      )}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className={cn(
                              "text-sm transition-colors",
                              validation.storage
                                ? "text-green-400"
                                : "text-orange-400"
                            )}>최대 저장소</CardTitle>
                            {validation.storage ? (
                              <CheckCircle2 className="h-4 w-4 text-green-400" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-orange-400" />
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className={cn(
                            "text-sm transition-colors",
                            theme === "dark" ? "text-slate-300" : "text-slate-700"
                          )}>
                            기대값: <span className="font-semibold">{expected.max_storage_gb}GB</span>
                          </div>
                          <div className={cn(
                            "text-sm transition-colors",
                            validation.storage
                              ? theme === "dark" ? "text-green-400" : "text-green-600"
                              : theme === "dark" ? "text-orange-400" : "text-orange-600"
                          )}>
                            실제값: <span className="font-semibold">{selectedTenant.max_storage_gb}GB</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className={cn(
                        "transition-colors",
                        theme === "dark" ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"
                      )}>
                        <CardHeader className="pb-3">
                          <CardTitle className={cn(
                            "text-sm text-blue-400"
                          )}>월간 AI 토큰 (참고)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className={cn(
                            "text-sm transition-colors",
                            theme === "dark" ? "text-slate-300" : "text-slate-700"
                          )}>
                            기대값: <span className="font-semibold">{expected.ai_tokens_monthly.toLocaleString()}개</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })()}
              </div>

              {!validateSpecs(selectedTenant).allValid && (
                <div className={cn(
                  "p-4 rounded-lg border transition-colors",
                  theme === "dark" ? "bg-orange-900/20 border-orange-800" : "bg-orange-50 border-orange-200"
                )}>
                  <div className="flex gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className={cn(
                        "text-sm font-medium mb-1 transition-colors",
                        theme === "dark" ? "text-orange-300" : "text-orange-700"
                      )}>
                        스펙 불일치 감지
                      </div>
                      <div className={cn(
                        "text-sm transition-colors",
                        theme === "dark" ? "text-orange-400" : "text-orange-600"
                      )}>
                        현재 설정된 스펙이 요금제 기준과 다릅니다. 요금제 변경 기능을 통해 자동으로 재설정할 수 있습니다.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 요금제 변경 다이얼로그 */}
      <Dialog open={planChangeDialogOpen} onOpenChange={setPlanChangeDialogOpen}>
        <DialogContent className={cn(
          "sm:max-w-[500px] transition-colors",
          theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        )}>
          <DialogHeader>
            <DialogTitle className={cn(
              "transition-colors",
              theme === "dark" ? "text-white" : "text-slate-900"
            )}>요금제 변경: {selectedTenant?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className={cn(
                "transition-colors",
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              )}>새 요금제 선택</Label>
              <Select value={newPlan} onValueChange={setNewPlan}>
                <SelectTrigger className={cn(
                  "transition-colors",
                  theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                )}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={cn(
                  "transition-colors",
                  theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                )}>
                  <SelectItem value="starter">스타터 (학생 50명, 저장소 10GB)</SelectItem>
                  <SelectItem value="standard">스탠다드 (학생 200명, 저장소 50GB)</SelectItem>
                  <SelectItem value="pro">프로 (학생 500명, 저장소 200GB)</SelectItem>
                  <SelectItem value="professional">프로페셔널 (학생 1,000명, 저장소 500GB)</SelectItem>
                  <SelectItem value="enterprise">엔터프라이즈 (학생 5,000명, 저장소 2TB)</SelectItem>
                  <SelectItem value="enterprise_hrd">엔터프라이즈 HRD (학생 10,000명, 저장소 5TB)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newPlan && (
              <Card className={cn(
                "transition-colors",
                theme === "dark" ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"
              )}>
                <CardHeader className="pb-3">
                  <CardTitle className={cn(
                    "text-sm text-blue-400"
                  )}>변경될 스펙</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {(() => {
                    const specs = getExpectedSpecs(newPlan);
                    return (
                      <>
                        <div className={cn(
                          "transition-colors",
                          theme === "dark" ? "text-slate-300" : "text-slate-700"
                        )}>
                          • 최대 학생: <span className="font-semibold">{specs.max_students}명</span>
                        </div>
                        <div className={cn(
                          "transition-colors",
                          theme === "dark" ? "text-slate-300" : "text-slate-700"
                        )}>
                          • 저장소: <span className="font-semibold">{specs.max_storage_gb}GB</span>
                        </div>
                        <div className={cn(
                          "transition-colors",
                          theme === "dark" ? "text-slate-300" : "text-slate-700"
                        )}>
                          • 월간 AI 토큰: <span className="font-semibold">{specs.ai_tokens_monthly.toLocaleString()}개</span>
                        </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            <div className={cn(
              "p-3 rounded-lg border text-sm transition-colors",
              theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
            )}>
              요금제를 변경하면 해당 요금제의 스펙이 자동으로 적용됩니다.
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPlanChangeDialogOpen(false)}
              className={cn(
                "transition-colors",
                theme === "dark" ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-300 text-slate-600 hover:bg-slate-100"
              )}
            >
              취소
            </Button>
            <Button
              onClick={handleChangePlan}
              disabled={!newPlan || newPlan === selectedTenant?.plan}
              className="bg-violet-500 hover:bg-violet-600"
            >
              변경 적용
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </OperatorLayout>
  );
};

export default OperatorTenants;
