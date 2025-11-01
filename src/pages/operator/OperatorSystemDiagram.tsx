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
