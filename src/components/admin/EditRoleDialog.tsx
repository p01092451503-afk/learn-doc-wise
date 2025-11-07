import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EditRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  currentRole: string;
  onRoleUpdated: () => void;
}

const ROLE_OPTIONS = [
  { value: "student", label: "학생", description: "강의 수강 및 학습" },
  { value: "teacher", label: "강사", description: "강의 생성 및 관리" },
  { value: "admin", label: "관리자", description: "시스템 전체 관리" },
];

export const EditRoleDialog = ({
  open,
  onOpenChange,
  userId,
  userName,
  currentRole,
  onRoleUpdated,
}: EditRoleDialogProps) => {
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setSelectedRole(currentRole);
  }, [currentRole, open]);

  const handleUpdateRole = async () => {
    if (selectedRole === currentRole) {
      toast({
        title: "알림",
        description: "변경된 권한이 없습니다.",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Updating role for user:", userId, "from", currentRole, "to", selectedRole);
      
      // 먼저 기존 역할 삭제
      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (deleteError) {
        console.error("Delete error:", deleteError);
        throw deleteError;
      }

      console.log("Previous roles deleted successfully");

      // 새 역할 추가
      const { data: insertData, error: insertError } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role: selectedRole as "student" | "teacher" | "admin" | "operator",
        })
        .select();

      if (insertError) {
        console.error("Insert error:", insertError);
        throw insertError;
      }

      console.log("New role inserted successfully:", insertData);

      toast({
        title: "성공",
        description: `${userName}님의 권한이 ${ROLE_OPTIONS.find(r => r.value === selectedRole)?.label}(으)로 변경되었습니다.`,
      });

      // UI 업데이트를 위해 약간의 딜레이 후 콜백 호출
      setTimeout(() => {
        onRoleUpdated();
        onOpenChange(false);
      }, 300);
    } catch (error: any) {
      console.error("Role update error:", error);
      toast({
        title: "오류",
        description: error.message || "권한 변경에 실패했습니다. 콘솔을 확인하세요.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRoleInfo = ROLE_OPTIONS.find(r => r.value === selectedRole);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            회원 권한 편집
          </DialogTitle>
          <DialogDescription>
            {userName}님의 권한을 변경합니다. 변경 즉시 적용됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="current-role">현재 권한</Label>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-base py-2 px-4">
                {ROLE_OPTIONS.find(r => r.value === currentRole)?.label || currentRole}
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="new-role">새 권한 선택 *</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger id="new-role">
                <SelectValue placeholder="권한 선택" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{role.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {role.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRoleInfo && (
              <p className="text-sm text-muted-foreground">
                {selectedRoleInfo.description}
              </p>
            )}
          </div>

          {selectedRole !== currentRole && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-900 dark:text-amber-100">
                ⚠️ 권한 변경은 즉시 적용되며, 사용자의 시스템 접근 권한이 변경됩니다.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            onClick={handleUpdateRole}
            disabled={isLoading || selectedRole === currentRole}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            권한 변경
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};