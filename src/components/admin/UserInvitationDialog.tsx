import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Mail, Lock, UserPlus } from "lucide-react";

interface UserInvitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  tenantName: string;
  onSuccess?: () => void;
}

export const UserInvitationDialog = ({
  open,
  onOpenChange,
  tenantId,
  tenantName,
  onSuccess,
}: UserInvitationDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"student" | "instructor">("student");
  const [temporaryPassword, setTemporaryPassword] = useState("");

  const generateTemporaryPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTemporaryPassword(password);
  };

  const handleInvite = async () => {
    if (!email || !fullName || !temporaryPassword) {
      toast.error("모든 필드를 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create user account
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

      console.log("User created:", authData.user.id);

      // 2. Add membership record
      const { error: membershipError } = await supabase
        .from("memberships")
        .insert({
          user_id: authData.user.id,
          tenant_id: tenantId,
          role: role,
          is_active: true,
        });

      if (membershipError) throw membershipError;

      console.log("Membership created");

      // 3. Get current user's name for invitation
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user?.id)
        .single();

      const inviterName = profile?.full_name || "관리자";

      // 4. Send invitation email
      const { error: emailError } = await supabase.functions.invoke(
        "send-user-invitation",
        {
          body: {
            email,
            role,
            tenantName,
            inviterName,
            temporaryPassword,
          },
        }
      );

      if (emailError) {
        console.error("Email sending failed:", emailError);
        toast.warning("사용자가 생성되었으나 이메일 발송에 실패했습니다.");
      } else {
        toast.success(`${role === 'instructor' ? '강사' : '학생'}가 초대되었습니다.`);
      }

      onOpenChange(false);
      setEmail("");
      setFullName("");
      setRole("student");
      setTemporaryPassword("");
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error inviting user:", error);
      toast.error(error.message || "사용자 초대에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>사용자 초대</DialogTitle>
          <DialogDescription>
            새로운 강사 또는 학생을 초대합니다
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role">역할</Label>
            <Select value={role} onValueChange={(value: any) => setRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">학생</SelectItem>
                <SelectItem value="instructor">강사</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">
              <UserPlus className="inline w-4 h-4 mr-2" />
              이름
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="사용자 이름"
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
              placeholder="user@example.com"
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
            <p className="text-sm font-medium">{tenantName}</p>
            <p className="text-xs text-muted-foreground">
              {role === 'instructor' ? '강사' : '학생'}로 초대됩니다
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleInvite} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            초대 발송
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
