import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, Star, Sparkles, ArrowLeft, X } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import { Badge } from "@/components/ui/badge";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b sticky top-0 bg-background/95 backdrop-blur-xl z-50 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoIcon} alt="Atom LMS" className="h-12 w-12" />
            <span className="text-2xl font-logo font-bold text-foreground tracking-tight">atomLMS</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="default" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              홈으로
            </Button>
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="text-gradient">합리적인 가격</span>으로<br />
              시작하세요
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              모든 요금제는 부가세 별도입니다. 연간 결제 시 20% 할인 혜택을 제공합니다.
            </p>
          </div>

          {/* Pricing Cards - 가로 배치 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* 스타터 */}
            <PricingCard
              title="스타터"
              description="개인 강사 및 소규모 학습 그룹"
              price="₩0"
              period="/영구 무료"
              aiTokens="기본 이러닝 기능만 제공"
              features={[
                "기본 강좌 개설",
                "동영상 업로드 5GB",
                "출석 체크 기능",
                "과제 제출 및 채점",
                "커뮤니티 게시판",
                "이메일 지원"
              ]}
              buttonText="무료 시작하기"
              buttonVariant="outline"
            />

            {/* 스탠다드 */}
            <PricingCard
              title="스탠다드"
              description="전문 강사 및 중소 교육 기관"
              price="₩150,000"
              period="/월"
              aiTokens="최대 수강생 200명"
              features={[
                "스타터의 모든 기능",
                "무제한 강좌 개설",
                "동영상 업로드 50GB",
                "자동 채점 시스템",
                "학습 진도 관리",
                "우선 고객 지원",
                "수료증 자동 발급"
              ]}
              buttonText="스탠다드 시작하기"
              buttonVariant="outline"
            />

            {/* 프로 (인기) */}
            <PricingCard
              title="프로"
              description="기본 AI 기능이 필요한 교육 기관"
              price="₩300,000"
              period="/월"
              aiTokens="최대 수강생 500명 · AI 토큰 10만/월"
              features={[
                "스탠다드의 모든 기능",
                "동영상 업로드 100GB",
                "기본 AI 기능",
                "AI 자동 채점",
                "AI 피드백",
                "AI 번역",
                "AI 요약",
                "AI 퀴즈 생성"
              ]}
              buttonText="프로 시작하기"
              buttonVariant="default"
              isPopular={true}
            />

            {/* 프로페셔널 */}
            <PricingCard
              title="프로페셔널"
              description="모든 AI 기능이 필요한 대형 교육 기관"
              price="₩600,000"
              period="/월"
              aiTokens="최대 수강생 2,000명 · AI 토큰 50만/월"
              features={[
                "프로의 모든 기능",
                "동영상 업로드 300GB",
                "모든 AI 기능 제공",
                "AI 학습 경로 추천",
                "AI 진도 예측",
                "AI 학습 분석",
                "AI 리포트 생성",
                "AI 스터디 메이트 매칭",
                "AI 튜터",
                "전담 계정 관리자"
              ]}
              buttonText="프로페셔널 시작하기"
              buttonVariant="premium"
            />

            {/* 엔터프라이즈 */}
            <PricingCard
              title="엔터프라이즈"
              description="온프레미스 구축이 필요한 대규모 조직"
              price="₩1,200,000"
              period="/월"
              aiTokens="무제한 수강생 · AI 토큰 100만/월"
              features={[
                "프로페셔널의 모든 기능",
                "시스템의 모든 기능",
                "동영상 업로드 무제한",
                "모든 AI 기능",
                "온프레미스 설치 지원",
                "전용 서버 구축",
                "커스터마이징 개발",
                "통합 관리 시스템",
                "24시간 기술 지원",
                "전담 개발팀 지원"
              ]}
              buttonText="엔터프라이즈 문의"
              buttonVariant="premium"
            />

            {/* 엔터프라이즈 HRD */}
            <PricingCard
              title="엔터프라이즈 HRD"
              description="정부지원 교육 운영 기관"
              price="₩2,000,000"
              period="/월"
              aiTokens="무제한 수강생 · AI 토큰 200만/월"
              features={[
                "엔터프라이즈의 모든 기능",
                "모든 AI 기능",
                "HRD 전용 기능",
                "출석 관리 시스템",
                "훈련수당 관리",
                "훈련일지 관리",
                "중도탈락 관리",
                "상담일지 관리",
                "만족도 조사",
                "훈련 이수 관리",
                "정부 보고서 자동 생성",
                "HRD-Net 연동",
                "컨설팅 및 운영 지원"
              ]}
              buttonText="HRD 문의하기"
              buttonVariant="premium"
            />
          </div>
        </div>
      </section>

      {/* 요금별 상세 기능 비교표 */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              <span className="text-gradient">요금별 상세 기능</span> 비교
            </h2>
            <p className="text-lg text-muted-foreground">
              플랜에 따른 기능을 자세히 비교해보세요
            </p>
          </div>
          
          <div className="max-w-7xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-primary">
                  <th className="p-4 text-left font-bold text-primary-foreground border border-primary/20">기능</th>
                  <th className="p-4 text-center font-bold text-primary-foreground border border-primary/20">
                    스타터<br/>
                    <span className="text-sm font-normal">₩0</span>
                  </th>
                  <th className="p-4 text-center font-bold text-primary-foreground border border-primary/20">
                    스탠다드<br/>
                    <span className="text-sm font-normal">₩150,000/월</span>
                  </th>
                  <th className="p-4 text-center font-bold text-primary-foreground border border-primary/20 relative">
                    프로<br/>
                    <span className="text-sm font-normal">₩300,000/월</span>
                    <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full font-bold">인기</div>
                  </th>
                  <th className="p-4 text-center font-bold text-primary-foreground border border-primary/20 relative">
                    프로페셔널<br/>
                    <span className="text-sm font-normal">₩600,000/월</span>
                    <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full font-bold">인기</div>
                  </th>
                  <th className="p-4 text-center font-bold text-primary-foreground border border-primary/20">
                    엔터프라이즈<br/>
                    <span className="text-sm font-normal">₩1,200,000/월</span>
                  </th>
                  <th className="p-4 text-center font-bold text-primary-foreground border border-primary/20">
                    엔터프라이즈 HRD<br/>
                    <span className="text-sm font-normal">₩2,000,000/월</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* 기본 사양 */}
                <tr className="bg-muted/50">
                  <td colSpan={7} className="p-3 font-bold text-foreground border border-border">기본 사양</td>
                </tr>
                <ComparisonRow
                  feature="최대 수강생"
                  values={[
                    "제한 없음",
                    "200명",
                    "500명",
                    "2,000명",
                    "무제한",
                    "무제한"
                  ]}
                />
                <ComparisonRow
                  feature="동영상 저장공간"
                  values={[
                    "5GB",
                    "50GB",
                    "100GB",
                    "300GB",
                    "무제한",
                    "무제한"
                  ]}
                />
                <ComparisonRow
                  feature="AI 토큰 (월)"
                  values={[
                    "-",
                    "-",
                    "10만 토큰",
                    "50만 토큰",
                    "100만 토큰",
                    "200만 토큰"
                  ]}
                />
                
                {/* 기본 서비스 */}
                <tr className="bg-muted/50">
                  <td colSpan={7} className="p-3 font-bold text-foreground border border-border">기본 서비스</td>
                </tr>
                <ComparisonRow
                  feature="도메인 / 보안 SSL"
                  values={[true, true, true, true, true, true]}
                />
                <ComparisonRow
                  feature="출석 체크 기능"
                  values={[true, true, true, true, true, true]}
                />
                <ComparisonRow
                  feature="과제 제출 및 채점"
                  values={[true, true, true, true, true, true]}
                />
                <ComparisonRow
                  feature="커뮤니티 게시판"
                  values={[true, true, true, true, true, true]}
                />
                <ComparisonRow
                  feature="자동 채점 시스템"
                  values={[false, true, true, true, true, true]}
                />
                <ComparisonRow
                  feature="학습 진도 관리"
                  values={[false, true, true, true, true, true]}
                />
                <ComparisonRow
                  feature="수료증 자동 발급"
                  values={[false, true, true, true, true, true]}
                />
                
                {/* AI 기능 */}
                <tr className="bg-muted/50">
                  <td colSpan={7} className="p-3 font-bold text-foreground border border-border">AI 기능</td>
                </tr>
                <ComparisonRow
                  feature="AI 자동 채점"
                  values={[false, false, true, true, true, true]}
                />
                <ComparisonRow
                  feature="AI 피드백"
                  values={[false, false, true, true, true, true]}
                />
                <ComparisonRow
                  feature="AI 번역"
                  values={[false, false, true, true, true, true]}
                />
                <ComparisonRow
                  feature="AI 요약"
                  values={[false, false, true, true, true, true]}
                />
                <ComparisonRow
                  feature="AI 퀴즈 생성"
                  values={[false, false, true, true, true, true]}
                />
                <ComparisonRow
                  feature="AI 학습 경로 추천"
                  values={[false, false, false, true, true, true]}
                />
                <ComparisonRow
                  feature="AI 진도 예측"
                  values={[false, false, false, true, true, true]}
                />
                <ComparisonRow
                  feature="AI 학습 분석"
                  values={[false, false, false, true, true, true]}
                />
                <ComparisonRow
                  feature="AI 리포트 생성"
                  values={[false, false, false, true, true, true]}
                />
                <ComparisonRow
                  feature="AI 스터디 메이트 매칭"
                  values={[false, false, false, true, true, true]}
                />
                <ComparisonRow
                  feature="AI 튜터"
                  values={[false, false, false, true, true, true]}
                />
                
                {/* 부가 서비스 */}
                <tr className="bg-muted/50">
                  <td colSpan={7} className="p-3 font-bold text-foreground border border-border">부가 서비스</td>
                </tr>
                <ComparisonRow
                  feature="게임화 기능 (배지, 포인트)"
                  values={[false, false, true, true, true, true]}
                />
                <ComparisonRow
                  feature="리더보드"
                  values={[false, false, true, true, true, true]}
                />
                <ComparisonRow
                  feature="학습 전용 앱"
                  values={[false, false, false, true, true, true]}
                />
                <ComparisonRow
                  feature="전담 계정 관리자"
                  values={[false, false, false, true, true, true]}
                />
                <ComparisonRow
                  feature="24시간 우선 지원"
                  values={[false, false, false, true, true, true]}
                />
                
                {/* 엔터프라이즈 기능 */}
                <tr className="bg-muted/50">
                  <td colSpan={7} className="p-3 font-bold text-foreground border border-border">엔터프라이즈 기능</td>
                </tr>
                <ComparisonRow
                  feature="온프레미스 설치"
                  values={[false, false, false, false, true, true]}
                />
                <ComparisonRow
                  feature="커스터마이징 개발"
                  values={[false, false, false, false, true, true]}
                />
                <ComparisonRow
                  feature="전담 개발팀 지원"
                  values={[false, false, false, false, true, true]}
                />
                <ComparisonRow
                  feature="SSO 통합 인증"
                  values={[false, false, false, false, true, true]}
                />
                <ComparisonRow
                  feature="API 연동"
                  values={[false, false, false, false, true, true]}
                />
                
                {/* HRD 전용 기능 */}
                <tr className="bg-muted/50">
                  <td colSpan={7} className="p-3 font-bold text-foreground border border-border">HRD 정부지원 전용</td>
                </tr>
                <ComparisonRow
                  feature="출석 관리 시스템"
                  values={[false, false, false, false, false, true]}
                />
                <ComparisonRow
                  feature="훈련수당 관리"
                  values={[false, false, false, false, false, true]}
                />
                <ComparisonRow
                  feature="훈련일지 관리"
                  values={[false, false, false, false, false, true]}
                />
                <ComparisonRow
                  feature="중도탈락 관리"
                  values={[false, false, false, false, false, true]}
                />
                <ComparisonRow
                  feature="상담일지 관리"
                  values={[false, false, false, false, false, true]}
                />
                <ComparisonRow
                  feature="만족도 조사"
                  values={[false, false, false, false, false, true]}
                />
                <ComparisonRow
                  feature="훈련 이수 관리"
                  values={[false, false, false, false, false, true]}
                />
                <ComparisonRow
                  feature="정부 보고서 자동 생성"
                  values={[false, false, false, false, false, true]}
                />
                <ComparisonRow
                  feature="HRD-Net 연동"
                  values={[false, false, false, false, false, true]}
                />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 유료 부가 서비스 */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              <span className="text-gradient">유료 부가 서비스</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              필요한 기능을 선택하여 플랫폼을 확장하세요 (VAT 별도)
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse bg-card rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-primary">
                  <th className="p-4 text-center font-bold text-primary-foreground border border-primary/20 w-1/4">서비스명</th>
                  <th className="p-4 text-center font-bold text-primary-foreground border border-primary/20 w-1/2">서비스 내용</th>
                  <th className="p-4 text-center font-bold text-primary-foreground border border-primary/20 w-1/4">서비스 요금<br/>(VAT 별도)</th>
                </tr>
              </thead>
              <tbody>
                {/* 스토리지/용량 */}
                <tr className="bg-muted/50">
                  <td rowSpan={3} className="p-4 text-center font-bold text-foreground border border-border align-top">
                    스토리지<br/>용량
                  </td>
                  <td className="p-4 text-sm text-card-foreground border border-border">
                    추가 동영상 저장공간<br/>
                    <span className="text-xs text-muted-foreground">※ 100GB 단위로 추가 가능</span>
                  </td>
                  <td className="p-4 text-center text-sm text-card-foreground border border-border">
                    30,000원/월<br/>
                    <span className="text-xs text-muted-foreground">(100GB당)</span>
                  </td>
                </tr>
                <tr className="bg-card hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-sm text-card-foreground border border-border">
                    추가 대역폭<br/>
                    <span className="text-xs text-muted-foreground">※ 100GB 단위로 추가 가능</span>
                  </td>
                  <td className="p-4 text-center text-sm text-card-foreground border border-border">
                    20,000원/월<br/>
                    <span className="text-xs text-muted-foreground">(100GB당)</span>
                  </td>
                </tr>
                <tr className="bg-card hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-sm text-card-foreground border border-border">
                    추가 AI 토큰<br/>
                    <span className="text-xs text-muted-foreground">※ 10만 토큰 단위로 추가 가능</span>
                  </td>
                  <td className="p-4 text-center text-sm text-card-foreground border border-border">
                    50,000원/월<br/>
                    <span className="text-xs text-muted-foreground">(10만 토큰당)</span>
                  </td>
                </tr>

                {/* 커스터마이징 */}
                <tr className="bg-muted/50">
                  <td rowSpan={3} className="p-4 text-center font-bold text-foreground border border-border align-top">
                    커스터<br/>마이징
                  </td>
                  <td className="p-4 text-sm text-card-foreground border border-border">
                    맞춤형 브랜딩<br/>
                    <span className="text-xs text-muted-foreground">※ 로고, 컬러, 폰트 커스터마이징</span>
                  </td>
                  <td className="p-4 text-center text-sm text-card-foreground border border-border">
                    1회 300,000원
                  </td>
                </tr>
                <tr className="bg-card hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-sm text-card-foreground border border-border">
                    커스텀 도메인 설정<br/>
                    <span className="text-xs text-muted-foreground">※ 연 2회까지 무료 도메인 변경 가능</span>
                  </td>
                  <td className="p-4 text-center text-sm text-card-foreground border border-border">
                    50,000원<br/>
                    <span className="text-xs text-muted-foreground">(1년마다 갱신 납부)</span>
                  </td>
                </tr>
                <tr className="bg-card hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-sm text-card-foreground border border-border">
                    화이트 라벨링<br/>
                    <span className="text-xs text-muted-foreground">※ Atom LMS 브랜딩 완전 제거</span>
                  </td>
                  <td className="p-4 text-center text-sm text-card-foreground border border-border">
                    200,000원/월
                  </td>
                </tr>

                {/* 기술 지원 */}
                <tr className="bg-muted/50">
                  <td rowSpan={2} className="p-4 text-center font-bold text-foreground border border-border align-top">
                    기술 지원
                  </td>
                  <td className="p-4 text-sm text-card-foreground border border-border">
                    우선 기술 지원<br/>
                    <span className="text-xs text-muted-foreground">※ 24시간 이내 응답 보장, 전화/이메일/채팅</span>
                  </td>
                  <td className="p-4 text-center text-sm text-card-foreground border border-border">
                    100,000원/월
                  </td>
                </tr>
                <tr className="bg-card hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-sm text-card-foreground border border-border">
                    전담 계정 관리자 배정<br/>
                    <span className="text-xs text-muted-foreground">※ 1:1 전담 매니저 지원</span>
                  </td>
                  <td className="p-4 text-center text-sm text-card-foreground border border-border">
                    300,000원/월
                  </td>
                </tr>

                {/* 교육/컨설팅 */}
                <tr className="bg-muted/50">
                  <td rowSpan={3} className="p-4 text-center font-bold text-foreground border border-border align-top">
                    교육<br/>컨설팅
                  </td>
                  <td className="p-4 text-sm text-card-foreground border border-border">
                    교육 운영 컨설팅<br/>
                    <span className="text-xs text-muted-foreground">※ 교육 과정 설계 및 운영 전략 수립</span>
                  </td>
                  <td className="p-4 text-center text-sm text-card-foreground border border-border">
                    1회 500,000원<br/>
                    <span className="text-xs text-muted-foreground">(2시간 기준)</span>
                  </td>
                </tr>
                <tr className="bg-card hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-sm text-card-foreground border border-border">
                    강사 트레이닝<br/>
                    <span className="text-xs text-muted-foreground">※ 플랫폼 활용 교육 (최대 10명)</span>
                  </td>
                  <td className="p-4 text-center text-sm text-card-foreground border border-border">
                    1회 300,000원<br/>
                    <span className="text-xs text-muted-foreground">(3시간 기준)</span>
                  </td>
                </tr>
                <tr className="bg-card hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-sm text-card-foreground border border-border">
                    학생 온보딩 지원<br/>
                    <span className="text-xs text-muted-foreground">※ 학생 대상 플랫폼 사용법 교육</span>
                  </td>
                  <td className="p-4 text-center text-sm text-card-foreground border border-border">
                    1회 200,000원<br/>
                    <span className="text-xs text-muted-foreground">(2시간 기준, 최대 50명)</span>
                  </td>
                </tr>

                {/* 고급 기능 */}
                <tr className="bg-muted/50">
                  <td rowSpan={4} className="p-4 text-center font-bold text-foreground border border-border align-top">
                    고급 기능
                  </td>
                  <td className="p-4 text-sm text-card-foreground border border-border">
                    화상 강의 시스템 연동<br/>
                    <span className="text-xs text-muted-foreground">※ Zoom, Google Meet 등 연동</span>
                  </td>
                  <td className="p-4 text-center text-sm text-card-foreground border border-border">
                    150,000원/월
                  </td>
                </tr>
                <tr className="bg-card hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-sm text-card-foreground border border-border">
                    결제 게이트웨이 연동<br/>
                    <span className="text-xs text-muted-foreground">※ 토스페이먼츠, 이니시스, KG이니시스 등<br/>수수료: 결제금액의 3.3% + 250원/건</span>
                  </td>
                  <td className="p-4 text-center text-sm text-card-foreground border border-border">
                    1회 200,000원<br/>
                    <span className="text-xs text-destructive text-xs">+ 거래 수수료</span>
                  </td>
                </tr>
                <tr className="bg-card hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-sm text-card-foreground border border-border">
                    모바일 앱 (iOS/Android)<br/>
                    <span className="text-xs text-muted-foreground">※ 네이티브 앱 제공, 앱스토어 등록 포함</span>
                  </td>
                  <td className="p-4 text-center text-sm text-card-foreground border border-border">
                    유지보수 300,000원/월<br/>
                    <span className="text-xs text-muted-foreground">앱 배포 초기 비용 1,000,000원</span>
                  </td>
                </tr>
                <tr className="bg-card hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-sm text-card-foreground border border-border">
                    SMS/알림톡 서비스<br/>
                    <span className="text-xs text-muted-foreground">※ 수강생 알림 발송 (SMS 15원, 알림톡 8원)</span>
                  </td>
                  <td className="p-4 text-center text-sm text-card-foreground border border-border">
                    사용량에 따라 청구
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              ※ 모든 가격은 부가세(VAT) 별도이며, 계약 기간에 따라 할인이 적용될 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p>© 2025 Atom LMS. All rights reserved.</p>
            <p className="mt-2 text-sm">AI 기반 학습관리 플랫폼 | 온라인 교육 솔루션</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const ComparisonRow = ({ feature, values }: { feature: string; values: (string | boolean)[] }) => {
  return (
    <tr className="bg-card hover:bg-muted/30 transition-colors">
      <td className="p-4 text-sm text-card-foreground border border-border">{feature}</td>
      {values.map((value, index) => (
        <td key={index} className="p-4 text-center border border-border">
          {typeof value === "boolean" ? (
            value ? (
              <Check className="h-5 w-5 text-primary mx-auto" />
            ) : (
              <X className="h-5 w-5 text-muted-foreground mx-auto" />
            )
          ) : (
            <span className="text-sm text-card-foreground">{value}</span>
          )}
        </td>
      ))}
    </tr>
  );
};

