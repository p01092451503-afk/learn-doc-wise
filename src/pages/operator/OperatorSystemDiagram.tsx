import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Network, Users, Database, Workflow, Boxes, Layers } from "lucide-react";
import MermaidDiagram from "@/components/MermaidDiagram";

const OperatorSystemDiagram = () => {
  const systemOverview = `graph TB
    subgraph "외부 사용자"
        Student[학생]
        Teacher[강사]
        Admin[관리자]
        Operator[운영자]
    end

    subgraph "LMS 플랫폼"
        Frontend[프론트엔드<br/>React + Vite]
        
        subgraph "백엔드 서비스"
            Auth[인증/권한]
            API[REST API]
            EdgeFunctions[Edge Functions]
        end
        
        subgraph "데이터베이스"
            Users[사용자 DB]
            Courses[강좌 DB]
            Content[콘텐츠 DB]
            HRD[HRD 데이터]
        end
        
        subgraph "스토리지"
            Video[동영상]
            Files[문서/파일]
            Images[이미지]
        end
        
        subgraph "AI 서비스"
            AITutor[AI 튜터]
            AIGrading[자동 채점]
            AIAnalysis[학습 분석]
            AIReport[보고서 생성]
        end
    end

    subgraph "외부 시스템"
        Payment[결제 시스템<br/>Toss Payments]
        Video3rd[동영상 플랫폼<br/>YouTube/Vimeo]
        Email[이메일 서비스]
        AI3rd[AI API<br/>GPT/Gemini]
    end

    Student --> Frontend
    Teacher --> Frontend
    Admin --> Frontend
    Operator --> Frontend
    
    Frontend --> Auth
    Frontend --> API
    Auth --> Users
    API --> EdgeFunctions
    
    EdgeFunctions --> Courses
    EdgeFunctions --> Content
    EdgeFunctions --> HRD
    EdgeFunctions --> AITutor
    EdgeFunctions --> AIGrading
    EdgeFunctions --> AIAnalysis
    EdgeFunctions --> AIReport
    
    AITutor --> AI3rd
    AIGrading --> AI3rd
    AIAnalysis --> AI3rd
    AIReport --> AI3rd
    
    Content --> Video
    Content --> Files
    Content --> Images
    
    Video --> Video3rd
    
    API --> Payment
    EdgeFunctions --> Email

    style Frontend fill:#3b82f6,color:#fff
    style AI3rd fill:#10b981,color:#fff
    style Payment fill:#f59e0b,color:#fff`;

  const userFlow = `graph LR
    subgraph "학생 여정"
        S1[로그인/가입] --> S2[강좌 탐색]
        S2 --> S3[강좌 등록]
        S3 --> S4[학습 진행]
        S4 --> S5[과제 제출]
        S5 --> S6[퀴즈/시험]
        S6 --> S7[수료]
    end
    
    subgraph "강사 여정"
        T1[로그인] --> T2[강좌 생성]
        T2 --> T3[콘텐츠 업로드]
        T3 --> T4[과제 관리]
        T4 --> T5[출석 관리]
        T5 --> T6[채점/피드백]
        T6 --> T7[성적 처리]
    end
    
    subgraph "관리자 여정"
        A1[로그인] --> A2[사용자 관리]
        A2 --> A3[강좌 승인]
        A3 --> A4[학습 모니터링]
        A4 --> A5[HRD 기능]
        A5 --> A6[보고서 생성]
        A6 --> A7[정산 처리]
    end
    
    subgraph "운영자 여정"
        O1[로그인] --> O2[테넌트 관리]
        O2 --> O3[시스템 모니터링]
        O3 --> O4[사용량 분석]
        O4 --> O5[AI 로그 확인]
        O5 --> O6[매출 관리]
    end

    style S1 fill:#3b82f6,color:#fff
    style T1 fill:#10b981,color:#fff
    style A1 fill:#f59e0b,color:#fff
    style O1 fill:#8b5cf6,color:#fff`;

  const dataFlow = `sequenceDiagram
    participant U as 사용자
    participant F as 프론트엔드
    participant A as 인증 시스템
    participant API as API 서버
    participant DB as 데이터베이스
    participant AI as AI 서비스
    participant S as 스토리지

    U->>F: 로그인 요청
    F->>A: 인증 정보 전송
    A->>DB: 사용자 조회
    DB-->>A: 사용자 정보
    A-->>F: JWT 토큰
    F-->>U: 로그인 완료

    U->>F: 강좌 콘텐츠 요청
    F->>API: 콘텐츠 조회 (with Token)
    API->>A: 토큰 검증
    A-->>API: 권한 확인
    API->>DB: 콘텐츠 데이터 조회
    DB-->>API: 콘텐츠 정보
    API->>S: 미디어 URL 요청
    S-->>API: 스트리밍 URL
    API-->>F: 콘텐츠 + URL
    F-->>U: 콘텐츠 표시

    U->>F: 과제 제출
    F->>API: 과제 업로드
    API->>S: 파일 저장
    S-->>API: 파일 URL
    API->>DB: 제출 정보 저장
    API->>AI: AI 채점 요청
    AI-->>API: 채점 결과
    API->>DB: 성적 저장
    DB-->>API: 저장 완료
    API-->>F: 제출 완료
    F-->>U: 제출 확인`;

  const courseWorkflow = `graph TD
    A[강사: 강좌 생성] --> B{관리자 승인}
    B -->|승인| C[강좌 공개]
    B -->|반려| D[수정 요청]
    D --> A
    
    C --> E[학생 등록 시작]
    E --> F[결제 처리]
    F --> G[학습 시작]
    
    G --> H[콘텐츠 학습]
    H --> I[과제 제출]
    I --> J[AI 자동 채점]
    J --> K{통과 여부}
    K -->|통과| L[다음 단계]
    K -->|미통과| H
    
    L --> M[퀴즈/시험]
    M --> N[출석률 확인]
    N --> O{수료 요건 충족}
    O -->|충족| P[수료증 발급]
    O -->|미충족| Q[추가 학습]
    Q --> H

    style A fill:#10b981,color:#fff
    style C fill:#3b82f6,color:#fff
    style P fill:#f59e0b,color:#fff`;

  const hrdWorkflow = `graph LR
    A[훈련 과정 개설] --> B[훈련생 모집]
    B --> C[출석 관리]
    C --> D[훈련일지 작성]
    D --> E[중도탈락 모니터링]
    E --> F{위험 학생 감지}
    F -->|있음| G[상담 실시]
    F -->|없음| H[만족도 조사]
    G --> H
    H --> I[성적 평가]
    I --> J[수료 심사]
    J --> K[훈련수당 지급]
    K --> L[수료 보고서]

    style A fill:#8b5cf6,color:#fff
    style E fill:#ef4444,color:#fff
    style L fill:#10b981,color:#fff`;

  const techStack = `graph TB
    subgraph "프론트엔드"
        React[React 18]
        Vite[Vite]
        TS[TypeScript]
        TW[Tailwind CSS]
        TQ[TanStack Query]
        RR[React Router]
    end

    subgraph "UI 컴포넌트"
        Shadcn[shadcn/ui]
        Radix[Radix UI]
        Lucide[Lucide Icons]
    end

    subgraph "백엔드 (Lovable Cloud)"
        Supabase[Supabase]
        
        subgraph "Supabase 서비스"
            Auth[Auth - 인증]
            DB[PostgreSQL]
            Storage[Storage]
            Edge[Edge Functions]
            Realtime[Realtime]
        end
    end

    subgraph "AI & 외부 서비스"
        GPT[OpenAI GPT-5]
        Gemini[Google Gemini 2.5]
        Toss[Toss Payments]
        YouTube[YouTube API]
        Vimeo[Vimeo API]
    end

    subgraph "배포 & 호스팅"
        Lovable[Lovable 플랫폼]
        CDN[CDN]
    end

    React --> Vite
    React --> TS
    React --> TW
    React --> TQ
    React --> RR
    React --> Shadcn
    Shadcn --> Radix
    React --> Lucide

    React --> Supabase
    Supabase --> Auth
    Supabase --> DB
    Supabase --> Storage
    Supabase --> Edge
    Supabase --> Realtime

    Edge --> GPT
    Edge --> Gemini
    Edge --> Toss
    React --> YouTube
    React --> Vimeo

    React --> Lovable
    Lovable --> CDN

    style React fill:#3b82f6,color:#fff
    style Supabase fill:#10b981,color:#fff
    style GPT fill:#f59e0b,color:#fff
    style Gemini fill:#8b5cf6,color:#fff`;

  const layerArchitecture = `graph TD
    subgraph "프레젠테이션 계층"
        Pages[Pages<br/>페이지 컴포넌트]
        Components[Components<br/>UI 컴포넌트]
        Layouts[Layouts<br/>레이아웃]
    end

    subgraph "비즈니스 로직 계층"
        Hooks[Custom Hooks<br/>상태 관리]
        Contexts[Contexts<br/>전역 상태]
        Utils[Utils<br/>유틸리티 함수]
    end

    subgraph "데이터 접근 계층"
        API[API Client<br/>Supabase Client]
        EdgeFunc[Edge Functions<br/>서버리스 함수]
        Query[TanStack Query<br/>데이터 캐싱]
    end

    subgraph "데이터베이스 계층"
        Tables[Tables<br/>데이터 테이블]
        RLS[RLS Policies<br/>보안 정책]
        Functions[DB Functions<br/>저장 프로시저]
        Triggers[Triggers<br/>트리거]
    end

    subgraph "외부 서비스 계층"
        AIService[AI Services]
        PaymentService[Payment Services]
        MediaService[Media Services]
    end

    Pages --> Components
    Pages --> Layouts
    Pages --> Hooks
    
    Components --> Hooks
    Hooks --> Contexts
    Hooks --> Utils
    
    Hooks --> Query
    Query --> API
    API --> EdgeFunc
    
    EdgeFunc --> Tables
    EdgeFunc --> Functions
    Tables --> RLS
    Tables --> Triggers
    
    EdgeFunc --> AIService
    EdgeFunc --> PaymentService
    API --> MediaService

    style Pages fill:#3b82f6,color:#fff
    style Hooks fill:#10b981,color:#fff
    style API fill:#f59e0b,color:#fff
    style Tables fill:#8b5cf6,color:#fff
    style AIService fill:#ef4444,color:#fff`;

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
                <div className="bg-muted/30 p-4 rounded-lg overflow-x-auto">
                  <MermaidDiagram chart={systemOverview} />
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
                <div className="bg-muted/30 p-4 rounded-lg overflow-x-auto">
                  <MermaidDiagram chart={userFlow} />
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
                <div className="bg-muted/30 p-4 rounded-lg overflow-x-auto">
                  <MermaidDiagram chart={dataFlow} />
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
                    <div className="bg-muted/30 p-4 rounded-lg overflow-x-auto">
                      <MermaidDiagram chart={courseWorkflow} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">HRD 훈련 관리 워크플로우</h3>
                    <div className="bg-muted/30 p-4 rounded-lg overflow-x-auto">
                      <MermaidDiagram chart={hrdWorkflow} />
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
                <div className="bg-muted/30 p-4 rounded-lg overflow-x-auto">
                  <MermaidDiagram chart={techStack} />
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
                <div className="bg-muted/30 p-4 rounded-lg overflow-x-auto mb-6">
                  <MermaidDiagram chart={layerArchitecture} />
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
