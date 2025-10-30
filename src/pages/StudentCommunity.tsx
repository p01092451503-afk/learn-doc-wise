import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, ThumbsUp, Search, Plus } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";

const StudentCommunity = () => {
  const [searchParams] = useSearchParams();
  const demoRole = searchParams.get('role') as "student" | "teacher" | "admin" | null;

  const posts = [
    {
      id: 1,
      title: "커뮤니티 준비 중입니다",
      author: "관리자",
      course: "전체",
      content: "곧 실제 게시판 기능이 추가될 예정입니다.",
      replies: 0,
      likes: 0,
      timestamp: "방금",
      category: "공지",
    },
  ];

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">커뮤니티</h1>
            <p className="text-muted-foreground mt-2">
              다른 학습자들과 소통하고 지식을 공유하세요 (곧 오픈 예정)
            </p>
          </div>
          <Button className="gap-2" disabled>
            <Plus className="h-4 w-4" />
            새 글 작성
          </Button>
        </div>

        {/* 커뮤니티 통계 */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    내 게시글
                  </p>
                  <p className="text-3xl font-bold mt-2">0</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    받은 좋아요
                  </p>
                  <p className="text-3xl font-bold mt-2">0</p>
                </div>
                <div className="h-12 w-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <ThumbsUp className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    답변한 글
                  </p>
                  <p className="text-3xl font-bold mt-2">0</p>
                </div>
                <div className="h-12 w-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 검색 및 필터 */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="게시글 검색..."
              className="pl-10 rounded-xl border-border/50"
              disabled
            />
          </div>
          <Button variant="outline" className="rounded-xl" disabled>
            필터
          </Button>
        </div>

        {/* 게시글 목록 */}
        <div className="space-y-4">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="border-border/50 shadow-sm"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">
                        {post.category}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {post.course}
                      </span>
                    </div>
                    <CardTitle className="text-xl">
                      {post.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.content}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10">
                          {post.author[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{post.author}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {post.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.replies}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{post.likes}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentCommunity;
