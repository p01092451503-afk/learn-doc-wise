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
  // 대시보드 및 개요
  {
    id: "admin-dashboard",
    title: "관리자 대시보드",
    category: "대시보드 및 개요",
    content: "전체 시스템 현황을 한눈에 파악하고 주요 지표를 모니터링합니다.",
    steps: [
      "대시보드에서 전체 통계 확인 (학생 수, 강좌 수, 수익 등)",
      "최근 활동 내역 확인",
      "주요 알림 및 경고 사항 확인",
      "빠른 접근 메뉴로 주요 기능 이동"
    ]
  },
  
  // 사용자 관리
  {
    id: "user-management",
    title: "사용자 관리",
    category: "사용자 관리",
    content: "시스템 사용자(학생, 강사, 관리자)를 생성하고 관리합니다.",
    steps: [
      "사용자 관리 메뉴로 이동",
      "우측 상단 '사용자 추가' 버튼 클릭",
      "이메일, 이름, 역할(student/teacher/admin) 선택",
      "추가 정보 입력 (연락처, 소속 등)",
      "저장 버튼을 클릭하여 사용자 생성",
      "사용자 목록에서 검색, 필터링, 수정, 삭제 가능",
      "역할 변경 시 권한 자동 조정"
    ]
  },
  
  // 강좌 관리
  {
    id: "course-management",
    title: "강좌 관리",
    category: "강좌 관리",
    content: "강좌를 생성하고 기본 정보를 관리합니다.",
    steps: [
      "강좌 관리 메뉴로 이동",
      "'강좌 추가' 버튼 클릭",
      "강좌명, 설명, 카테고리 입력",
      "썸네일 이미지 업로드",
      "난이도(초급/중급/고급) 선택",
      "예상 학습 시간 입력",
      "가격 및 할인율 설정",
      "강사 배정",
      "공개/비공개 설정",
      "강좌 승인 및 게시",
      "강좌 복제 기능으로 빠른 생성"
    ]
  },
  {
    id: "content-management",
    title: "콘텐츠 관리",
    category: "강좌 관리",
    content: "강좌별 학습 콘텐츠(동영상, 문서, 퀴즈)를 추가하고 관리합니다.",
    steps: [
      "콘텐츠 관리 메뉴로 이동",
      "강좌 선택 후 '콘텐츠 추가' 클릭",
      "콘텐츠 유형 선택 (동영상/문서/퀴즈/과제)",
      "콘텐츠 제목 및 설명 입력",
      "동영상: YouTube/Vimeo URL 입력 또는 직접 업로드",
      "문서: PDF, PPT, 문서 파일 업로드",
      "퀴즈: 문제 및 답안 작성",
      "순서 변경은 드래그앤드롭으로 가능",
      "학습 완료 조건 설정 (시청 시간, 퀴즈 점수 등)",
      "콘텐츠 미리보기 기능"
    ]
  },
  {
    id: "public-courses",
    title: "공개 강좌",
    category: "강좌 관리",
    content: "비회원도 볼 수 있는 공개 강좌를 관리합니다.",
    steps: [
      "강좌 관리에서 공개 설정 활성화",
      "공개 강좌 페이지에서 미리보기 확인",
      "무료 체험 콘텐츠 설정",
      "등록 전환율 모니터링"
    ]
  },
  {
    id: "course-templates",
    title: "강좌 템플릿",
    category: "강좌 관리",
    content: "미리 정의된 강좌 템플릿을 관리하고 적용합니다.",
    steps: [
      "템플릿 관리 메뉴로 이동",
      "기존 템플릿 목록 확인",
      "템플릿 선택 후 미리보기",
      "'템플릿 적용' 클릭하여 새 강좌 생성",
      "커스텀 템플릿 생성 및 저장"
    ]
  },
  
  // 학습 관리
  {
    id: "learning-management",
    title: "학습 관리",
    category: "학습 관리",
    badge: "AI",
    content: "학생들의 학습 진행 상황을 모니터링하고 관리합니다.",
    steps: [
      "학습 관리 메뉴로 이동",
      "전체 강좌별 진도율 확인",
      "학생별 학습 진행 상황 확인",
      "AI 분석으로 학습 패턴 파악",
      "학습 속도가 느린 학생 식별",
      "중도 탈락 위험 학생 조기 발견",
      "맞춤형 학습 경로 추천",
      "학습 알림 및 독려 메시지 발송"
    ]
  },
  {
    id: "assignments",
    title: "과제 관리",
    category: "학습 관리",
    badge: "AI",
    content: "과제를 생성하고 제출물을 관리 및 채점합니다.",
    steps: [
      "과제 관리 메뉴로 이동",
      "'과제 생성' 버튼 클릭",
      "과제 제목, 설명, 마감일 입력",
      "첨부 파일 업로드 (참고 자료)",
      "배점 및 채점 기준 설정",
      "대상 학생 또는 그룹 선택",
      "제출된 과제 목록 확인",
      "AI 자동 채점 기능 활용",
      "수동 채점 및 피드백 작성",
      "과제 제출률 및 성적 통계 확인"
    ]
  },
  {
    id: "analytics",
    title: "학습 분석",
    category: "학습 관리",
    badge: "AI",
    content: "학습 데이터를 분석하고 인사이트를 도출합니다.",
    steps: [
      "분석 메뉴로 이동",
      "기간별 학습 활동 추이 확인",
      "강좌별 완강률 분석",
      "학생별 학습 시간 및 참여도 분석",
      "AI 기반 학습 예측 분석",
      "취약 구간 및 어려운 콘텐츠 식별",
      "성과 지표 대시보드 확인",
      "분석 보고서 다운로드"
    ]
  },
  
  // 출석 관리
  {
    id: "attendance-management",
    title: "출석 관리",
    category: "HRD 기능",
    badge: "HRD",
    content: "학생들의 출석 현황을 기록하고 관리합니다.",
    steps: [
      "출석 관리 메뉴로 이동",
      "날짜와 강좌 선택",
      "학생 목록 확인",
      "학생별 출석/지각/결석/조퇴 체크",
      "출석 사유 입력 (결석, 지각 시)",
      "출석률 통계 자동 계산",
      "출석 경고 대상 학생 확인",
      "출석부 보고서 출력 및 다운로드",
      "월별/학기별 출석 현황 확인"
    ]
  },
  {
    id: "attendance-checker",
    title: "출석 체크 시스템",
    category: "HRD 기능",
    badge: "HRD",
    content: "실시간 출석 체크 및 QR코드 출석 기능을 제공합니다.",
    steps: [
      "출석 체크 시스템 활성화",
      "QR코드 생성 및 표시",
      "학생 QR코드 스캔으로 자동 출석 처리",
      "실시간 출석 현황 모니터링",
      "지각/결석 자동 판정"
    ]
  },
  
  // HRD 전용 기능
  {
    id: "training-log",
    title: "훈련일지",
    category: "HRD 기능",
    badge: "HRD",
    content: "일일 훈련 내용을 기록하고 관리합니다.",
    steps: [
      "훈련일지 메뉴로 이동",
      "'일지 작성' 버튼 클릭",
      "날짜 및 강좌 선택",
      "훈련 시간 입력 (시작 시간, 종료 시간)",
      "훈련 내용 상세 기록",
      "교육 방법 선택 (강의, 실습, 토론 등)",
      "특이사항 및 비고 입력",
      "첨부 파일 업로드 (사진, 문서 등)",
      "저장 후 목록에서 확인",
      "수정/삭제/복사 가능",
      "월별 훈련일지 통계",
      "훈련일지 보고서 출력"
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
      "설문 제목 및 설명 입력",
      "질문 항목 추가 (객관식, 주관식, 척도)",
      "평가 척도 설정 (5점 척도, 10점 척도 등)",
      "대상 학생 또는 그룹 선택",
      "설문 기간 설정",
      "설문 발송 (이메일, 알림)",
      "응답 현황 실시간 확인",
      "응답 결과를 차트로 시각화",
      "평균, 표준편차 등 통계 분석",
      "만족도 보고서 생성 및 다운로드"
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
      "학생 선택",
      "상담 날짜 및 시간 입력",
      "상담 유형 선택 (진로, 학업, 심리, 기타)",
      "상담 내용 상세 기록",
      "상담 결과 및 후속 조치 입력",
      "다음 상담 일정 예약",
      "저장 후 학생별 상담 이력 확인",
      "상담 통계 및 분석",
      "상담 보고서 출력"
    ]
  },
  {
    id: "dropout-management",
    title: "중도탈락 관리",
    category: "HRD 기능",
    badge: "HRD & AI",
    content: "중도탈락 위험 학생을 관리하고 예방합니다.",
    steps: [
      "중도탈락 관리 메뉴로 이동",
      "AI가 위험 학생 자동 감지 (출석률, 학습 참여도 등)",
      "위험 수준별로 학생 분류 (높음/중간/낮음)",
      "위험 학생 상세 정보 확인",
      "개입 조치 계획 수립",
      "상담 및 지원 활동 기록",
      "탈락 방지 프로그램 배정",
      "실제 탈락 시 사유 기록",
      "탈락률 통계 및 분석",
      "예방 효과 모니터링"
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
      "강좌별 수료 요건 설정",
      "출석률 기준 설정 (예: 80% 이상)",
      "과제 완료율 기준 설정",
      "최소 학습 시간 설정",
      "시험 합격 점수 설정",
      "학생별 수료 요건 충족 여부 자동 확인",
      "수료 예정자 목록 확인",
      "수료증 자동 발급",
      "수료증 다운로드 및 출력",
      "이수자 명단 생성",
      "미수료자 관리 및 재수강 안내"
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
      "강좌 및 평가 항목 선택",
      "평가 항목 추가 (출석, 과제, 중간고사, 기말고사 등)",
      "항목별 배점 설정",
      "학생별 점수 입력",
      "자동 집계 및 총점 계산",
      "등급 산출 (A, B, C, D, F)",
      "성적 분포 확인",
      "성적표 생성 및 출력",
      "학생별 성적 통지"
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
      "지급 대상 학생 선택 또는 일괄 선택",
      "지급 항목 설정 (출석수당, 교통비 등)",
      "지급 금액 입력",
      "지급 날짜 및 방법 선택",
      "지급 사유 및 비고 입력",
      "지급 승인 처리",
      "지급 내역 확인",
      "학생별 누적 지급액 확인",
      "수당 지급 보고서 생성 및 출력",
      "정산 자료 다운로드"
    ]
  },
  
  // AI 기능
  {
    id: "ai-tutor",
    title: "AI 튜터",
    category: "AI 기능",
    badge: "AI",
    content: "AI 기반 1:1 학습 도우미 기능입니다.",
    steps: [
      "AI 튜터 기능 활성화",
      "학생이 질문 입력",
      "AI가 강좌 내용 기반으로 답변 생성",
      "이해도에 따른 추가 설명 제공",
      "관련 학습 자료 추천",
      "AI 튜터 대화 이력 확인",
      "학습 효과 분석"
    ]
  },
  {
    id: "ai-quiz",
    title: "AI 퀴즈 생성",
    category: "AI 기능",
    badge: "AI",
    content: "학습 내용을 바탕으로 AI가 자동으로 퀴즈를 생성합니다.",
    steps: [
      "퀴즈 생성 메뉴로 이동",
      "대상 콘텐츠 또는 강의 선택",
      "퀴즈 난이도 선택",
      "문제 개수 설정",
      "'AI 퀴즈 생성' 버튼 클릭",
      "생성된 퀴즈 검토 및 수정",
      "퀴즈 저장 및 학생에게 배포"
    ]
  },
  {
    id: "ai-grading",
    title: "AI 자동 채점",
    category: "AI 기능",
    badge: "AI",
    content: "과제 및 시험을 AI가 자동으로 채점합니다.",
    steps: [
      "채점 대상 과제 선택",
      "'AI 채점' 버튼 클릭",
      "AI가 답안 분석 및 채점 수행",
      "채점 결과 및 피드백 확인",
      "필요시 수동으로 점수 조정",
      "학생에게 결과 통보"
    ]
  },
  {
    id: "ai-feedback",
    title: "AI 피드백",
    category: "AI 기능",
    badge: "AI",
    content: "학생 답변에 대해 AI가 상세한 피드백을 제공합니다.",
    steps: [
      "학생 답변 또는 과제 선택",
      "'AI 피드백' 버튼 클릭",
      "AI가 강점과 개선점 분석",
      "구체적인 피드백 생성",
      "추가 학습 자료 추천",
      "피드백 검토 후 학생에게 전달"
    ]
  },
  {
    id: "ai-summarize",
    title: "AI 요약",
    category: "AI 기능",
    badge: "AI",
    content: "긴 학습 자료를 AI가 요약해줍니다.",
    steps: [
      "요약할 콘텐츠 선택",
      "'AI 요약' 버튼 클릭",
      "요약 길이 선택 (짧게/보통/자세히)",
      "AI가 핵심 내용 추출 및 요약 생성",
      "요약 결과 확인",
      "요약본 저장 또는 학생과 공유"
    ]
  },
  {
    id: "ai-translate",
    title: "AI 번역",
    category: "AI 기능",
    badge: "AI",
    content: "학습 자료를 다양한 언어로 번역합니다.",
    steps: [
      "번역할 콘텐츠 선택",
      "목표 언어 선택",
      "'AI 번역' 버튼 클릭",
      "AI가 자연스러운 번역 수행",
      "번역 결과 확인 및 수정",
      "번역본 저장"
    ]
  },
  {
    id: "ai-study-match",
    title: "AI 스터디 매칭",
    category: "AI 기능",
    badge: "AI",
    content: "학습 스타일이 비슷한 학생들을 AI가 매칭해줍니다.",
    steps: [
      "스터디 매칭 메뉴로 이동",
      "매칭 기준 설정 (강좌, 수준, 관심사 등)",
      "'AI 매칭' 시작",
      "AI가 학생 학습 데이터 분석",
      "최적의 스터디 그룹 제안",
      "매칭 결과 확인 및 그룹 생성",
      "스터디 활동 모니터링"
    ]
  },
  {
    id: "ai-learning-path",
    title: "AI 학습 경로 추천",
    category: "AI 기능",
    badge: "AI",
    content: "학생 수준에 맞는 최적의 학습 경로를 AI가 추천합니다.",
    steps: [
      "학습 경로 메뉴로 이동",
      "학생 선택 또는 전체 분석",
      "AI가 학습 이력 및 성과 분석",
      "맞춤형 학습 경로 생성",
      "추천 강좌 및 콘텐츠 제시",
      "학습 순서 및 일정 제안",
      "학생에게 경로 안내"
    ]
  },
  {
    id: "ai-progress-prediction",
    title: "AI 학습 진도 예측",
    category: "AI 기능",
    badge: "AI",
    content: "학생의 학습 패턴을 분석하여 향후 진도를 예측합니다.",
    steps: [
      "진도 예측 메뉴로 이동",
      "예측 대상 학생 및 강좌 선택",
      "AI가 과거 학습 데이터 분석",
      "예상 완료 시기 예측",
      "학습 장애물 및 위험 요인 식별",
      "조기 개입이 필요한 학생 파악",
      "맞춤형 지원 계획 수립"
    ]
  },
  {
    id: "ai-report",
    title: "AI 보고서 생성",
    category: "AI 기능",
    badge: "AI",
    content: "학습 데이터를 바탕으로 AI가 자동으로 보고서를 생성합니다.",
    steps: [
      "보고서 생성 메뉴로 이동",
      "보고서 유형 선택 (학생, 강좌, 전체 등)",
      "기간 및 대상 설정",
      "'AI 보고서 생성' 클릭",
      "AI가 데이터 분석 및 인사이트 도출",
      "보고서 초안 생성",
      "검토 및 수정",
      "보고서 다운로드 또는 공유"
    ]
  },
  {
    id: "ai-logs",
    title: "AI 로그 및 모니터링",
    category: "AI 기능",
    badge: "AI",
    content: "AI 기능 사용 내역을 확인하고 모니터링합니다.",
    steps: [
      "AI 로그 메뉴로 이동",
      "날짜별/기능별 AI 사용량 확인",
      "사용자별 AI 활용 현황",
      "요청 내용 및 응답 결과 확인",
      "토큰 사용량 및 비용 확인",
      "AI 성능 지표 모니터링",
      "오류 및 실패 로그 확인",
      "사용 통계 및 트렌드 분석"
    ]
  },
  {
    id: "ai-search",
    title: "AI 검색",
    category: "AI 기능",
    badge: "AI",
    content: "자연어로 시스템 내 정보를 검색합니다.",
    steps: [
      "AI 검색창 활성화",
      "자연어로 질문 입력",
      "AI가 관련 콘텐츠 검색",
      "검색 결과 확인",
      "상세 정보로 빠르게 이동"
    ]
  },
  {
    id: "chatbot",
    title: "AI 챗봇",
    category: "AI 기능",
    badge: "AI",
    content: "시스템 사용 관련 질문에 답변하는 AI 챗봇입니다.",
    steps: [
      "챗봇 아이콘 클릭",
      "시스템 사용 방법 질문",
      "AI 챗봇이 즉시 답변",
      "관련 매뉴얼 페이지 링크 제공",
      "추가 도움이 필요한 경우 상담 연결"
    ]
  },
  
  // 커뮤니티 및 소통
  {
    id: "community",
    title: "커뮤니티 관리",
    category: "커뮤니티 및 소통",
    content: "학생 간 소통 공간을 관리하고 모니터링합니다.",
    steps: [
      "커뮤니티 관리 메뉴로 이동",
      "게시판별 게시글 확인",
      "부적절한 게시글 모니터링",
      "게시글 삭제 또는 숨김 처리",
      "사용자 신고 내역 확인",
      "커뮤니티 규칙 설정",
      "공지사항 작성 및 관리"
    ]
  },
  {
    id: "notifications",
    title: "알림 관리",
    category: "커뮤니티 및 소통",
    content: "시스템 알림을 발송하고 관리합니다.",
    steps: [
      "알림 관리 메뉴로 이동",
      "알림 유형 선택 (일반, 중요, 긴급)",
      "알림 제목 및 내용 작성",
      "수신 대상 선택 (전체, 그룹, 개인)",
      "발송 시간 예약 또는 즉시 발송",
      "발송 내역 및 읽음 확인",
      "자동 알림 규칙 설정"
    ]
  },
  
  // 게이미피케이션
  {
    id: "gamification",
    title: "게이미피케이션 관리",
    category: "게이미피케이션",
    content: "학습 동기 부여를 위한 게임 요소를 관리합니다.",
    steps: [
      "게이미피케이션 메뉴로 이동",
      "포인트 정책 설정 (활동별 포인트)",
      "배지 생성 및 획득 조건 설정",
      "리더보드 설정 (기간, 순위 기준)",
      "레벨 시스템 설정",
      "보상 아이템 관리",
      "전체 포인트 및 배지 현황 확인",
      "학생별 게이미피케이션 통계"
    ]
  },
  {
    id: "badges",
    title: "배지 시스템",
    category: "게이미피케이션",
    content: "학습 성취에 따른 배지를 관리합니다.",
    steps: [
      "배지 관리 메뉴로 이동",
      "새 배지 생성 (이름, 아이콘, 설명)",
      "획득 조건 설정",
      "배지 등급 설정 (브론즈, 실버, 골드)",
      "배지 발급 내역 확인",
      "수동 배지 발급"
    ]
  },
  {
    id: "leaderboard",
    title: "리더보드",
    category: "게이미피케이션",
    content: "학습 활동 순위를 표시합니다.",
    steps: [
      "리더보드 설정",
      "순위 기준 선택 (포인트, 완료율 등)",
      "기간 설정 (주간, 월간, 전체)",
      "카테고리별 리더보드 생성",
      "순위 변동 모니터링"
    ]
  },
  
  // 매출 및 결제
  {
    id: "revenue-management",
    title: "매출 관리",
    category: "매출 및 결제",
    content: "강좌별 매출 현황을 확인하고 관리합니다.",
    steps: [
      "매출 관리 메뉴로 이동",
      "기간별 총 매출 확인",
      "강좌별 수익 분석",
      "결제 방법별 통계",
      "환불 내역 확인",
      "정산 대상 금액 확인",
      "매출 추이 그래프 확인",
      "정산 보고서 생성 및 출력"
    ]
  },
  {
    id: "payment-management",
    title: "결제 관리",
    category: "매출 및 결제",
    content: "학생 결제 내역을 조회하고 관리합니다.",
    steps: [
      "결제 관리 메뉴로 이동",
      "결제 내역 목록 확인",
      "결제 상태별 필터링 (완료, 대기, 실패, 취소)",
      "학생별 결제 이력 조회",
      "결제 상세 정보 확인",
      "환불 처리",
      "결제 실패 원인 확인",
      "정산 처리"
    ]
  },
  {
    id: "settlement",
    title: "정산 관리",
    category: "매출 및 결제",
    content: "강사 및 파트너 정산을 처리합니다.",
    steps: [
      "정산 관리 메뉴로 이동",
      "정산 기간 선택",
      "강사별 정산 금액 확인",
      "수수료 및 공제 내역 확인",
      "정산 승인 처리",
      "정산 내역서 생성",
      "정산 완료 통보"
    ]
  },
  
  // 시스템 관리
  {
    id: "system-monitoring",
    title: "시스템 모니터링",
    category: "시스템 관리",
    content: "시스템 상태와 성능을 실시간으로 모니터링합니다.",
    steps: [
      "시스템 모니터링 메뉴로 이동",
      "서버 상태 확인 (CPU, 메모리, 디스크)",
      "서비스 응답 시간 확인",
      "사용자 동시 접속 현황",
      "에러 발생 현황",
      "데이터베이스 성능 모니터링",
      "API 호출 통계",
      "리소스 사용량 추이",
      "알림 임계값 설정"
    ]
  },
  {
    id: "system-settings",
    title: "시스템 설정",
    category: "시스템 관리",
    content: "시스템 전반적인 설정을 관리합니다.",
    steps: [
      "시스템 설정 메뉴로 이동",
      "기관 기본 정보 설정 (이름, 로고, 연락처)",
      "이메일 발송 설정",
      "SMS 알림 설정",
      "언어 및 시간대 설정",
      "권한 및 역할 관리",
      "메뉴 표시 설정",
      "백업 스케줄 설정",
      "보안 정책 설정"
    ]
  },
  {
    id: "tenant-management",
    title: "테넌트 관리",
    category: "시스템 관리",
    content: "다중 테넌트(기관) 환경을 관리합니다.",
    steps: [
      "테넌트 관리 메뉴로 이동",
      "등록된 테넌트 목록 확인",
      "새 테넌트 생성",
      "테넌트별 설정 관리",
      "테넌트별 사용량 확인",
      "테넌트 활성화/비활성화",
      "테넌트별 요금제 관리"
    ]
  },
  {
    id: "usage-management",
    title: "사용량 관리",
    category: "시스템 관리",
    content: "시스템 리소스 사용량을 모니터링하고 제한합니다.",
    steps: [
      "사용량 관리 메뉴로 이동",
      "사용자별 스토리지 사용량 확인",
      "AI 토큰 사용량 확인",
      "API 호출량 확인",
      "사용 한도 설정",
      "초과 사용 알림 설정",
      "사용량 보고서 생성"
    ]
  },
  {
    id: "storage-management",
    title: "스토리지 관리",
    category: "시스템 관리",
    content: "파일 저장소를 관리합니다.",
    steps: [
      "스토리지 관리 메뉴로 이동",
      "전체 저장 용량 확인",
      "파일 유형별 사용량 확인",
      "사용자별 파일 목록",
      "대용량 파일 식별",
      "불필요한 파일 삭제",
      "백업 파일 관리"
    ]
  },
  {
    id: "backup-restore",
    title: "백업 및 복구",
    category: "시스템 관리",
    content: "데이터 백업과 복구를 관리합니다.",
    steps: [
      "백업 관리 메뉴로 이동",
      "자동 백업 스케줄 설정",
      "수동 백업 실행",
      "백업 파일 목록 확인",
      "백업 파일 다운로드",
      "백업에서 복구",
      "백업 보관 정책 설정"
    ]
  },
  
  // 보안 및 권한
  {
    id: "role-management",
    title: "역할 및 권한 관리",
    category: "보안 및 권한",
    content: "사용자 역할과 권한을 설정합니다.",
    steps: [
      "역할 관리 메뉴로 이동",
      "기존 역할 목록 확인 (admin, teacher, student)",
      "새 역할 생성",
      "역할별 권한 설정",
      "메뉴별 접근 권한 설정",
      "기능별 사용 권한 설정",
      "역할 할당 및 변경"
    ]
  },
  {
    id: "access-log",
    title: "접근 로그",
    category: "보안 및 권한",
    content: "사용자 접근 이력을 확인합니다.",
    steps: [
      "접근 로그 메뉴로 이동",
      "날짜별 접근 이력 확인",
      "사용자별 로그인 이력",
      "IP 주소 및 디바이스 정보",
      "비정상 접근 시도 확인",
      "로그 검색 및 필터링",
      "로그 다운로드"
    ]
  },
  
  // 비디오 관리
  {
    id: "video-management",
    title: "비디오 관리",
    category: "콘텐츠 관리",
    content: "동영상 콘텐츠를 관리합니다.",
    steps: [
      "비디오 라이브러리로 이동",
      "동영상 업로드 또는 URL 추가",
      "썸네일 설정",
      "재생 옵션 설정 (자동재생, 속도 조절 등)",
      "자막 업로드",
      "비디오 인코딩 상태 확인",
      "시청 통계 확인"
    ]
  },
  {
    id: "video-analytics",
    title: "비디오 분석",
    category: "콘텐츠 관리",
    content: "동영상 시청 데이터를 분석합니다.",
    steps: [
      "비디오 분석 메뉴로 이동",
      "동영상별 시청률 확인",
      "평균 시청 시간",
      "이탈 구간 분석",
      "반복 시청 구간 파악",
      "학생별 시청 이력"
    ]
  },
  
  // 템플릿 및 레이아웃
  {
    id: "page-layouts",
    title: "페이지 레이아웃",
    category: "디자인 관리",
    content: "페이지 레이아웃을 관리하고 커스터마이즈합니다.",
    steps: [
      "레이아웃 설정 메뉴로 이동",
      "레이아웃 스타일 선택 (Card, Minimal, Modern)",
      "색상 테마 설정",
      "로고 및 브랜딩 설정",
      "메뉴 구성 커스터마이즈",
      "미리보기 확인",
      "레이아웃 적용"
    ]
  },
  
  // 다국어
  {
    id: "language-settings",
    title: "다국어 설정",
    category: "시스템 설정",
    content: "시스템 언어를 관리합니다.",
    steps: [
      "언어 설정 메뉴로 이동",
      "지원 언어 확인 (한국어, 영어)",
      "기본 언어 설정",
      "번역 관리",
      "언어별 콘텐츠 관리"
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
