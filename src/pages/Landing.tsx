import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Bot, Brain, Users, BarChart3, CheckCircle, Zap, Sparkles, Award, TrendingUp, Check, Star } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";


const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b sticky top-0 bg-background/95 backdrop-blur-xl z-50 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoIcon} alt="Logo" className="h-12 w-12" />
            <span className="text-2xl font-logo font-bold text-foreground tracking-tight">atomLMS</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="default">로그인</Button>
            </Link>
            <Link to="/auth">
              <Button variant="premium" size="default" className="gap-2">
                <Sparkles className="h-4 w-4" />
                무료 시작하기
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-8 md:py-12">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">AI 기반 혁신 학습</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 text-foreground leading-tight animate-slide-up">
              차세대<br />
              <span className="text-gradient">AI 학습관리시스템</span>
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
              강사와 학습자를 위한 프리미엄 LMS. AI 튜터, 자동 평가, 
              실시간 분석으로 더 스마트한 학습 경험을 제공합니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/auth">
                <Button size="lg" variant="premium" className="text-lg px-10 gap-2">
                  <TrendingUp className="h-5 w-5" />
                  지금 시작하기
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="text-lg px-10">
                  데모 체험하기
                </Button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-10 mt-16">
              <div className="flex items-center gap-3">
                <Award className="h-7 w-7 text-accent" />
                <span className="text-base font-semibold text-foreground">업계 최고 평점 4.9</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-7 w-7 text-accent" />
                <span className="text-base font-semibold text-foreground">10,000+ 활성 사용자</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-7 w-7 text-accent" />
                <span className="text-base font-semibold text-foreground">99.9% 업타임 보장</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            왜 <span className="font-logo">atomLMS</span>인가?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Brain className="h-10 w-10" />}
              title="AI 기반 학습"
              description="개인화된 AI 튜터가 학습을 도와주고, 자동으로 피드백과 요약을 제공합니다"
            />
            <FeatureCard
              icon={<Users className="h-10 w-10" />}
              title="협업 학습"
              description="토론, Q&A, 그룹 스터디를 통해 학습자들과 함께 성장하세요"
            />
            <FeatureCard
              icon={<BarChart3 className="h-10 w-10" />}
              title="실시간 분석"
              description="학습 진도, 성적, 참여도를 실시간으로 확인하고 개선하세요"
            />
            <FeatureCard
              icon={<Zap className="h-10 w-10" />}
              title="자동화된 평가"
              description="AI가 과제를 자동으로 채점하고 상세한 피드백을 제공합니다"
            />
            <FeatureCard
              icon={<CheckCircle className="h-10 w-10" />}
              title="수료증 발급"
              description="코스 완료 시 자동으로 수료증이 발급됩니다"
            />
            <FeatureCard
              icon={<Bot className="h-10 w-10" />}
              title="AI 기반 학습"
              description="Atom AI가 개인화된 학습 경로를 제공하고 실시간으로 피드백합니다"
            />
            <FeatureCard
              icon={<Sparkles className="h-10 w-10" />}
              title="스마트 출석"
              description="자동 출석 체크와 학습 참여도를 실시간으로 모니터링합니다"
            />
            <FeatureCard
              icon={<TrendingUp className="h-10 w-10" />}
              title="진도 관리"
              description="학습 진행 상황을 한눈에 파악하고 목표 달성을 지원합니다"
            />
            <FeatureCard
              icon={<Award className="h-10 w-10" />}
              title="성취 보상"
              description="학습 목표 달성 시 배지와 포인트로 동기부여를 제공합니다"
            />
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Brain className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-primary">AI 파워드</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              <span className="text-gradient">AI가 탑재된</span><br />
              7가지 핵심 기능
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              최신 AI 기술로 학습 효율을 극대화하고, 강사의 업무 부담을 줄이며,<br />
              학습자에게 개인화된 경험을 제공합니다
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* AI 튜터 */}
            <div className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2 text-card-foreground group-hover:text-primary transition-colors">AI 튜터</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    24시간 상시 대기하는 AI 튜터가 질문에 즉시 답변하고, 개념 설명과 퀴즈를 제공합니다
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">실시간 답변</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">개념 설명</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI 자동 채점 */}
            <div className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2 text-card-foreground group-hover:text-primary transition-colors">AI 자동 채점</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    과제와 시험을 AI가 자동으로 채점하고 상세한 피드백을 즉시 제공합니다
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">즉시 채점</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">상세 피드백</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI 피드백 */}
            <div className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2 text-card-foreground group-hover:text-primary transition-colors">AI 피드백</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    과제와 문법을 AI가 분석하여 개선점과 맞춤형 피드백을 제공합니다
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">과제 분석</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">문법 교정</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI 번역 */}
            <div className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2 text-card-foreground group-hover:text-primary transition-colors">AI 번역</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    학습 자료와 콘텐츠를 다국어로 실시간 번역하여 글로벌 학습을 지원합니다
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">실시간 번역</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">다국어 지원</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI 학습 분석 */}
            <div className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2 text-card-foreground group-hover:text-primary transition-colors">AI 학습 분석</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    학습 패턴을 분석하여 취약점을 파악하고 맞춤형 학습 경로를 제안합니다
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">패턴 분석</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">맞춤 경로</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI 리포트 */}
            <div className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2 text-card-foreground group-hover:text-primary transition-colors">AI 리포트 생성</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    학습 데이터를 기반으로 상세한 분석 리포트를 자동으로 생성합니다
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">자동 생성</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">상세 분석</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI 챗봇 */}
            <div className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1 md:col-span-2 lg:col-span-3">
              <div className="flex items-start gap-4 max-w-2xl mx-auto">
                <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2 text-card-foreground group-hover:text-primary transition-colors">AI 챗봇</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    학습자와 강사를 위한 지능형 챗봇이 학습 관련 질문에 실시간으로 답변하고, 코스 추천, 일정 관리, 학습 조언을 제공합니다
                  </p>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">실시간 상담</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">코스 추천</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">일정 관리</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <Link to="/auth">
              <Button size="lg" variant="premium" className="gap-2">
                <Sparkles className="h-5 w-5" />
                AI 기능 체험하기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="text-gradient">합리적인 가격</span>으로<br />
              시작하세요
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              모든 요금제는 부가세 별도입니다. 연간 결제 시 20% 할인 혜택을 제공합니다.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* 스타터 */}
            <PricingCard
              title="스타터"
              description="개인 강사 및 소규모 학습 그룹"
              price="₩0"
              period="/영구 무료"
              aiTokens="월 최대 수강생 50명"
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

            {/* 스탠다드 (인기) */}
            <PricingCard
              title="스탠다드"
              description="전문 강사 및 중소 교육 기관"
              price="₩150,000"
              period="/월"
              aiTokens="월 최대 수강생 500명"
              features={[
                "무제한 강좌 개설",
                "동영상 업로드 100GB",
                "AI 학습 분석 엔진",
                "실시간 화상 강의",
                "자동 채점 시스템",
                "맞춤형 학습 경로",
                "우선 고객 지원",
                "수료증 자동 발급"
              ]}
              buttonText="스탠다드 시작하기"
              buttonVariant="default"
              isPopular={true}
            />

            {/* 프로페셔널 */}
            <PricingCard
              title="프로페셔널"
              description="대형 교육 기관 및 기업 교육"
              price="₩300,000"
              period="/월"
              aiTokens="월 최대 수강생 무제한"
              features={[
                "스탠다드의 모든 기능",
                "동영상 업로드 500GB",
                "전담 계정 관리자",
                "24시간 우선 지원",
                "맞춤형 브랜딩",
                "API 연동 지원",
                "실시간 라이브 강의",
                "고급 분석 대시보드",
                "SSO 통합 인증"
              ]}
              buttonText="프로페셔널 시작하기"
              buttonVariant="premium"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              <span className="text-gradient">AI가 설계한</span><br />
              지능형 학습의 세계로 초대합니다
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              14일 무료 체험을 통해 자동 진도 관리, 실시간 피드백, 콘텐츠 추천까지<br />
              <span className="font-logo font-semibold">atomLMS</span>의 모든 기능을 직접 경험해보세요.<br />
              복잡한 등록 절차나 결제 정보는 필요 없습니다.
            </p>
            <Link to="/auth">
              <Button size="lg" variant="gold" className="text-lg px-12 gap-2 shadow-glow">
                <Sparkles className="h-5 w-5" />
                무료로 시작하기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p>© 2024 Atom LMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="group p-8 rounded-2xl card-premium border border-border shadow-premium hover:border-primary/50 hover:shadow-glow transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.01] bg-gradient-to-br from-background to-background/80">
      <div className="relative mb-4">
        <div className="text-primary group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">{icon}</div>
        <div className="absolute inset-0 bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <h3 className="text-xl font-display font-semibold mb-3 text-card-foreground group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
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
        ? 'border-2 border-primary scale-105 hover:scale-[1.07]' 
        : 'border border-border hover:border-primary/50 hover:scale-105'
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
      
      <div className="text-center mb-6">
        <h3 className="text-2xl font-display font-bold mb-2 text-card-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="text-center mb-6 pb-6 border-b border-border">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl md:text-5xl font-display font-bold text-foreground">{price}</span>
          <span className="text-muted-foreground text-sm">{period}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{aiTokens}</p>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-sm text-card-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <Link to="/auth" className="block">
        <Button 
          variant={buttonVariant} 
          className="w-full"
          size="lg"
        >
          {buttonText}
        </Button>
      </Link>
    </div>
  );
};

export default Landing;
