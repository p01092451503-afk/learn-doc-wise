import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Bot, Brain, Users, BarChart3, CheckCircle, Zap, Sparkles, Award, TrendingUp, Check, Star, FileText, Calendar, MessageSquare, AlertTriangle, Trophy, Wallet, ClipboardCheck, UserCheck, Route, FileQuestion } from "lucide-react";
import { useState } from "react";
import { AILearningPathDialog } from "@/components/ai/AILearningPathDialog";
import { AIQuizDialog } from "@/components/ai/AIQuizDialog";
import { AISummaryDialog } from "@/components/ai/AISummaryDialog";
import { AIProgressDialog } from "@/components/ai/AIProgressDialog";
import { AIStudyMatchDialog } from "@/components/ai/AIStudyMatchDialog";
import logoIcon from "@/assets/logo-icon.png";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const Landing = () => {
  const [learningPathOpen, setLearningPathOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [studyMatchOpen, setStudyMatchOpen] = useState(false);

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
          
          {/* HRD 정부지원 훈련과정 전용 기능 */}
          <div className="mt-12 pt-12 border-t border-border">
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
            <div className="group p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1 relative">
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-accent px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Sparkles className="h-3 w-3 text-white" />
                <span className="text-xs font-bold text-white">AI</span>
              </div>
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
            <div className="group p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1 relative">
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-accent px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Sparkles className="h-3 w-3 text-white" />
                <span className="text-xs font-bold text-white">AI</span>
              </div>
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
            <div className="group p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1 relative">
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-accent px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Sparkles className="h-3 w-3 text-white" />
                <span className="text-xs font-bold text-white">AI</span>
              </div>
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
            <div className="group p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1 relative">
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-accent px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Sparkles className="h-3 w-3 text-white" />
                <span className="text-xs font-bold text-white">AI</span>
              </div>
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
            <div className="group p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1 relative">
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-accent px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Sparkles className="h-3 w-3 text-white" />
                <span className="text-xs font-bold text-white">AI</span>
              </div>
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
            <div className="group p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1 relative">
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-accent px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Sparkles className="h-3 w-3 text-white" />
                <span className="text-xs font-bold text-white">AI</span>
              </div>
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
            <div 
              onClick={() => setLearningPathOpen(true)}
              className="group p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1 cursor-pointer relative"
            >
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-accent px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Sparkles className="h-3 w-3 text-white" />
                <span className="text-xs font-bold text-white">AI</span>
              </div>
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
            <div 
              onClick={() => setQuizOpen(true)}
              className="group p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1 cursor-pointer relative"
            >
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-accent px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Sparkles className="h-3 w-3 text-white" />
                <span className="text-xs font-bold text-white">AI</span>
              </div>
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
            <div 
              onClick={() => setSummaryOpen(true)}
              className="group p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1 cursor-pointer relative"
            >
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-accent px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Sparkles className="h-3 w-3 text-white" />
                <span className="text-xs font-bold text-white">AI</span>
              </div>
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
            <div 
              onClick={() => setProgressOpen(true)}
              className="group p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1 cursor-pointer relative"
            >
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-accent px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Sparkles className="h-3 w-3 text-white" />
                <span className="text-xs font-bold text-white">AI</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold mb-2 text-card-foreground group-hover:text-primary transition-colors">AI 진도 예측</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    학습 패턴을 분석하여 수료 시점을 예측하고 목표 달성을 돕습니다
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">패턴 분석</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">목표 관리</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI 스터디 메이트 매칭 */}
            <div 
              onClick={() => setStudyMatchOpen(true)}
              className="group p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1 cursor-pointer relative"
            >
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-accent px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Sparkles className="h-3 w-3 text-white" />
                <span className="text-xs font-bold text-white">AI</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold mb-2 text-card-foreground group-hover:text-primary transition-colors">AI 스터디 메이트 매칭</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    학습 수준과 관심사가 비슷한 학습 동료를 AI가 매칭해줍니다
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">스마트 매칭</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">협업 학습</span>
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
                    학습 관련 모든 질문에 24시간 답변하고 맞춤형 도움을 제공합니다
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

      {/* Pricing Section */}
      <section className="py-20 bg-muted/30" aria-labelledby="pricing-heading">
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
      <footer className="border-t py-8 bg-muted/30" role="contentinfo">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p>© 2025 Atom LMS. All rights reserved.</p>
            <p className="mt-2 text-sm">AI 기반 학습관리 플랫폼 | 온라인 교육 솔루션</p>
          </div>
        </div>
      </footer>

      {/* AI Dialogs */}
      <AILearningPathDialog open={learningPathOpen} onOpenChange={setLearningPathOpen} />
      <AIQuizDialog open={quizOpen} onOpenChange={setQuizOpen} />
      <AISummaryDialog open={summaryOpen} onOpenChange={setSummaryOpen} />
      <AIProgressDialog open={progressOpen} onOpenChange={setProgressOpen} />
      <AIStudyMatchDialog open={studyMatchOpen} onOpenChange={setStudyMatchOpen} />
    </div>
    </TooltipProvider>
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
