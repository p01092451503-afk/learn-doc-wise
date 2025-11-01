import { useState, useEffect } from "react";
import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import {
  BookOpen,
  Users,
  GraduationCap,
  BarChart3,
  Award,
  MessageSquare,
  FileText,
  Calendar,
  Settings,
  CreditCard,
  Video,
  Brain,
  TrendingUp,
  CheckCircle,
  Shield,
  Layout,
  Target,
  LineChart,
  PieChart,
  Activity,
  Clock,
  Filter,
  Download,
  Upload,
  Search,
  Bell,
  Mail,
  UserCheck,
  UserPlus,
  Edit,
  Trash,
  Eye,
  Lock,
  Unlock,
  Star,
  Heart,
  ThumbsUp,
  Share2,
  Bookmark,
  PlayCircle,
  PauseCircle,
  SkipForward,
  Volume2,
  Maximize,
  MessageCircle,
  Send,
  Image,
  Paperclip,
  Smile,
  MoreVertical,
  RefreshCw,
  Save,
  Copy,
  ExternalLink,
  Globe,
  Zap,
  Package,
  ShoppingCart,
  DollarSign,
  Receipt,
  Wallet,
  Briefcase,
  Building2,
  ClipboardCheck,
  ClipboardList,
  UserCog,
  AlertCircle,
} from "lucide-react";

interface SubFeature {
  name: string;
  description: string;
}

interface MenuSection {
  menuName: string;
  menuPath: string;
  icon: LucideIcon;
  description: string;
  features: SubFeature[];
}

