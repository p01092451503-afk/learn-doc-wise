import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Search, BookOpen, ChevronRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
    id: "user-management",
    title: "사용자 관리",
    category: "기본 관리",
    content: "시스템 사용자(학생, 강사, 관리자)를 생성하고 관리합니다.",
    steps: [
      "사용자 관리 메뉴로 이동",
      "우측 상단 '사용자 추가' 버튼 클릭",
      "이메일, 이름, 역할을 입력",
      "저장 버튼을 클릭하여 사용자 생성",
      "사용자 목록에서 수정/삭제 가능"
    ]
  },
  {
    id: "course-management",
    title: "강좌 관리",
    category: "강의 관리",
    content: "강좌를 생성하고 강의 내용을 관리합니다.",
    steps: [
      "강좌 관리 메뉴로 이동",
      "'강좌 추가' 버튼 클릭",
      "강좌명, 설명, 썸네일, 난이도, 시간 입력",
      "강좌 생성 후 콘텐츠 관리에서 강의 추가",
      "강의 순서는 드래그앤드롭으로 변경 가능"
    ]
  },
  {
    id: "content-management",
    title: "콘텐츠 관리",
    category: "강의 관리",
    content: "강좌별 강의 콘텐츠(동영상, 문서, 퀴즈)를 추가하고 관리합니다.",
    steps: [
      "콘텐츠 관리 메뉴로 이동",
      "강좌 선택 후 '콘텐츠 추가' 클릭",
      "콘텐츠 제목, 설명, 유형(동영상/문서/퀴즈) 선택",
      "동영상은 YouTube/Vimeo URL 또는 직접 업로드",
      "순서 변경은 드래그앤드롭으로 가능"
    ]
  },
  {
    id: "learning-management",
    title: "학습 관리",
    category: "학습 관리",
    badge: "AI",
    content: "학생들의 학습 진행 상황을 모니터링하고 관리합니다.",
    steps: [
      "학습 관리 메뉴로 이동",
      "강좌별/학생별 진도율 확인",
      "AI 분석으로 학습 패턴 파악",
      "중도 탈락 위험 학생 조기 발견",
      "맞춤형 학습 경로 추천"
    ]
  },
  {
    id: "attendance-management",
    title: "출석 관리",
    category: "HRD 기능",
    badge: "HRD",
    content: "학생들의 출석 현황을 기록하고 관리합니다.",
    steps: [
      "출석 관리 메뉴로 이동",
      "날짜와 강좌 선택",
      "학생별 출석/지각/결석 체크",
      "출석률 통계 확인",
      "출석 보고서 출력 가능"
    ]
  },
  {
    id: "training-log",
    title: "훈련일지",
    category: "HRD 기능",
    badge: "HRD",
    content: "일일 훈련 내용을 기록하고 관리합니다.",
    steps: [
      "훈련일지 메뉴로 이동",
      "'일지 작성' 버튼 클릭",
      "날짜, 강좌, 훈련 내용, 비고 입력",
      "저장 후 목록에서 확인 가능",
      "수정/삭제 가능"
    ]
  },
  {
    id: "satisfaction-survey",
    title: "만족도 조사",
    category: "HRD 기능",
    badge: "HRD",
    content: "교육 만족도 설문을 생성하고 결과를 분석합니다.",
    steps: [
      "만족도 조사 메뉴로 이동",
      "'설문 생성' 버튼 클릭",
      "질문 항목과 척도 설정",
      "대상 학생 선택 후 발송",
      "응답 결과를 차트로 확인"
    ]
  },
  {
    id: "counseling-log",
    title: "상담일지",
    category: "HRD 기능",
    badge: "HRD",
    content: "학생 상담 내용을 기록하고 관리합니다.",
    steps: [
      "상담일지 메뉴로 이동",
      "'상담 기록' 버튼 클릭",
      "학생, 날짜, 상담 유형, 내용 입력",
      "저장 후 학생별 상담 이력 확인",
      "상담 통계 및 보고서 출력"
    ]
  },
  {
    id: "dropout-management",
    title: "중도탈락 관리",
    category: "HRD 기능",
    badge: "HRD",
    content: "중도탈락 위험 학생을 관리하고 예방합니다.",
    steps: [
      "중도탈락 관리 메뉴로 이동",
      "AI가 위험 학생 자동 감지",
      "위험 수준별로 학생 분류",
      "개입 조치 기록",
      "탈락 사유 및 통계 관리"
    ]
  },
  {
    id: "training-completion",
    title: "수료 관리",
    category: "HRD 기능",
    badge: "HRD",
    content: "수료 요건을 설정하고 이수 여부를 관리합니다.",
    steps: [
      "수료 관리 메뉴로 이동",
      "강좌별 수료 요건 설정 (출석률, 과제 완료율 등)",
      "학생별 수료 요건 충족 여부 확인",
      "수료증 자동 발급",
      "이수자 명단 출력"
    ]
  },
  {
    id: "grades-management",
    title: "성적 관리",
    category: "HRD 기능",
    badge: "HRD",
    content: "학생들의 성적을 입력하고 관리합니다.",
    steps: [
      "성적 관리 메뉴로 이동",
      "강좌와 평가 항목 선택",
      "학생별 점수 입력",
      "자동 집계 및 등급 산출",
      "성적표 출력"
    ]
  },
  {
    id: "training-allowance",
    title: "훈련수당",
    category: "HRD 기능",
    badge: "HRD",
    content: "훈련수당 지급 내역을 관리합니다.",
    steps: [
      "훈련수당 메뉴로 이동",
      "지급 대상 학생 선택",
      "지급 금액 및 날짜 입력",
      "지급 내역 확인",
      "수당 지급 보고서 출력"
    ]
  },
  {
    id: "ai-logs",
    title: "AI 로그",
    category: "AI 기능",
    badge: "AI",
    content: "AI 기능 사용 내역을 확인하고 모니터링합니다.",
    steps: [
      "AI 로그 메뉴로 이동",
      "날짜별/기능별 AI 사용량 확인",
      "사용자별 AI 활용 현황",
      "토큰 사용량 및 비용 확인",
      "AI 성능 모니터링"
    ]
  },
  {
    id: "revenue-management",
    title: "매출 관리",
    category: "운영 관리",
    content: "강좌별 매출 현황을 확인하고 관리합니다.",
    steps: [
      "매출 관리 메뉴로 이동",
      "기간별 매출 통계 확인",
      "강좌별 수익 분석",
      "결제 내역 조회",
      "정산 보고서 출력"
    ]
  },
  {
    id: "system-monitoring",
    title: "시스템 모니터링",
    category: "운영 관리",
    content: "시스템 상태와 성능을 실시간으로 모니터링합니다.",
    steps: [
      "시스템 모니터링 메뉴로 이동",
      "서버 상태 및 응답 시간 확인",
      "사용자 동시 접속 현황",
      "에러 로그 확인",
      "리소스 사용량 모니터링"
    ]
  },
  {
    id: "system-settings",
    title: "시스템 설정",
    category: "운영 관리",
    content: "시스템 전반적인 설정을 관리합니다.",
    steps: [
      "시스템 설정 메뉴로 이동",
      "기본 정보 설정 (기관명, 로고 등)",
      "이메일 알림 설정",
      "권한 및 역할 관리",
      "백업 및 복구 설정"
    ]
  }
];

const AdminManual = () => {
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
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">관리자 매뉴얼</h1>
          <p className="text-muted-foreground">
            시스템 기능별 사용 방법을 확인하세요
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
    </DashboardLayout>
  );
};

export default AdminManual;
