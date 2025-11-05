import { useEffect, useState } from "react";
import { 
  Brain, Award, Zap, CheckCircle, BarChart3, Users, 
  Bot, Sparkles, Route, FileQuestion, TrendingUp,
  FileText, Calendar, MessageSquare, AlertTriangle, Trophy, Wallet, Star, ClipboardCheck, UserCheck
} from "lucide-react";

interface FeatureCard {
  icon: any;
  title: string;
  description: string;
  category: "why" | "ai" | "hrd";
  tags?: string[];
}

const allFeatures: FeatureCard[] = [
  // 왜 atomLMS인가?
  { 
    icon: Brain, 
    title: "AI 지능형 학습", 
    description: "10가지 이상의 AI 기능으로 학습 경로 추천, 퀴즈 생성, 자동 채점, 진도 예측 등을 제공합니다",
    category: "why",
    tags: ["AI 추천", "자동화"]
  },
  { 
    icon: Award, 
    title: "HRD 전문 시스템", 
    description: "정부지원 훈련과정에 필요한 출석, 훈련일지, 상담일지, 수료 관리 등 모든 기능을 완벽 지원합니다",
    category: "why",
    tags: ["정부지원", "전문"]
  },
  { 
    icon: Zap, 
    title: "엔터프라이즈급 안정성", 
    description: "99.9% 가동률 보장, 자동 백업, 실시간 모니터링으로 언제나 안정적인 서비스를 제공합니다",
    category: "why",
    tags: ["99.9% 가동률", "안정적"]
  },
  { 
    icon: CheckCircle, 
    title: "강력한 보안 체계", 
    description: "데이터 암호화, RLS 기반 접근 제어, 역할별 권한 관리로 민감한 학습 데이터를 안전하게 보호합니다",
    category: "why",
    tags: ["암호화", "보안"]
  },
  { 
    icon: BarChart3, 
    title: "실시간 분석 대시보드", 
    description: "학습 진도, 성적, 참여도, AI 사용량 등 모든 데이터를 실시간으로 분석하고 시각화합니다",
    category: "why",
    tags: ["실시간", "분석"]
  },
  { 
    icon: Users, 
    title: "확장 가능한 아키텍처", 
    description: "멀티 테넌트 구조로 수천 명의 동시 사용자를 지원하며, 무제한 확장이 가능합니다",
    category: "why",
    tags: ["멀티 테넌트", "확장성"]
  },

  // AI 기능
  { 
    icon: Bot, 
    title: "AI 튜터", 
    description: "24시간 상시 대기하는 AI 튜터가 질문에 즉시 답변하고, 개념 설명과 퀴즈를 제공합니다",
    category: "ai",
    tags: ["실시간 답변", "개념 설명"]
  },
  { 
    icon: CheckCircle, 
    title: "AI 자동 채점", 
    description: "과제와 시험을 AI가 자동으로 채점하고 상세한 피드백을 즉시 제공합니다",
    category: "ai",
    tags: ["즉시 채점", "상세 피드백"]
  },
  { 
    icon: Sparkles, 
    title: "AI 피드백", 
    description: "과제와 문법을 AI가 분석하여 개선점과 맞춤형 피드백을 제공합니다",
    category: "ai",
    tags: ["과제 분석", "문법 교정"]
  },
  { 
    icon: Route, 
    title: "AI 학습 경로 추천", 
    description: "수준과 목표를 분석하여 최적의 학습 순서와 코스를 추천합니다",
    category: "ai",
    tags: ["맞춤 추천", "단계별 학습"]
  },
  { 
    icon: FileQuestion, 
    title: "AI 퀴즈 생성", 
    description: "학습 내용을 기반으로 맞춤형 퀴즈를 자동으로 생성합니다",
    category: "ai",
    tags: ["자동 생성", "맞춤형"]
  },
  { 
    icon: TrendingUp, 
    title: "AI 진도 예측", 
    description: "학습 속도를 분석하여 수료일과 학습 성과를 미리 예측합니다",
    category: "ai",
    tags: ["진도 예측", "성과 추정"]
  },

  // HRD 기능
  { 
    icon: FileText, 
    title: "훈련일지 관리", 
    description: "일일 훈련 내용과 진행 사항을 체계적으로 기록하고 관리합니다",
    category: "hrd",
    tags: ["일일 기록", "체계적"]
  },
  { 
    icon: Calendar, 
    title: "출석 관리", 
    description: "출석, 지각, 결석을 자동으로 체크하고 상세 이력을 관리합니다",
    category: "hrd",
    tags: ["자동 체크", "이력 관리"]
  },
  { 
    icon: MessageSquare, 
    title: "상담일지", 
    description: "학생 상담 내용을 기록하고 맞춤형 학습 지원을 제공합니다",
    category: "hrd",
    tags: ["상담 기록", "맞춤 지원"]
  },
  { 
    icon: AlertTriangle, 
    title: "중도탈락 관리", 
    description: "중도탈락 위험 학생을 조기 발견하고 적극적으로 지원합니다",
    category: "hrd",
    tags: ["조기 발견", "위험 관리"]
  },
  { 
    icon: Trophy, 
    title: "수료 관리", 
    description: "출석률과 성적을 자동 집계하여 수료 요건을 관리합니다",
    category: "hrd",
    tags: ["자동 집계", "수료 요건"]
  },
  { 
    icon: Wallet, 
    title: "훈련수당 관리", 
    description: "출석 기반 훈련수당을 자동 계산하고 지급 내역을 관리합니다",
    category: "hrd",
    tags: ["자동 계산", "지급 관리"]
  },
];

