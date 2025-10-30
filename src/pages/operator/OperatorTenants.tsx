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

const OperatorTenants = () => {
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
          plan: formData.plan as "starter" | "standard" | "professional",
          max_students: formData.max_students,
          max_storage_gb: formData.max_storage_gb,
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
        plan: "starter",
        max_students: 50,
        max_storage_gb: 10,
      });
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "고객사 추가에 실패했습니다.",
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

  return (
    <OperatorLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">고객사 관리</h1>
            <p className="text-slate-400">등록된 고객사를 관리하고 모니터링합니다</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-violet-500 hover:bg-violet-600">
                <Plus className="h-4 w-4" />
                새 고객사 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800">
              <DialogHeader>
                <DialogTitle className="text-white">새 고객사 추가</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300">고객사명</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subdomain" className="text-slate-300">서브도메인</Label>
                  <Input
                    id="subdomain"
                    value={formData.subdomain}
                    onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                    required
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan" className="text-slate-300">플랜</Label>
                  <Select value={formData.plan} onValueChange={(value) => setFormData({ ...formData, plan: value })}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="starter">스타터</SelectItem>
                      <SelectItem value="standard">스탠다드</SelectItem>
                      <SelectItem value="professional">프로페셔널</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max_students" className="text-slate-300">최대 학생 수</Label>
                    <Input
                      id="max_students"
                      type="number"
                      value={formData.max_students}
                      onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) })}
                      required
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_storage_gb" className="text-slate-300">최대 저장소 (GB)</Label>
                    <Input
                      id="max_storage_gb"
                      type="number"
                      value={formData.max_storage_gb}
                      onChange={(e) => setFormData({ ...formData, max_storage_gb: parseInt(e.target.value) })}
                      required
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-violet-500 hover:bg-violet-600">추가하기</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">고객사 목록</CardTitle>
            <CardDescription className="text-slate-400">전체 {tenants.length}개 고객사</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-400">로딩 중...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800">
                    <TableHead className="text-slate-400">고객사명</TableHead>
                    <TableHead className="text-slate-400">서브도메인</TableHead>
                    <TableHead className="text-slate-400">플랜</TableHead>
                    <TableHead className="text-slate-400">최대 학생</TableHead>
                    <TableHead className="text-slate-400">저장소</TableHead>
                    <TableHead className="text-slate-400">상태</TableHead>
                    <TableHead className="text-slate-400">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((tenant) => (
                    <TableRow key={tenant.id} className="border-slate-800">
                      <TableCell className="font-medium text-white">{tenant.name}</TableCell>
                      <TableCell className="text-slate-400">{tenant.subdomain}</TableCell>
                      <TableCell>
                        <Badge className={getPlanBadgeColor(tenant.plan)}>
                          {getPlanLabel(tenant.plan)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400">{tenant.max_students}</TableCell>
                      <TableCell className="text-slate-400">{tenant.max_storage_gb} GB</TableCell>
                      <TableCell>
                        <Badge className={tenant.is_active ? "bg-green-500/10 text-green-400 border-green-500/50" : "bg-red-500/10 text-red-400 border-red-500/50"}>
                          {tenant.is_active ? "활성" : "비활성"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(tenant)}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800"
                          >
                            {tenant.is_active ? "비활성화" : "활성화"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTenant(tenant);
                              setPaymentDialogOpen(true);
                            }}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800"
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
        amount={0}
      />
    </OperatorLayout>
  );
};

export default OperatorTenants;
