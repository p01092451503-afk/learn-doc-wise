import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Brain, 
  MessageCircle, 
  FileText, 
  FileQuestion,
  Route,
  TrendingUp,
  Languages,
  Users,
  FileCheck,
  Sparkles,
  ArrowLeft,
  Coins,
  CheckCircle,
  Zap
} from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import { AITutorDialog } from "@/components/ai/AITutorDialog";
import { AIQuizDialog } from "@/components/ai/AIQuizDialog";
import { AIFeedbackDialog } from "@/components/ai/AIFeedbackDialog";
import { AISummaryDialog } from "@/components/ai/AISummaryDialog";
import { AITranslateDialog } from "@/components/ai/AITranslateDialog";
import { AILearningPathDialog } from "@/components/ai/AILearningPathDialog";
import { AIProgressDialog } from "@/components/ai/AIProgressDialog";
import { AIStudyMatchDialog } from "@/components/ai/AIStudyMatchDialog";

const AIShowcase = () => {
  const [tutorOpen, setTutorOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [translateOpen, setTranslateOpen] = useState(false);
  const [learningPathOpen, setLearningPathOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [studyMatchOpen, setStudyMatchOpen] = useState(false);

  const aiFeatures = [
    {
      title: "AI 튜터",
      description: "24시간 언제든지 질문하고 실시간 답변을 받으세요. 학습 내용 요약과 문제 출제도 가능합니다.",
      icon: <MessageCircle className="h-6 w-6" />,
      color: "from-blue-500 to-cyan-500",
      onClick: () => setTutorOpen(true),
      features: ["실시간 Q&A", "학습 내용 요약", "맞춤형 문제 출제"],
    },
    {
      title: "AI 퀴즈 생성",
      description: "원하는 주제와 난이도에 맞는 퀴즈를 자동으로 생성합니다.",
      icon: <FileQuestion className="h-6 w-6" />,
      color: "from-purple-500 to-pink-500",
      onClick: () => setQuizOpen(true),
      features: ["주제별 퀴즈 생성", "난이도 조절", "해설 자동 생성"],
    },
    {
      title: "AI 자동 채점 & 피드백",
      description: "과제 제출 시 즉시 채점 결과와 상세한 피드백을 제공합니다.",
      icon: <FileCheck className="h-6 w-6" />,
      color: "from-green-500 to-emerald-500",
      onClick: () => setFeedbackOpen(true),
      features: ["자동 채점", "상세 피드백", "문법 교정"],
    },
    {
      title: "AI 요약",
      description: "긴 강의 내용이나 문서를 원하는 길이로 요약합니다.",
      icon: <FileText className="h-6 w-6" />,
      color: "from-orange-500 to-amber-500",
      onClick: () => setSummaryOpen(true),
      features: ["길이 조절 가능", "핵심 내용 추출", "문서 요약"],
    },
    {
      title: "AI 번역",
      description: "7개 언어를 지원하는 고품질 번역 서비스입니다.",
      icon: <Languages className="h-6 w-6" />,
      color: "from-red-500 to-rose-500",
      onClick: () => setTranslateOpen(true),
      features: ["7개 언어 지원", "자연스러운 번역", "전문 용어 처리"],
    },
    {
      title: "AI 학습 경로 추천",
      description: "학습자의 수준과 목표에 맞는 최적의 학습 경로를 추천합니다.",
      icon: <Route className="h-6 w-6" />,
      color: "from-indigo-500 to-violet-500",
      onClick: () => setLearningPathOpen(true),
      features: ["맞춤형 커리큘럼", "단계별 추천", "목표 기반 설계"],
    },
    {
      title: "AI 진도 예측",
      description: "현재 학습 패턴을 분석하여 수료 가능성을 예측합니다.",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "from-teal-500 to-cyan-500",
      onClick: () => setProgressOpen(true),
      features: ["수료 예측", "학습 패턴 분석", "권장 학습량"],
    },
    {
      title: "AI 스터디 메이트 매칭",
      description: "비슷한 관심사와 수준의 학습 파트너를 추천합니다.",
      icon: <Users className="h-6 w-6" />,
      color: "from-pink-500 to-fuchsia-500",
      onClick: () => setStudyMatchOpen(true),
      features: ["관심사 매칭", "수준별 매칭", "시간대 맞춤"],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b sticky top-0 bg-background/95 backdrop-blur-xl z-50 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoIcon} alt="Atom LMS" className="h-12 w-12" />
            <span className="text-2xl font-logo font-bold text-foreground tracking-tight">atomLMS</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/pricing">
              <Button variant="outline" size="default">
                요금제 보기
              </Button>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="default" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                로그인
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="default" className="mb-4 px-4 py-2 text-sm">
              <Brain className="h-4 w-4 mr-2" />
              AI 기반 학습 플랫폼
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="text-gradient">11가지 AI 기능</span>으로<br />
              스마트한 학습을 경험하세요
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              atomLMS의 AI 기능은 학습 효율을 높이고 관리자의 업무를 자동화합니다.
              각 기능을 직접 체험해보세요.
            </p>

            {/* Token Info Banner */}
            <div className="max-w-xl mx-auto bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Coins className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold mb-1">AI 토큰 기반 과금</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    AI 기능 사용 시 토큰이 소모됩니다. 요금제에 따라 월별 토큰이 제공되며, 
                    관리자 대시보드에서 실시간 사용량을 확인할 수 있습니다.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                      프로: 10만 토큰/월
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                      프로페셔널: 50만 토큰/월
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                      엔터프라이즈: 100만+ 토큰/월
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-4">
              모든 AI 기능을 <span className="text-gradient">직접 체험</span>해보세요
            </h2>
            <p className="text-muted-foreground">
              각 카드를 클릭하면 해당 AI 기능을 바로 사용해볼 수 있습니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiFeatures.map((feature, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden"
                onClick={feature.onClick}
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.color}`} />
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} text-white`}>
                      {feature.icon}
                    </div>
                    <Badge variant="default" className="text-[10px]">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {feature.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Zap className="h-3 w-3 text-primary" />
                        {f}
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    체험하기
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-bold mb-4">
            AI 기능이 포함된 요금제를 확인하세요
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            프로 요금제부터 기본 AI 기능이 제공되며, 프로페셔널 이상에서는 모든 AI 기능을 사용할 수 있습니다.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/pricing">
              <Button size="lg" className="gap-2">
                <Coins className="h-5 w-5" />
                요금제 보기
              </Button>
            </Link>
            <Link to="/">
              <Button size="lg" variant="outline">
                무료로 시작하기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Dialogs */}
      <AITutorDialog open={tutorOpen} onOpenChange={setTutorOpen} />
      <AIQuizDialog open={quizOpen} onOpenChange={setQuizOpen} />
      <AIFeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
      <AISummaryDialog open={summaryOpen} onOpenChange={setSummaryOpen} />
      <AITranslateDialog open={translateOpen} onOpenChange={setTranslateOpen} />
      <AILearningPathDialog open={learningPathOpen} onOpenChange={setLearningPathOpen} />
      <AIProgressDialog open={progressOpen} onOpenChange={setProgressOpen} />
      <AIStudyMatchDialog open={studyMatchOpen} onOpenChange={setStudyMatchOpen} />
    </div>
  );
};

export default AIShowcase;
