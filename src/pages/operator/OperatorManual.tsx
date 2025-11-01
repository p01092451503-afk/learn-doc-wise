import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, ChevronRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import OperatorLayout from "@/components/layouts/OperatorLayout";

interface ManualSection {
  id: string;
  title: string;
  category: string;
  badge?: string;
  content: string;
  steps?: string[];
}

const manualData: ManualSection[] = [
  {
    id: "tenant-management",
    title: "고객사 관리",
    category: "고객사 관리",
    content: "플랫폼을 사용하는 고객사(교육 기관)를 생성하고 관리합니다.",
    steps: [
      "고객사 관리 메뉴로 이동",
      "'고객사 추가' 버튼 클릭",
      "고객사명, 담당자 정보, 요금제 선택",
      "스토리지 용량 및 사용자 수 제한 설정",
      "저장 후 고객사별 독립 운영 환경 생성"
    ]
  },
  {
    id: "usage-management",
    title: "사용량 관리",
    category: "리소스 관리",
    content: "고객사별 시스템 사용량을 모니터링하고 관리합니다.",
    steps: [
      "사용량 관리 메뉴로 이동",
      "고객사별 스토리지, 사용자 수, AI 사용량 확인",
      "사용량 한계 초과 고객사 확인",
      "요금제 업그레이드 권장",
      "사용량 제한 설정 및 알림"
    ]
  },
  {
    id: "ai-logs",
    title: "AI 로그",
    category: "AI 관리",
    badge: "AI",
    content: "전체 플랫폼의 AI 기능 사용 내역을 모니터링합니다.",
    steps: [
      "AI 로그 메뉴로 이동",
      "전체 고객사의 AI 사용량 확인",
      "고객사별/기능별 AI 활용 통계",
      "토큰 사용량 및 비용 분석",
      "AI 성능 및 응답 시간 모니터링"
    ]
  },
  {
    id: "revenue-management",
    title: "전체 매출",
    category: "재무 관리",
    content: "플랫폼 전체 매출 현황을 확인하고 분석합니다.",
    steps: [
      "전체 매출 메뉴로 이동",
      "기간별 매출 추이 확인",
      "고객사별 결제 내역 조회",
      "요금제별 수익 분석",
      "매출 보고서 및 통계 출력"
    ]
  },
  {
    id: "system-monitoring",
    title: "시스템 모니터링",
    category: "시스템 관리",
    content: "플랫폼 전체 시스템의 상태와 성능을 모니터링합니다.",
    steps: [
      "시스템 모니터링 메뉴로 이동",
      "서버 상태, CPU, 메모리 사용률 확인",
      "전체 플랫폼 동시 접속자 수",
      "API 응답 시간 및 에러율",
      "데이터베이스 성능 지표",
      "알림 설정 및 장애 대응"
    ]
  },
  {
    id: "platform-settings",
    title: "플랫폼 설정",
    category: "시스템 관리",
    content: "플랫폼 전반적인 설정을 관리합니다.",
    steps: [
      "플랫폼 설정 메뉴로 이동",
      "요금제 구성 및 가격 설정",
      "기본 시스템 설정 (언어, 타임존 등)",
      "이메일 및 알림 템플릿 관리",
      "API 키 발급 및 관리",
      "백업 및 보안 설정"
    ]
  },
  {
    id: "user-support",
    title: "고객 지원",
    category: "고객 서비스",
    content: "고객사의 문의사항과 지원 요청을 관리합니다.",
    steps: [
      "고객 지원 대시보드 확인",
      "고객사별 문의 내역 조회",
      "지원 티켓 생성 및 관리",
      "우선순위별 티켓 분류",
      "응답 및 해결 처리",
      "고객 만족도 조사"
    ]
  },
  {
    id: "feature-management",
    title: "기능 관리",
    category: "제품 관리",
    content: "플랫폼의 새로운 기능 개발 및 배포를 관리합니다.",
    steps: [
      "기능 관리 메뉴로 이동",
      "신규 기능 개발 현황 확인",
      "베타 테스트 고객사 선정",
      "기능 활성화/비활성화 설정",
      "고객사별 기능 접근 권한 관리",
      "기능 사용 통계 분석"
    ]
  },
  {
    id: "tech-stack",
    title: "기술 스택",
    category: "제품 관리",
    content: "플랫폼의 기술 스택과 인프라를 관리합니다.",
    steps: [
      "기술 스택 메뉴로 이동",
      "사용 중인 기술 목록 확인",
      "라이브러리 버전 관리",
      "의존성 업데이트",
      "보안 취약점 점검",
      "성능 최적화 모니터링"
    ]
  },
  {
    id: "government-training",
    title: "정부지원 교육",
    category: "특화 기능",
    badge: "HRD",
    content: "HRD 정부지원 교육 기능의 개발 및 관리 현황을 확인합니다.",
    steps: [
      "정부지원 교육 메뉴로 이동",
      "HRD 기능 개발 로드맵 확인",
      "고객사별 HRD 기능 활성화 설정",
      "HRD-Net 연동 상태 모니터링",
      "정부 보고서 자동 생성 기능 관리",
      "관련 법규 및 기준 업데이트"
    ]
  },
  {
    id: "data-analytics",
    title: "데이터 분석",
    category: "분석",
    content: "플랫폼 전체 데이터를 분석하고 인사이트를 도출합니다.",
    steps: [
      "데이터 분석 대시보드로 이동",
      "고객사별 활성 사용자 추이",
      "기능별 사용 빈도 분석",
      "이탈률 및 재방문율 확인",
      "매출 예측 및 성장률 분석",
      "맞춤형 리포트 생성"
    ]
  },
  {
    id: "security-management",
    title: "보안 관리",
    category: "시스템 관리",
    content: "플랫폼의 보안을 강화하고 위협을 관리합니다.",
    steps: [
      "보안 관리 메뉴로 이동",
      "보안 이벤트 로그 확인",
      "취약점 스캔 실행",
      "비정상 접근 탐지 및 차단",
      "데이터 암호화 상태 점검",
      "백업 및 복구 테스트"
    ]
  },
  {
    id: "api-management",
    title: "API 관리",
    category: "개발자 도구",
    content: "외부 연동을 위한 API를 관리하고 모니터링합니다.",
    steps: [
      "API 관리 메뉴로 이동",
      "API 키 발급 및 권한 설정",
      "API 사용량 및 호출 통계",
      "API 응답 시간 모니터링",
      "Rate Limiting 설정",
      "API 문서 업데이트"
    ]
  },
  {
    id: "billing-management",
    title: "결제 관리",
    category: "재무 관리",
    content: "고객사의 결제 및 정산을 관리합니다.",
    steps: [
      "결제 관리 메뉴로 이동",
      "고객사별 결제 내역 조회",
      "자동 결제 설정 및 관리",
      "결제 실패 건 확인 및 처리",
      "환불 처리",
      "세금계산서 발행"
    ]
  },
  {
    id: "notification-management",
    title: "알림 관리",
    category: "커뮤니케이션",
    content: "플랫폼 전체 알림을 생성하고 발송합니다.",
    steps: [
      "알림 관리 메뉴로 이동",
      "공지사항 작성 및 발송",
      "고객사별 맞춤 알림 전송",
      "이메일/SMS 발송 내역 확인",
      "알림 템플릿 관리",
      "발송 통계 및 오픈율 확인"
    ]
  }
];

