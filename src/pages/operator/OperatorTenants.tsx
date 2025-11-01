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
import { Building2, Plus, Search, Filter, CreditCard, X } from "lucide-react";
import TossPaymentDialog from "@/components/admin/TossPaymentDialog";
import { EmptyState } from "@/components/operator/EmptyState";
import { cn } from "@/lib/utils";
import logoIcon from "@/assets/logo-icon.png";

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
      const { error } = await supabase.from("tenants").insert([
        {
          name: formData.name,
          subdomain: formData.subdomain,
          custom_domain: formData.custom_domain || null,
          plan: formData.plan as "starter" | "standard" | "professional",
          status: formData.status,
          max_students: formData.max_students,
          max_storage_gb: formData.max_storage_gb,
          max_bandwidth_gb: formData.max_bandwidth_gb,
          features_enabled: formData.features_enabled,
          contract_end_date: formData.contract_end_date || null,
          trial_end_date: formData.trial_end_date || null,
          is_active: true,
        },
      ]);

      if (error) throw error;

      toast({
        title: "성공",
        description: "새 고객사가 추가되었습니다.",
      });

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

  return (
    <OperatorLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className={cn(
              "text-3xl font-bold mb-2 transition-colors flex items-center gap-2",
              theme === "dark" ? "text-white" : "text-slate-900"
            )}>
              <img src={logoIcon} alt="atom" className="h-8 w-8" />
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
                        <div className="flex gap-2">
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
    </OperatorLayout>
  );
};

export default OperatorTenants;
