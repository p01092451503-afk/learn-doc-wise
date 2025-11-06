import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User } from "lucide-react";

interface AdminAccountCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  contractNumber: string;
  tenantId: string;
  tenantName: string;
  tenantSubdomain: string;
  representativeEmail: string;
  representativeName: string;
}

export const AdminAccountCreationDialog = ({
  open,
  onOpenChange,
  contractId,
  contractNumber,
  tenantId,
  tenantName,
  tenantSubdomain,
  representativeEmail,
  representativeName,
}: AdminAccountCreationDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(representativeEmail);
  const [fullName, setFullName] = useState(representativeName);
  const [temporaryPassword, setTemporaryPassword] = useState("");

  const generateTemporaryPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTemporaryPassword(password);
  };

  const handleCreateAdmin = async () => {
    if (!email || !fullName || !temporaryPassword) {
      toast.error("모든 필드를 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create user account using admin API
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: temporaryPassword,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("사용자 생성 실패");

      console.log("Admin user created:", authData.user.id);

      // 2. Add membership record
      const { error: membershipError } = await supabase
        .from("memberships")
        .insert({
          user_id: authData.user.id,
          tenant_id: tenantId,
          role: "admin",
          is_active: true,
        });

      if (membershipError) throw membershipError;

      console.log("Membership created");

      // 3. Send invitation email
      const { error: emailError } = await supabase.functions.invoke(
        "send-admin-invitation",
        {
          body: {
            email,
            tenantName,
            tenantSubdomain,
            contractNumber,
            temporaryPassword,
          },
        }
      );

      if (emailError) {
        console.error("Email sending failed:", emailError);
        toast.warning("관리자 계정은 생성되었으나 이메일 발송에 실패했습니다.");
      } else {
        toast.success("관리자 계정이 생성되고 초대 이메일이 발송되었습니다.");
      }

      // 4. Update contract with admin_user_id
      const { error: contractUpdateError } = await supabase
        .from("contracts")
        .update({ technical_representative: authData.user.id })
        .eq("id", contractId);

      if (contractUpdateError) {
        console.error("Contract update failed:", contractUpdateError);
      }

      onOpenChange(false);
      setEmail(representativeEmail);
      setFullName(representativeName);
      setTemporaryPassword("");
    } catch (error: any) {
      console.error("Error creating admin:", error);
      toast.error(error.message || "관리자 계정 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>관리자 계정 생성</DialogTitle>
          <DialogDescription>
            {tenantName}의 관리자 계정을 생성하고 초대 이메일을 발송합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">
              <User className="inline w-4 h-4 mr-2" />
              이름
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="관리자 이름"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              <Mail className="inline w-4 h-4 mr-2" />
              이메일
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              <Lock className="inline w-4 h-4 mr-2" />
              임시 비밀번호
            </Label>
            <div className="flex gap-2">
              <Input
                id="password"
                type="text"
                value={temporaryPassword}
                onChange={(e) => setTemporaryPassword(e.target.value)}
                placeholder="임시 비밀번호"
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateTemporaryPassword}
              >
                생성
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              임시 비밀번호는 이메일로 전송됩니다. 첫 로그인 후 변경하도록 안내됩니다.
            </p>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium">계약 정보</p>
            <p className="text-xs text-muted-foreground">계약번호: {contractNumber}</p>
            <p className="text-xs text-muted-foreground">테넌트: {tenantName}</p>
            {tenantSubdomain && (
              <p className="text-xs text-muted-foreground">
                서브도메인: {tenantSubdomain}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleCreateAdmin} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            계정 생성 및 초대 발송
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
