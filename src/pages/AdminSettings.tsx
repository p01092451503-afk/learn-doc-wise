import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Save } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import MenuOrderSettings from "@/components/admin/MenuOrderSettings";

const AdminSettings = () => {
  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">시스템 설정</h1>
          <p className="text-muted-foreground mt-2">
            플랫폼의 전반적인 설정을 관리하세요
          </p>
        </div>

        {/* 메뉴 순서 설정 */}
        <MenuOrderSettings />

        {/* 일반 설정 */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>일반 설정</CardTitle>
            <CardDescription>플랫폼의 기본 정보를 설정합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="platform-name">플랫폼 이름</Label>
              <Input
                id="platform-name"
                defaultValue="atomLMS"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-email">관리자 이메일</Label>
              <Input
                id="admin-email"
                type="email"
                defaultValue="admin@atomlms.com"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-email">고객 지원 이메일</Label>
              <Input
                id="support-email"
                type="email"
                defaultValue="support@atomlms.com"
                className="rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        {/* 사용자 설정 */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>사용자 설정</CardTitle>
            <CardDescription>
              사용자 가입 및 권한 관련 설정을 관리합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allow-signup">신규 가입 허용</Label>
                <p className="text-sm text-muted-foreground">
                  새로운 사용자의 회원가입을 허용합니다
                </p>
              </div>
              <Switch id="allow-signup" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-verification">이메일 인증 필수</Label>
                <p className="text-sm text-muted-foreground">
                  가입 시 이메일 인증을 필수로 요구합니다
                </p>
              </div>
              <Switch id="email-verification" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="instructor-approval">강사 승인 필요</Label>
                <p className="text-sm text-muted-foreground">
                  강사 등록 시 관리자 승인이 필요합니다
                </p>
              </div>
              <Switch id="instructor-approval" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* 강의 설정 */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>강의 설정</CardTitle>
            <CardDescription>강의 관련 설정을 관리합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="course-approval">강의 승인 필수</Label>
                <p className="text-sm text-muted-foreground">
                  새로운 강의는 관리자 승인 후 공개됩니다
                </p>
              </div>
              <Switch id="course-approval" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-refund">자동 환불 허용</Label>
                <p className="text-sm text-muted-foreground">
                  7일 이내 자동 환불을 허용합니다
                </p>
              </div>
              <Switch id="auto-refund" defaultChecked />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="min-price">최소 강의 가격</Label>
              <Input
                id="min-price"
                type="number"
                defaultValue="10000"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commission-rate">수수료율 (%)</Label>
              <Input
                id="commission-rate"
                type="number"
                defaultValue="15"
                className="rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        {/* 알림 설정 */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>알림 설정</CardTitle>
            <CardDescription>
              시스템 알림 및 이메일 설정을 관리합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new-user-alert">신규 가입 알림</Label>
                <p className="text-sm text-muted-foreground">
                  새로운 사용자 가입 시 알림을 받습니다
                </p>
              </div>
              <Switch id="new-user-alert" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="course-submit-alert">강의 제출 알림</Label>
                <p className="text-sm text-muted-foreground">
                  새로운 강의 제출 시 알림을 받습니다
                </p>
              </div>
              <Switch id="course-submit-alert" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="payment-alert">결제 알림</Label>
                <p className="text-sm text-muted-foreground">
                  결제 발생 시 알림을 받습니다
                </p>
              </div>
              <Switch id="payment-alert" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* 보안 설정 */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>보안 설정</CardTitle>
            <CardDescription>플랫폼 보안 관련 설정입니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="two-factor">2단계 인증 활성화</Label>
                <p className="text-sm text-muted-foreground">
                  관리자 계정에 2단계 인증을 적용합니다
                </p>
              </div>
              <Switch id="two-factor" />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="session-timeout">세션 타임아웃 (분)</Label>
              <Input
                id="session-timeout"
                type="number"
                defaultValue="30"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-login-attempts">최대 로그인 시도 횟수</Label>
              <Input
                id="max-login-attempts"
                type="number"
                defaultValue="5"
                className="rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        {/* 저장 버튼 */}
        <div className="flex justify-end gap-4">
          <Button variant="outline">취소</Button>
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            변경사항 저장
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
