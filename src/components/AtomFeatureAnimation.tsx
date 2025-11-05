import { useEffect, useState } from "react";
import atomLogo from "@/assets/atom-logo.png";
import { Bot, CheckCircle, BarChart3, FileQuestion, Route, Sparkles, TrendingUp, Brain } from "lucide-react";

const features = [
  { icon: Bot, text: "AI 튜터", description: "24시간 즉시 답변" },
  { icon: CheckCircle, text: "자동 채점", description: "즉각적인 피드백" },
  { icon: BarChart3, text: "학습 분석", description: "맞춤형 인사이트" },
  { icon: FileQuestion, text: "퀴즈 생성", description: "자동 문제 출제" },
  { icon: Route, text: "학습 경로", description: "개인화된 추천" },
  { icon: Sparkles, text: "AI 피드백", description: "상세한 개선안" },
  { icon: TrendingUp, text: "진도 예측", description: "성공 가능성 분석" },
  { icon: Brain, text: "스터디 매칭", description: "최적 팀 구성" },
];

export const AtomFeatureAnimation = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const currentFeature = features[currentIndex];
  const FeatureIcon = currentFeature.icon;

  return (
    <div className="relative w-full h-full min-h-[400px] md:min-h-[500px] bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-2xl overflow-hidden flex items-center justify-center">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      {/* Orbiting particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/30"
            style={{
              top: '50%',
              left: '50%',
              animation: `orbit-${i} ${8 + i * 0.5}s linear infinite`,
            }}
          />
        ))}
      </div>

      {/* Central atom logo with rotation */}
      <div className="relative z-10">
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute inset-0 -m-20 rounded-full bg-primary/10 animate-pulse" />
          
          {/* Rotating ring */}
          <div className="absolute inset-0 -m-16">
            <div className="w-full h-full rounded-full border-2 border-primary/20 animate-spin" style={{ animationDuration: '8s' }} />
          </div>

          {/* Main atom logo */}
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <img 
                src={atomLogo} 
                alt="Atom Logo" 
                className="w-20 h-20 md:w-24 md:h-24 object-contain animate-[spin_20s_linear_infinite]"
              />
            </div>
          </div>
        </div>

        {/* Feature display */}
        <div 
          key={currentIndex}
          className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-80 text-center animate-fade-in"
        >
          <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <FeatureIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                {currentFeature.text}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentFeature.description}
              </p>
            </div>
          </div>
        </div>

        {/* Feature indicator dots */}
        <div className="absolute -bottom-48 left-1/2 -translate-x-1/2 flex gap-2">
          {features.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-primary w-8' 
                  : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>

      <style>{`
        ${[...Array(8)].map((_, i) => `
          @keyframes orbit-${i} {
            from {
              transform: translate(-50%, -50%) rotate(${i * 45}deg) translateX(${120 + i * 10}px) rotate(-${i * 45}deg);
            }
            to {
              transform: translate(-50%, -50%) rotate(${360 + i * 45}deg) translateX(${120 + i * 10}px) rotate(-${360 + i * 45}deg);
            }
          }
        `).join('\n')}
      `}</style>
    </div>
  );
};
