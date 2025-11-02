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
  // 대시보드 및 개요
  {
    id: "operator-dashboard",
    title: "운영자 대시보드",
    category: "대시보드 및 개요",
    content: "플랫폼 전체 현황을 한눈에 파악하고 주요 지표를 모니터링합니다.",
    steps: [
      "대시보드에서 전체 통계 확인 (고객사 수, 전체 사용자 수, 매출 등)",
      "최근 가입 고객사 및 활동 내역 확인",
      "시스템 알림 및 경고 사항 확인",
      "주요 지표 추이 그래프 분석",
      "빠른 접근 메뉴로 주요 기능 이동"
    ]
  },
  {
    id: "platform-overview",
    title: "플랫폼 전체 현황",
    category: "대시보드 및 개요",
    content: "전체 플랫폼의 사용 현황과 성장 추이를 분석합니다.",
    steps: [
      "전체 고객사 수 및 활성 고객사 비율",
      "총 사용자 수 및 월간 활성 사용자(MAU)",
      "전체 강좌 수 및 수강생 수",
      "월간 매출 및 성장률",
      "주요 기능별 사용 통계"
    ]
  },
  
  // 고객사 관리
  {
    id: "tenant-create",
    title: "고객사 생성",
    category: "고객사 관리",
    content: "새로운 고객사(교육 기관)를 생성하고 초기 설정을 진행합니다.",
    steps: [
      "고객사 관리 메뉴로 이동",
      "'고객사 추가' 버튼 클릭",
      "기본 정보 입력 (고객사명, 사업자번호, 주소)",
      "담당자 정보 입력 (이름, 이메일, 연락처)",
      "요금제 선택 (Starter/Standard/Pro/Enterprise)",
      "리소스 제한 설정 (스토리지, 사용자 수, AI 토큰)",
      "도메인 설정 (서브도메인 또는 커스텀 도메인)",
      "초기 관리자 계정 생성",
      "환영 이메일 자동 발송"
    ]
  },
  {
    id: "tenant-settings",
    title: "고객사별 설정 관리",
    category: "고객사 관리",
    content: "각 고객사의 세부 설정을 관리하고 커스터마이징합니다.",
    steps: [
      "고객사 목록에서 대상 선택",
      "기본 설정 (로고, 브랜딩, 테마 색상)",
      "기능 활성화/비활성화 (AI 기능, HRD 기능 등)",
      "언어 및 지역 설정",
      "이메일 알림 설정",
      "백업 스케줄 설정",
      "API 접근 권한 설정"
    ]
  },
  {
    id: "tenant-users",
    title: "고객사 사용자 관리",
    category: "고객사 관리",
    content: "고객사별 사용자 현황을 확인하고 관리합니다.",
    steps: [
      "고객사 선택 후 사용자 목록 확인",
      "역할별 사용자 수 확인 (관리자, 강사, 학생)",
      "활성/비활성 사용자 통계",
      "사용자 계정 활성화/비활성화",
      "문제 계정 조치 (정지, 삭제)",
      "사용자 활동 로그 확인"
    ]
  },
  {
    id: "tenant-monitoring",
    title: "고객사 활동 모니터링",
    category: "고객사 관리",
    content: "각 고객사의 활동 현황과 사용 패턴을 모니터링합니다.",
    steps: [
      "고객사별 활동 대시보드 확인",
      "일일 활성 사용자(DAU) 추이",
      "강좌 생성 및 수강 통계",
      "과제 제출 및 채점 현황",
      "커뮤니티 활동 지표",
      "이상 패턴 감지 및 알림"
    ]
  },
  {
    id: "tenant-migration",
    title: "고객사 데이터 마이그레이션",
    category: "고객사 관리",
    content: "고객사의 데이터를 내보내거나 가져옵니다.",
    steps: [
      "마이그레이션 메뉴로 이동",
      "데이터 내보내기 (사용자, 강좌, 콘텐츠)",
      "내보내기 형식 선택 (CSV, JSON, SQL)",
      "데이터 가져오기 템플릿 다운로드",
      "데이터 검증 및 매핑",
      "마이그레이션 실행 및 결과 확인"
    ]
  },
  
  // 리소스 관리
  {
    id: "storage-management",
    title: "스토리지 관리",
    category: "리소스 관리",
    content: "전체 및 고객사별 스토리지 사용량을 관리합니다.",
    steps: [
      "스토리지 관리 대시보드로 이동",
      "전체 스토리지 사용량 및 가용량 확인",
      "고객사별 사용량 순위",
      "파일 유형별 사용량 분석 (동영상, 이미지, 문서)",
      "사용량 초과 고객사 확인",
      "자동 정리 정책 설정",
      "스토리지 용량 확장 요청 처리"
    ]
  },
  {
    id: "user-limit-management",
    title: "사용자 수 제한 관리",
    category: "리소스 관리",
    content: "고객사별 사용자 수 제한을 모니터링하고 관리합니다.",
    steps: [
      "사용자 수 관리 메뉴로 이동",
      "고객사별 사용자 수 현황",
      "요금제별 제한 확인",
      "제한 초과 고객사 알림",
      "임시 제한 완화 처리",
      "요금제 업그레이드 권장"
    ]
  },
  {
    id: "ai-token-management",
    title: "AI 토큰 사용량 관리",
    category: "리소스 관리",
    badge: "AI",
    content: "AI 기능의 토큰 사용량을 모니터링하고 비용을 관리합니다.",
    steps: [
      "AI 사용량 대시보드로 이동",
      "전체 토큰 사용량 및 비용 확인",
      "고객사별 AI 사용량 통계",
      "AI 모델별 사용 분포 (GPT-5, Gemini 2.5)",
      "사용량 급증 고객사 모니터링",
      "토큰 제한 설정 및 알림",
      "비용 예측 및 예산 관리"
    ]
  },
  {
    id: "database-resources",
    title: "데이터베이스 리소스 관리",
    category: "리소스 관리",
    content: "데이터베이스 용량과 성능을 관리합니다.",
    steps: [
      "데이터베이스 모니터링 대시보드",
      "전체 데이터베이스 크기 및 증가율",
      "고객사별 테이블 크기 분석",
      "인덱스 사용 현황 및 최적화",
      "쿼리 성능 분석",
      "백업 크기 및 복원 테스트",
      "데이터 정리 및 아카이빙"
    ]
  },
  {
    id: "edge-function-usage",
    title: "Edge Functions 사용량",
    category: "리소스 관리",
    content: "서버리스 함수의 실행 횟수와 성능을 모니터링합니다.",
    steps: [
      "Edge Functions 대시보드로 이동",
      "함수별 실행 횟수 통계",
      "평균 실행 시간 및 성능",
      "오류율 및 실패 원인 분석",
      "고객사별 함수 호출 통계",
      "함수별 비용 분석",
      "성능 최적화 권장사항"
    ]
  },
  
  // 요금제 및 결제
  {
    id: "pricing-plan-management",
    title: "요금제 구성 관리",
    category: "요금제 및 결제",
    content: "플랫폼의 요금제를 설계하고 관리합니다.",
    steps: [
      "요금제 관리 메뉴로 이동",
      "기존 요금제 목록 확인",
      "새 요금제 생성 (이름, 가격, 주기)",
      "요금제별 기능 및 제한 설정",
      "사용자 수, 스토리지, AI 토큰 한도 설정",
      "프로모션 및 할인 설정",
      "요금제 활성화/비활성화"
    ]
  },
  {
    id: "subscription-management",
    title: "구독 관리",
    category: "요금제 및 결제",
    content: "고객사의 구독 상태를 관리합니다.",
    steps: [
      "구독 관리 대시보드로 이동",
      "고객사별 구독 상태 확인",
      "구독 시작일 및 갱신일 확인",
      "자동 갱신 설정 관리",
      "구독 일시정지 또는 취소 처리",
      "구독 재개 처리",
      "만료 예정 구독 알림"
    ]
  },
  {
    id: "payment-processing",
    title: "결제 처리",
    category: "요금제 및 결제",
    content: "고객사의 결제를 처리하고 관리합니다.",
    steps: [
      "결제 관리 메뉴로 이동",
      "결제 대기 목록 확인",
      "결제 방법 확인 (카드, 계좌이체, 무통장입금)",
      "결제 승인 처리",
      "결제 실패 건 확인 및 재시도",
      "결제 내역 조회 및 영수증 발급",
      "세금계산서 발행"
    ]
  },
  {
    id: "refund-processing",
    title: "환불 처리",
    category: "요금제 및 결제",
    content: "고객사의 환불 요청을 처리합니다.",
    steps: [
      "환불 요청 목록 확인",
      "환불 사유 확인",
      "환불 금액 계산 (일할 계산)",
      "환불 승인 또는 거절",
      "환불 처리 (결제사 API 호출)",
      "환불 완료 알림 발송",
      "환불 내역 기록"
    ]
  },
  {
    id: "settlement-management",
    title: "정산 관리",
    category: "요금제 및 결제",
    content: "월별/분기별 매출을 정산합니다.",
    steps: [
      "정산 관리 메뉴로 이동",
      "정산 기간 선택",
      "고객사별 결제 금액 집계",
      "수수료 및 세금 계산",
      "정산 보고서 생성",
      "회계 시스템 연동",
      "정산 완료 처리"
    ]
  },
  {
    id: "invoice-management",
    title: "청구서 관리",
    category: "요금제 및 결제",
    content: "고객사에게 발송할 청구서를 관리합니다.",
    steps: [
      "청구서 관리 메뉴로 이동",
      "자동 청구서 생성 설정",
      "청구서 템플릿 관리",
      "청구서 발송 스케줄 설정",
      "미결제 청구서 추적",
      "독촉 알림 발송",
      "청구서 다운로드 및 출력"
    ]
  },
  
  // 시스템 모니터링
  {
    id: "server-monitoring",
    title: "서버 상태 모니터링",
    category: "시스템 모니터링",
    content: "서버의 실시간 상태와 리소스 사용률을 모니터링합니다.",
    steps: [
      "시스템 모니터링 대시보드로 이동",
      "서버 상태 (온라인/오프라인) 확인",
      "CPU 사용률 실시간 모니터링",
      "메모리 사용량 및 스왑 확인",
      "디스크 I/O 성능 모니터링",
      "네트워크 트래픽 분석",
      "임계값 초과 시 알림 수신"
    ]
  },
  {
    id: "performance-monitoring",
    title: "성능 모니터링",
    category: "시스템 모니터링",
    content: "플랫폼 전체의 성능 지표를 모니터링합니다.",
    steps: [
      "성능 대시보드로 이동",
      "페이지 로드 시간 분석",
      "API 응답 시간 통계",
      "데이터베이스 쿼리 성능",
      "Edge Functions 실행 시간",
      "병목 구간 식별",
      "성능 개선 권장사항"
    ]
  },
  {
    id: "error-log-monitoring",
    title: "에러 로그 모니터링",
    category: "시스템 모니터링",
    content: "시스템 에러를 추적하고 분석합니다.",
    steps: [
      "에러 로그 대시보드로 이동",
      "최근 에러 목록 확인",
      "에러 유형별 분류 (4xx, 5xx)",
      "에러 발생 빈도 및 추이",
      "에러 스택 트레이스 확인",
      "영향받은 사용자 수 확인",
      "에러 해결 및 배포"
    ]
  },
  {
    id: "api-monitoring",
    title: "API 모니터링",
    category: "시스템 모니터링",
    content: "API 엔드포인트의 상태와 성능을 모니터링합니다.",
    steps: [
      "API 모니터링 대시보드로 이동",
      "엔드포인트별 호출 통계",
      "평균 응답 시간 및 p95, p99",
      "성공률 및 실패율",
      "Rate Limiting 현황",
      "가장 많이 호출되는 API Top 10",
      "느린 API 식별 및 최적화"
    ]
  },
  {
    id: "database-performance",
    title: "데이터베이스 성능",
    category: "시스템 모니터링",
    content: "데이터베이스의 성능과 상태를 모니터링합니다.",
    steps: [
      "데이터베이스 모니터링으로 이동",
      "활성 연결 수 확인",
      "느린 쿼리 로그 분석",
      "테이블별 쿼리 통계",
      "인덱스 사용 효율성 확인",
      "Lock 및 데드락 모니터링",
      "쿼리 최적화 권장사항"
    ]
  },
  {
    id: "uptime-monitoring",
    title: "가동 시간 모니터링",
    category: "시스템 모니터링",
    content: "서비스의 가동 시간과 다운타임을 추적합니다.",
    steps: [
      "가동 시간 대시보드로 이동",
      "월간/연간 가동률(Uptime) 확인",
      "다운타임 발생 내역",
      "장애 원인 분석",
      "평균 복구 시간(MTTR)",
      "SLA 준수 여부 확인",
      "가동 시간 보고서 생성"
    ]
  },
  
  // AI 관리
  {
    id: "ai-logs",
    title: "AI 로그 확인",
    category: "AI 관리",
    badge: "AI",
    content: "전체 플랫폼의 AI 기능 사용 내역을 확인합니다.",
    steps: [
      "AI 로그 메뉴로 이동",
      "날짜별/기능별 AI 사용량 확인",
      "고객사별 AI 활용 통계",
      "사용자별 AI 요청 내역",
      "요청 내용 및 응답 결과 확인",
      "실패한 요청 분석",
      "AI 응답 품질 모니터링"
    ]
  },
  {
    id: "ai-usage-analytics",
    title: "AI 사용량 분석",
    category: "AI 관리",
    badge: "AI",
    content: "AI 기능별 사용 패턴과 트렌드를 분석합니다.",
    steps: [
      "AI 분석 대시보드로 이동",
      "AI 기능별 사용 빈도 (튜터, 채점, 퀴즈 생성 등)",
      "시간대별 사용 패턴",
      "고객사별 AI 선호도 분석",
      "AI 기능별 만족도 조사",
      "사용 증가율 및 트렌드",
      "AI 기능 개선 인사이트 도출"
    ]
  },
  {
    id: "ai-model-management",
    title: "AI 모델 관리",
    category: "AI 관리",
    badge: "AI",
    content: "사용 중인 AI 모델을 관리하고 최적화합니다.",
    steps: [
      "AI 모델 관리 메뉴로 이동",
      "사용 중인 모델 목록 (GPT-5, Gemini 2.5 등)",
      "모델별 성능 비교",
      "모델별 비용 분석",
      "기능별 최적 모델 매핑",
      "새 모델 테스트 및 배포",
      "모델 버전 관리"
    ]
  },
  {
    id: "ai-cost-management",
    title: "AI 비용 관리",
    category: "AI 관리",
    badge: "AI",
    content: "AI 사용에 따른 비용을 추적하고 최적화합니다.",
    steps: [
      "AI 비용 대시보드로 이동",
      "월별 AI 비용 추이",
      "모델별 비용 분석",
      "고객사별 AI 비용",
      "예산 대비 실제 비용 비교",
      "비용 절감 기회 식별",
      "비용 알림 및 예산 관리"
    ]
  },
  {
    id: "ai-quality-control",
    title: "AI 품질 관리",
    category: "AI 관리",
    badge: "AI",
    content: "AI 응답의 품질을 모니터링하고 개선합니다.",
    steps: [
      "AI 품질 관리 메뉴로 이동",
      "AI 응답 샘플링 및 검토",
      "사용자 피드백 수집",
      "부적절한 응답 필터링",
      "응답 정확도 측정",
      "프롬프트 엔지니어링 최적화",
      "AI 응답 개선 작업"
    ]
  },
  
  // 보안 관리
  {
    id: "security-monitoring",
    title: "보안 이벤트 모니터링",
    category: "보안 관리",
    content: "보안 위협과 이상 활동을 실시간으로 모니터링합니다.",
    steps: [
      "보안 모니터링 대시보드로 이동",
      "실시간 보안 이벤트 확인",
      "의심스러운 로그인 시도",
      "비정상적인 API 호출 패턴",
      "DDoS 공격 감지",
      "SQL 인젝션 시도 탐지",
      "보안 경고 알림 수신"
    ]
  },
  {
    id: "access-control",
    title: "접근 제어",
    category: "보안 관리",
    content: "시스템 접근 권한을 관리하고 제어합니다.",
    steps: [
      "접근 제어 메뉴로 이동",
      "운영자 계정 목록 확인",
      "역할 및 권한 설정",
      "IP 화이트리스트 관리",
      "2단계 인증(2FA) 강제 설정",
      "접근 로그 확인",
      "의심스러운 접근 차단"
    ]
  },
  {
    id: "data-encryption",
    title: "데이터 암호화 관리",
    category: "보안 관리",
    content: "데이터 암호화 상태를 점검하고 관리합니다.",
    steps: [
      "암호화 관리 메뉴로 이동",
      "저장 데이터 암호화 상태 확인",
      "전송 중 데이터 암호화 (TLS/SSL)",
      "암호화 키 관리",
      "암호화 알고리즘 업데이트",
      "민감 데이터 마스킹",
      "암호화 규정 준수 확인"
    ]
  },
  {
    id: "backup-recovery",
    title: "백업 및 복구",
    category: "보안 관리",
    content: "데이터를 정기적으로 백업하고 복구 절차를 관리합니다.",
    steps: [
      "백업 관리 메뉴로 이동",
      "자동 백업 스케줄 설정",
      "백업 파일 목록 확인",
      "백업 파일 무결성 검증",
      "수동 백업 실행",
      "백업에서 복구 테스트",
      "재해 복구 계획(DRP) 관리"
    ]
  },
  {
    id: "vulnerability-management",
    title: "취약점 관리",
    category: "보안 관리",
    content: "시스템의 보안 취약점을 식별하고 조치합니다.",
    steps: [
      "취약점 스캐너 실행",
      "발견된 취약점 목록 확인",
      "취약점 심각도 평가 (Critical, High, Medium, Low)",
      "패치 및 업데이트 적용",
      "취약점 조치 내역 기록",
      "정기 보안 감사 수행",
      "보안 규정 준수 확인"
    ]
  },
  {
    id: "security-audit",
    title: "보안 감사",
    category: "보안 관리",
    content: "시스템 전반의 보안 상태를 점검합니다.",
    steps: [
      "보안 감사 메뉴로 이동",
      "감사 체크리스트 확인",
      "접근 로그 분석",
      "권한 설정 검토",
      "보안 정책 준수 여부 확인",
      "감사 보고서 생성",
      "개선 권고사항 도출"
    ]
  },
  
  // 배포 및 업데이트
  {
    id: "system-update",
    title: "시스템 업데이트",
    category: "배포 및 업데이트",
    content: "플랫폼의 시스템을 업데이트하고 패치합니다.",
    steps: [
      "업데이트 관리 메뉴로 이동",
      "사용 가능한 업데이트 확인",
      "업데이트 내역 및 변경사항 검토",
      "테스트 환경에서 사전 테스트",
      "유지보수 모드 활성화",
      "업데이트 실행",
      "업데이트 후 검증",
      "유지보수 모드 해제"
    ]
  },
  {
    id: "feature-deployment",
    title: "기능 배포",
    category: "배포 및 업데이트",
    content: "새로운 기능을 배포하고 관리합니다.",
    steps: [
      "기능 배포 대시보드로 이동",
      "배포 대기 기능 목록 확인",
      "기능 테스트 완료 여부 확인",
      "점진적 롤아웃 설정 (Canary, Blue-Green)",
      "베타 테스트 고객사 선정",
      "기능 플래그 설정",
      "배포 실행 및 모니터링",
      "전체 배포 또는 롤백 결정"
    ]
  },
  {
    id: "rollback-management",
    title: "롤백 관리",
    category: "배포 및 업데이트",
    content: "문제 발생 시 이전 버전으로 롤백합니다.",
    steps: [
      "배포 이력 확인",
      "문제 발생 버전 식별",
      "롤백 대상 버전 선택",
      "롤백 영향 범위 분석",
      "롤백 실행",
      "롤백 후 시스템 검증",
      "사용자 공지",
      "문제 원인 분석 및 재발 방지"
    ]
  },
  {
    id: "maintenance-mode",
    title: "유지보수 모드",
    category: "배포 및 업데이트",
    content: "시스템 점검을 위한 유지보수 모드를 관리합니다.",
    steps: [
      "유지보수 설정 메뉴로 이동",
      "유지보수 일정 수립",
      "고객사에게 사전 공지",
      "유지보수 페이지 메시지 설정",
      "유지보수 모드 활성화",
      "점검 작업 수행",
      "시스템 검증 및 테스트",
      "유지보수 모드 해제 및 재개 공지"
    ]
  },
  
  // 고객 지원
  {
    id: "customer-support",
    title: "고객 문의 관리",
    category: "고객 지원",
    content: "고객사의 문의사항을 접수하고 처리합니다.",
    steps: [
      "고객 지원 대시보드로 이동",
      "신규 문의 목록 확인",
      "문의 내용 및 우선순위 확인",
      "담당자 배정",
      "문의 응답 작성 및 전송",
      "추가 정보 요청 (필요시)",
      "문제 해결 및 종료",
      "고객 만족도 조사"
    ]
  },
  {
    id: "technical-support",
    title: "기술 지원",
    category: "고객 지원",
    content: "기술적인 문제 해결을 지원합니다.",
    steps: [
      "기술 지원 티켓 확인",
      "문제 상황 파악 (로그, 스크린샷)",
      "재현 시도 및 원인 분석",
      "임시 해결방법 제시",
      "근본 원인 해결",
      "고객사에 해결 방법 안내",
      "문제 해결 확인",
      "지식베이스에 문서화"
    ]
  },
  {
    id: "bug-tracking",
    title: "버그 트래킹",
    category: "고객 지원",
    content: "보고된 버그를 추적하고 관리합니다.",
    steps: [
      "버그 트래킹 시스템으로 이동",
      "버그 보고서 작성",
      "버그 재현 절차 기록",
      "심각도 및 우선순위 설정",
      "개발팀에 할당",
      "수정 진행 상황 추적",
      "수정 완료 후 검증",
      "고객사에 해결 통보"
    ]
  },
  {
    id: "feedback-management",
    title: "피드백 관리",
    category: "고객 지원",
    content: "고객사의 피드백을 수집하고 분석합니다.",
    steps: [
      "피드백 관리 메뉴로 이동",
      "고객사 피드백 수집 (설문, 인터뷰)",
      "피드백 분류 (기능 요청, 개선 제안, 불만)",
      "우선순위 및 중요도 평가",
      "제품 로드맵 반영",
      "피드백 제공자에게 진행 상황 통보",
      "피드백 기반 개선사항 추적"
    ]
  },
  {
    id: "knowledge-base",
    title: "지식베이스 관리",
    category: "고객 지원",
    content: "FAQ와 가이드를 작성하고 관리합니다.",
    steps: [
      "지식베이스 관리로 이동",
      "자주 묻는 질문(FAQ) 작성",
      "사용 가이드 문서 작성",
      "트러블슈팅 가이드 작성",
      "스크린샷 및 동영상 튜토리얼 추가",
      "문서 카테고리 정리",
      "검색 최적화",
      "정기적인 문서 업데이트"
    ]
  },
  
  // 분석 및 리포팅
  {
    id: "platform-analytics",
    title: "플랫폼 분석",
    category: "분석 및 리포팅",
    content: "플랫폼 전체 데이터를 분석하고 인사이트를 도출합니다.",
    steps: [
      "플랫폼 분석 대시보드로 이동",
      "주요 지표(KPI) 확인",
      "사용자 증가율 및 이탈률 분석",
      "기능별 사용 빈도 분석",
      "고객사별 활성도 비교",
      "매출 및 성장률 분석",
      "트렌드 및 패턴 식별"
    ]
  },
  {
    id: "revenue-analytics",
    title: "매출 분석",
    category: "분석 및 리포팅",
    content: "플랫폼의 매출을 분석하고 예측합니다.",
    steps: [
      "매출 분석 대시보드로 이동",
      "월별/분기별 매출 추이",
      "요금제별 매출 기여도",
      "고객사별 매출 순위",
      "MRR (월간 반복 매출) 추적",
      "ARR (연간 반복 매출) 계산",
      "매출 예측 모델링",
      "성장률 및 목표 달성도"
    ]
  },
  {
    id: "custom-reports",
    title: "맞춤형 보고서",
    category: "분석 및 리포팅",
    content: "필요에 따라 맞춤형 보고서를 생성합니다.",
    steps: [
      "보고서 생성 메뉴로 이동",
      "보고서 유형 선택 (운영, 재무, 기술)",
      "데이터 소스 및 기간 선택",
      "포함할 지표 선택",
      "차트 및 그래프 유형 설정",
      "보고서 미리보기",
      "보고서 생성 및 다운로드 (PDF, Excel)",
      "정기 보고서 스케줄 설정"
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
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 text-foreground">
            <BookOpen className="h-8 w-8 text-primary" />
            운영자 매뉴얼
          </h1>
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