export const FeatureShowcaseAnimation = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsExiting(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % allFeatures.length);
        setIsExiting(false);
      }, 400); // 더 부드러운 전환을 위해 250ms에서 400ms로 증가
    }, 3500); // 카드 표시 시간도 3초에서 3.5초로 증가


    return () => clearInterval(interval);
  }, []);

  const currentFeature = allFeatures[currentIndex];
  const FeatureIcon = currentFeature.icon;

  const getCategoryColor = () => {
    switch (currentFeature.category) {
      case "why":
        return "from-primary/20 via-primary/10 to-transparent";
      case "ai":
        return "from-accent/20 via-accent/10 to-transparent";
      case "hrd":
        return "from-blue-500/20 via-blue-500/10 to-transparent";
      default:
        return "from-primary/20 via-primary/10 to-transparent";
    }
  };

  const getCategoryLabel = () => {
    switch (currentFeature.category) {
      case "why":
        return { text: "왜 atomLMS인가?", color: "text-primary" };
      case "ai":
        return { text: "AI 기능", color: "text-accent" };
      case "hrd":
        return { text: "HRD 전문 기능", color: "text-blue-600 dark:text-blue-400" };
      default:
        return { text: "", color: "" };
    }
  };

  const categoryLabel = getCategoryLabel();

  return (
    <div className="relative w-full min-h-[400px] md:min-h-[450px] flex items-center justify-center overflow-hidden">
      {/* Subtle background pattern only */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />

      {/* Main feature card */}
      <div
        key={currentIndex}
        className={`relative z-10 max-w-2xl mx-auto px-4 transition-all duration-700 ${
          isExiting 
            ? 'animate-slide-out-right opacity-0' 
            : 'animate-slide-in-left opacity-100'
        }`}
      >
        {/* Category badge */}
        <div className="flex justify-center mb-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border">
            <span className={`text-xs font-bold ${categoryLabel.color}`}>
              {categoryLabel.text}
            </span>
          </div>
        </div>

        {/* Feature card */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1">
          <div className="flex flex-col items-center text-center gap-4">
            {/* Icon */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10 shadow-md">
              <FeatureIcon className="h-12 w-12 md:h-14 md:h-14 text-primary" />
            </div>

            {/* Title */}
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">
              {currentFeature.title}
            </h3>

            {/* Description */}
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
              {currentFeature.description}
            </p>

            {/* Tags */}
            {currentFeature.tags && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                {currentFeature.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-full bg-muted text-foreground font-medium border border-border text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Progress indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {allFeatures.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-primary w-10' 
                  : 'bg-muted-foreground/30 w-1'
              }`}
            />
          ))}
        </div>

        {/* Counter */}
        <div className="text-center mt-3">
          <span className="text-xs text-muted-foreground font-medium">
            {currentIndex + 1} / {allFeatures.length}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes slide-in-left {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slide-out-right {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .animate-slide-out-right {
          animation: slide-out-right 0.6s cubic-bezier(0.4, 0, 0.6, 1);
        }
      `}</style>
    </div>
  );
};
