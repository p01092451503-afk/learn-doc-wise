import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const OperatorOnboardingFlow = () => {
  return (
    <OperatorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">임대형 계약 온보딩 프로세스</h1>
          <p className="text-muted-foreground">
            운영자부터 테넌트까지의 전체 업무 흐름을 확인하세요
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">전체 프로세스</TabsTrigger>
            <TabsTrigger value="operator">운영자 업무</TabsTrigger>
            <TabsTrigger value="admin">관리자 업무</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>전체 온보딩 프로세스 플로우</CardTitle>
                <CardDescription>
                  계약부터 테넌트 운영까지의 전체 흐름
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/30 p-6 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
{`graph TB
    A[계약 생성] --> B{계약 승인}
    B -->|승인| C[결제 정보 입력]
    B -->|거절| Z[계약 종료]
    C --> D[결제 확인]
    D --> E[테넌트 생성]
    E --> F[관리자 계정 생성]
    F --> G[초기 설정]
    G --> H{설정 완료}
    H -->|완료| I[테넌트 활성화]
    H -->|추가 설정 필요| G
    I --> J[운영 시작]
    
    style A fill:#e1f5ff
    style E fill:#fff4e6
    style I fill:#e7f5e7
    style J fill:#f0f0ff`}
                  </pre>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Badge variant="outline">1단계</Badge>
                      계약 준비
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• 계약서 생성 및 검토</li>
                      <li>• 고객 정보 확인</li>
                      <li>• 플랜 선택</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Badge variant="outline">2단계</Badge>
                      결제 처리
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• 결제 정보 입력</li>
                      <li>• 결제 승인</li>
                      <li>• 영수증 발행</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Badge variant="outline">3단계</Badge>
                      테넌트 설정
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• 테넌트 생성</li>
                      <li>• 관리자 계정 생성</li>
                      <li>• 초기 설정 완료</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Badge variant="outline">4단계</Badge>
                      운영 시작
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• 서비스 활성화</li>
                      <li>• 모니터링 시작</li>
                      <li>• 고객 지원 준비</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>운영자 업무 프로세스</CardTitle>
                <CardDescription>
                  운영자가 수행하는 주요 업무 흐름
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/30 p-6 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
{`graph LR
    A[계약서 작성] --> B[계약 정보 입력]
    B --> C[플랜 설정]
    C --> D[결제 요청 전송]
    D --> E{결제 완료}
    E -->|완료| F[테넌트 생성 실행]
    E -->|대기| G[고객 팔로업]
    F --> H[관리자 계정 생성]
    H --> I[초기 설정 지원]
    I --> J[활성화 확인]
    J --> K[모니터링]
    
    style A fill:#e1f5ff
    style F fill:#fff4e6
    style K fill:#e7f5e7`}
                  </pre>
                </div>

                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4 py-2">
                    <h4 className="font-semibold mb-2">주요 체크포인트</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>✓ 계약 정보의 정확성 확인</li>
                      <li>✓ 결제 상태 실시간 모니터링</li>
                      <li>✓ 테넌트 생성 자동화 확인</li>
                      <li>✓ 관리자 초기 로그인 지원</li>
                      <li>✓ 시스템 정상 작동 확인</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>관리자(테넌트) 초기 설정 프로세스</CardTitle>
                <CardDescription>
                  테넌트 관리자가 진행하는 초기 설정 흐름
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/30 p-6 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
{`graph TB
    A[초대 이메일 수신] --> B[계정 활성화]
    B --> C[초기 로그인]
    C --> D[비밀번호 변경]
    D --> E[브랜딩 설정]
    E --> F[사용자 초대]
    F --> G[메뉴 구성]
    G --> H[정책 설정]
    H --> I[과정 생성]
    I --> J{설정 완료}
    J -->|완료| K[운영 시작]
    J -->|추가 설정| E
    
    style A fill:#e1f5ff
    style C fill:#fff4e6
    style K fill:#e7f5e7`}
                  </pre>
                </div>

                <div className="space-y-4">
                  <div className="border-l-4 border-secondary pl-4 py-2">
                    <h4 className="font-semibold mb-2">필수 설정 항목</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">1. 브랜딩</p>
                        <p className="text-xs text-muted-foreground">로고, 색상, 도메인 설정</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">2. 사용자 관리</p>
                        <p className="text-xs text-muted-foreground">강사/학생 초대 및 권한 설정</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">3. 메뉴 구성</p>
                        <p className="text-xs text-muted-foreground">필요한 메뉴 활성화 및 순서 조정</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">4. 정책 설정</p>
                        <p className="text-xs text-muted-foreground">이용약관, 개인정보처리방침 등록</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">5. 콘텐츠 생성</p>
                        <p className="text-xs text-muted-foreground">과정 및 학습 자료 업로드</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OperatorLayout>
  );
};

export default OperatorOnboardingFlow;