import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
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
import { Building2, Plus, Users, HardDrive, TrendingUp, CreditCard } from "lucide-react";
import TossPaymentDialog from "@/components/admin/TossPaymentDialog";

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  plan: string;
  is_active: boolean;
  max_students: number;
  max_storage_gb: number;
  created_at: string;
}

interface UsageMetrics {
  student_count: number;
  storage_used_gb: number;
  bandwidth_gb: number;
  ai_tokens_used: number;
}

const AdminTenants = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
    plan: "starter",
    max_students: 50,
    max_storage_gb: 10,
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      toast({
        title: "오류",
        description: "고객사 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("tenants").insert([{
        name: formData.name,
        subdomain: formData.subdomain,
        slug: formData.subdomain, // Add slug from subdomain
        plan: formData.plan as "starter" | "standard" | "professional",
        max_students: formData.max_students,
        max_storage_gb: formData.max_storage_gb,
        owner_id: user?.id,
      }]);

      if (error) throw error;

      toast({
        title: "성공",
        description: "고객사가 생성되었습니다.",
      });

      setIsDialogOpen(false);
      fetchTenants();
      setFormData({
        name: "",
        subdomain: "",
        plan: "starter",
        max_students: 50,
        max_storage_gb: 10,
      });
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "고객사 생성에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const toggleTenantStatus = async (tenantId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("tenants")
        .update({ is_active: !currentStatus })
        .eq("id", tenantId);

      if (error) throw error;

      toast({
        title: "성공",
        description: "고객사 상태가 변경되었습니다.",
      });

      fetchTenants();
    } catch (error) {
      toast({
        title: "오류",
        description: "상태 변경에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const getPlanBadge = (plan: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      starter: "secondary",
      standard: "default",
      professional: "destructive",
    };
    return <Badge variant={variants[plan] || "default"}>{plan}</Badge>;
  };

  const getPlanAmount = (plan: string): number => {
    const amounts: Record<string, number> = {
      starter: 0,
      standard: 150000,
      professional: 300000,
    };
    return amounts[plan] || 0;
  };

  const handlePaymentClick = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setPaymentDialogOpen(true);
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-2">
              <Building2 className="h-7 w-7 text-primary" />
              고객사 관리
            </h1>
            <p className="text-muted-foreground mt-2">기관별 생성 및 사용량 관리</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                고객사 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>새 고객사 생성</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>기관명</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="예: 서울대학교"
                  />
                </div>
                <div className="space-y-2">
                  <Label>서브도메인</Label>
                  <Input
                    value={formData.subdomain}
                    onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                    placeholder="예: seoul-univ"
                  />
                </div>
                <div className="space-y-2">
                  <Label>요금제</Label>
                  <Select value={formData.plan} onValueChange={(value) => setFormData({ ...formData, plan: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">스타터 (₩0)</SelectItem>
                      <SelectItem value="standard">스탠다드 (₩150,000)</SelectItem>
                      <SelectItem value="professional">프로페셔널 (₩300,000)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>최대 학습자 수</Label>
                    <Input
                      type="number"
                      value={formData.max_students}
                      onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>최대 스토리지 (GB)</Label>
                    <Input
                      type="number"
                      value={formData.max_storage_gb}
                      onChange={(e) => setFormData({ ...formData, max_storage_gb: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleCreateTenant}>생성</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 고객사</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tenants.length}</div>
              <p className="text-xs text-muted-foreground mt-1">활성: {tenants.filter(t => t.is_active).length}개</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 학습자</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tenants.reduce((sum, t) => sum + t.max_students, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">제한 인원</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 스토리지</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tenants.reduce((sum, t) => sum + t.max_storage_gb, 0)} GB
              </div>
              <p className="text-xs text-muted-foreground mt-1">할당량</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">월 매출</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₩{tenants.reduce((sum, t) => {
                  const amounts = { starter: 0, standard: 150000, professional: 300000 };
                  return sum + (amounts[t.plan as keyof typeof amounts] || 0);
                }, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">예상 매출</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>고객사 목록</CardTitle>
            <CardDescription>전체 기관 목록 및 상태 관리</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>기관명</TableHead>
                  <TableHead>서브도메인</TableHead>
                  <TableHead>요금제</TableHead>
                  <TableHead>최대 학습자</TableHead>
                  <TableHead>스토리지</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>생성일</TableHead>
                  <TableHead>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell>{tenant.subdomain}</TableCell>
                    <TableCell>{getPlanBadge(tenant.plan)}</TableCell>
                    <TableCell>{tenant.max_students}명</TableCell>
                    <TableCell>{tenant.max_storage_gb} GB</TableCell>
                    <TableCell>
                      <Badge variant={tenant.is_active ? "default" : "secondary"}>
                        {tenant.is_active ? "활성" : "비활성"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(tenant.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleTenantStatus(tenant.id, tenant.is_active)}
                        >
                          {tenant.is_active ? "비활성화" : "활성화"}
                        </Button>
                        {tenant.plan !== "starter" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handlePaymentClick(tenant)}
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            결제
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {selectedTenant && (
          <TossPaymentDialog
            open={paymentDialogOpen}
            onOpenChange={setPaymentDialogOpen}
            tenantId={selectedTenant.id}
            tenantName={selectedTenant.name}
            amount={getPlanAmount(selectedTenant.plan)}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminTenants;
