import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, Plus, Trash2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface OperatorAccessManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  tenantName: string;
}

export const OperatorAccessManagementDialog = ({
  open,
  onOpenChange,
  tenantId,
  tenantName,
}: OperatorAccessManagementDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOperator, setSelectedOperator] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch operators
  const { data: operators } = useQuery({
    queryKey: ["operators"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("is_operator", {
        _user_id: (await supabase.auth.getUser()).data.user?.id,
      });

      if (error) throw error;

      // Get all users with operator role
      const { data: operatorUsers, error: usersError } = await supabase
        .from("user_roles")
        .select("user_id, profiles(email)")
        .eq("role", "operator");

      if (usersError) throw usersError;
      return operatorUsers;
    },
    enabled: open,
  });

  // Fetch current access list
  const { data: accessList, refetch: refetchAccess } = useQuery({
    queryKey: ["tenant-operator-access", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("operator_tenant_access")
        .select(`
          *,
          operator:operator_id(id, email),
          granted_by_user:granted_by(id, email)
        `)
        .eq("tenant_id", tenantId)
        .order("granted_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  // Grant access mutation
  const grantAccessMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("operator_tenant_access").insert({
        operator_id: selectedOperator,
        tenant_id: tenantId,
        granted_by: user.id,
        expires_at: expiresAt || null,
        notes,
        is_active: true,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "접근 권한 부여",
        description: "운영자에게 테넌트 접근 권한이 부여되었습니다.",
      });
      refetchAccess();
      setSelectedOperator("");
      setExpiresAt("");
      setNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message || "권한 부여에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Revoke access mutation
  const revokeAccessMutation = useMutation({
    mutationFn: async (accessId: string) => {
      const { error } = await supabase
        .from("operator_tenant_access")
        .update({ is_active: false })
        .eq("id", accessId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "접근 권한 회수",
        description: "운영자의 테넌트 접근 권한이 회수되었습니다.",
      });
      refetchAccess();
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message || "권한 회수에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleGrantAccess = () => {
    if (!selectedOperator) {
      toast({
        title: "오류",
        description: "운영자를 선택해주세요.",
        variant: "destructive",
      });
      return;
    }
    grantAccessMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            대리 로그인 권한 관리 - {tenantName}
          </DialogTitle>
          <DialogDescription>
            이 테넌트에 대리 로그인할 수 있는 운영자를 관리합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Grant Access Form */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold">새 권한 부여</h3>
            
            <div className="space-y-2">
              <Label htmlFor="operator">운영자 선택</Label>
              <select
                id="operator"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedOperator}
                onChange={(e) => setSelectedOperator(e.target.value)}
              >
                <option value="">운영자 선택...</option>
                {operators?.map((op: any) => (
                  <option key={op.user_id} value={op.user_id}>
                    {op.profiles?.email || op.user_id}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires">만료 날짜 (선택사항)</Label>
              <Input
                id="expires"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">메모 (선택사항)</Label>
              <Textarea
                id="notes"
                placeholder="권한 부여 사유 등..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleGrantAccess}
              disabled={!selectedOperator || grantAccessMutation.isPending}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              권한 부여
            </Button>
          </div>

          {/* Current Access List */}
          <div className="space-y-4">
            <h3 className="font-semibold">현재 권한 목록</h3>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>운영자</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>부여 일시</TableHead>
                  <TableHead>만료 일시</TableHead>
                  <TableHead>부여자</TableHead>
                  <TableHead>메모</TableHead>
                  <TableHead>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accessList?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      권한이 부여된 운영자가 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  accessList?.map((access: any) => {
                    const isExpired = access.expires_at && new Date(access.expires_at) < new Date();
                    
                    return (
                      <TableRow key={access.id}>
                        <TableCell>
                          {access.operator?.email || "N/A"}
                        </TableCell>
                        <TableCell>
                          {access.is_active && !isExpired ? (
                            <Badge className="bg-green-600">활성</Badge>
                          ) : (
                            <Badge variant="secondary">
                              {isExpired ? "만료" : "비활성"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(access.granted_at).toLocaleString("ko-KR")}
                        </TableCell>
                        <TableCell>
                          {access.expires_at ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(access.expires_at).toLocaleString("ko-KR")}
                            </div>
                          ) : (
                            "무제한"
                          )}
                        </TableCell>
                        <TableCell>
                          {access.granted_by_user?.email || "N/A"}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {access.notes || "-"}
                        </TableCell>
                        <TableCell>
                          {access.is_active && !isExpired && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => revokeAccessMutation.mutate(access.id)}
                              disabled={revokeAccessMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
