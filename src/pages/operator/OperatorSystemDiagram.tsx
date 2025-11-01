import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Network, Users, Database, Workflow, Boxes, Layers } from "lucide-react";

const OperatorSystemDiagram = () => {
  return (
    <OperatorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">시스템 컨텍스트 다이어그램</h1>
          <p className="text-muted-foreground">
            전체 시스템 아키텍처와 구성 요소를 시각화합니다
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">
              <Network className="h-4 w-4 mr-2" />
              전체 구조
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              사용자 흐름
            </TabsTrigger>
            <TabsTrigger value="data">
              <Database className="h-4 w-4 mr-2" />
              데이터 흐름
            </TabsTrigger>
            <TabsTrigger value="workflow">
              <Workflow className="h-4 w-4 mr-2" />
              워크플로우
            </TabsTrigger>
            <TabsTrigger value="tech">
              <Boxes className="h-4 w-4 mr-2" />
              기술 스택
            </TabsTrigger>
            <TabsTrigger value="architecture">
              <Layers className="h-4 w-4 mr-2" />
              아키텍처
            </TabsTrigger>
          </TabsList>

          {/* 전체 시스템 구조 */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>전체 시스템 컨텍스트</CardTitle>
                <CardDescription>
                  LMS 시스템의 전체 구조와 외부 시스템 연동
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 p-6 rounded-lg">
                  <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <h4 className="font-semibold text-blue-400 mb-2">외부 사용자</h4>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• 학생</li>
                          <li>• 강사</li>
                          <li>• 관리자</li>
                          <li>• 운영자</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                        <h4 className="font-semibold text-primary mb-2">LMS 플랫폼</h4>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• 프론트엔드 (React + Vite)</li>
                          <li>• 백엔드 서비스 (Auth, API, Edge Functions)</li>
                          <li>• 데이터베이스 (사용자, 강좌, 콘텐츠, HRD)</li>
                          <li>• 스토리지 (동영상, 문서, 이미지)</li>
                          <li>• AI 서비스 (튜터, 채점, 분석, 보고서)</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <h4 className="font-semibold text-green-400 mb-2">외부 시스템</h4>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• Toss Payments</li>
                          <li>• YouTube/Vimeo</li>
                          <li>• 이메일 서비스</li>
                          <li>• AI API (GPT/Gemini)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 사용자 역할별 흐름 */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>사용자 역할별 시스템 흐름</CardTitle>
                <CardDescription>
                  각 사용자 역할이 시스템과 상호작용하는 방식
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <h4 className="font-semibold text-blue-400 mb-3">학생 여정</h4>
                    <ol className="space-y-2 text-sm text-muted-foreground">
                      <li>1. 로그인/가입</li>
                      <li>2. 강좌 탐색</li>
                      <li>3. 강좌 등록</li>
                      <li>4. 학습 진행</li>
                      <li>5. 과제 제출</li>
                      <li>6. 퀴즈/시험</li>
                      <li>7. 수료</li>
                    </ol>
                  </div>
                  
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <h4 className="font-semibold text-green-400 mb-3">강사 여정</h4>
                    <ol className="space-y-2 text-sm text-muted-foreground">
                      <li>1. 로그인</li>
                      <li>2. 강좌 생성</li>
                      <li>3. 콘텐츠 업로드</li>
                      <li>4. 과제 관리</li>
                      <li>5. 출석 관리</li>
                      <li>6. 채점/피드백</li>
                      <li>7. 성적 처리</li>
                    </ol>
                  </div>
                  
                  <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <h4 className="font-semibold text-orange-400 mb-3">관리자 여정</h4>
                    <ol className="space-y-2 text-sm text-muted-foreground">
                      <li>1. 로그인</li>
                      <li>2. 사용자 관리</li>
                      <li>3. 강좌 승인</li>
                      <li>4. 학습 모니터링</li>
                      <li>5. HRD 기능</li>
                      <li>6. 보고서 생성</li>
                      <li>7. 정산 처리</li>
                    </ol>
                  </div>
                  
                  <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <h4 className="font-semibold text-purple-400 mb-3">운영자 여정</h4>
                    <ol className="space-y-2 text-sm text-muted-foreground">
                      <li>1. 로그인</li>
                      <li>2. 테넌트 관리</li>
                      <li>3. 시스템 모니터링</li>
                      <li>4. 사용량 분석</li>
                      <li>5. AI 로그 확인</li>
                      <li>6. 매출 관리</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 데이터 흐름 */}
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>데이터 흐름 다이어그램</CardTitle>
                <CardDescription>
                  시스템 내 주요 데이터의 흐름과 처리 과정
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold mb-3">사용자 로그인 프로세스</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-24">사용자</div>
                        <div className="flex-1 border-t-2 border-dashed"></div>
                        <div className="w-32">프론트엔드</div>
                        <div className="flex-1 border-t-2 border-dashed"></div>
                        <div className="w-32">인증 시스템</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold mb-3">강좌 콘텐츠 요청</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>1. 프론트엔드 → API (토큰 검증)</p>
                      <p>2. API → 데이터베이스 (콘텐츠 조회)</p>
                      <p>3. API → 스토리지 (미디어 URL 요청)</p>
                      <p>4. 스토리지 → 프론트엔드 (스트리밍 URL)</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold mb-3">과제 제출 및 AI 채점</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>1. 프론트엔드 → API (과제 업로드)</p>
                      <p>2. API → 스토리지 (파일 저장)</p>
                      <p>3. API → AI 서비스 (채점 요청)</p>
                      <p>4. AI 서비스 → API (채점 결과)</p>
                      <p>5. API → 데이터베이스 (성적 저장)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 워크플로우 */}
          <TabsContent value="workflow">
            <Card>
              <CardHeader>
                <CardTitle>주요 비즈니스 워크플로우</CardTitle>
                <CardDescription>
                  핵심 업무 프로세스의 흐름도
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">강좌 생성 및 운영 워크플로우</h3>
                    <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center text-xs">1</div>
                        <p className="text-sm">강사: 강좌 생성</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-500 flex items-center justify-center text-xs">2</div>
                        <p className="text-sm">관리자 승인 (승인 → 강좌 공개 / 반려 → 수정 요청)</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center text-xs">3</div>
                        <p className="text-sm">학생 등록 및 결제 처리</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center text-xs">4</div>
                        <p className="text-sm">학습 진행 (콘텐츠 → 과제 → AI 채점 → 퀴즈)</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500 flex items-center justify-center text-xs">5</div>
                        <p className="text-sm">수료 요건 확인 및 수료증 발급</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">HRD 훈련 관리 워크플로우</h3>
                    <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center text-xs">1</div>
                        <p className="text-sm">훈련 과정 개설 및 훈련생 모집</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center text-xs">2</div>
                        <p className="text-sm">출석 관리 및 훈련일지 작성</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-xs">3</div>
                        <p className="text-sm">중도탈락 모니터링 및 상담 실시</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-500 flex items-center justify-center text-xs">4</div>
                        <p className="text-sm">만족도 조사 및 성적 평가</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center text-xs">5</div>
                        <p className="text-sm">수료 심사, 훈련수당 지급, 보고서 작성</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 기술 스택 */}
          <TabsContent value="tech">
            <Card>
              <CardHeader>
                <CardTitle>기술 스택 아키텍처</CardTitle>
                <CardDescription>
                  시스템 구성 기술 및 인프라
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <h4 className="font-semibold text-blue-400 mb-3">프론트엔드</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• React 18</li>
                      <li>• Vite</li>
                      <li>• TypeScript</li>
                      <li>• Tailwind CSS</li>
                      <li>• TanStack Query</li>
                      <li>• React Router</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                    <h4 className="font-semibold text-primary mb-3">UI 컴포넌트</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• shadcn/ui</li>
                      <li>• Radix UI</li>
                      <li>• Lucide Icons</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <h4 className="font-semibold text-green-400 mb-3">백엔드 (Lovable Cloud)</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Supabase</li>
                      <li>• Auth - 인증</li>
                      <li>• PostgreSQL</li>
                      <li>• Storage</li>
                      <li>• Edge Functions</li>
                      <li>• Realtime</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <h4 className="font-semibold text-orange-400 mb-3">AI & 외부 서비스</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• OpenAI GPT-5</li>
                      <li>• Google Gemini 2.5</li>
                      <li>• Toss Payments</li>
                      <li>• YouTube API</li>
                      <li>• Vimeo API</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 시스템 아키텍처 */}
          <TabsContent value="architecture">
            <Card>
              <CardHeader>
                <CardTitle>시스템 레이어 아키텍처</CardTitle>
                <CardDescription>
                  계층별 시스템 구조 및 책임
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <h4 className="font-semibold text-blue-400 mb-2">프레젠테이션 계층</h4>
                    <p className="text-sm text-muted-foreground">Pages, Components, Layouts</p>
                  </div>
                  
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <h4 className="font-semibold text-green-400 mb-2">비즈니스 로직 계층</h4>
                    <p className="text-sm text-muted-foreground">Custom Hooks, Contexts, Utils</p>
                  </div>
                  
                  <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <h4 className="font-semibold text-orange-400 mb-2">데이터 접근 계층</h4>
                    <p className="text-sm text-muted-foreground">API Client, Edge Functions, TanStack Query</p>
                  </div>
                  
                  <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <h4 className="font-semibold text-purple-400 mb-2">데이터베이스 계층</h4>
                    <p className="text-sm text-muted-foreground">Tables, RLS Policies, Functions, Triggers</p>
                  </div>
                  
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <h4 className="font-semibold text-red-400 mb-2">외부 서비스 계층</h4>
                    <p className="text-sm text-muted-foreground">AI Services, Payment Services, Media Services</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">주요 디렉토리 구조</h4>
                    <div className="bg-muted p-4 rounded text-sm font-mono">
                      <div>src/</div>
                      <div>├── pages/ - 페이지 컴포넌트 (라우팅)</div>
                      <div>├── components/ - 재사용 가능한 UI 컴포넌트</div>
                      <div>│   ├── ui/ - shadcn 기본 컴포넌트</div>
                      <div>│   ├── layouts/ - 레이아웃 컴포넌트</div>
                      <div>│   ├── admin/ - 관리자 전용 컴포넌트</div>
                      <div>│   ├── ai/ - AI 기능 컴포넌트</div>
                      <div>│   └── video/ - 비디오 관련 컴포넌트</div>
                      <div>├── hooks/ - 커스텀 Hooks</div>
                      <div>├── contexts/ - React Context</div>
                      <div>├── integrations/ - 외부 서비스 통합</div>
                      <div>│   └── supabase/ - Supabase 클라이언트</div>
                      <div>├── lib/ - 유틸리티 함수</div>
                      <div>└── i18n/ - 다국어 지원</div>
                      <div className="mt-2">supabase/</div>
                      <div>└── functions/ - Edge Functions (서버리스)</div>
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

export default OperatorSystemDiagram;
