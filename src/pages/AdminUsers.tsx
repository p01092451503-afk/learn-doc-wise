import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus, Search, CheckCircle, XCircle, Clock, Ban, Eye, Building2, Edit } from "lucide-react";
import { EditRoleDialog } from "@/components/admin/EditRoleDialog";

interface User {
  id: string;
  user_id: string;
  email: string | undefined;
  full_name: string | null;
  approval_status: string;
  approved_at: string | null;
  rejection_reason: string | null;
  suspended_until: string | null;
  created_at: string;
  role?: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  max_members: number | null;
  created_at: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOrgDialogOpen, setIsOrgDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();

  const [orgForm, setOrgForm] = useState({
    name: "",
    slug: "",
    description: "",
    max_members: 100,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log("Fetching user data...");
      
      const [profilesResult, rolesResult, orgsResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("user_roles")
          .select("user_id, role"),
        supabase
          .from("organizations")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (profilesResult.error) {
        console.error("Profiles error:", profilesResult.error);
        throw profilesResult.error;
      }
      if (rolesResult.error) {
        console.error("Roles error:", rolesResult.error);
        throw rolesResult.error;
      }
      if (orgsResult.error) {
        console.error("Orgs error:", orgsResult.error);
        throw orgsResult.error;
      }

      console.log("Roles data:", rolesResult.data);

      // Get user emails
      const { data: { users: authUsers } } = await supabase.auth.admin.listUsers();
      
      const usersWithEmailsAndRoles = (profilesResult.data || []).map((profile: any) => {
        const userRole = rolesResult.data?.find((r: any) => r.user_id === profile.user_id);
        const role = userRole?.role || "student";
        console.log(`User ${profile.user_id} has role:`, role);
        return {
          ...profile,
          email: authUsers?.find((u: any) => u.id === profile.user_id)?.email,
          role,
        };
      });

      console.log("Users with roles:", usersWithEmailsAndRoles);
      setUsers(usersWithEmailsAndRoles);
      setOrganizations(orgsResult.data || []);
    } catch (error: any) {
      console.error("Fetch data error:", error);
      toast({
        title: "오류",
        description: error.message || "데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          approval_status: "approved",
          approved_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "성공",
        description: "사용자가 승인되었습니다.",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "승인에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          approval_status: "rejected",
          rejection_reason: rejectionReason,
        })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "성공",
        description: "사용자 가입이 거절되었습니다.",
      });

      setSelectedUser(null);
      setRejectionReason("");
      fetchData();
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "거절 처리에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleSuspendUser = async (userId: string, days: number) => {
    try {
      const suspendUntil = new Date();
      suspendUntil.setDate(suspendUntil.getDate() + days);

      const { error } = await supabase
        .from("profiles")
        .update({
          approval_status: "suspended",
          suspended_until: suspendUntil.toISOString(),
        })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "성공",
        description: `사용자가 ${days}일간 정지되었습니다.`,
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "정지 처리에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleCreateOrganization = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from("organizations").insert([{
        name: orgForm.name,
        slug: orgForm.slug || orgForm.name.toLowerCase().replace(/\s+/g, "-"),
        description: orgForm.description,
        max_members: orgForm.max_members,
        created_by: user?.id,
      }]);

      if (error) throw error;

      toast({
        title: "성공",
        description: "조직이 생성되었습니다.",
      });

      setIsOrgDialogOpen(false);
      fetchData();
      setOrgForm({ name: "", slug: "", description: "", max_members: 100 });
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "조직 생성에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      approved: "default",
      pending: "outline",
      rejected: "destructive",
      suspended: "secondary",
    };
    const labels: Record<string, string> = {
      approved: "승인됨",
      pending: "대기중",
      rejected: "거절됨",
      suspended: "정지됨",
    };
    return <Badge variant={variants[status] || "outline"}>{labels[status] || status}</Badge>;
  };

  const getRoleBadge = (role?: string) => {
    if (!role) return <Badge variant="secondary">역할 없음</Badge>;
    const labels: Record<string, string> = {
      student: "학생",
      teacher: "강사",
      admin: "관리자",
      operator: "운영자",
    };
    return <Badge variant="outline">{labels[role] || role}</Badge>;
  };

  const handleEditRole = (user: User) => {
    setEditingUser(user);
    setIsEditRoleOpen(true);
  };


  const pendingUsers = users.filter(u => u.approval_status === "pending");
  const approvedUsers = users.filter(u => u.approval_status === "approved");
  const suspendedUsers = users.filter(u => u.approval_status === "suspended");

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-2">
              <Users className="h-7 w-7 text-primary" />
              사용자 관리
            </h1>
            <p className="text-muted-foreground mt-2">회원 승인, 권한 설정 및 조직 관리</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground mt-1">등록된 사용자</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">승인 대기</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingUsers.length}</div>
              <p className="text-xs text-muted-foreground mt-1">처리 필요</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedUsers.length}</div>
              <p className="text-xs text-muted-foreground mt-1">승인된 사용자</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">정지된 사용자</CardTitle>
              <Ban className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{suspendedUsers.length}</div>
              <p className="text-xs text-muted-foreground mt-1">일시 정지</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">전체 사용자</TabsTrigger>
            <TabsTrigger value="pending">승인 대기 ({pendingUsers.length})</TabsTrigger>
            <TabsTrigger value="organizations">조직 관리</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>사용자 목록 ({users.length}명)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>이름</TableHead>
                      <TableHead>이메일</TableHead>
                      <TableHead>역할</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>가입일</TableHead>
                      <TableHead>작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name || "이름 없음"}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.approval_status)}</TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditRole(user)}
                              title="권한 편집"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              권한
                            </Button>
                            {user.approval_status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApproveUser(user.user_id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                                  승인
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedUser(user)}
                                >
                                  <XCircle className="h-4 w-4 mr-1 text-red-600" />
                                  거절
                                </Button>
                              </>
                            )}
                            {user.approval_status === "approved" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSuspendUser(user.user_id, 7)}
                              >
                                <Ban className="h-4 w-4 mr-1" />
                                정지
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
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>승인 대기 중인 사용자</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">승인 대기 중인 사용자가 없습니다.</p>
                ) : (
                  <div className="space-y-4">
                    {pendingUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {user.full_name?.[0] || user.email?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{user.full_name || "이름 없음"}</h4>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              신청일: {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button onClick={() => handleApproveUser(user.user_id)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            승인
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => setSelectedUser(user)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            거절
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organizations" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isOrgDialogOpen} onOpenChange={setIsOrgDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Building2 className="h-4 w-4 mr-2" />
                    조직 추가
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>새 조직 생성</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>조직명 *</Label>
                      <Input
                        value={orgForm.name}
                        onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                        placeholder="예: 서울대학교"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>슬러그</Label>
                      <Input
                        value={orgForm.slug}
                        onChange={(e) => setOrgForm({ ...orgForm, slug: e.target.value })}
                        placeholder="자동 생성"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>설명</Label>
                      <Textarea
                        value={orgForm.description}
                        onChange={(e) => setOrgForm({ ...orgForm, description: e.target.value })}
                        placeholder="조직 설명"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>최대 멤버 수</Label>
                      <Input
                        type="number"
                        value={orgForm.max_members}
                        onChange={(e) => setOrgForm({ ...orgForm, max_members: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOrgDialogOpen(false)}>
                      취소
                    </Button>
                    <Button onClick={handleCreateOrganization}>생성</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>조직 목록 ({organizations.length}개)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>조직명</TableHead>
                      <TableHead>슬러그</TableHead>
                      <TableHead>최대 멤버</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>생성일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizations.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell className="font-medium">{org.name}</TableCell>
                        <TableCell className="font-mono text-sm">{org.slug}</TableCell>
                        <TableCell>{org.max_members || "무제한"}</TableCell>
                        <TableCell>
                          <Badge variant={org.is_active ? "default" : "secondary"}>
                            {org.is_active ? "활성" : "비활성"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(org.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Rejection Dialog */}
        <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>가입 거절</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p>사용자: {selectedUser?.full_name || selectedUser?.email}</p>
              <div className="space-y-2">
                <Label>거절 사유 *</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="거절 사유를 입력하세요"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                취소
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedUser && handleRejectUser(selectedUser.user_id)}
                disabled={!rejectionReason}
              >
                거절
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Role Dialog */}
        {editingUser && (
          <EditRoleDialog
            open={isEditRoleOpen}
            onOpenChange={setIsEditRoleOpen}
            userId={editingUser.user_id}
            userName={editingUser.full_name || editingUser.email || "사용자"}
            currentRole={editingUser.role || "student"}
            onRoleUpdated={fetchData}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
