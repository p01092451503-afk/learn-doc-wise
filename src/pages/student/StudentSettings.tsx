import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Bell, Lock, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudentSettings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // 프로필 정보
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  
  // 비밀번호 변경
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // 알림 설정
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [courseUpdates, setCourseUpdates] = useState(true);
  const [assignmentReminders, setAssignmentReminders] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      
      setUser(user);
      setEmail(user.email || "");
      
      // 프로필 정보 로드
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (profile) {
        setFullName(profile.full_name || "");
      }
      
      // 알림 설정 로드
      const { data: notifPrefs } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (notifPrefs) {
        setEmailNotifications(notifPrefs.email_enabled ?? true);
        setCourseUpdates(notifPrefs.course_updates ?? true);
        setAssignmentReminders(notifPrefs.assignment_reminders ?? true);
      }
    } catch (error: any) {
      console.error("Error loading user data:", error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // 프로필 업데이트 (암호화 RPC 사용)
      const { error: profileError } = await supabase.rpc('update_profile', {
        p_full_name: fullName,
        p_phone_number: null, // phone_number 필드가 있다면 여기에 추가
      });
      
      if (profileError) throw profileError;
      
      toast({
        title: "프로필 업데이트 완료",
        description: "프로필 정보가 성공적으로 업데이트되었습니다.",
      });
    } catch (error: any) {
      toast({
        title: "업데이트 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "입력 오류",
        description: "새 비밀번호를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "새 비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: "비밀번호 오류",
        description: "비밀번호는 최소 6자 이상이어야 합니다.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      toast({
        title: "비밀번호 변경 완료",
        description: "비밀번호가 성공적으로 변경되었습니다.",
      });
    } catch (error: any) {
      toast({
        title: "비밀번호 변경 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("notification_preferences")
        .upsert({
          user_id: user.id,
          email_enabled: emailNotifications,
          course_updates: courseUpdates,
          assignment_reminders: assignmentReminders,
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
      
      toast({
        title: "알림 설정 업데이트 완료",
        description: "알림 설정이 성공적으로 업데이트되었습니다.",
      });
    } catch (error: any) {
      toast({
        title: "업데이트 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">설정</h1>
          <p className="text-muted-foreground">계정 정보 및 알림 설정을 관리합니다</p>
        </div>

        {/* 프로필 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              프로필 정보
            </CardTitle>
            <CardDescription>기본 프로필 정보를 수정할 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">이름</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="이름을 입력하세요"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">이메일은 변경할 수 없습니다</p>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button onClick={handleUpdateProfile} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                프로필 저장
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 비밀번호 변경 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              비밀번호 변경
            </CardTitle>
            <CardDescription>보안을 위해 정기적으로 비밀번호를 변경하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">새 비밀번호</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호 (최소 6자)"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="새 비밀번호 확인"
              />
            </div>
            
            <div className="flex justify-end pt-4">
              <Button onClick={handleChangePassword} disabled={loading}>
                <Lock className="h-4 w-4 mr-2" />
                비밀번호 변경
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 알림 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              알림 설정
            </CardTitle>
            <CardDescription>받고 싶은 알림을 선택하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotifications" className="text-base cursor-pointer">
                  이메일 알림
                </Label>
                <p className="text-sm text-muted-foreground">
                  이메일로 알림을 받습니다
                </p>
              </div>
              <Switch
                id="emailNotifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="courseUpdates" className="text-base cursor-pointer">
                  강의 업데이트
                </Label>
                <p className="text-sm text-muted-foreground">
                  새로운 강의 콘텐츠가 추가되면 알림을 받습니다
                </p>
              </div>
              <Switch
                id="courseUpdates"
                checked={courseUpdates}
                onCheckedChange={setCourseUpdates}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="assignmentReminders" className="text-base cursor-pointer">
                  과제 알림
                </Label>
                <p className="text-sm text-muted-foreground">
                  과제 마감일이 다가오면 알림을 받습니다
                </p>
              </div>
              <Switch
                id="assignmentReminders"
                checked={assignmentReminders}
                onCheckedChange={setAssignmentReminders}
              />
            </div>
            
            <div className="flex justify-end pt-4">
              <Button onClick={handleUpdateNotifications} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                알림 설정 저장
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentSettings;
