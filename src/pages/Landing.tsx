import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Bot, Brain, Users, BarChart3, CheckCircle, Zap, Sparkles, Award, TrendingUp, Check, Star, FileText, Calendar, MessageSquare, AlertTriangle, Trophy, Wallet, ClipboardCheck, UserCheck, Route, FileQuestion, X, BookOpen } from "lucide-react";
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
                  <img src={logoIcon} alt="Atom LMS 로고 - AI 기반 학습관리 플랫폼" className="h-12 w-12" width="48" height="48" />
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

        {/* 역할별 대시보드 체험 기능 */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-primary">역할별 전용 기능</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                <span className="text-gradient">역할별</span> 맞춤 대시보드
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                학생, 강사, 관리자 각각의 니즈에 최적화된 전용 기능을 제공합니다
              </p>
            </div>

            {/* 학생 기능 */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">학생 대시보드</h3>
                  <p className="text-muted-foreground">자기주도 학습을 위한 스마트한 학습 환경</p>
                </div>
              </div>
              <div className="grid md:grid-cols-4 gap-4 max-w-7xl mx-auto">
                <div className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                  <BarChart3 className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">대시보드</h4>
                  <p className="text-sm text-muted-foreground">학습 현황 한눈에 파악</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                  <BookOpen className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">내 강의</h4>
                  <p className="text-sm text-muted-foreground">수강 중인 모든 강의 관리</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                  <Route className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">AI 학습 경로</h4>
                  <p className="text-sm text-muted-foreground">맞춤형 학습 로드맵 제공</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                  <FileText className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">과제</h4>
                  <p className="text-sm text-muted-foreground">과제 제출 및 피드백 확인</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                  <MessageSquare className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">커뮤니티</h4>
                  <p className="text-sm text-muted-foreground">학습자 간 소통과 토론</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                  <Trophy className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">게이미피케이션</h4>
                  <p className="text-sm text-muted-foreground">배지, 포인트, 리더보드</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                  <BarChart3 className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">학습 통계</h4>
                  <p className="text-sm text-muted-foreground">학습 패턴 분석 및 진도 확인</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                  <Star className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">만족도 조사</h4>
                  <p className="text-sm text-muted-foreground">강의 평가 및 의견 제출</p>
                </div>
              </div>
            </div>

            {/* 강사 기능 */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-xl bg-accent/10">
                  <Users className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">강사 대시보드</h3>
                  <p className="text-muted-foreground">효율적인 강의 운영과 학생 관리</p>
                </div>
              </div>
              <div className="grid md:grid-cols-4 gap-4 max-w-7xl mx-auto">
                <div className="p-4 rounded-lg bg-card border border-border hover:border-accent/50 transition-all">
                  <BarChart3 className="h-6 w-6 text-accent mb-2" />
                  <h4 className="font-semibold mb-1">대시보드</h4>
                  <p className="text-sm text-muted-foreground">강의 현황 실시간 모니터링</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-accent/50 transition-all">
                  <BookOpen className="h-6 w-6 text-accent mb-2" />
                  <h4 className="font-semibold mb-1">강의 관리</h4>
                  <p className="text-sm text-muted-foreground">강의 생성 및 콘텐츠 업로드</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-accent/50 transition-all">
                  <CheckCircle className="h-6 w-6 text-accent mb-2" />
                  <h4 className="font-semibold mb-1">AI 과제 채점</h4>
                  <p className="text-sm text-muted-foreground">자동 채점 및 피드백 생성</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-accent/50 transition-all">
                  <Calendar className="h-6 w-6 text-accent mb-2" />
                  <h4 className="font-semibold mb-1">출석 관리</h4>
                  <p className="text-sm text-muted-foreground">실시간 출석 체크 및 이력</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-accent/50 transition-all">
                  <ClipboardCheck className="h-6 w-6 text-accent mb-2" />
                  <h4 className="font-semibold mb-1">훈련일지</h4>
                  <p className="text-sm text-muted-foreground">HRD 일일 훈련 기록</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-accent/50 transition-all">
                  <MessageSquare className="h-6 w-6 text-accent mb-2" />
                  <h4 className="font-semibold mb-1">상담일지</h4>
                  <p className="text-sm text-muted-foreground">학생 상담 내용 기록 관리</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-accent/50 transition-all">
                  <AlertTriangle className="h-6 w-6 text-accent mb-2" />
                  <h4 className="font-semibold mb-1">중도탈락 관리</h4>
                  <p className="text-sm text-muted-foreground">위험군 학생 조기 발견</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-accent/50 transition-all">
                  <Trophy className="h-6 w-6 text-accent mb-2" />
                  <h4 className="font-semibold mb-1">수료 요건</h4>
                  <p className="text-sm text-muted-foreground">수료 기준 관리 및 추적</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-accent/50 transition-all">
                  <Wallet className="h-6 w-6 text-accent mb-2" />
                  <h4 className="font-semibold mb-1">훈련수당</h4>
                  <p className="text-sm text-muted-foreground">출석 기반 수당 자동 계산</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-accent/50 transition-all">
                  <BarChart3 className="h-6 w-6 text-accent mb-2" />
                  <h4 className="font-semibold mb-1">훈련 리포트</h4>
                  <p className="text-sm text-muted-foreground">AI 기반 상세 분석 리포트</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-accent/50 transition-all">
                  <Users className="h-6 w-6 text-accent mb-2" />
                  <h4 className="font-semibold mb-1">학생 관리</h4>
                  <p className="text-sm text-muted-foreground">수강생 정보 및 진도 관리</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-accent/50 transition-all">
                  <TrendingUp className="h-6 w-6 text-accent mb-2" />
                  <h4 className="font-semibold mb-1">통계 분석</h4>
                  <p className="text-sm text-muted-foreground">강의 성과 데이터 분석</p>
                </div>
              </div>
            </div>

            {/* 관리자 기능 */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">관리자 대시보드</h3>
                  <p className="text-muted-foreground">전체 시스템 관리 및 운영 최적화</p>
                </div>
              </div>
              <div className="grid md:grid-cols-4 gap-4 max-w-7xl mx-auto">
                <div className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                  <BarChart3 className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">통합 대시보드</h4>
                  <p className="text-sm text-muted-foreground">전체 현황 실시간 모니터링</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                  <Users className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">사용자 관리</h4>
                  <p className="text-sm text-muted-foreground">회원 등록 및 권한 관리</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                  <UserCheck className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">데모 승인</h4>
                  <p className="text-sm text-muted-foreground">데모 신청 검토 및 승인</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                  <BookOpen className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">강좌 관리</h4>
                  <p className="text-sm text-muted-foreground">전체 강좌 승인 및 관리</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                  <FileText className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">콘텐츠 관리</h4>
                  <p className="text-sm text-muted-foreground">학습 자료 중앙 관리</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                  <Brain className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">AI 학습 관리</h4>
                  <p className="text-sm text-muted-foreground">AI 기능 활용 현황 파악</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                  <Calendar className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">출석 관리</h4>
                  <p className="text-sm text-muted-foreground">전체 출석 현황 통합 관리</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                  <ClipboardCheck className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">훈련일지</h4>
                  <p className="text-sm text-muted-foreground">HRD 전체 일지 확인</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                  <Star className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">만족도 조사</h4>
                  <p className="text-sm text-muted-foreground">전체 만족도 결과 분석</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                  <MessageSquare className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">상담일지</h4>
                  <p className="text-sm text-muted-foreground">전체 상담 내역 통합 관리</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                  <AlertTriangle className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">중도탈락 관리</h4>
                  <p className="text-sm text-muted-foreground">위험군 학생 전체 파악</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                  <Trophy className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">수료 관리</h4>
                  <p className="text-sm text-muted-foreground">전체 수료 요건 관리</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                  <CheckCircle className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">성적 관리</h4>
                  <p className="text-sm text-muted-foreground">전체 학생 성적 통합 관리</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                  <Wallet className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">훈련수당</h4>
                  <p className="text-sm text-muted-foreground">전체 수당 지급 관리</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                  <Brain className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">AI 로그</h4>
                  <p className="text-sm text-muted-foreground">AI 사용 내역 및 비용 추적</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                  <Zap className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold mb-1">시스템 모니터링</h4>
                  <p className="text-sm text-muted-foreground">서버 상태 및 성능 모니터링</p>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link to="/demo">
                <Button size="lg" variant="premium" className="gap-2">
                  <Sparkles className="h-5 w-5" />
                  지금 바로 데모 체험하기
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
                    <th className="p-4 text-center font-bold text-primary-foreground border border-primary/20">
                      프로<br/>
                      <span className="text-sm font-normal">₩300,000/월</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* 기본 LMS 기능 */}
                  <tr className="bg-muted">
                    <td colSpan={4} className="p-3 font-bold text-base border border-border">
                      📚 기본 LMS 기능
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">강의 콘텐츠 업로드</td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">비디오 강의 (Vimeo/YouTube)</td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">수강생 관리</td>
                    <td className="p-3 text-center border border-border">최대 10명</td>
                    <td className="p-3 text-center border border-border">최대 500명</td>
                    <td className="p-3 text-center border border-border">무제한</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">과제 및 시험 출제</td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">온라인 퀴즈</td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">게시판 및 Q&A</td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">실시간 채팅</td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>

                  {/* AI 기능 */}
                  <tr className="bg-muted">
                    <td colSpan={4} className="p-3 font-bold text-base border border-border">
                      🤖 AI 학습 기능
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">AI 튜터 (24/7 Q&A)</td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border">제한적</td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">AI 자동 채점</td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">AI 피드백 생성</td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">AI 퀴즈 자동 생성</td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">AI 학습 경로 추천</td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">AI 진도 예측</td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">AI 요약</td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">AI 번역 (다국어 지원)</td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>

                  {/* 분석 및 리포트 */}
                  <tr className="bg-muted">
                    <td colSpan={4} className="p-3 font-bold text-base border border-border">
                      📊 분석 & 리포트
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">학습 진도 대시보드</td>
                    <td className="p-3 text-center border border-border">기본</td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">성적 분석</td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">AI 리포트 자동 생성</td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">학습 패턴 분석</td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>

                  {/* HRD 정부지원 훈련과정 기능 */}
                  <tr className="bg-muted">
                    <td colSpan={4} className="p-3 font-bold text-base border border-border">
                      🎓 HRD 정부지원 훈련과정 전용 기능
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">출석 관리 시스템</td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">훈련일지 관리</td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">상담일지 작성 및 관리</td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">중도탈락 관리</td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">수료 관리</td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">훈련수당 관리</td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">만족도 조사</td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>

                  {/* 게이미피케이션 */}
                  <tr className="bg-muted">
                    <td colSpan={4} className="p-3 font-bold text-base border border-border">
                      🏆 게이미피케이션
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">뱃지 & 업적 시스템</td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">리더보드</td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">포인트 시스템</td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>

                  {/* 지원 & 보안 */}
                  <tr className="bg-muted">
                    <td colSpan={4} className="p-3 font-bold text-base border border-border">
                      🔒 지원 & 보안
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">이메일 지원</td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">우선 지원 (24시간 이내 응답)</td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">전담 계정 매니저</td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">데이터 백업 및 복원</td>
                    <td className="p-3 text-center border border-border">수동</td>
                    <td className="p-3 text-center border border-border">자동 (일 1회)</td>
                    <td className="p-3 text-center border border-border">자동 (실시간)</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border">SSO (Single Sign-On)</td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-center border border-border"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-12 text-center">
              <Link to="/pricing">
                <Button size="lg" variant="premium">
                  상세 요금제 보기
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 후기 섹션 */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                고객 <span className="text-gradient">후기</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                실제 사용자들의 생생한 경험을 확인하세요
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* 후기 1 */}
              <div className="p-6 rounded-xl bg-card border border-border hover:shadow-premium transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  "AI 튜터 기능이 정말 유용합니다. 학생들이 24시간 언제든 질문할 수 있어서 학습 만족도가 크게 향상되었습니다."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">김민수</p>
                    <p className="text-sm text-muted-foreground">온라인 강의 운영</p>
                  </div>
                </div>
              </div>

              {/* 후기 2 */}
              <div className="p-6 rounded-xl bg-card border border-border hover:shadow-premium transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  "정부지원 훈련과정 운영에 필요한 모든 기능이 완벽하게 갖춰져 있어요. 출석, 훈련일지, 수료 관리가 정말 편리합니다."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">이영희</p>
                    <p className="text-sm text-muted-foreground">HRD 훈련기관 운영</p>
                  </div>
                </div>
              </div>

              {/* 후기 3 */}
              <div className="p-6 rounded-xl bg-card border border-border hover:shadow-premium transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  "실시간 분석 대시보드 덕분에 학생들의 학습 현황을 한눈에 파악할 수 있습니다. 데이터 기반 교육이 가능해졌어요."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">박철수</p>
                    <p className="text-sm text-muted-foreground">기업 교육팀 매니저</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                지금 바로 <span className="text-gradient">무료로 시작</span>하세요
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                신용카드 등록 없이 5분 만에 시작할 수 있습니다.<br />
                모든 기능을 자유롭게 체험해보세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth">
                  <Button size="lg" variant="premium" className="text-lg px-12 gap-2">
                    <Sparkles className="h-5 w-5" />
                    무료 체험 시작
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button size="lg" variant="outline" className="text-lg px-12">
                    요금제 살펴보기
                  </Button>
                </Link>
              </div>
              
              <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Check className="h-5 w-5 text-primary" />
                  <span>신용카드 불필요</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Check className="h-5 w-5 text-primary" />
                  <span>언제든 취소 가능</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Check className="h-5 w-5 text-primary" />
                  <span>24/7 고객 지원</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <img src={logoIcon} alt="Atom LMS 로고" className="h-10 w-10" width="40" height="40" />
                  <span className="text-xl font-logo font-bold">atomLMS</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">AI 기반 학습관리 플랫폼</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">회사</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link to="/about" className="hover:text-primary transition-colors">회사 소개</Link></li>
                  <li><Link to="/team" className="hover:text-primary transition-colors">팀 소개</Link></li>
                  <li><Link to="/careers" className="hover:text-primary transition-colors">채용</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">지원</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link to="/help" className="hover:text-primary transition-colors">고객 지원</Link></li>
                  <li><Link to="/docs" className="hover:text-primary transition-colors">문서</Link></li>
                  <li><Link to="/contact" className="hover:text-primary transition-colors">문의하기</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">법률</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link to="/privacy" className="hover:text-primary transition-colors">개인정보처리방침</Link></li>
                  <li><Link to="/terms" className="hover:text-primary transition-colors">이용약관</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t pt-8 text-center text-sm text-muted-foreground">
              <p>© 2025 atomLMS. All rights reserved. | AI 기반 학습관리 플랫폼</p>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="group p-6 rounded-xl card-premium border border-border hover:border-primary/50 hover:shadow-premium transition-all duration-300">
      <div className="text-primary mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
};

export default Landing;
