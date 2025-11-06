import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Search, FileText, Edit, Trash2, CheckCircle, XCircle, Clock, Building2, UserPlus, UserCheck } from "lucide-react";
import { ContractDialog } from "@/components/operator/ContractDialog";
import { CreateTenantFromContractDialog } from "@/components/operator/CreateTenantFromContractDialog";
import { AdminAccountCreationDialog } from "@/components/operator/AdminAccountCreationDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function OperatorContracts() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<any>(null);
  const [createTenantDialogOpen, setCreateTenantDialogOpen] = useState(false);
  const [contractForTenant, setContractForTenant] = useState<any>(null);
  const [adminCreationDialogOpen, setAdminCreationDialogOpen] = useState(false);
  const [contractForAdmin, setContractForAdmin] = useState<any>(null);

  useEffect(() => {
    checkOperatorAccess();
  }, []);

  const checkOperatorAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: isOp } = await supabase.rpc("is_operator", { _user_id: user.id });
    if (!isOp) {
      toast.error("운영자 권한이 필요합니다");
      navigate("/");
      return;
    }

    fetchContracts();
  };

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error: any) {
      console.error("Error fetching contracts:", error);
      toast.error("계약 목록을 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (contractId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("contracts")
        .update({ status: newStatus })
        .eq("id", contractId);

      if (error) throw error;
      toast.success("계약 상태가 변경되었습니다");
      fetchContracts();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error("상태 변경에 실패했습니다");
    }
  };

  const handleDelete = async () => {
    if (!contractToDelete) return;

    try {
      const { error } = await supabase
        .from("contracts")
        .delete()
        .eq("id", contractToDelete.id);

      if (error) throw error;
      toast.success("계약이 삭제되었습니다");
      fetchContracts();
    } catch (error: any) {
      console.error("Error deleting contract:", error);
      toast.error("계약 삭제에 실패했습니다");
    } finally {
      setDeleteDialogOpen(false);
      setContractToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      pending: { variant: "secondary", icon: Clock },
      active: { variant: "default", icon: CheckCircle },
      completed: { variant: "outline", icon: CheckCircle },
      cancelled: { variant: "destructive", icon: XCircle },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status === "pending" && "대기"}
        {status === "active" && "진행중"}
        {status === "completed" && "완료"}
        {status === "cancelled" && "취소"}
      </Badge>
    );
  };

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, string> = {
      starter: "bg-gray-100 text-gray-800",
      standard: "bg-blue-100 text-blue-800",
      pro: "bg-purple-100 text-purple-800",
      professional: "bg-indigo-100 text-indigo-800",
      enterprise: "bg-green-100 text-green-800",
      enterprise_hrd: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={colors[plan] || colors.starter}>
        {plan.toUpperCase()}
      </Badge>
    );
  };

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch = contract.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.contract_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: contracts.length,
    pending: contracts.filter(c => c.status === "pending").length,
    active: contracts.filter(c => c.status === "active").length,
    completed: contracts.filter(c => c.status === "completed").length,
  };

  return (
    <OperatorLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">계약 관리</h1>
            <p className="text-muted-foreground">고객사 계약을 체결하고 관리합니다</p>
          </div>
          <Button onClick={() => {
            setSelectedContract(null);
            setDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            신규 계약 등록
          </Button>
        </div>

        {/* 통계 카드 */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">전체 계약</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">대기중</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">진행중</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">완료</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* 필터 및 검색 */}
        <Card>
          <CardHeader>
            <CardTitle>계약 목록</CardTitle>
            <CardDescription>등록된 모든 계약을 확인하고 관리합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="고객사명 또는 계약번호로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="상태 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="pending">대기중</SelectItem>
                  <SelectItem value="active">진행중</SelectItem>
                  <SelectItem value="completed">완료</SelectItem>
                  <SelectItem value="cancelled">취소</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
            ) : filteredContracts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>등록된 계약이 없습니다</p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>계약번호</TableHead>
                      <TableHead>고객사명</TableHead>
                      <TableHead>테넌트</TableHead>
                      <TableHead>플랜</TableHead>
                      <TableHead>계약금액</TableHead>
                      <TableHead>계약기간</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell className="font-mono text-sm">{contract.contract_number}</TableCell>
                        <TableCell className="font-medium">{contract.customer_name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            {contract.tenant_id ? (
                              <>
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  테넌트 생성완료
                                </Badge>
                                {contract.technical_representative ? (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                    <UserCheck className="h-3 w-3 mr-1" />
                                    관리자 설정완료
                                  </Badge>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-xs"
                                    onClick={() => {
                                      setContractForAdmin(contract);
                                      setAdminCreationDialogOpen(true);
                                    }}
                                  >
                                    <UserPlus className="h-3 w-3 mr-1" />
                                    관리자 생성
                                  </Button>
                                )}
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs"
                                onClick={() => {
                                  setContractForTenant(contract);
                                  setCreateTenantDialogOpen(true);
                                }}
                                disabled={contract.status !== "active"}
                              >
                                <Building2 className="h-3 w-3 mr-1" />
                                테넌트 생성
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getPlanBadge(contract.plan)}</TableCell>
                        <TableCell>{contract.contract_amount.toLocaleString()}원</TableCell>
                        <TableCell className="text-sm">
                          {contract.contract_start_date} ~ {contract.contract_end_date}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={contract.status}
                            onValueChange={(value) => handleStatusChange(contract.id, value)}
                          >
                            <SelectTrigger className="w-[120px]">
                              {getStatusBadge(contract.status)}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">대기</SelectItem>
                              <SelectItem value="active">진행중</SelectItem>
                              <SelectItem value="completed">완료</SelectItem>
                              <SelectItem value="cancelled">취소</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedContract(contract);
                                setDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setContractToDelete(contract);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ContractDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        contract={selectedContract}
        onSuccess={fetchContracts}
      />

      <CreateTenantFromContractDialog
        open={createTenantDialogOpen}
        onOpenChange={setCreateTenantDialogOpen}
        contract={contractForTenant}
        onSuccess={() => {
          fetchContracts();
          toast.success("테넌트가 성공적으로 생성되었습니다");
        }}
      />

      {contractForAdmin && (
        <AdminAccountCreationDialog
          open={adminCreationDialogOpen}
          onOpenChange={setAdminCreationDialogOpen}
          contractId={contractForAdmin.id}
          contractNumber={contractForAdmin.contract_number}
          tenantId={contractForAdmin.tenant_id}
          tenantName={contractForAdmin.customer_name}
          tenantSubdomain=""
          representativeEmail={contractForAdmin.representative_email}
          representativeName={contractForAdmin.representative_name}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>계약 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 계약을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </OperatorLayout>
  );
}
