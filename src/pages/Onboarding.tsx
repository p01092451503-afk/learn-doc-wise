import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  Loader2,
  Sparkles 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
}

const steps: OnboardingStep[] = [
  { id: 1, title: "조직 정보", description: "학원/기관 정보를 입력해주세요" },
  { id: 2, title: "도메인 설정", description: "사용할 도메인을 설정해주세요" },
  { id: 3, title: "결제", description: "플랜을 결제하고 시작하세요" },
];

const planNames = {
  starter: "스타터 플랜",
  standard: "스탠다드 플랜",
  professional: "프로페셔널 플랜",
};

const planPrices = {
  starter: 49000,
  standard: 99000,
  professional: 199000,
};

export default function Onboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const selectedPlan = searchParams.get("plan") || "starter";
  
  const [formData, setFormData] = useState({
    organizationName: "",
    subdomain: "",
    description: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "먼저 로그인해주세요.",
        variant: "destructive",
      });
      navigate(`/auth?redirect=/onboarding?plan=${selectedPlan}`);
      return;
    }
    setUser(user);
  };

  const validateSubdomain = (subdomain: string) => {
    const regex = /^[a-z0-9-]+$/;
    return regex.test(subdomain) && subdomain.length >= 3 && subdomain.length <= 30;
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!formData.organizationName.trim()) {
        toast({
          title: "오류",
          description: "조직 이름을 입력해주세요.",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!formData.subdomain.trim()) {
        toast({
          title: "오류",
          description: "서브도메인을 입력해주세요.",
          variant: "destructive",
        });
        return;
      }
      
      if (!validateSubdomain(formData.subdomain)) {
        toast({
          title: "오류",
          description: "서브도메인은 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다 (3-30자).",
          variant: "destructive",
        });
        return;
      }

      // Check if subdomain is available
      const { data: existing } = await supabase
        .from("tenants")
        .select("id")
        .eq("subdomain", formData.subdomain)
        .single();

      if (existing) {
        toast({
          title: "오류",
          description: "이미 사용 중인 서브도메인입니다.",
          variant: "destructive",
        });
        return;
      }

      setCurrentStep(3);
    }
  };

  const handlePayment = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Request payment
      const { data, error } = await supabase.functions.invoke("toss-payment-request", {
        body: {
          amount: planPrices[selectedPlan as keyof typeof planPrices],
          orderName: `${planNames[selectedPlan as keyof typeof planNames]} 구독`,
          customerName: user.email,
          metadata: {
            plan: selectedPlan,
            organizationName: formData.organizationName,
            subdomain: formData.subdomain,
            description: formData.description,
          },
        },
      });

      if (error) throw error;

      if (data?.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (error: any) {
      toast({
        title: "결제 오류",
        description: error.message || "결제 요청에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">atomLMS 시작하기</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            {planNames[selectedPlan as keyof typeof planNames]}로 시작합니다
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                      currentStep >= step.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-muted"
                    )}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <span className="font-semibold">{step.id}</span>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-1 mx-4 transition-all",
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep - 1].title}</CardTitle>
              <CardDescription>{steps[currentStep - 1].description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="organizationName">
                      조직 이름 <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="organizationName"
                        placeholder="예: ABC 학원"
                        value={formData.organizationName}
                        onChange={(e) =>
                          setFormData({ ...formData, organizationName: e.target.value })
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">조직 설명 (선택사항)</Label>
                    <Textarea
                      id="description"
                      placeholder="학원 또는 기관에 대한 간단한 설명을 입력해주세요"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subdomain">
                      서브도메인 <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="subdomain"
                        placeholder="myschool"
                        value={formData.subdomain}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            subdomain: e.target.value.toLowerCase(),
                          })
                        }
                        className="pl-10"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      귀하의 LMS 주소: <strong>{formData.subdomain || "myschool"}</strong>.atomlms.com
                    </p>
                    <p className="text-xs text-muted-foreground">
                      * 영문 소문자, 숫자, 하이픈만 사용 가능 (3-30자)
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                    <h3 className="font-semibold text-lg">선택한 플랜</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">플랜</span>
                        <span className="font-medium">
                          {planNames[selectedPlan as keyof typeof planNames]}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">조직 이름</span>
                        <span className="font-medium">{formData.organizationName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">서브도메인</span>
                        <span className="font-medium">{formData.subdomain}.atomlms.com</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between text-lg">
                          <span className="font-semibold">월 결제 금액</span>
                          <span className="font-bold text-primary">
                            {planPrices[selectedPlan as keyof typeof planPrices].toLocaleString()}원
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <p className="text-sm">
                      <strong>💳 안전한 결제</strong>
                      <br />
                      Toss Payments를 통해 안전하게 결제됩니다. 결제 완료 후 즉시 LMS를 사용하실 수 있습니다.
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between pt-4">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    disabled={loading}
                  >
                    이전
                  </Button>
                )}
                
                {currentStep < 3 ? (
                  <Button
                    onClick={handleNext}
                    className="ml-auto gap-2"
                    disabled={loading}
                  >
                    다음
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handlePayment}
                    className="ml-auto gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        처리 중...
                      </>
                    ) : (
                      <>
                        결제하기
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
