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
            <div className="space-y-6">
              {/* 주요 데이터 흐름 프로세스 */}
              <Card>
                <CardHeader>
                  <CardTitle>주요 데이터 흐름 프로세스</CardTitle>
                  <CardDescription>
                    핵심 기능별 데이터 처리 과정
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <h4 className="font-semibold text-blue-400 mb-3">1. 사용자 인증 및 권한 처리</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>→ 사용자: 로그인 정보 입력 (이메일, 비밀번호)</p>
                        <p>→ 프론트엔드: 입력 검증 및 API 호출</p>
                        <p>→ Auth 서비스: 자격 증명 확인</p>
                        <p>→ 데이터베이스: 사용자 정보 조회 및 역할 확인</p>
                        <p>→ Auth 서비스: JWT 토큰 생성 (사용자 ID, 역할 포함)</p>
                        <p>→ 프론트엔드: 토큰 저장 (LocalStorage/SessionStorage)</p>
                        <p>→ 프론트엔드: 역할별 대시보드로 리다이렉트</p>
                        <p className="text-xs text-blue-400 mt-2">* 이후 모든 API 요청 시 Authorization 헤더에 JWT 토큰 포함</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <h4 className="font-semibold text-green-400 mb-3">2. 강좌 콘텐츠 조회 및 스트리밍</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>→ 프론트엔드: 강좌 상세 페이지 접속</p>
                        <p>→ API: JWT 토큰 검증 및 수강 권한 확인</p>
                        <p>→ 데이터베이스: 강좌 정보 및 콘텐츠 목록 조회</p>
                        <p>→ TanStack Query: 응답 데이터 캐싱 (5분간 유효)</p>
                        <p>→ 프론트엔드: 콘텐츠 목록 렌더링</p>
                        <p>→ 사용자: 동영상 콘텐츠 클릭</p>
                        <p>→ API: 스토리지에서 임시 스트리밍 URL 생성 (1시간 유효)</p>
                        <p>→ 프론트엔드: 비디오 플레이어로 스트리밍</p>
                        <p>→ 프론트엔드: 시청 진도 실시간 업데이트 (30초마다)</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                      <h4 className="font-semibold text-purple-400 mb-3">3. 과제 제출 및 AI 자동 채점</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>→ 학생: 과제 파일 선택 및 답안 작성</p>
                        <p>→ 프론트엔드: 파일 크기 및 형식 검증</p>
                        <p>→ API: 파일 업로드 요청 (multipart/form-data)</p>
                        <p>→ 스토리지: 파일 저장 및 URL 생성</p>
                        <p>→ 데이터베이스: 제출 정보 저장 (학생 ID, 과제 ID, 파일 URL, 제출 시간)</p>
                        <p>→ Edge Function: AI 채점 요청 (비동기)</p>
                        <p>→ AI API (GPT/Gemini): 답안 분석 및 채점</p>
                        <p>→ Edge Function: 채점 결과 처리 (점수, 피드백)</p>
                        <p>→ 데이터베이스: 성적 및 피드백 저장</p>
                        <p>→ Realtime: 학생에게 채점 완료 알림 전송</p>
                        <p>→ 프론트엔드: 알림 수신 및 결과 표시</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                      <h4 className="font-semibold text-orange-400 mb-3">4. 결제 처리 흐름</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>→ 학생: 강좌 구매 버튼 클릭</p>
                        <p>→ 프론트엔드: 결제 정보 확인 및 검증</p>
                        <p>→ Edge Function: 결제 요청 생성 (toss-payment-request)</p>
                        <p>→ Toss Payments API: 결제 페이지 URL 생성</p>
                        <p>→ 프론트엔드: 결제 페이지로 리다이렉트</p>
                        <p>→ 사용자: 결제 정보 입력 및 승인</p>
                        <p>→ Toss Payments: 결제 완료 후 콜백 URL 호출</p>
                        <p>→ Edge Function: 결제 확인 (toss-payment-confirm)</p>
                        <p>→ 데이터베이스: 결제 내역 저장 및 수강 권한 부여</p>
                        <p>→ 데이터베이스: 매출 데이터 기록</p>
                        <p>→ 프론트엔드: 결제 성공 페이지 표시</p>
                        <p>→ Email 서비스: 결제 영수증 발송</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 데이터베이스 스키마 구조 */}
              <Card>
                <CardHeader>
                  <CardTitle>데이터베이스 스키마 구조</CardTitle>
                  <CardDescription>
                    주요 테이블 및 관계
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-semibold mb-3">사용자 관련 테이블</h4>
                      <div className="space-y-2 text-sm">
                        <div className="p-2 bg-muted rounded">
                          <p className="font-medium">profiles</p>
                          <p className="text-xs text-muted-foreground">사용자 프로필 (user_id, full_name, avatar_url, role)</p>
                        </div>
                        <div className="p-2 bg-muted rounded">
                          <p className="font-medium">user_progress</p>
                          <p className="text-xs text-muted-foreground">학습 진도 (user_id, course_id, progress_rate)</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-semibold mb-3">강좌 관련 테이블</h4>
                      <div className="space-y-2 text-sm">
                        <div className="p-2 bg-muted rounded">
                          <p className="font-medium">courses</p>
                          <p className="text-xs text-muted-foreground">강좌 정보 (id, title, description, instructor_id)</p>
                        </div>
                        <div className="p-2 bg-muted rounded">
                          <p className="font-medium">course_contents</p>
                          <p className="text-xs text-muted-foreground">콘텐츠 (id, course_id, type, title, video_url)</p>
                        </div>
                        <div className="p-2 bg-muted rounded">
                          <p className="font-medium">enrollments</p>
                          <p className="text-xs text-muted-foreground">수강 신청 (user_id, course_id, enrolled_at)</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-semibold mb-3">과제 및 평가</h4>
                      <div className="space-y-2 text-sm">
                        <div className="p-2 bg-muted rounded">
                          <p className="font-medium">assignments</p>
                          <p className="text-xs text-muted-foreground">과제 (id, course_id, title, due_date)</p>
                        </div>
                        <div className="p-2 bg-muted rounded">
                          <p className="font-medium">submissions</p>
                          <p className="text-xs text-muted-foreground">제출 (id, assignment_id, student_id, file_url)</p>
                        </div>
                        <div className="p-2 bg-muted rounded">
                          <p className="font-medium">grades</p>
                          <p className="text-xs text-muted-foreground">성적 (id, submission_id, score, feedback)</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-semibold mb-3">HRD 기능</h4>
                      <div className="space-y-2 text-sm">
                        <div className="p-2 bg-muted rounded">
                          <p className="font-medium">attendance</p>
                          <p className="text-xs text-muted-foreground">출석 (id, student_id, course_id, status, date)</p>
                        </div>
                        <div className="p-2 bg-muted rounded">
                          <p className="font-medium">training_logs</p>
                          <p className="text-xs text-muted-foreground">훈련일지 (id, course_id, date, content)</p>
                        </div>
                        <div className="p-2 bg-muted rounded">
                          <p className="font-medium">counseling_logs</p>
                          <p className="text-xs text-muted-foreground">상담일지 (id, student_id, type, content, date)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* API 엔드포인트 및 Edge Functions */}
              <Card>
                <CardHeader>
                  <CardTitle>API 엔드포인트 및 Edge Functions</CardTitle>
                  <CardDescription>
                    주요 API 및 서버리스 함수
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <h4 className="font-semibold text-blue-400 mb-3">AI 관련 Edge Functions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="font-medium">/ai-tutor</p>
                          <p className="text-xs text-muted-foreground">AI 튜터 질문 응답</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="font-medium">/ai-grading</p>
                          <p className="text-xs text-muted-foreground">과제 자동 채점</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="font-medium">/ai-quiz-generator</p>
                          <p className="text-xs text-muted-foreground">퀴즈 자동 생성</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="font-medium">/ai-summarize</p>
                          <p className="text-xs text-muted-foreground">콘텐츠 요약</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="font-medium">/ai-feedback</p>
                          <p className="text-xs text-muted-foreground">학습 피드백 생성</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="font-medium">/ai-learning-path</p>
                          <p className="text-xs text-muted-foreground">학습 경로 추천</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <h4 className="font-semibold text-green-400 mb-3">결제 관련 Edge Functions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="font-medium">/toss-payment-request</p>
                          <p className="text-xs text-muted-foreground">결제 요청 생성</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="font-medium">/toss-payment-confirm</p>
                          <p className="text-xs text-muted-foreground">결제 확인 및 검증</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="font-medium">/toss-payment-webhook</p>
                          <p className="text-xs text-muted-foreground">결제 웹훅 처리</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                      <h4 className="font-semibold text-orange-400 mb-3">시스템 관리 Edge Functions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="font-medium">/check-usage-limits</p>
                          <p className="text-xs text-muted-foreground">사용량 제한 확인</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="font-medium">/collect-usage-metrics</p>
                          <p className="text-xs text-muted-foreground">사용량 지표 수집</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="font-medium">/chatbot</p>
                          <p className="text-xs text-muted-foreground">AI 챗봇 대화</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 실시간 데이터 동기화 */}
              <Card>
                <CardHeader>
                  <CardTitle>실시간 데이터 동기화</CardTitle>
                  <CardDescription>
                    Supabase Realtime을 통한 실시간 업데이트
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-semibold mb-2">실시간 구독 대상</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                          <div>
                            <p className="font-medium">채팅 메시지</p>
                            <p className="text-xs text-muted-foreground">커뮤니티 채팅방, AI 튜터 대화</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                          <div>
                            <p className="font-medium">알림</p>
                            <p className="text-xs text-muted-foreground">과제 제출, 채점 완료, 공지사항</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                          <div>
                            <p className="font-medium">학습 진도</p>
                            <p className="text-xs text-muted-foreground">동영상 시청, 퀴즈 완료 등</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                          <div>
                            <p className="font-medium">출석 현황</p>
                            <p className="text-xs text-muted-foreground">실시간 출석 체크</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <h4 className="font-semibold text-blue-400 mb-2">구독 패턴</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>→ 프론트엔드: Realtime 채널 생성 및 구독</p>
                        <p>→ 데이터베이스: 데이터 변경 감지 (INSERT, UPDATE, DELETE)</p>
                        <p>→ Realtime: 변경 사항을 구독 중인 클라이언트에게 브로드캐스트</p>
                        <p>→ 프론트엔드: 변경 사항 수신 및 UI 자동 업데이트</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 캐싱 및 성능 최적화 */}
              <Card>
                <CardHeader>
                  <CardTitle>캐싱 및 성능 최적화 전략</CardTitle>
                  <CardDescription>
                    데이터 캐싱 및 성능 향상 기법
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-semibold mb-3">TanStack Query 캐싱</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p><span className="text-foreground font-medium">강좌 목록:</span> 5분 캐시</p>
                        <p><span className="text-foreground font-medium">사용자 정보:</span> 10분 캐시</p>
                        <p><span className="text-foreground font-medium">학습 진도:</span> 30초 staleTime</p>
                        <p><span className="text-foreground font-medium">성적 데이터:</span> 1분 캐시</p>
                        <p className="text-xs text-primary mt-2">* 데이터 변경 시 자동 무효화 및 재조회</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-semibold mb-3">브라우저 캐싱</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p><span className="text-foreground font-medium">정적 자산:</span> CDN 캐싱 (1년)</p>
                        <p><span className="text-foreground font-medium">이미지:</span> 브라우저 캐시 (1주)</p>
                        <p><span className="text-foreground font-medium">동영상 썸네일:</span> 브라우저 캐시 (1일)</p>
                        <p><span className="text-foreground font-medium">JWT 토큰:</span> LocalStorage/SessionStorage</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <h4 className="font-semibold text-green-400 mb-3">데이터베이스 최적화</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>• 자주 조회되는 컬럼에 인덱스 생성</p>
                        <p>• 페이지네이션으로 대용량 데이터 처리</p>
                        <p>• JOIN 최소화 및 필요한 컬럼만 SELECT</p>
                        <p>• Materialized View로 복잡한 쿼리 사전 계산</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                      <h4 className="font-semibold text-orange-400 mb-3">파일 최적화</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>• 이미지: WebP 변환 및 압축</p>
                        <p>• 동영상: 적응형 스트리밍 (HLS/DASH)</p>
                        <p>• 문서: PDF 최적화 및 압축</p>
                        <p>• Lazy Loading으로 필요 시 로드</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 워크플로우 */}
          <TabsContent value="workflow">
            <div className="space-y-6">
              {/* 학생 워크플로우 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center">
                      <span className="text-blue-400 font-bold text-sm">학생</span>
                    </div>
                    <div>
                      <CardTitle>학생 학습 워크플로우</CardTitle>
                      <CardDescription>학생의 강좌 수강 및 학습 전체 과정</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">1</div>
                      <div>
                        <p className="font-medium text-sm">회원가입 및 로그인</p>
                        <p className="text-xs text-muted-foreground mt-1">이메일 인증 → 프로필 작성 → JWT 토큰 발급 → 학생 대시보드 접속</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">2</div>
                      <div>
                        <p className="font-medium text-sm">강좌 탐색 및 검색</p>
                        <p className="text-xs text-muted-foreground mt-1">강좌 목록 조회 → 카테고리 필터링 → 난이도/가격별 정렬 → 강좌 상세정보 확인 → 커리큘럼 미리보기</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">3</div>
                      <div>
                        <p className="font-medium text-sm">강좌 등록 및 결제</p>
                        <p className="text-xs text-muted-foreground mt-1">장바구니 추가 → 결제 정보 입력 → Toss Payments 결제 → 결제 완료 → 수강 권한 자동 부여</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">4</div>
                      <div>
                        <p className="font-medium text-sm">학습 콘텐츠 시청</p>
                        <p className="text-xs text-muted-foreground mt-1">강의 선택 → 동영상 스트리밍 → 진도율 자동 기록 (30초마다) → 북마크 및 메모 작성 → 자막 및 재생속도 조절</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">5</div>
                      <div>
                        <p className="font-medium text-sm">AI 튜터 활용</p>
                        <p className="text-xs text-muted-foreground mt-1">질문 입력 → AI 튜터 응답 → 추가 설명 요청 → 관련 학습 자료 추천 → 학습 이력 저장</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">6</div>
                      <div>
                        <p className="font-medium text-sm">퀴즈 및 과제 수행</p>
                        <p className="text-xs text-muted-foreground mt-1">퀴즈 응시 → 즉시 피드백 → 과제 파일 제출 → AI 자동 채점 대기 → 성적 및 피드백 확인</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">7</div>
                      <div>
                        <p className="font-medium text-sm">커뮤니티 참여</p>
                        <p className="text-xs text-muted-foreground mt-1">게시글 작성 → 댓글 및 토론 → 스터디 그룹 참여 → AI 스터디 매칭</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">8</div>
                      <div>
                        <p className="font-medium text-sm">학습 분석 확인</p>
                        <p className="text-xs text-muted-foreground mt-1">진도율 대시보드 → 학습 시간 통계 → 취약 구간 분석 → AI 학습 경로 추천 → 목표 설정</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">9</div>
                      <div>
                        <p className="font-medium text-sm">수료 및 인증서 발급</p>
                        <p className="text-xs text-muted-foreground mt-1">수료 요건 확인 → 모든 강의 완료 → 최종 평가 통과 → 수료증 자동 발급 → PDF 다운로드</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 강사 워크플로우 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                      <span className="text-green-400 font-bold text-sm">강사</span>
                    </div>
                    <div>
                      <CardTitle>강사 강좌 운영 워크플로우</CardTitle>
                      <CardDescription>강사의 강좌 개설부터 운영까지 전체 과정</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">1</div>
                      <div>
                        <p className="font-medium text-sm">강좌 기획 및 생성</p>
                        <p className="text-xs text-muted-foreground mt-1">강좌 제목 및 설명 작성 → 카테고리 선택 → 난이도 설정 → 썸네일 업로드 → 가격 책정 → 예상 학습 시간 설정</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">2</div>
                      <div>
                        <p className="font-medium text-sm">커리큘럼 설계</p>
                        <p className="text-xs text-muted-foreground mt-1">섹션 구조 설계 → 강의 순서 배치 → 학습 목표 설정 → 선수 과정 지정 → 드래그앤드롭으로 순서 조정</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">3</div>
                      <div>
                        <p className="font-medium text-sm">콘텐츠 제작 및 업로드</p>
                        <p className="text-xs text-muted-foreground mt-1">동영상 촬영 및 편집 → YouTube/Vimeo URL 추가 또는 직접 업로드 → 자막 파일 업로드 → 강의 자료 첨부 (PDF, PPT) → 썸네일 설정</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">4</div>
                      <div>
                        <p className="font-medium text-sm">퀴즈 및 과제 생성</p>
                        <p className="text-xs text-muted-foreground mt-1">AI 퀴즈 생성 활용 → 객관식/주관식 문제 작성 → 답안 및 해설 입력 → 과제 요구사항 작성 → 제출 마감일 설정 → 배점 설정</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">5</div>
                      <div>
                        <p className="font-medium text-sm">강좌 승인 요청</p>
                        <p className="text-xs text-muted-foreground mt-1">콘텐츠 검토 완료 → 관리자에게 승인 요청 → 승인 대기 → 피드백 수신 (필요시) → 수정 후 재요청 → 최종 승인</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">6</div>
                      <div>
                        <p className="font-medium text-sm">학생 관리</p>
                        <p className="text-xs text-muted-foreground mt-1">수강생 목록 확인 → 진도율 모니터링 → 학습 패턴 분석 → 저조한 학생 식별 → 개별 메시지 발송</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">7</div>
                      <div>
                        <p className="font-medium text-sm">과제 채점 및 피드백</p>
                        <p className="text-xs text-muted-foreground mt-1">제출된 과제 확인 → AI 자동 채점 결과 검토 → 수동 채점 (필요시) → 상세 피드백 작성 → 점수 부여 → 학생에게 통보</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">8</div>
                      <div>
                        <p className="font-medium text-sm">Q&A 및 커뮤니티 관리</p>
                        <p className="text-xs text-muted-foreground mt-1">학생 질문 답변 → 토론 게시판 모니터링 → 부적절한 게시글 관리 → 공지사항 작성</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">9</div>
                      <div>
                        <p className="font-medium text-sm">강좌 분석 및 개선</p>
                        <p className="text-xs text-muted-foreground mt-1">강좌 완강률 확인 → 학생 만족도 조사 → 어려운 구간 분석 → 콘텐츠 업데이트 → 새 강의 추가</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">10</div>
                      <div>
                        <p className="font-medium text-sm">매출 확인</p>
                        <p className="text-xs text-muted-foreground mt-1">강좌별 수익 조회 → 수강생 수 추이 → 정산 내역 확인 → 수수료 확인 → 정산 요청</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 관리자 워크플로우 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center">
                      <span className="text-orange-400 font-bold text-sm">관리자</span>
                    </div>
                    <div>
                      <CardTitle>관리자 플랫폼 관리 워크플로우</CardTitle>
                      <CardDescription>관리자의 전체 플랫폼 운영 및 관리 과정</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">1</div>
                      <div>
                        <p className="font-medium text-sm">사용자 계정 관리</p>
                        <p className="text-xs text-muted-foreground mt-1">사용자 생성 (학생, 강사) → 역할 배정 → 계정 활성화/비활성화 → 비밀번호 재설정 → 사용자 정보 수정 → 계정 삭제</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">2</div>
                      <div>
                        <p className="font-medium text-sm">강좌 승인 및 관리</p>
                        <p className="text-xs text-muted-foreground mt-1">강사의 강좌 신청 확인 → 콘텐츠 품질 검토 → 저작권 확인 → 승인/반려 결정 → 피드백 전송 → 강좌 공개 설정</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">3</div>
                      <div>
                        <p className="font-medium text-sm">콘텐츠 관리 및 검수</p>
                        <p className="text-xs text-muted-foreground mt-1">부적절한 콘텐츠 모니터링 → 저작권 위반 콘텐츠 차단 → 콘텐츠 품질 기준 수립 → 정기 콘텐츠 감사</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">4</div>
                      <div>
                        <p className="font-medium text-sm">학습 현황 모니터링</p>
                        <p className="text-xs text-muted-foreground mt-1">전체 학생 진도율 확인 → 강좌별 완강률 분석 → AI 학습 분석 리포트 확인 → 중도탈락 위험 학생 조기 발견 → 개입 조치</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">5</div>
                      <div>
                        <p className="font-medium text-sm">매출 및 정산 관리</p>
                        <p className="text-xs text-muted-foreground mt-1">전체 매출 현황 확인 → 강좌별/강사별 수익 분석 → 결제 내역 조회 → 환불 처리 → 강사 정산 승인 → 정산 보고서 생성</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">6</div>
                      <div>
                        <p className="font-medium text-sm">시스템 설정 관리</p>
                        <p className="text-xs text-muted-foreground mt-1">기관 정보 설정 → 로고 및 브랜딩 → 이메일 템플릿 관리 → 알림 설정 → 권한 및 역할 관리 → 백업 스케줄 설정</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">7</div>
                      <div>
                        <p className="font-medium text-sm">AI 기능 모니터링</p>
                        <p className="text-xs text-muted-foreground mt-1">AI 사용량 확인 → 토큰 소비 현황 → AI 기능별 사용 통계 → AI 응답 품질 관리 → 비용 최적화</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">8</div>
                      <div>
                        <p className="font-medium text-sm">분석 및 보고서 생성</p>
                        <p className="text-xs text-muted-foreground mt-1">플랫폼 전체 통계 분석 → 기간별 성과 비교 → AI 보고서 생성 → 맞춤형 리포트 작성 → 경영진 보고</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">9</div>
                      <div>
                        <p className="font-medium text-sm">고객 지원 관리</p>
                        <p className="text-xs text-muted-foreground mt-1">문의사항 확인 및 답변 → 기술 지원 티켓 처리 → 버그 리포트 확인 → FAQ 업데이트</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 운영자 워크플로우 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center">
                      <span className="text-purple-400 font-bold text-sm">운영자</span>
                    </div>
                    <div>
                      <CardTitle>운영자 플랫폼 운영 워크플로우</CardTitle>
                      <CardDescription>운영자의 전체 플랫폼 운영 및 기술 관리 과정</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">1</div>
                      <div>
                        <p className="font-medium text-sm">고객사(테넌트) 관리</p>
                        <p className="text-xs text-muted-foreground mt-1">신규 고객사 생성 → 요금제 설정 → 리소스 할당 (스토리지, 사용자 수) → 도메인 설정 → 독립 환경 구성 → 초기 관리자 계정 생성</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">2</div>
                      <div>
                        <p className="font-medium text-sm">리소스 사용량 모니터링</p>
                        <p className="text-xs text-muted-foreground mt-1">고객사별 스토리지 사용량 → 사용자 수 제한 확인 → AI 토큰 소비 추적 → 데이터베이스 용량 → Edge Functions 호출량 → 초과 사용 알림</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">3</div>
                      <div>
                        <p className="font-medium text-sm">시스템 성능 모니터링</p>
                        <p className="text-xs text-muted-foreground mt-1">서버 상태 점검 (CPU, 메모리, 디스크) → API 응답 시간 → 데이터베이스 쿼리 성능 → 에러율 추적 → 병목 구간 식별 → 성능 최적화</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">4</div>
                      <div>
                        <p className="font-medium text-sm">보안 관리</p>
                        <p className="text-xs text-muted-foreground mt-1">보안 이벤트 모니터링 → 취약점 스캔 → 비정상 접근 탐지 → 데이터 암호화 상태 확인 → 백업 무결성 검증 → 보안 패치 적용</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">5</div>
                      <div>
                        <p className="font-medium text-sm">배포 및 업데이트</p>
                        <p className="text-xs text-muted-foreground mt-1">신규 기능 테스트 → 베타 고객사 선정 → Canary 배포 → 모니터링 → 전체 배포 또는 롤백 → 릴리스 노트 작성 → 고객사 공지</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">6</div>
                      <div>
                        <p className="font-medium text-sm">AI 인프라 관리</p>
                        <p className="text-xs text-muted-foreground mt-1">AI 모델 성능 모니터링 → 토큰 사용량 및 비용 분석 → 모델별 효율성 비교 → 프롬프트 최적화 → 새 모델 테스트 및 적용</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">7</div>
                      <div>
                        <p className="font-medium text-sm">결제 및 정산 관리</p>
                        <p className="text-xs text-muted-foreground mt-1">고객사별 결제 내역 확인 → 구독 갱신 관리 → 결제 실패 처리 → 환불 승인 → 월별 정산 처리 → 세금계산서 발행</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">8</div>
                      <div>
                        <p className="font-medium text-sm">고객 지원 및 기술 지원</p>
                        <p className="text-xs text-muted-foreground mt-1">고객사 문의 처리 → 기술 이슈 해결 → 버그 트래킹 및 수정 → 지식베이스 업데이트 → 교육 자료 제공</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">9</div>
                      <div>
                        <p className="font-medium text-sm">플랫폼 분석 및 인사이트</p>
                        <p className="text-xs text-muted-foreground mt-1">전체 플랫폼 지표 분석 → 고객사별 활성도 → 기능별 사용률 → 성장률 및 이탈률 → 매출 예측 → 개선 방안 도출</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">10</div>
                      <div>
                        <p className="font-medium text-sm">재해 복구 및 비즈니스 연속성</p>
                        <p className="text-xs text-muted-foreground mt-1">정기 백업 검증 → 재해 복구 계획 수립 → 복구 테스트 실행 → 장애 대응 매뉴얼 관리 → 비상 연락망 유지</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* HRD 기능 워크플로우 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
                      <span className="text-red-400 font-bold text-xs">HRD</span>
                    </div>
                    <div>
                      <CardTitle>HRD 정부지원 교육 워크플로우</CardTitle>
                      <CardDescription>HRD 전담 관리자의 정부지원 교육과정 운영 전체 과정</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">1</div>
                      <div>
                        <p className="font-medium text-sm">훈련과정 기획 및 신청</p>
                        <p className="text-xs text-muted-foreground mt-1">과정 개발 → HRD-Net 과정 등록 → 과정 승인 → 훈련 계획 수립 → 예산 편성 → 훈련생 모집 공고</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">2</div>
                      <div>
                        <p className="font-medium text-sm">훈련생 선발 및 등록</p>
                        <p className="text-xs text-muted-foreground mt-1">지원자 접수 → 자격 요건 확인 → 선발 심사 → HRD-Net 훈련생 등록 → 오리엔테이션 실시 → 서약서 징구</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">3</div>
                      <div>
                        <p className="font-medium text-sm">일일 출석 관리</p>
                        <p className="text-xs text-muted-foreground mt-1">출석 체크 시스템 가동 → QR코드/지문 인증 → 출석/지각/결석/조퇴 기록 → 출석부 자동 생성 → 출석률 실시간 계산 → 출석 경고 대상 관리</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">4</div>
                      <div>
                        <p className="font-medium text-sm">훈련일지 작성</p>
                        <p className="text-xs text-muted-foreground mt-1">일일 훈련 내용 기록 → 교육 시간 입력 → 교육 방법 기록 (이론, 실습, 평가) → 특이사항 기록 → 사진 첨부 → 강사 서명 → 일지 승인</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">5</div>
                      <div>
                        <p className="font-medium text-sm">중도탈락 관리</p>
                        <p className="text-xs text-muted-foreground mt-1">AI 위험 학생 감지 → 출석률 및 학습 참여도 분석 → 상담 실시 및 기록 → 개인 사유 확인 → 중도탈락 보고 (HRD-Net) → 사유서 징구 → 통계 관리</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">6</div>
                      <div>
                        <p className="font-medium text-sm">상담일지 관리</p>
                        <p className="text-xs text-muted-foreground mt-1">정기 상담 실시 → 상담 유형 분류 (진로, 학업, 심리) → 상담 내용 상세 기록 → 후속 조치 계획 → 다음 상담 예약 → 상담 통계 및 보고</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">7</div>
                      <div>
                        <p className="font-medium text-sm">만족도 조사</p>
                        <p className="text-xs text-muted-foreground mt-1">중간 만족도 조사 실시 → 최종 만족도 조사 → 설문 응답 수집 → 결과 분석 (평균, 만족도) → HRD-Net 제출 → 개선사항 도출</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">8</div>
                      <div>
                        <p className="font-medium text-sm">성적 평가 및 관리</p>
                        <p className="text-xs text-muted-foreground mt-1">출석 점수 계산 → 중간/기말 평가 실시 → 과제 및 실습 평가 → 총점 및 등급 산출 → 성적 입력 (HRD-Net) → 성적표 발급</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">9</div>
                      <div>
                        <p className="font-medium text-sm">훈련수당 지급</p>
                        <p className="text-xs text-muted-foreground mt-1">출석률 기준 확인 → 지급 대상자 선정 → 지급 금액 계산 → 계좌 정보 확인 → 지급 승인 → 지급 내역 기록 → HRD-Net 보고</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">10</div>
                      <div>
                        <p className="font-medium text-sm">수료 관리</p>
                        <p className="text-xs text-muted-foreground mt-1">수료 요건 확인 (출석률 80% 이상, 평가 통과) → 이수자 확정 → 수료증 발급 → HRD-Net 수료 처리 → 이수자 명단 보고 → 수료식 개최</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">11</div>
                      <div>
                        <p className="font-medium text-sm">정부 보고 및 정산</p>
                        <p className="text-xs text-muted-foreground mt-1">월별 훈련 실적 보고 → 출석부 제출 → 훈련일지 제출 → 만족도 조사 결과 제출 → 수료 현황 보고 → 훈련비 청구 → 정산 완료</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-xs flex-shrink-0 mt-1">12</div>
                      <div>
                        <p className="font-medium text-sm">사후 관리</p>
                        <p className="text-xs text-muted-foreground mt-1">수료생 취업 현황 추적 → 취업 지원 서비스 제공 → 만족도 추가 조사 → 훈련 효과성 분석 → 개선사항 반영</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