interface PricingCardProps {
  title: string;
  description: string;
  price: string;
  period: string;
  aiTokens: string;
  features: string[];
  buttonText: string;
  buttonVariant?: "default" | "outline" | "premium";
  isPopular?: boolean;
}

const PricingCard = ({ 
  title, 
  description, 
  price, 
  period, 
  aiTokens, 
  features, 
  buttonText, 
  buttonVariant = "outline",
  isPopular = false 
}: PricingCardProps) => {
  return (
    <div className={`relative rounded-2xl bg-card p-8 shadow-premium transition-all duration-500 hover:shadow-elegant ${
      isPopular 
        ? 'border-2 border-primary hover:scale-[1.02]' 
        : 'border border-border hover:border-primary/50 hover:scale-[1.01]'
    }`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-glow">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span>인기</span>
            <Star className="h-3.5 w-3.5 fill-current" />
          </div>
        </div>
      )}
      
      <div className="flex flex-col h-full">
        <div className="mb-6">
          <h3 className="text-xl font-display font-bold mb-2 text-card-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          
          <div className="mb-4">
            <div className="flex items-baseline gap-0.5 flex-wrap">
              <span className="text-3xl font-display font-bold text-foreground">{price}</span>
              <span className="text-lg text-muted-foreground font-medium">{period}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{aiTokens}</p>
          </div>

          <Link to="/auth">
            <Button 
              variant={buttonVariant} 
              className="w-full"
              size="lg"
            >
              {buttonText}
            </Button>
          </Link>
        </div>

        {/* 기능 목록 */}
        <div className="flex-1">
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-card-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
