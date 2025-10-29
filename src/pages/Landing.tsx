import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { GraduationCap, Brain, Users, BarChart3, CheckCircle, Zap } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">WebHeads LMS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">로그인</Button>
            </Link>
            <Link to="/auth">
              <Button>무료 시작하기</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              AI 기반 차세대<br />
              <span className="text-primary">학습 관리 플랫폼</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              강사와 학습자를 위한 올인원 LMS 솔루션. AI 튜터, 자동 평가, 
              실시간 분석으로 더 스마트한 학습 경험을 제공합니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8">
                  지금 시작하기
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  데모 보기
                </Button>
              </Link>
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
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-12 border">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              지금 바로 시작하세요
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              14일 무료 체험으로 모든 기능을 경험해보세요. 신용카드 필요 없습니다.
            </p>
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8">
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
            <p>© 2024 WebHeads LMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="p-6 rounded-xl bg-card border hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-card-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default Landing;
