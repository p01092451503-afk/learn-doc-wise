import { useState, useEffect } from "react";
import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Code2, 
  Package, 
  Layers, 
  Sparkles, 
  Database, 
  Palette, 
  Workflow,
  ShieldCheck,
  Video,
  CreditCard,
  Wrench,
  ExternalLink,
  Plus,
  Calendar,
  GitBranch,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TechStack {
  id: string;
  category: string;
  name: string;
  version: string | null;
  description: string | null;
  purpose: string | null;
  documentation_url: string | null;
  is_core: boolean;
}

interface PlatformVersion {
  id: string;
  version: string;
  release_date: string;
  release_type: string;
  title: string;
  description: string | null;
  features: any;
  tech_changes: any;
  breaking_changes: any;
}

const categoryIcons: Record<string, any> = {
  Frontend: Code2,
  Styling: Palette,
  "State Management": Workflow,
  Routing: GitBranch,
  Backend: Database,
  Database: Database,
  "AI/ML": Sparkles,
  "UI Components": Layers,
  Media: Video,
  Payment: CreditCard,
  Utilities: Wrench,
  DevTools: Package,
};

const OperatorTechStack = () => {
  const { toast } = useToast();
  const [techStack, setTechStack] = useState<TechStack[]>([]);
  const [versions, setVersions] = useState<PlatformVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddVersionOpen, setIsAddVersionOpen] = useState(false);
  const [newVersion, setNewVersion] = useState({
    version: "",
    release_type: "minor",
    title: "",
    description: "",
    features: "",
    tech_changes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [techStackData, versionsData] = await Promise.all([
        supabase
          .from("tech_stack")
          .select("*")
          .order("display_order", { ascending: true }),
        supabase
          .from("platform_versions")
          .select("*")
          .order("release_date", { ascending: false }),
      ]);

      if (techStackData.error) throw techStackData.error;
      if (versionsData.error) throw versionsData.error;

      setTechStack(techStackData.data || []);
      setVersions(versionsData.data || []);
    } catch (error: any) {
      toast({
        title: "데이터 로딩 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const groupedTechStack = techStack.reduce((acc, tech) => {
    if (!acc[tech.category]) {
      acc[tech.category] = [];
    }
    acc[tech.category].push(tech);
    return acc;
  }, {} as Record<string, TechStack[]>);

  const handleAddVersion = async () => {
    try {
      const featuresArray = newVersion.features
        .split("\n")
        .filter(f => f.trim())
        .map(f => ({ name: f.trim(), description: "" }));
      
      const techChangesArray = newVersion.tech_changes
        .split("\n")
        .filter(t => t.trim())
        .map(t => ({ name: t.trim(), description: "" }));

      const { error } = await supabase
        .from("platform_versions")
        .insert({
          version: newVersion.version,
          release_type: newVersion.release_type,
          title: newVersion.title,
          description: newVersion.description,
          features: featuresArray,
          tech_changes: techChangesArray,
        });

      if (error) throw error;

      toast({
        title: "버전 추가 완료",
        description: `버전 ${newVersion.version}이(가) 성공적으로 추가되었습니다.`,
      });

      setIsAddVersionOpen(false);
      setNewVersion({
        version: "",
        release_type: "minor",
        title: "",
        description: "",
        features: "",
        tech_changes: "",
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "버전 추가 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getReleaseTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      major: "destructive",
      minor: "default",
      patch: "secondary",
    };
    return <Badge variant={variants[type] || "default"}>{type.toUpperCase()}</Badge>;
  };

  if (loading) {
    return (
      <OperatorLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </OperatorLayout>
    );
  }

  return (
    <OperatorLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Package className="h-8 w-8 text-primary" />
              기술 스택 & 버전 관리
            </h1>
            <p className="text-muted-foreground mt-2">
              플랫폼의 기술 스택과 버전 히스토리를 확인하고 관리합니다
            </p>
          </div>
          <Dialog open={isAddVersionOpen} onOpenChange={setIsAddVersionOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                새 버전 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>새 버전 추가</DialogTitle>
                <DialogDescription>
                  새로운 플랫폼 버전 정보를 입력하세요
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="version">버전 번호 *</Label>
                    <Input
                      id="version"
                      placeholder="예: 1.1.0"
                      value={newVersion.version}
                      onChange={(e) => setNewVersion({ ...newVersion, version: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="release_type">릴리스 타입 *</Label>
                    <Select
                      value={newVersion.release_type}
                      onValueChange={(value) => setNewVersion({ ...newVersion, release_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="major">Major</SelectItem>
                        <SelectItem value="minor">Minor</SelectItem>
                        <SelectItem value="patch">Patch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">제목 *</Label>
                  <Input
                    id="title"
                    placeholder="예: 새로운 AI 기능 추가"
                    value={newVersion.title}
                    onChange={(e) => setNewVersion({ ...newVersion, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">설명</Label>
                  <Textarea
                    id="description"
                    placeholder="버전에 대한 상세 설명"
                    value={newVersion.description}
                    onChange={(e) => setNewVersion({ ...newVersion, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="features">추가된 기능 (한 줄에 하나씩)</Label>
                  <Textarea
                    id="features"
                    placeholder="예:&#10;AI 채팅봇 개선&#10;새로운 분석 대시보드"
                    rows={5}
                    value={newVersion.features}
                    onChange={(e) => setNewVersion({ ...newVersion, features: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tech_changes">기술 변경사항 (한 줄에 하나씩)</Label>
                  <Textarea
                    id="tech_changes"
                    placeholder="예:&#10;React 18.3.1로 업그레이드&#10;새로운 캐싱 시스템 도입"
                    rows={5}
                    value={newVersion.tech_changes}
                    onChange={(e) => setNewVersion({ ...newVersion, tech_changes: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddVersionOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleAddVersion}>추가</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="tech-stack" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tech-stack" className="gap-2">
              <Package className="h-4 w-4" />
              기술 스택
            </TabsTrigger>
            <TabsTrigger value="versions" className="gap-2">
              <GitBranch className="h-4 w-4" />
              버전 히스토리
            </TabsTrigger>
            <TabsTrigger value="scalability" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              확장성 분석
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tech-stack" className="space-y-4">
            <div className="grid gap-4">
              {Object.entries(groupedTechStack).map(([category, techs]) => {
                const Icon = categoryIcons[category] || Package;
                return (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        {category}
                      </CardTitle>
                      <CardDescription>
                        {techs.length}개의 기술/라이브러리
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        {techs.map((tech) => (
                          <div
                            key={tech.id}
                            className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{tech.name}</h4>
                                {tech.version && (
                                  <Badge variant="outline">{tech.version}</Badge>
                                )}
                                {tech.is_core && (
                                  <Badge variant="default" className="gap-1">
                                    <ShieldCheck className="h-3 w-3" />
                                    Core
                                  </Badge>
                                )}
                              </div>
                              {tech.description && (
                                <p className="text-sm text-muted-foreground">
                                  {tech.description}
                                </p>
                              )}
                              {tech.purpose && (
                                <p className="text-sm text-primary/80">
                                  목적: {tech.purpose}
                                </p>
                              )}
                            </div>
                            {tech.documentation_url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-4"
                                onClick={() => window.open(tech.documentation_url!, "_blank")}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="versions" className="space-y-4">
            {versions.map((version, index) => (
              <Card key={version.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle>v{version.version}</CardTitle>
                        {getReleaseTypeBadge(version.release_type)}
                        {index === 0 && (
                          <Badge variant="default" className="gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Latest
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(version.release_date).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </CardDescription>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mt-2">{version.title}</h3>
                  {version.description && (
                    <p className="text-sm text-muted-foreground">{version.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {version.features && version.features.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        추가된 기능
                      </h4>
                      <ul className="space-y-1 ml-6">
                        {version.features.map((feature: any, idx: number) => (
                          <li key={idx} className="text-sm list-disc">
                            <span className="font-medium">{feature.name}</span>
                            {feature.description && (
                              <span className="text-muted-foreground"> - {feature.description}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {version.tech_changes && version.tech_changes.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Code2 className="h-4 w-4 text-blue-500" />
                        기술 변경사항
                      </h4>
                      <ul className="space-y-1 ml-6">
                        {version.tech_changes.map((change: any, idx: number) => (
                          <li key={idx} className="text-sm list-disc">
                            <span className="font-medium">{change.name}</span>
                            {change.description && (
                              <span className="text-muted-foreground"> - {change.description}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {version.breaking_changes && version.breaking_changes.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        Breaking Changes
                      </h4>
                      <ul className="space-y-1 ml-6">
                        {version.breaking_changes.map((change: any, idx: number) => (
                          <li key={idx} className="text-sm list-disc text-orange-600">
                            <span className="font-medium">{change.name}</span>
                            {change.description && (
                              <span className="text-muted-foreground"> - {change.description}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="scalability" className="space-y-6">
            {/* 현재 아키텍처 분석 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-500" />
                  현재 아키텍처 분석
                </CardTitle>
                <CardDescription>
                  동시 접속 500명+ 시나리오에서의 시스템 평가
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 긍정적 요소 */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-600 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    강점 및 준비된 요소
                  </h4>
                  <div className="grid gap-3">
                    <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950/20">
                      <div className="font-medium mb-1">✅ Lovable Cloud (Supabase) 기반 인프라</div>
                      <p className="text-sm text-muted-foreground">
                        Supabase는 자동 스케일링을 지원하며, PostgreSQL의 Connection Pooling(Supavisor)으로 
                        수천 개의 동시 연결 처리 가능. 기본적으로 높은 확장성 제공.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950/20">
                      <div className="font-medium mb-1">✅ Row Level Security (RLS)</div>
                      <p className="text-sm text-muted-foreground">
                        데이터베이스 레벨에서 보안과 멀티테넌시 구현. 사용자별 데이터 격리가 효율적으로 처리됨.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950/20">
                      <div className="font-medium mb-1">✅ React + Vite 최적화된 프론트엔드</div>
                      <p className="text-sm text-muted-foreground">
                        코드 스플리팅, Tree Shaking, Lazy Loading 지원. 클라이언트 사이드 렌더링으로 서버 부하 최소화.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950/20">
                      <div className="font-medium mb-1">✅ TanStack Query를 통한 효율적 데이터 관리</div>
                      <p className="text-sm text-muted-foreground">
                        자동 캐싱, 백그라운드 리페칭, 중복 요청 제거로 네트워크 부하 감소.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 병목 지점 */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-orange-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    잠재적 병목 지점
                  </h4>
                  <div className="grid gap-3">
                    <div className="p-4 rounded-lg border bg-orange-50 dark:bg-orange-950/20">
                      <div className="font-medium mb-1">⚠️ 데이터베이스 쿼리 최적화 부족</div>
                      <p className="text-sm text-muted-foreground">
                        복잡한 JOIN, N+1 쿼리 문제, 인덱스 누락 가능성. 실시간 동시 쿼리 증가 시 응답 시간 지연.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border bg-orange-50 dark:bg-orange-950/20">
                      <div className="font-medium mb-1">⚠️ 실시간 기능의 WebSocket 연결 관리</div>
                      <p className="text-sm text-muted-foreground">
                        Realtime 기능 사용 시 WebSocket 연결 수 제한. 대규모 동시 접속 시 연결 관리 필요.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border bg-orange-50 dark:bg-orange-950/20">
                      <div className="font-medium mb-1">⚠️ AI 기능의 Rate Limiting</div>
                      <p className="text-sm text-muted-foreground">
                        Lovable AI는 무료 사용량 제한 있음. 동시 다발적 AI 요청 시 쓰로틀링 가능성.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border bg-orange-50 dark:bg-orange-950/20">
                      <div className="font-medium mb-1">⚠️ 파일 업로드/스트리밍 대역폭</div>
                      <p className="text-sm text-muted-foreground">
                        동영상 스트리밍, 대용량 파일 동시 다운로드 시 네트워크 대역폭 포화 가능.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 개선 권장사항 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  상용화 개선 권장사항
                </CardTitle>
                <CardDescription>
                  동시 접속 500명 이상 대응을 위한 구체적 개선안
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {/* 1. 데이터베이스 최적화 */}
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-bold mb-2">1. 데이터베이스 성능 최적화 🔧</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <div>
                          <strong>인덱스 전략 수립:</strong> 자주 사용되는 WHERE, JOIN 조건에 복합 인덱스 추가
                          <code className="block mt-1 p-2 bg-muted rounded text-xs">
                            CREATE INDEX idx_enrollments_user_course ON enrollments(user_id, course_id);
                          </code>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <div>
                          <strong>Materialized Views 도입:</strong> 복잡한 집계 쿼리 사전 계산
                          <code className="block mt-1 p-2 bg-muted rounded text-xs">
                            CREATE MATERIALIZED VIEW user_analytics_summary AS ...
                          </code>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <div>
                          <strong>Query 튜닝:</strong> EXPLAIN ANALYZE로 느린 쿼리 식별 후 최적화
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <div>
                          <strong>Connection Pooling 설정:</strong> Supavisor 설정 조정 (Pool Size 증가)
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* 2. 캐싱 전략 */}
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-bold mb-2">2. 다층 캐싱 전략 구현 ⚡</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <div>
                          <strong>CDN 도입:</strong> Cloudflare/Vercel Edge Network로 정적 자산 글로벌 캐싱
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <div>
                          <strong>Redis 캐시 레이어:</strong> Upstash Redis로 세션, 자주 조회되는 데이터 캐싱
                          <code className="block mt-1 p-2 bg-muted rounded text-xs">
                            // 강의 목록, 사용자 프로필 등 캐싱 (TTL: 5분)
                          </code>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <div>
                          <strong>Browser Caching 최적화:</strong> Cache-Control 헤더 적극 활용
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <div>
                          <strong>API Response 캐싱:</strong> TanStack Query staleTime 증가 (변경 빈도 낮은 데이터)
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* 3. Edge Functions 최적화 */}
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-bold mb-2">3. Edge Functions 확장 🚀</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        <div>
                          <strong>Deno Deploy 자동 스케일링:</strong> Edge Functions는 자동 스케일 (추가 작업 불필요)
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        <div>
                          <strong>Rate Limiting 구현:</strong> 사용자/IP당 요청 제한으로 서비스 안정성 확보
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        <div>
                          <strong>Queue 시스템 도입:</strong> 무거운 AI 작업은 Queue (Inngest, BullMQ)로 비동기 처리
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        <div>
                          <strong>Background Tasks 활용:</strong> EdgeRuntime.waitUntil로 응답 속도 개선
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* 4. 프론트엔드 최적화 */}
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-bold mb-2">4. 프론트엔드 성능 최적화 🎨</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <div>
                          <strong>Code Splitting 고도화:</strong> React.lazy + Suspense로 페이지별 번들 분리
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <div>
                          <strong>Image 최적화:</strong> WebP 포맷, Lazy Loading, Responsive Images
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <div>
                          <strong>Virtual Scrolling:</strong> 긴 목록(강의, 학생)에 react-window 적용
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <div>
                          <strong>Debouncing/Throttling:</strong> 검색, 필터 등 실시간 입력에 적용
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* 5. 모니터링 & 알림 */}
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-bold mb-2">5. 모니터링 & 알림 시스템 구축 📊</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        <div>
                          <strong>APM 도입:</strong> Sentry (에러 트래킹), Vercel Analytics (성능 모니터링)
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        <div>
                          <strong>Uptime 모니터링:</strong> UptimeRobot, Pingdom으로 서비스 가용성 추적
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        <div>
                          <strong>Supabase Dashboard 활용:</strong> DB 성능 메트릭, Slow Query 알림 설정
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        <div>
                          <strong>Custom 메트릭:</strong> 동시 접속자, API 응답 시간, 에러율 대시보드
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* 6. AI 사용량 관리 */}
                  <div className="border-l-4 border-cyan-500 pl-4">
                    <h4 className="font-bold mb-2">6. AI 기능 확장성 확보 🤖</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-500 mt-1">•</span>
                        <div>
                          <strong>AI 요청 쓰로틀링:</strong> 사용자당 분당 요청 제한 (예: 10회/분)
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-500 mt-1">•</span>
                        <div>
                          <strong>응답 캐싱:</strong> 동일 질문에 대한 AI 응답 재사용 (Redis)
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-500 mt-1">•</span>
                        <div>
                          <strong>Fallback 전략:</strong> Lovable AI 한도 초과 시 OpenAI API로 자동 전환
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-500 mt-1">•</span>
                        <div>
                          <strong>Batch Processing:</strong> 대량 채점, 분석 작업은 야간 배치로 처리
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 예상 비용 & 플랜 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-yellow-500" />
                  상용화 인프라 비용 예측
                </CardTitle>
                <CardDescription>
                  동시 접속 500명 기준 월간 예상 비용 (USD)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border bg-card">
                      <h4 className="font-semibold mb-3">기본 인프라</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Supabase Pro 플랜</span>
                          <span className="font-mono">$25/월</span>
                        </div>
                        <div className="flex justify-between">
                          <span>추가 DB 용량 (50GB)</span>
                          <span className="font-mono">$0.125/GB = $6.25</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Vercel Pro (호스팅)</span>
                          <span className="font-mono">$20/월</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2">
                          <span>소계</span>
                          <span className="font-mono">~$51/월</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border bg-card">
                      <h4 className="font-semibold mb-3">확장 서비스</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Upstash Redis (캐싱)</span>
                          <span className="font-mono">$10/월</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sentry (모니터링)</span>
                          <span className="font-mono">$29/월</span>
                        </div>
                        <div className="flex justify-between">
                          <span>CDN (Cloudflare Pro)</span>
                          <span className="font-mono">$20/월</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2">
                          <span>소계</span>
                          <span className="font-mono">~$59/월</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border bg-primary/5">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">총 예상 비용</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">~$110/월</div>
                        <div className="text-sm text-muted-foreground">(약 150,000원/월)</div>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    * AI 사용량(Lovable AI 무료 한도 초과 시), 파일 스토리지, 대역폭은 사용량에 따라 추가 비용 발생
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 로드맵 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  구현 우선순위 로드맵
                </CardTitle>
                <CardDescription>
                  단계별 개선 작업 순서
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-bold text-red-600">🔴 Phase 1: 즉시 실행 (1-2주)</h4>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• 데이터베이스 인덱스 추가</li>
                      <li>• Slow Query 식별 및 최적화</li>
                      <li>• TanStack Query 캐싱 설정 조정</li>
                      <li>• 기본 모니터링 도구 설정 (Sentry)</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-bold text-orange-600">🟠 Phase 2: 단기 개선 (2-4주)</h4>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• Redis 캐싱 레이어 구축</li>
                      <li>• CDN 설정 및 정적 자산 최적화</li>
                      <li>• Code Splitting 및 Lazy Loading 적용</li>
                      <li>• AI Rate Limiting 구현</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-bold text-yellow-600">🟡 Phase 3: 중기 고도화 (1-2개월)</h4>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• Queue 시스템 도입 (AI 작업 비동기 처리)</li>
                      <li>• Materialized Views 구축</li>
                      <li>• Virtual Scrolling 구현</li>
                      <li>• 종합 모니터링 대시보드 구축</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-bold text-green-600">🟢 Phase 4: 장기 확장 (3개월+)</h4>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• 마이크로서비스 아키텍처 검토 (필요시)</li>
                      <li>• Multi-region 배포 (글로벌 확장)</li>
                      <li>• Load Testing 및 성능 벤치마킹</li>
                      <li>• 자동 스케일링 정책 수립</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 결론 */}
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  결론 및 권장사항
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm leading-relaxed">
                  <strong>현재 아키텍처는 동시 접속 500명을 기술적으로 지원 가능</strong>하나, 
                  실제 상용 서비스로 안정적으로 운영하려면 <strong>Phase 1, 2의 개선이 필수</strong>입니다.
                </p>
                <p className="text-sm leading-relaxed">
                  특히 <strong className="text-primary">데이터베이스 최적화(인덱스, 쿼리 튜닝)</strong>와 
                  <strong className="text-primary"> 캐싱 전략</strong>이 가장 큰 성능 향상 효과를 보입니다.
                </p>
                <p className="text-sm leading-relaxed">
                  Supabase/Lovable Cloud의 자동 스케일링 덕분에 인프라 확장은 비교적 간단하며, 
                  위 개선사항을 적용하면 <strong>동시 접속 1,000명 이상도 충분히 대응 가능</strong>합니다.
                </p>
                <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm font-medium">
                    💡 <strong>핵심 권장사항:</strong> Phase 1을 먼저 완료한 후 실제 트래픽을 모니터링하며 
                    Phase 2, 3을 순차적으로 적용하는 것이 비용 대비 효율적입니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OperatorLayout>
  );
};

export default OperatorTechStack;
