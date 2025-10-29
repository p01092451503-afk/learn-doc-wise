import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderOpen, FileText, Video, Image as ImageIcon, Upload, Search, MoreVertical } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminContent = () => {
  const contents = [
    {
      id: 1,
      name: "React Hooks 강의 영상",
      type: "video",
      size: "245 MB",
      course: "React 완벽 가이드",
      uploadDate: "2024-10-25",
      status: "published",
    },
    {
      id: 2,
      name: "TypeScript 실습 자료.pdf",
      type: "document",
      size: "12 MB",
      course: "TypeScript 마스터클래스",
      uploadDate: "2024-10-24",
      status: "published",
    },
    {
      id: 3,
      name: "디자인 시스템 예제 이미지",
      type: "image",
      size: "5.2 MB",
      course: "디자인 시스템 구축",
      uploadDate: "2024-10-23",
      status: "draft",
    },
    {
      id: 4,
      name: "데이터 분석 코드 예제",
      type: "document",
      size: "2.1 MB",
      course: "파이썬 데이터 분석",
      uploadDate: "2024-10-22",
      status: "published",
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5 text-primary" />;
      case "document":
        return <FileText className="h-5 w-5 text-accent" />;
      case "image":
        return <ImageIcon className="h-5 w-5 text-secondary" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "video":
        return <Badge className="bg-primary/10 text-primary">동영상</Badge>;
      case "document":
        return <Badge className="bg-accent/10 text-accent">문서</Badge>;
      case "image":
        return <Badge className="bg-secondary/10 text-secondary">이미지</Badge>;
      default:
        return <Badge>기타</Badge>;
    }
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">콘텐츠 관리</h1>
            <p className="text-muted-foreground mt-2">
              강의 자료와 콘텐츠를 관리하세요
            </p>
          </div>
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            콘텐츠 업로드
          </Button>
        </div>

        {/* 통계 카드 */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium whitespace-nowrap text-muted-foreground">
                전체 콘텐츠
              </CardTitle>
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <FolderOpen className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-3xl font-bold whitespace-nowrap overflow-x-auto scrollbar-hide">1,234</div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">이번 달 +42</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium whitespace-nowrap text-muted-foreground">
                동영상
              </CardTitle>
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Video className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-3xl font-bold whitespace-nowrap overflow-x-auto scrollbar-hide">456</div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">125 GB</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium whitespace-nowrap text-muted-foreground">
                문서
              </CardTitle>
              <div className="h-10 w-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-3xl font-bold whitespace-nowrap overflow-x-auto scrollbar-hide">567</div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">12 GB</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium whitespace-nowrap text-muted-foreground">
                이미지
              </CardTitle>
              <div className="h-10 w-10 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <ImageIcon className="h-5 w-5 text-secondary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-3xl font-bold whitespace-nowrap overflow-x-auto scrollbar-hide">211</div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">3.2 GB</p>
            </CardContent>
          </Card>
        </div>

        {/* 검색 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="콘텐츠 이름, 강좌명으로 검색..."
            className="pl-10 rounded-xl border-border/50"
          />
        </div>

        {/* 콘텐츠 목록 */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>최근 업로드된 콘텐츠</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contents.map((content) => (
                <div
                  key={content.id}
                  className="flex items-center justify-between p-4 rounded-xl border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                      {getTypeIcon(content.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeBadge(content.type)}
                        <Badge
                          variant={
                            content.status === "published" ? "default" : "secondary"
                          }
                        >
                          {content.status === "published" ? "게시됨" : "임시저장"}
                        </Badge>
                      </div>
                      <h4 className="font-semibold">{content.name}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span>{content.course}</span>
                        <span>·</span>
                        <span>{content.size}</span>
                        <span>·</span>
                        <span>{content.uploadDate}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>다운로드</DropdownMenuItem>
                      <DropdownMenuItem>정보 수정</DropdownMenuItem>
                      <DropdownMenuItem>링크 복사</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 저장 공간 사용량 */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>저장 공간 사용량</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-muted-foreground">사용 중</span>
                  <span className="font-medium">140.2 GB / 500 GB</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-primary to-primary-glow h-3 rounded-full transition-all duration-300"
                    style={{ width: "28%" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  남은 용량: 359.8 GB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminContent;
