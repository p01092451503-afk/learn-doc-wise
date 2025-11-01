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
  TrendingUp
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
            <h1 className="text-3xl font-bold tracking-tight">기술 스택 & 버전 관리</h1>
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
        </Tabs>
      </div>
    </OperatorLayout>
  );
};

export default OperatorTechStack;
