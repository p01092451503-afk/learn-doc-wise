import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, Star, Sparkles, ArrowLeft } from "lucide-react";
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
