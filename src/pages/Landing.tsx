import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { GraduationCap, Brain, Users, BarChart3, CheckCircle, Zap, Sparkles, Award, TrendingUp } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b sticky top-0 bg-background/95 backdrop-blur-xl z-50 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <GraduationCap className="h-9 w-9 text-primary relative z-10" />
              <div className="absolute inset-0 bg-primary/20 blur-xl"></div>
            </div>
            <span className="text-2xl font-display font-bold">
              <span className="text-gradient">WebHeads</span>{" "}
              <span className="text-foreground">LMS</span>
            </span>
          </div>
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
      <section className="relative overflow-hidden py-24 md:py-40">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">AI 기반 혁신 학습</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 text-foreground leading-tight animate-slide-up">
              차세대 AI 학습<br />
              <span className="text-gradient">관리 플랫폼</span>
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
            <div className="flex flex-wrap items-center justify-center gap-8 mt-16 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-accent" />
                <span>업계 최고 평점 4.9</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                <span>10,000+ 활성 사용자</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent" />
                <span>99.9% 업타임 보장</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            왜 WebHeads LMS인가?
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
              icon={<GraduationCap className="h-10 w-10" />}
              title="멀티 테넌트"
              description="기관별로 독립적인 환경에서 안전하게 운영하세요"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center relative overflow-hidden rounded-3xl p-16 border border-primary/20 shadow-elegant">
            <div className="absolute inset-0 bg-[var(--gradient-hero)]"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                <span className="text-gradient">프리미엄 학습</span>을<br />
                지금 바로 시작하세요
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                14일 무료 체험으로 모든 프리미엄 기능을 경험해보세요.<br />
                신용카드 필요 없습니다.
              </p>
              <Link to="/auth">
                <Button size="lg" variant="gold" className="text-lg px-12 gap-2 shadow-glow">
                  <Sparkles className="h-5 w-5" />
                  무료로 시작하기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p>© 2024 WebHeads LMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="group p-8 rounded-2xl card-premium border border-border hover:border-primary/50 hover:shadow-elegant transition-all duration-500 transform hover:-translate-y-1">
      <div className="relative mb-4">
        <div className="text-primary group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <h3 className="text-xl font-display font-semibold mb-3 text-card-foreground group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
};

export default Landing;
