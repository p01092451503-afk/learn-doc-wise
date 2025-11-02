import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Bot, Brain, Users, BarChart3, CheckCircle, Zap, Sparkles, Award, TrendingUp, Check, Star, FileText, Calendar, MessageSquare, AlertTriangle, Trophy, Wallet, ClipboardCheck, UserCheck, Route, FileQuestion, X, Info } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const Landing = () => {

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="border-b sticky top-0 bg-background/95 backdrop-blur-xl z-50 shadow-sm" role="navigation" aria-label="주요 메뉴">
          <div className="container mx-auto px-4 h-20 flex items-center justify-between">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/" className="flex items-center gap-2" aria-label="Atom LMS 홈페이지">
                  <img src={logoIcon} alt="Atom LMS 로고 - AI 기반 학습관리 플랫폼" className="h-12 w-12" />
                  <span className="text-2xl font-logo font-bold text-foreground tracking-tight">atomLMS</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-primary text-primary-foreground border-primary">
                <p>아톰 안녕?</p>
              </TooltipContent>
            </Tooltip>
          <div className="flex items-center gap-3">
            <Link to="/features-detail">
              <Button variant="ghost" size="default">세부 기능</Button>
            </Link>
            <Link to="/pricing">
              <Button variant="ghost" size="default">요금제</Button>
            </Link>
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
      <header className="relative overflow-hidden py-8 md:py-12" role="banner">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" aria-hidden="true" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" aria-hidden="true" />
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
      </header>

      {/* Features Section */}
      <section className="py-10 bg-muted/30" aria-labelledby="features-heading">
        <div className="container mx-auto px-4">
          <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-center mb-10 text-foreground">
            왜 <span className="font-logo">atomLMS</span>인가?
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Brain className="h-10 w-10" />}
              title="AI 지능형 학습"
              description="10가지 이상의 AI 기능으로 학습 경로 추천, 퀴즈 생성, 자동 채점, 진도 예측 등을 제공합니다"
            />
            <FeatureCard
              icon={<Award className="h-10 w-10" />}
              title="HRD 전문 시스템"
              description="정부지원 훈련과정에 필요한 출석, 훈련일지, 상담일지, 수료 관리 등 모든 기능을 완벽 지원합니다"
            />
            <FeatureCard
              icon={<Zap className="h-10 w-10" />}
              title="엔터프라이즈급 안정성"
              description="99.9% 가동률 보장, 자동 백업, 실시간 모니터링으로 언제나 안정적인 서비스를 제공합니다"
            />
            <FeatureCard
              icon={<CheckCircle className="h-10 w-10" />}
              title="강력한 보안 체계"
              description="데이터 암호화, RLS 기반 접근 제어, 역할별 권한 관리로 민감한 학습 데이터를 안전하게 보호합니다"
            />
            <FeatureCard
              icon={<BarChart3 className="h-10 w-10" />}
              title="실시간 분석 대시보드"
              description="학습 진도, 성적, 참여도, AI 사용량 등 모든 데이터를 실시간으로 분석하고 시각화합니다"
            />
            <FeatureCard
              icon={<Users className="h-10 w-10" />}
              title="확장 가능한 아키텍처"
              description="멀티 테넌트 구조로 수천 명의 동시 사용자를 지원하며, 무제한 확장이 가능합니다"
            />
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Brain className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-primary">AI 파워드</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
              <span className="text-gradient">다양하고 강력한</span><br />
              AI 기능
            </h2>
            <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              최신 AI 기술로 학습 효율을 극대화하고, 강사의 업무 부담을 줄이며,<br />
              학습자에게 개인화된 경험을 제공합니다
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto">
            {/* AI 튜터 */}
            <div className="group p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold mb-2 text-card-foreground group-hover:text-primary transition-colors">AI 튜터</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    24시간 상시 대기하는 AI 튜터가 질문에 즉시 답변하고, 개념 설명과 퀴즈를 제공합니다
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">실시간 답변</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">개념 설명</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI 자동 채점 */}
            <div className="group p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold mb-2 text-card-foreground group-hover:text-primary transition-colors">AI 자동 채점</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    과제와 시험을 AI가 자동으로 채점하고 상세한 피드백을 즉시 제공합니다
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">즉시 채점</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">상세 피드백</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI 피드백 */}
            <div className="group p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold mb-2 text-card-foreground group-hover:text-primary transition-colors">AI 피드백</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    과제와 문법을 AI가 분석하여 개선점과 맞춤형 피드백을 제공합니다
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">과제 분석</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">문법 교정</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI 번역 */}
            <div className="group p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold mb-2 text-card-foreground group-hover:text-primary transition-colors">AI 번역</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    학습 자료와 콘텐츠를 다국어로 실시간 번역하여 글로벌 학습을 지원합니다
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">실시간 번역</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">다국어 지원</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI 학습 분석 */}
            <div className="group p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold mb-2 text-card-foreground group-hover:text-primary transition-colors">AI 학습 분석</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    학습 패턴을 분석하여 취약점을 파악하고 맞춤형 학습 경로를 제안합니다
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">패턴 분석</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">맞춤 경로</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI 리포트 */}
            <div className="group p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold mb-2 text-card-foreground group-hover:text-primary transition-colors">AI 리포트 생성</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    학습 데이터를 기반으로 상세한 분석 리포트를 자동으로 생성합니다
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">자동 생성</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">상세 분석</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI 학습 경로 추천 */}
            <div className="group p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Route className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold mb-2 text-card-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                    AI 학습 경로 추천
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    수준과 목표를 분석하여 최적의 학습 순서와 코스를 추천합니다
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">맞춤 추천</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">단계별 학습</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI 퀴즈 생성 */}
            <div className="group p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <FileQuestion className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold mb-2 text-card-foreground group-hover:text-primary transition-colors">AI 퀴즈 생성</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    강의 내용을 분석하여 맞춤형 퀴즈와 연습문제를 자동 생성합니다
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">자동 생성</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">다양한 난이도</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI 요약 */}
            <div className="group p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold mb-2 text-card-foreground group-hover:text-primary transition-colors">AI 요약</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    긴 강의나 문서를 핵심 내용만 간추려 빠르게 이해할 수 있습니다
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">핵심 요약</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">시간 절약</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI 진도 예측 */}
            <div className="group p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold mb-2 text-card-foreground group-hover:text-primary transition-colors">AI 진도 예측</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    학습 속도를 분석하여 수료일과 학습 성과를 미리 예측합니다
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">진도 예측</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">성과 추정</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI 학습 매칭 */}
            <div className="group p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold mb-2 text-card-foreground group-hover:text-primary transition-colors">AI 학습 매칭</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    수준이 비슷한 학습자를 매칭하여 스터디 그룹을 형성합니다
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">자동 매칭</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">스터디 그룹</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI 챗봇 */}
            <div className="group p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold mb-2 text-card-foreground group-hover:text-primary transition-colors">AI 챗봇</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    학습 관련 질문에 24시간 즉시 응답하는 지능형 챗봇 서비스
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">24/7 지원</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">맞춤 답변</span>
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

      {/* HRD 정부지원 훈련과정 전용 기능 */}
      <section className="py-10 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
              <Award className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-accent">HRD 정부지원 훈련과정</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              정부지원 훈련기관을 위한 전문 기능
            </h3>
            <p className="text-muted-foreground">
              HRD-Net 연계부터 수료 관리까지, 정부지원 훈련과정 운영에 필요한 모든 기능
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <FeatureCard
              icon={<FileText className="h-10 w-10" />}
              title="훈련일지 관리"
              description="일일 훈련 내용과 진행 사항을 체계적으로 기록하고 관리합니다"
            />
            <FeatureCard
              icon={<Calendar className="h-10 w-10" />}
              title="출석 관리"
              description="출석, 지각, 결석을 자동으로 체크하고 상세 이력을 관리합니다"
            />
            <FeatureCard
              icon={<MessageSquare className="h-10 w-10" />}
              title="상담일지"
              description="학생 상담 내용을 기록하고 맞춤형 학습 지원을 제공합니다"
            />
            <FeatureCard
              icon={<AlertTriangle className="h-10 w-10" />}
              title="중도탈락 관리"
              description="중도탈락 위험 학생을 조기 발견하고 적극적으로 지원합니다"
            />
            <FeatureCard
              icon={<Trophy className="h-10 w-10" />}
              title="수료 관리"
              description="출석률과 성적을 자동 집계하여 수료 요건을 관리합니다"
            />
            <FeatureCard
              icon={<Wallet className="h-10 w-10" />}
              title="훈련수당 관리"
              description="출석 기반 훈련수당을 자동 계산하고 지급 내역을 관리합니다"
            />
            <FeatureCard
              icon={<Star className="h-10 w-10" />}
              title="만족도 조사"
              description="중간/최종 만족도 조사를 진행하고 결과를 분석합니다"
            />
            <FeatureCard
              icon={<ClipboardCheck className="h-10 w-10" />}
              title="성적 관리"
              description="시험, 과제, 참여도를 종합하여 체계적으로 성적을 관리합니다"
            />
            <FeatureCard
              icon={<UserCheck className="h-10 w-10" />}
              title="훈련생 관리"
              description="훈련생 정보와 학습 이력을 통합 관리하고 맞춤 지원합니다"
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
                  <th className="p-4 text-center font-bold text-primary-foreground border border-primary/20 relative overflow-visible">
                    프로<br/>
                    <span className="text-sm font-normal">₩300,000/월</span>
                    <div className="absolute -top-3 -right-3 bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full font-bold shadow-lg z-10">인기</div>
                  </th>
                  <th className="p-4 text-center font-bold text-primary-foreground border border-primary/20 relative overflow-visible">
                    프로페셔널<br/>
                    <span className="text-sm font-normal">₩600,000/월</span>
                    <div className="absolute -top-3 -right-3 bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full font-bold shadow-lg z-10">인기</div>
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
          
          <div className="text-center mt-12">
            <Link to="/pricing">
              <Button size="lg" variant="premium" className="gap-2">
                <Sparkles className="h-5 w-5" />
                요금제 자세히 보기
              </Button>
            </Link>
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

      {/* Pricing Section - 숨김 처리 */}
      {/* <section className="py-20 bg-muted/30" aria-labelledby="pricing-heading">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 id="pricing-heading" className="text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="text-gradient">합리적인 가격</span>으로<br />
              시작하세요
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              모든 요금제는 부가세 별도입니다. 연간 결제 시 20% 할인 혜택을 제공합니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
            Pricing cards...
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/30" role="contentinfo">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p>© 2025 Atom LMS. All rights reserved.</p>
            <p className="mt-2 text-sm">AI 기반 학습관리 플랫폼 | 온라인 교육 솔루션</p>
          </div>
        </div>
      </footer>

    </div>
    </TooltipProvider>
  );
};

const ComparisonRow = ({ feature, values }: { feature: string; values: (string | boolean)[] }) => {
  return (
    <tr className="bg-card hover:bg-muted/30 transition-colors">
      <td className="p-4 text-sm text-card-foreground border border-border">{feature}</td>
      {values.map((value, index) => (
        <td key={index} className="p-4 text-center border border-border">
          {typeof value === 'boolean' ? (
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

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="group p-6 rounded-xl card-premium border border-border shadow-premium hover:border-primary/50 hover:shadow-glow transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.01] bg-gradient-to-br from-background to-background/80">
      <div className="relative mb-3">
        <div className="text-primary group-hover:scale-110 transition-transform duration-300 drop-shadow-lg [&>svg]:h-8 [&>svg]:w-8">{icon}</div>
        <div className="absolute inset-0 bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <h3 className="text-lg font-display font-semibold mb-2 text-card-foreground group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
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