const OperatorManual = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(manualData.map(item => item.category)));

  const filteredData = manualData.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.steps?.some(step => step.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <OperatorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">운영자 매뉴얼</h1>
          <p className="text-muted-foreground">
            플랫폼 운영 및 관리 방법을 확인하세요
          </p>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="기능 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={!selectedCategory ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(null)}
                >
                  전체
                </Badge>
                {categories.map(category => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manual Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              매뉴얼 목록
            </CardTitle>
            <CardDescription>
              {filteredData.length}개의 매뉴얼을 찾았습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                검색 결과가 없습니다
              </div>
            ) : (
              <Accordion type="single" collapsible className="space-y-2">
                {filteredData.map((item) => (
                  <AccordionItem key={item.id} value={item.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <ChevronRight className="h-5 w-5 text-primary" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{item.title}</span>
                            {item.badge && (
                              <Badge variant="default" className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {item.category}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-4 space-y-4">
                        <p className="text-sm text-muted-foreground">
                          {item.content}
                        </p>
                        
                        {item.steps && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2">사용 방법:</h4>
                            <ol className="space-y-2">
                              {item.steps.map((step, index) => (
                                <li key={index} className="flex gap-3 text-sm">
                                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                                    {index + 1}
                                  </span>
                                  <span className="text-muted-foreground">{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </OperatorLayout>
  );
};

export default OperatorManual;
