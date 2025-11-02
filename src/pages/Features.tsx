import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Brain, BookOpen, Users, BarChart3, Award, MessageSquare, Calendar, FileText, Languages, TrendingUp, Route, FileQuestion, Bot, ClipboardCheck, UserCheck, Wallet, AlertTriangle, Trophy, Shield, Zap, Video, CheckCircle, Clock, Target, Star, Sparkles, GraduationCap, Building2, Settings, Database } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import { Badge } from "@/components/ui/badge";

const Features = () => {
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

      {/* Features Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="space-y-20">
            
            {/* AI 기능 */}
            <FeatureSection
              icon={<Brain className="h-8 w-8" />}
              title="AI 기반 학습 지원"
              description="최첨단 인공지능으로 학습 효율을 극대화합니다"
              badge="AI"
              features={[
                {
                  icon: <Bot className="h-5 w-5" />,
                  title: "AI 튜터",
                  description: "24시간 질문하고 실시간 답변을 받으세요"
                },
                {
                  icon: <ClipboardCheck className="h-5 w-5" />,
                  title: "AI 자동 채점",
                  description: "과제를 자동으로 채점하고 상세한 피드백 제공"
                },
                {
                  icon: <MessageSquare className="h-5 w-5" />,
                  title: "AI 피드백",
                  description: "개인화된 학습 피드백과 개선 방안 제시"
                },
                {
                  icon: <Languages className="h-5 w-5" />,
                  title: "AI 번역",
                  description: "강의 자료를 다양한 언어로 즉시 번역"
                },
                {
                  icon: <BarChart3 className="h-5 w-5" />,
                  title: "AI 학습 분석",
                  description: "학습 패턴을 분석하고 최적의 학습 전략 제안"
                },
                {
                  icon: <FileText className="h-5 w-5" />,
                  title: "AI 리포트 생성",
                  description: "학습 성과를 자동으로 분석하여 리포트 작성"
                },
                {
                  icon: <Route className="h-5 w-5" />,
                  title: "AI 학습 경로 추천",
                  description: "개인별 맞춤 학습 경로를 AI가 설계"
                },
                {
                  icon: <FileQuestion className="h-5 w-5" />,
                  title: "AI 퀴즈 생성",
                  description: "학습 내용 기반 맞춤형 문제 자동 생성"
                },
                {
                  icon: <FileText className="h-5 w-5" />,
                  title: "AI 요약",
                  description: "긴 강의 내용을 핵심만 압축하여 요약"
                },
                {
                  icon: <TrendingUp className="h-5 w-5" />,
                  title: "AI 진도 예측",
                  description: "학습 완료 시점을 예측하고 목표 관리"
                },
                {
                  icon: <Users className="h-5 w-5" />,
                  title: "AI 스터디 메이트 매칭",
                  description: "비슷한 수준의 학습 동료를 자동으로 연결"
                }
              ]}
            />

            {/* 강의 관리 */}
            <FeatureSection
              icon={<BookOpen className="h-8 w-8" />}
              title="강의 및 콘텐츠 관리"
              description="강의 제작부터 배포까지 모든 과정을 지원합니다"
              features={[
                {
                  icon: <BookOpen className="h-5 w-5" />,
                  title: "무제한 강좌 개설",
                  description: "원하는 만큼 강좌를 생성하고 관리하세요"
                },
                {
                  icon: <Video className="h-5 w-5" />,
                  title: "동영상 업로드 및 스트리밍",
                  description: "YouTube, Vimeo 연동 및 직접 업로드 지원"
                },
                {
                  icon: <FileText className="h-5 w-5" />,
                  title: "다양한 콘텐츠 형식",
                  description: "동영상, PDF, 문서, 퀴즈 등 다양한 자료 지원"
                },
                {
                  icon: <Target className="h-5 w-5" />,
                  title: "학습 목표 설정",
                  description: "강의별 학습 목표와 성취 기준 관리"
                },
                {
                  icon: <Clock className="h-5 w-5" />,
                  title: "진도 관리",
                  description: "학생별 학습 진행률을 실시간으로 추적"
                },
                {
                  icon: <CheckCircle className="h-5 w-5" />,
                  title: "수료증 자동 발급",
                  description: "강의 완료 시 자동으로 수료증 생성 및 발급"
                },
                {
                  icon: <Video className="h-5 w-5" />,
                  title: "실시간 화상 강의",
                  description: "화상 회의 시스템 통합으로 라이브 강의 진행"
                },
                {
                  icon: <FileText className="h-5 w-5" />,
                  title: "강의 자료 공유",
                  description: "학습 자료를 학생들과 쉽게 공유"
                }
              ]}
            />

            {/* 과제 및 평가 */}
            <FeatureSection
              icon={<ClipboardCheck className="h-8 w-8" />}
              title="과제 및 평가 시스템"
              description="효율적인 과제 관리와 공정한 평가를 지원합니다"
              features={[
                {
                  icon: <ClipboardCheck className="h-5 w-5" />,
                  title: "과제 제출 시스템",
                  description: "온라인으로 과제를 제출하고 관리"
                },
                {
                  icon: <Brain className="h-5 w-5" />,
                  title: "자동 채점",
                  description: "AI 기반 자동 채점으로 채점 시간 단축"
                },
                {
                  icon: <Star className="h-5 w-5" />,
                  title: "루브릭 평가",
                  description: "세부 평가 기준으로 공정한 점수 산정"
                },
                {
                  icon: <MessageSquare className="h-5 w-5" />,
                  title: "피드백 시스템",
                  description: "과제별 상세한 피드백 제공"
                },
                {
                  icon: <FileQuestion className="h-5 w-5" />,
                  title: "퀴즈 및 시험",
                  description: "객관식, 주관식 등 다양한 문제 유형 지원"
                },
                {
                  icon: <BarChart3 className="h-5 w-5" />,
                  title: "성적 관리",
                  description: "학생별 성적을 체계적으로 관리"
                }
              ]}
            />

            {/* 출석 및 학습 관리 */}
            <FeatureSection
              icon={<UserCheck className="h-8 w-8" />}
              title="출석 및 학습 활동 관리"
              description="학생들의 학습 활동을 정확하게 기록합니다"
              features={[
                {
                  icon: <UserCheck className="h-5 w-5" />,
                  title: "출석 체크",
                  description: "실시간 출석 확인 및 기록"
                },
                {
                  icon: <Calendar className="h-5 w-5" />,
                  title: "출석 통계",
                  description: "학생별, 강좌별 출석률 분석"
                },
                {
                  icon: <Clock className="h-5 w-5" />,
                  title: "학습 시간 추적",
                  description: "실제 학습 시간을 자동으로 기록"
                },
                {
                  icon: <Target className="h-5 w-5" />,
                  title: "일일 학습 목표",
                  description: "매일 학습 목표를 설정하고 달성 현황 확인"
                },
                {
                  icon: <TrendingUp className="h-5 w-5" />,
                  title: "학습 스트릭",
                  description: "연속 학습일수 기록으로 동기부여"
                }
              ]}
            />

            {/* 커뮤니티 */}
            <FeatureSection
              icon={<MessageSquare className="h-8 w-8" />}
              title="커뮤니티 및 소통"
              description="학생과 강사가 함께 성장하는 학습 커뮤니티"
              features={[
                {
                  icon: <MessageSquare className="h-5 w-5" />,
                  title: "게시판",
                  description: "질문, 정보 공유, 토론이 가능한 게시판"
                },
                {
                  icon: <MessageSquare className="h-5 w-5" />,
                  title: "댓글 시스템",
                  description: "게시글과 강의에 댓글로 소통"
                },
                {
                  icon: <Star className="h-5 w-5" />,
                  title: "좋아요 기능",
                  description: "유용한 게시글과 댓글에 좋아요 표시"
                },
                {
                  icon: <Users className="h-5 w-5" />,
                  title: "스터디 그룹",
                  description: "관심사가 같은 학생들끼리 그룹 형성"
                },
                {
                  icon: <Bot className="h-5 w-5" />,
                  title: "AI 챗봇",
                  description: "24시간 질문 응답 챗봇 지원"
                }
              ]}
            />


            {/* 분석 및 리포팅 */}
            <FeatureSection
              icon={<BarChart3 className="h-8 w-8" />}
              title="분석 및 리포팅"
              description="데이터 기반 의사결정으로 학습 성과를 극대화합니다"
              features={[
                {
                  icon: <BarChart3 className="h-5 w-5" />,
                  title: "학습 분석 대시보드",
                  description: "실시간 학습 데이터 시각화"
                },
                {
                  icon: <TrendingUp className="h-5 w-5" />,
                  title: "진도 모니터링",
                  description: "학생별 학습 진행 상황 추적"
                },
                {
                  icon: <AlertTriangle className="h-5 w-5" />,
                  title: "중도 탈락 예측",
                  description: "AI로 중도 탈락 위험 학생 조기 발견"
                },
                {
                  icon: <FileText className="h-5 w-5" />,
                  title: "자동 리포트 생성",
                  description: "학습 성과 리포트 자동 작성"
                },
                {
                  icon: <BarChart3 className="h-5 w-5" />,
                  title: "수익 분석",
                  description: "강좌별 수익 현황 및 통계"
                },
                {
                  icon: <Users className="h-5 w-5" />,
                  title: "학생 행동 분석",
                  description: "학습 패턴과 참여도 분석"
                }
              ]}
            />

            {/* HRD 전용 기능 */}
            <FeatureSection
              icon={<GraduationCap className="h-8 w-8" />}
              title="HRD 전용 기능"
              description="정부지원 교육 운영에 필요한 모든 기능"
              badge="HRD"
              features={[
                {
                  icon: <UserCheck className="h-5 w-5" />,
                  title: "출석 관리 시스템",
                  description: "HRD 기준에 맞는 정확한 출석 관리"
                },
                {
                  icon: <Wallet className="h-5 w-5" />,
                  title: "훈련수당 관리",
                  description: "훈련수당 지급 내역 관리"
                },
                {
                  icon: <FileText className="h-5 w-5" />,
                  title: "훈련일지 관리",
                  description: "일일 훈련 내용 기록 및 관리"
                },
                {
                  icon: <AlertTriangle className="h-5 w-5" />,
                  title: "중도탈락 관리",
                  description: "중도탈락자 관리 및 보고"
                },
                {
                  icon: <MessageSquare className="h-5 w-5" />,
                  title: "상담일지",
                  description: "학생 상담 내용 기록 및 관리"
                },
                {
                  icon: <Star className="h-5 w-5" />,
                  title: "만족도 조사",
                  description: "교육 만족도 설문 및 분석"
                },
                {
                  icon: <CheckCircle className="h-5 w-5" />,
                  title: "훈련 이수 관리",
                  description: "이수 기준 관리 및 수료 처리"
                },
                {
                  icon: <FileText className="h-5 w-5" />,
                  title: "정부 보고서 자동 생성",
                  description: "HRD-Net 제출용 보고서 자동 작성"
                },
                {
                  icon: <Database className="h-5 w-5" />,
                  title: "HRD-Net 연동",
                  description: "HRD-Net과 데이터 연동"
                },
                {
                  icon: <BarChart3 className="h-5 w-5" />,
                  title: "성적 관리",
                  description: "HRD 기준 성적 관리 시스템"
                }
              ]}
            />

            {/* 관리자 기능 */}
            <FeatureSection
              icon={<Settings className="h-8 w-8" />}
              title="관리자 기능"
              description="효율적인 시스템 운영을 위한 관리 도구"
              features={[
                {
                  icon: <Users className="h-5 w-5" />,
                  title: "사용자 관리",
                  description: "학생, 강사, 관리자 계정 관리"
                },
                {
                  icon: <Shield className="h-5 w-5" />,
                  title: "권한 관리",
                  description: "역할 기반 접근 제어 시스템"
                },
                {
                  icon: <Building2 className="h-5 w-5" />,
                  title: "테넌트 관리",
                  description: "멀티 테넌트 구조로 기관별 독립 운영"
                },
                {
                  icon: <BarChart3 className="h-5 w-5" />,
                  title: "시스템 모니터링",
                  description: "실시간 시스템 상태 확인"
                },
                {
                  icon: <Database className="h-5 w-5" />,
                  title: "데이터 백업",
                  description: "자동 백업 및 복구 시스템"
                },
                {
                  icon: <FileText className="h-5 w-5" />,
                  title: "활동 로그",
                  description: "모든 사용자 활동 기록 및 감사"
                }
              ]}
            />

            {/* 고급 기능 */}
            <FeatureSection
              icon={<Zap className="h-8 w-8" />}
              title="고급 기능"
              description="엔터프라이즈급 기능으로 더 강력한 시스템 구축"
              features={[
                {
                  icon: <Zap className="h-5 w-5" />,
                  title: "API 연동",
                  description: "RESTful API로 외부 시스템과 연동"
                },
                {
                  icon: <Shield className="h-5 w-5" />,
                  title: "SSO 통합 인증",
                  description: "Single Sign-On으로 통합 로그인"
                },
                {
                  icon: <Sparkles className="h-5 w-5" />,
                  title: "맞춤형 브랜딩",
                  description: "기관 CI에 맞는 디자인 커스터마이징"
                },
                {
                  icon: <Database className="h-5 w-5" />,
                  title: "온프레미스 설치",
                  description: "자체 서버에 시스템 구축"
                },
                {
                  icon: <Shield className="h-5 w-5" />,
                  title: "보안 강화",
                  description: "2단계 인증, IP 제한 등 보안 옵션"
                },
                {
                  icon: <Settings className="h-5 w-5" />,
                  title: "커스터마이징 개발",
                  description: "기관 맞춤형 기능 개발 지원"
                }
              ]}
            />

          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <div className="p-10 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <h2 className="text-3xl font-display font-bold mb-4">
                지금 바로 시작하세요
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                모든 기능을 14일 동안 무료로 체험해보세요. 신용카드 등록 없이 바로 시작할 수 있습니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth">
                  <Button size="lg" variant="premium" className="gap-2">
                    <Sparkles className="h-5 w-5" />
                    무료로 시작하기
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button size="lg" variant="outline">
                    요금제 보기
                  </Button>
                </Link>
              </div>
            </div>
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

interface FeatureSectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }[];
  badge?: string;
}

const FeatureSection = ({ icon, title, description, features, badge }: FeatureSectionProps) => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl md:text-3xl font-display font-bold">{title}</h2>
            {badge && <Badge variant="default" className="text-xs">{badge}</Badge>}
          </div>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="p-5 rounded-xl border border-border hover:border-primary/50 hover:shadow-glow transition-all bg-card group"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors flex-shrink-0">
                {feature.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold mb-2 text-lg">{feature.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