const OperatorFeatures = () => {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("operator-theme");
    return (saved as "dark" | "light") || "dark";
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("operator-theme");
      setTheme((saved as "dark" | "light") || "dark");
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(() => {
      const saved = localStorage.getItem("operator-theme");
      if (saved !== theme) {
        setTheme((saved as "dark" | "light") || "dark");
      }
    }, 100);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [theme]);

  const studentMenus: MenuSection[] = [
    {
      menuName: "대시보드",
      menuPath: "/student",
      icon: Layout,
      description: "학습 현황을 한눈에 파악",
      features: [
        { name: "학습 진행률 위젯", description: "현재 수강 중인 강의별 진도율 표시" },
        { name: "다가오는 과제 목록", description: "마감일이 가까운 과제 우선 표시" },
        { name: "최근 성적 요약", description: "최근 제출한 과제의 점수 및 피드백" },
        { name: "학습 시간 통계", description: "일별/주별 학습 시간 차트" },
        { name: "목표 달성도", description: "설정한 학습 목표 대비 달성률" },
        { name: "알림 센터", description: "새로운 과제, 성적, 공지사항 알림" },
        { name: "퀵 액션 버튼", description: "자주 사용하는 기능 빠른 접근" },
      ],
    },
    {
      menuName: "강의 관리",
      menuPath: "/student/courses",
      icon: BookOpen,
      description: "수강 중인 모든 강의 관리",
      features: [
        { name: "강의 목록 조회", description: "수강 중/완료된 강의 필터링" },
        { name: "강의 상세 정보", description: "커리큘럼, 강사 정보, 수강생 수" },
        { name: "강의 검색", description: "키워드, 카테고리별 강의 검색" },
        { name: "강의 즐겨찾기", description: "자주 보는 강의 북마크" },
        { name: "학습 자료 다운로드", description: "강의 자료, PPT, PDF 다운로드" },
        { name: "비디오 강의 재생", description: "온라인 비디오 스트리밍" },
        { name: "재생 속도 조절", description: "0.5x ~ 2.0x 속도 조절" },
        { name: "북마크 기능", description: "강의 중요 구간 저장" },
        { name: "메모 작성", description: "강의 시청 중 메모 작성" },
        { name: "진도율 추적", description: "강의별 시청 진행률 자동 저장" },
      ],
    },
    {
      menuName: "과제 관리",
      menuPath: "/student/assignments",
      icon: FileText,
      description: "과제 제출 및 성적 확인",
      features: [
        { name: "과제 목록", description: "제출 대기/완료/채점 완료 상태별 분류" },
        { name: "과제 상세 조회", description: "과제 요구사항, 마감일, 배점 확인" },
        { name: "파일 업로드", description: "다양한 형식의 과제 파일 제출" },
        { name: "AI 자동 채점", description: "즉시 채점 및 피드백 제공" },
        { name: "재제출 기능", description: "마감일 전 과제 수정 및 재제출" },
        { name: "성적 확인", description: "채점 결과 및 강사 피드백 확인" },
        { name: "성적 통계", description: "과목별 평균 점수 및 등급 분포" },
        { name: "마감일 알림", description: "과제 마감 전 자동 알림" },
      ],
    },
    {
      menuName: "학습 경로",
      menuPath: "/student/learning-path",
      icon: Target,
      description: "개인화된 학습 로드맵",
      features: [
        { name: "추천 학습 경로", description: "수준별 맞춤 커리큘럼 제안" },
        { name: "목표 설정", description: "학습 목표 및 기간 설정" },
        { name: "진도 추적", description: "학습 경로별 완료율 추적" },
        { name: "관련 강의 추천", description: "AI 기반 다음 강의 추천" },
        { name: "스킬 트리", description: "학습 단계별 로드맵 시각화" },
      ],
    },
    {
      menuName: "게임화",
      menuPath: "/student/gamification",
      icon: Award,
      description: "학습 동기 부여 시스템",
      features: [
        { name: "포인트 시스템", description: "학습 활동에 따른 포인트 적립" },
        { name: "배지 획득", description: "업적 달성 시 배지 수여" },
        { name: "리더보드", description: "전체/과목별 랭킹 확인" },
        { name: "레벨 시스템", description: "경험치에 따른 레벨 업" },
        { name: "도전 과제", description: "일일/주간 챌린지 참여" },
        { name: "보상 스토어", description: "포인트로 아이템 구매" },
      ],
    },
    {
      menuName: "학습 분석",
      menuPath: "/student/analytics",
      icon: BarChart3,
      description: "개인 학습 데이터 분석",
      features: [
        { name: "학습 시간 분석", description: "일별/주별/월별 학습 시간 차트" },
        { name: "성적 추이", description: "과목별 성적 변화 그래프" },
        { name: "강점/약점 분석", description: "과목별 이해도 분석" },
        { name: "출석률 통계", description: "강의별 출석 기록" },
        { name: "학습 패턴", description: "선호 학습 시간대 분석" },
        { name: "목표 대비 달성률", description: "설정한 목표 달성 현황" },
        { name: "예상 성적", description: "현재 진도 기반 최종 성적 예측" },
      ],
    },
    {
      menuName: "커뮤니티",
      menuPath: "/student/community",
      icon: MessageSquare,
      description: "학생 간 소통 공간",
      features: [
        { name: "질문 게시판", description: "학습 질문 작성 및 답변" },
        { name: "스터디 그룹", description: "스터디 모임 생성 및 참여" },
        { name: "토론 포럼", description: "주제별 토론 참여" },
        { name: "파일 공유", description: "학습 자료 공유" },
        { name: "멘토링", description: "선배 학생과 멘토링 매칭" },
        { name: "실시간 채팅", description: "그룹 채팅 및 DM" },
        { name: "투표 기능", description: "설문 및 투표 생성" },
      ],
    },
    {
      menuName: "AI 학습 도우미",
      menuPath: "/student/ai-tools",
      icon: Brain,
      description: "AI 기반 학습 지원 도구",
      features: [
        { name: "AI 챗봇", description: "24시간 학습 질문 답변 AI 어시스턴트" },
        { name: "AI 튜터", description: "개인 맞춤형 학습 가이드 및 설명" },
        { name: "AI 퀴즈 생성", description: "학습 내용 기반 자동 퀴즈 생성" },
        { name: "AI 요약", description: "긴 학습 자료를 핵심 요약" },
        { name: "AI 번역", description: "다국어 학습 자료 실시간 번역" },
        { name: "AI 학습 경로", description: "수준별 맞춤 학습 로드맵 추천" },
        { name: "AI 진도 예측", description: "학습 패턴 분석 및 완료 시기 예측" },
        { name: "AI 스터디 매칭", description: "학습 스타일 기반 스터디 메이트 추천" },
        { name: "AI 피드백", description: "과제 및 코드에 대한 즉각적 피드백" },
      ],
    },
  ];

  const teacherMenus: MenuSection[] = [
    {
      menuName: "대시보드",
      menuPath: "/teacher",
      icon: Layout,
      description: "강의 현황 종합 관리",
      features: [
        { name: "강의 통계", description: "전체 강의 수, 수강생 수, 완강률" },
        { name: "수익 요약", description: "월별 수익 및 정산 예정액" },
        { name: "최근 활동", description: "새로운 질문, 과제 제출 현황" },
        { name: "학생 진도 현황", description: "강의별 평균 진도율" },
        { name: "평점 및 리뷰", description: "강의 평점 및 최근 리뷰" },
        { name: "알림 센터", description: "학생 질문, 과제 제출 알림" },
      ],
    },
    {
      menuName: "강의 관리",
      menuPath: "/teacher/courses",
      icon: BookOpen,
      description: "강의 콘텐츠 관리",
      features: [
        { name: "강의 생성", description: "새로운 강의 과정 개설" },
        { name: "커리큘럼 구성", description: "섹션 및 레슨 구조 설정" },
        { name: "강의 편집", description: "강의 정보, 설명, 이미지 수정" },
        { name: "비디오 업로드", description: "강의 영상 업로드 및 인코딩" },
        { name: "자료 첨부", description: "PDF, PPT 등 학습 자료 첨부" },
        { name: "미리보기", description: "학생 시점 강의 미리보기" },
        { name: "강의 공개 설정", description: "공개/비공개/예약 공개" },
        { name: "가격 설정", description: "강의 가격 및 할인 설정" },
        { name: "태그 관리", description: "검색 최적화를 위한 태그 설정" },
        { name: "강의 삭제", description: "강의 아카이브 또는 영구 삭제" },
      ],
    },
    {
      menuName: "학생 관리",
      menuPath: "/teacher/students",
      icon: Users,
      description: "수강생 관리 및 모니터링",
      features: [
        { name: "수강생 목록", description: "강의별 수강생 조회" },
        { name: "학생 상세 정보", description: "개별 학생 프로필 및 학습 현황" },
        { name: "진도 추적", description: "학생별 강의 시청 진도" },
        { name: "성적 관리", description: "과제 및 시험 성적 입력" },
        { name: "출석 기록", description: "출석 여부 확인 및 수정" },
        { name: "개별 메시지", description: "학생에게 직접 메시지 전송" },
        { name: "수료증 발급", description: "강의 완료 학생에게 수료증 발급" },
        { name: "학생 필터링", description: "진도율, 성적, 출석률로 필터" },
      ],
    },
    {
      menuName: "과제 관리",
      menuPath: "/teacher/assignments",
      icon: FileText,
      description: "과제 출제 및 채점",
      features: [
        { name: "과제 생성", description: "새로운 과제 출제" },
        { name: "채점 기준 설정", description: "배점 및 평가 기준 명시" },
        { name: "마감일 설정", description: "제출 마감 시간 지정" },
        { name: "제출물 확인", description: "학생 제출 과제 조회" },
        { name: "AI 자동 채점", description: "AI 기반 자동 채점 실행" },
        { name: "수동 채점", description: "직접 점수 입력 및 수정" },
        { name: "피드백 작성", description: "개별 학생에게 피드백 제공" },
        { name: "재제출 허용", description: "학생 재제출 기회 부여" },
        { name: "통계 확인", description: "과제별 평균 점수, 제출률" },
        { name: "대량 다운로드", description: "모든 제출물 일괄 다운로드" },
      ],
    },
    {
      menuName: "출석 관리",
      menuPath: "/teacher/attendance",
      icon: CheckCircle,
      description: "실시간 출석 체크",
      features: [
        { name: "출석 코드 생성", description: "실시간 출석 체크 코드 발급" },
        { name: "QR 출석", description: "QR 코드 스캔 출석" },
        { name: "출석부", description: "일별/주별 출석 현황 조회" },
        { name: "지각/결석 관리", description: "출석 상태 수정" },
        { name: "출석률 통계", description: "학생별/강의별 출석률" },
        { name: "출석 알림", description: "미출석 학생에게 자동 알림" },
        { name: "출석 리포트", description: "기간별 출석 현황 리포트" },
      ],
    },
    {
      menuName: "수익 관리",
      menuPath: "/teacher/revenue",
      icon: CreditCard,
      description: "매출 및 정산 관리",
      features: [
        { name: "매출 대시보드", description: "일별/월별 매출 그래프" },
        { name: "강의별 수익", description: "강의당 판매 수익 현황" },
        { name: "정산 내역", description: "정산 완료 및 예정 금액" },
        { name: "환불 관리", description: "환불 요청 처리" },
        { name: "판매 통계", description: "강의 판매량, 환불률" },
        { name: "쿠폰 관리", description: "할인 쿠폰 생성 및 사용 현황" },
        { name: "세금 계산서", description: "월별 세금 계산서 발행" },
        { name: "결제 내역", description: "학생별 결제 이력 조회" },
      ],
    },
    {
      menuName: "학습 분석",
      menuPath: "/teacher/analytics",
      icon: BarChart3,
      description: "강의 성과 분석",
      features: [
        { name: "강의 조회수", description: "강의별 재생 횟수 통계" },
        { name: "완강률", description: "강의 완료율 분석" },
        { name: "평균 시청 시간", description: "레슨별 시청 시간" },
        { name: "이탈 구간 분석", description: "학생들이 이탈하는 구간 파악" },
        { name: "성적 분포", description: "과제/시험 점수 분포" },
        { name: "학생 활동", description: "질문, 댓글 등 참여도" },
        { name: "리뷰 분석", description: "평점 및 리뷰 키워드 분석" },
        { name: "비교 분석", description: "유사 강의 대비 성과 비교" },
      ],
    },
    {
      menuName: "AI 교육 도구",
      menuPath: "/teacher/ai-tools",
      icon: Brain,
      description: "AI 기반 교육 지원 도구",
      features: [
        { name: "AI 챗봇", description: "학생 질문 자동 응답 AI 어시스턴트" },
        { name: "AI 자동 채점", description: "과제 자동 채점 및 즉각 피드백" },
        { name: "AI 피드백 생성", description: "학생 과제에 대한 상세 피드백 자동 생성" },
        { name: "AI 보고서 생성", description: "학생 성과 분석 리포트 자동 작성" },
        { name: "AI 퀴즈 생성", description: "강의 내용 기반 평가 문제 자동 생성" },
        { name: "AI 요약", description: "긴 학습 자료 핵심 요약 생성" },
        { name: "AI 번역", description: "강의 자료 다국어 번역" },
      ],
    },
  ];

  const adminMenus: MenuSection[] = [
    {
      menuName: "대시보드",
      menuPath: "/admin",
      icon: Layout,
      description: "플랫폼 전체 현황",
      features: [
        { name: "핵심 지표 (KPI)", description: "총 사용자, 강의, 매출 등 주요 지표" },
        { name: "실시간 활동", description: "현재 접속자, 진행 중인 강의" },
        { name: "매출 추이", description: "일별/월별 매출 그래프" },
        { name: "신규 가입자", description: "기간별 가입자 증가 추이" },
        { name: "인기 강의", description: "조회수/판매량 기준 인기 강의" },
        { name: "시스템 상태", description: "서버, 데이터베이스 상태 모니터링" },
        { name: "최근 활동 로그", description: "주요 이벤트 타임라인" },
      ],
    },
    {
      menuName: "사용자 관리",
      menuPath: "/admin/users",
      icon: Users,
      description: "전체 회원 관리",
      features: [
        { name: "사용자 목록", description: "학생, 강사, 관리자 전체 조회" },
        { name: "회원 검색", description: "이름, 이메일, 전화번호로 검색" },
        { name: "회원 등록", description: "신규 회원 수동 등록" },
        { name: "회원 정보 수정", description: "프로필, 연락처 등 정보 수정" },
        { name: "권한 관리", description: "역할(학생/강사/관리자) 변경" },
        { name: "계정 상태", description: "활성/비활성/정지 상태 변경" },
        { name: "계정 삭제", description: "회원 탈퇴 처리" },
        { name: "로그인 이력", description: "사용자별 접속 기록" },
        { name: "대량 가입", description: "CSV 파일로 일괄 등록" },
        { name: "회원 통계", description: "가입 경로, 활동률 분석" },
      ],
    },
    {
      menuName: "강의 관리",
      menuPath: "/admin/courses",
      icon: BookOpen,
      description: "전체 강의 승인 및 관리",
      features: [
        { name: "강의 목록", description: "전체 강의 조회 및 필터링" },
        { name: "강의 승인", description: "신규 강의 검토 및 승인" },
        { name: "강의 반려", description: "부적합 강의 반려 및 사유 전달" },
        { name: "강의 수정", description: "강의 정보 직접 수정" },
        { name: "강의 삭제", description: "강의 숨김 또는 영구 삭제" },
        { name: "카테고리 관리", description: "강의 분류 체계 설정" },
        { name: "추천 강의 설정", description: "메인 페이지 추천 강의 선정" },
        { name: "강의 품질 관리", description: "저품질 강의 필터링" },
        { name: "강의 통계", description: "강의별 수강생, 매출, 평점" },
      ],
    },
    {
      menuName: "콘텐츠 관리",
      menuPath: "/admin/content",
      icon: FileText,
      description: "플랫폼 콘텐츠 관리",
      features: [
        { name: "공지사항", description: "전체 공지사항 작성 및 관리" },
        { name: "FAQ 관리", description: "자주 묻는 질문 등록 및 편집" },
        { name: "배너 관리", description: "메인 페이지 배너 이미지 설정" },
        { name: "이벤트 페이지", description: "프로모션 페이지 생성" },
        { name: "약관 관리", description: "이용약관, 개인정보처리방침 수정" },
        { name: "이메일 템플릿", description: "자동 발송 이메일 양식 편집" },
        { name: "푸시 알림", description: "전체 또는 그룹별 알림 발송" },
        { name: "SEO 설정", description: "메타 태그, 키워드 관리" },
      ],
    },
    {
      menuName: "매출 관리",
      menuPath: "/admin/revenue",
      icon: DollarSign,
      description: "플랫폼 수익 관리",
      features: [
        { name: "매출 대시보드", description: "전체 매출 현황 및 추이" },
        { name: "정산 관리", description: "강사별 정산 처리" },
        { name: "결제 내역", description: "전체 결제 트랜잭션 조회" },
        { name: "환불 처리", description: "환불 요청 검토 및 처리" },
        { name: "수수료 설정", description: "플랫폼 수수료율 조정" },
        { name: "쿠폰 관리", description: "전체 쿠폰 생성 및 사용 현황" },
        { name: "프로모션", description: "할인 이벤트 기획 및 실행" },
        { name: "매출 리포트", description: "기간별 매출 보고서 생성" },
        { name: "세금 관리", description: "부가세, 원천징수 처리" },
        { name: "결제 게이트웨이", description: "결제 수단 설정 및 관리" },
      ],
    },
    {
      menuName: "분석 도구",
      menuPath: "/admin/analytics",
      icon: BarChart3,
      description: "데이터 기반 의사결정",
      features: [
        { name: "사용자 분석", description: "사용자 행동 패턴 분석" },
        { name: "강의 성과", description: "강의별 성과 지표 분석" },
        { name: "매출 분석", description: "카테고리별, 기간별 매출 분석" },
        { name: "유입 경로", description: "마케팅 채널별 유입 분석" },
        { name: "전환율", description: "회원가입, 결제 전환율" },
        { name: "이탈률", description: "페이지별 이탈률 분석" },
        { name: "코호트 분석", description: "가입 시기별 사용자 그룹 분석" },
        { name: "A/B 테스트", description: "기능 개선 효과 측정" },
        { name: "사용자 만족도", description: "NPS, 만족도 설문 결과" },
        { name: "커스텀 리포트", description: "원하는 지표 조합으로 리포트 생성" },
      ],
    },
    {
      menuName: "시스템 모니터링",
      menuPath: "/admin/monitoring",
      icon: Activity,
      description: "시스템 상태 모니터링",
      features: [
        { name: "서버 상태", description: "CPU, 메모리, 디스크 사용률" },
        { name: "데이터베이스", description: "DB 성능 및 쿼리 모니터링" },
        { name: "API 모니터링", description: "API 응답 시간 및 에러율" },
        { name: "에러 로그", description: "시스템 에러 추적 및 분석" },
        { name: "보안 로그", description: "의심스러운 접근 기록" },
        { name: "백업 관리", description: "자동 백업 설정 및 복원" },
        { name: "알림 설정", description: "임계치 초과 시 관리자 알림" },
        { name: "성능 최적화", description: "느린 쿼리, 병목 지점 파악" },
      ],
    },
    {
      menuName: "AI 로그",
      menuPath: "/admin/ai-logs",
      icon: Brain,
      description: "AI 사용 현황 추적",
      features: [
        { name: "AI 사용 내역", description: "전체 AI 기능 사용 기록" },
        { name: "토큰 사용량", description: "일별/사용자별 토큰 소비량" },
        { name: "모델별 통계", description: "사용된 AI 모델 분포" },
        { name: "비용 분석", description: "AI 사용 비용 추정" },
        { name: "품질 모니터링", description: "AI 응답 품질 평가" },
        { name: "에러 추적", description: "AI 요청 실패 및 에러 로그" },
        { name: "사용량 한도", description: "사용자별 AI 사용 제한 설정" },
      ],
    },
    {
      menuName: "학습 관리",
      menuPath: "/admin/learning",
      icon: GraduationCap,
      description: "학습 경로 및 커리큘럼",
      features: [
        { name: "학습 경로 관리", description: "추천 학습 경로 생성 및 편집" },
        { name: "커리큘럼 승인", description: "강사 제안 커리큘럼 검토" },
        { name: "스킬 트리", description: "학습 단계 체계 설정" },
        { name: "수료증 템플릿", description: "수료증 디자인 관리" },
        { name: "자격증 연동", description: "외부 자격증과 연계" },
      ],
    },
    {
      menuName: "템플릿 관리",
      menuPath: "/admin/templates",
      icon: Package,
      description: "재사용 가능한 템플릿",
      features: [
        { name: "강의 템플릿", description: "강의 구조 템플릿 제공" },
        { name: "과제 템플릿", description: "자주 사용하는 과제 양식" },
        { name: "이메일 템플릿", description: "자동 발송 메일 양식" },
        { name: "리포트 템플릿", description: "분석 리포트 양식" },
      ],
    },
    {
      menuName: "시스템 설정",
      menuPath: "/admin/settings",
      icon: Settings,
      description: "플랫폼 전반 설정",
      features: [
        { name: "기본 설정", description: "사이트명, 로고, 연락처" },
        { name: "메뉴 관리", description: "네비게이션 메뉴 구조 편집" },
        { name: "권한 설정", description: "역할별 접근 권한 제어" },
        { name: "이메일 설정", description: "SMTP 설정 및 발신자 정보" },
        { name: "결제 설정", description: "결제 게이트웨이 연동" },
        { name: "스토리지 설정", description: "파일 저장소 용량 및 정책" },
        { name: "보안 설정", description: "비밀번호 정책, 2FA 설정" },
        { name: "언어 설정", description: "다국어 지원 설정" },
        { name: "테마 설정", description: "색상, 폰트 등 디자인 커스터마이징" },
        { name: "API 설정", description: "외부 API 키 관리" },
      ],
    },
    {
      menuName: "AI 관리 도구",
      menuPath: "/admin/ai-management",
      icon: Brain,
      description: "AI 기능 관리 및 모니터링",
      features: [
        { name: "AI 챗봇 관리", description: "전체 플랫폼 AI 챗봇 설정 및 관리" },
        { name: "AI 사용량 모니터링", description: "역할별 AI 기능 사용 현황 추적" },
        { name: "AI 보고서 자동 생성", description: "플랫폼 전체 통계 AI 리포트 작성" },
        { name: "AI 모델 설정", description: "사용 AI 모델 및 파라미터 설정" },
        { name: "AI 품질 관리", description: "AI 응답 품질 모니터링 및 개선" },
        { name: "AI 비용 관리", description: "AI 사용 비용 추적 및 예산 관리" },
        { name: "AI 사용 제한", description: "사용자별 AI 기능 접근 권한 설정" },
      ],
    },
  ];

  const operatorMenus: MenuSection[] = [
    {
      menuName: "국비과정 출석관리",
      menuPath: "/admin/attendance",
      icon: ClipboardCheck,
      description: "HRD 출석 관리 시스템",
      features: [
        { name: "일일 출석 체크", description: "학생별 출석/결석/지각 상태 관리" },
        { name: "출석부 다운로드", description: "엑셀 형식 출석부 내보내기" },
        { name: "출석률 통계", description: "학생별/과정별 출석률 분석" },
        { name: "결석 사유 관리", description: "결석 사유 등록 및 확인" },
        { name: "지각 시간 기록", description: "지각 시간 자동 계산" },
        { name: "출석 경고 알림", description: "출석률 미달 시 자동 알림" },
      ],
    },
    {
      menuName: "국비과정 성적관리",
      menuPath: "/admin/grades",
      icon: BarChart3,
      description: "HRD 성적 평가 시스템",
      features: [
        { name: "성적 입력", description: "필기/실기/과제 점수 입력" },
        { name: "성적 산출", description: "가중치 기반 총점 자동 계산" },
        { name: "성적표 출력", description: "개인별 성적표 PDF 생성" },
        { name: "등급 부여", description: "점수 구간별 등급 자동 산정" },
        { name: "성적 통계", description: "평균/최고/최저점 분석" },
        { name: "재평가 관리", description: "재시험/재평가 기록" },
      ],
    },
    {
      menuName: "국비과정 상담일지",
      menuPath: "/admin/counseling-log",
      icon: MessageSquare,
      description: "HRD 상담 기록 관리",
      features: [
        { name: "상담 일지 작성", description: "1:1 상담 내용 기록" },
        { name: "상담 유형 분류", description: "진로/학업/생활 상담 구분" },
        { name: "상담 이력 조회", description: "학생별 전체 상담 이력" },
        { name: "상담 통계", description: "상담 유형별 통계 분석" },
        { name: "후속 조치 관리", description: "상담 후 조치사항 추적" },
        { name: "상담 보고서", description: "월별/분기별 상담 보고서" },
      ],
    },
    {
      menuName: "국비과정 교육일지",
      menuPath: "/admin/training-log",
      icon: ClipboardList,
      description: "HRD 교육 일지 작성",
      features: [
        { name: "일일 교육 기록", description: "교육 내용 및 진행 상황 작성" },
        { name: "교육 시간 기록", description: "일일 교육 시간 누적 관리" },
        { name: "교육 자료 첨부", description: "교안 및 자료 파일 첨부" },
        { name: "특이사항 기록", description: "교육 중 특이사항 메모" },
        { name: "강사 평가", description: "교육 만족도 및 피드백" },
        { name: "교육일지 제출", description: "HRD 보고용 일지 제출" },
      ],
    },
    {
      menuName: "국비과정 중도탈락관리",
      menuPath: "/admin/dropout-management",
      icon: AlertCircle,
      description: "HRD 중도탈락 예방 및 관리",
      features: [
        { name: "중도탈락 위험군 식별", description: "출석률/성적 기반 위험도 분석" },
        { name: "탈락 사유 관리", description: "개인/가정/건강 사유 분류" },
        { name: "탈락 처리", description: "중도탈락 처리 및 보고" },
        { name: "예방 상담 계획", description: "위험군 대상 상담 일정 관리" },
        { name: "탈락률 통계", description: "과정별/기수별 탈락률 분석" },
        { name: "복귀 관리", description: "재입과 및 복귀 절차 관리" },
      ],
    },
    {
      menuName: "국비과정 만족도조사",
      menuPath: "/admin/satisfaction-survey",
      icon: Star,
      description: "HRD 교육 만족도 조사",
      features: [
        { name: "설문 작성", description: "교육 만족도 설문지 작성" },
        { name: "설문 배포", description: "학생별 설문 링크 발송" },
        { name: "응답 수집", description: "실시간 응답 현황 확인" },
        { name: "만족도 분석", description: "항목별 만족도 통계" },
        { name: "자유 의견 수집", description: "개선 의견 및 건의사항" },
        { name: "만족도 보고서", description: "HRD 제출용 보고서 생성" },
      ],
    },
    {
      menuName: "국비과정 훈련수당",
      menuPath: "/admin/training-allowance",
      icon: Wallet,
      description: "HRD 훈련수당 관리",
      features: [
        { name: "수당 지급 기준", description: "출석률 기반 지급 기준 설정" },
        { name: "수당 산정", description: "개인별 지급액 자동 계산" },
        { name: "지급 내역 관리", description: "월별 지급 이력 관리" },
        { name: "수당 보고서", description: "HRD 보고용 수당 내역서" },
        { name: "미지급 사유", description: "미달자 미지급 사유 관리" },
        { name: "재지급 처리", description: "오류 정정 및 재지급" },
      ],
    },
    {
      menuName: "국비과정 수료관리",
      menuPath: "/admin/training-completion",
      icon: Award,
      description: "HRD 수료 판정 및 관리",
      features: [
        { name: "수료 기준 설정", description: "출석률/성적 수료 기준 설정" },
        { name: "수료 판정", description: "기준별 자동 수료 판정" },
        { name: "수료증 발급", description: "개인별 수료증 PDF 생성" },
        { name: "미수료 관리", description: "미수료 사유 및 재교육 안내" },
        { name: "수료율 통계", description: "과정별/기수별 수료율 분석" },
        { name: "수료 보고서", description: "HRD 제출용 수료 보고서" },
      ],
    },
    {
      menuName: "AI 분석 도구",
      menuPath: "/operator/ai-tools",
      icon: Brain,
      description: "AI 기반 HRD 분석 및 보고",
      features: [
        { name: "AI 챗봇", description: "HRD 업무 관련 질의응답 AI 어시스턴트" },
        { name: "AI 보고서 자동 생성", description: "HRD 제출용 각종 보고서 자동 작성" },
        { name: "AI 중도탈락 예측", description: "학생 데이터 기반 탈락 위험도 예측" },
        { name: "AI 상담 분석", description: "상담 내용 키워드 분석 및 인사이트" },
        { name: "AI 성적 분석", description: "성적 패턴 분석 및 개선 방안 제시" },
        { name: "AI 출석 패턴 분석", description: "출석 데이터 기반 문제 학생 조기 발견" },
        { name: "AI 만족도 분석", description: "설문 응답 자동 분석 및 리포트" },
      ],
    },
  ];

  const renderMenuSection = (menu: MenuSection) => (
    <Card
      key={menu.menuPath}
      className={cn(
        "transition-colors",
        theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-300"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-500/10">
            <menu.icon className="h-5 w-5 text-violet-400" />
          </div>
          <div className="flex-1">
            <CardTitle
              className={cn(
                "text-lg transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}
            >
              {menu.menuName}
            </CardTitle>
            <p
              className={cn(
                "text-xs mt-0.5 transition-colors",
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              )}
            >
              {menu.description}
            </p>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs",
              theme === "dark" 
                ? "text-slate-300 border-slate-600" 
                : "text-slate-700 border-slate-400"
            )}
          >
            {menu.features.length}개
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {menu.features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "p-2.5 rounded-md transition-colors border",
                theme === "dark" 
                  ? "bg-slate-800/50 border-slate-700/50 hover:bg-slate-800" 
                  : "bg-white border-slate-200 hover:bg-slate-50"
              )}
            >
              <div className="flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-violet-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "font-medium text-xs leading-tight transition-colors",
                      theme === "dark" ? "text-white" : "text-slate-900"
                    )}
                  >
                    {feature.name}
                  </p>
                  <p
                    className={cn(
                      "text-[11px] mt-0.5 leading-snug transition-colors",
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    )}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <OperatorLayout>
      <div className="space-y-6">
        <div>
          <h1
            className={cn(
              "text-3xl font-bold mb-2 transition-colors flex items-center gap-2",
              theme === "dark" ? "text-white" : "text-slate-900"
            )}
          >
            <img src={logoIcon} alt="atom" className="h-8 w-8" />
            기능 목록
          </h1>
          <p
            className={cn(
              "transition-colors",
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            )}
          >
            학생, 강사, 관리자, 국비과정 모드의 모든 기능을 확인합니다
          </p>
        </div>

        <Tabs defaultValue="student" className="w-full">
          <TabsList
            className={cn(
              "grid w-full grid-cols-4 transition-colors",
              theme === "dark" ? "bg-slate-900/50" : "bg-slate-100"
            )}
          >
            <TabsTrigger value="student">
              <GraduationCap className="h-4 w-4 mr-2" />
              학생
            </TabsTrigger>
            <TabsTrigger value="teacher">
              <Users className="h-4 w-4 mr-2" />
              강사
            </TabsTrigger>
            <TabsTrigger value="admin">
              <Shield className="h-4 w-4 mr-2" />
              관리자
            </TabsTrigger>
            <TabsTrigger value="operator">
              <Building2 className="h-4 w-4 mr-2" />
              국비과정 HRD
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student" className="space-y-3 mt-6">
            <div className="grid gap-4">
              {studentMenus.map(renderMenuSection)}
            </div>
          </TabsContent>

          <TabsContent value="teacher" className="space-y-3 mt-6">
            <div className="grid gap-4">
              {teacherMenus.map(renderMenuSection)}
            </div>
          </TabsContent>

          <TabsContent value="admin" className="space-y-3 mt-6">
            <div className="grid gap-4">
              {adminMenus.map(renderMenuSection)}
            </div>
          </TabsContent>

          <TabsContent value="operator" className="space-y-3 mt-6">
            <div className="grid gap-4">
              {operatorMenus.map(renderMenuSection)}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </OperatorLayout>
  );
};

export default OperatorFeatures;
