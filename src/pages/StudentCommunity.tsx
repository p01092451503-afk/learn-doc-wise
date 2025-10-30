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
      title: "React useState와 useEffect의 차이점이 궁금합니다",
      author: "김학생",
      course: "React 완벽 가이드",
      content:
        "useState는 상태를 관리하고, useEffect는 부수효과를 처리한다고 배웠는데, 정확히 어떤 차이가 있나요?",
      replies: 5,
      likes: 12,
      timestamp: "2시간 전",
      category: "질문",
    },
    {
      id: 2,
      title: "Pandas DataFrame 병합 방법 정리",
      author: "이데이터",
      course: "파이썬 데이터 분석",
      content:
        "merge, concat, join의 차이점을 정리해봤습니다. 도움이 되셨으면 좋겠어요!",
      replies: 8,
      likes: 25,
      timestamp: "5시간 전",
      category: "정보공유",
    },
    {
      id: 3,
      title: "과제 2번 문제 힌트 부탁드립니다",
      author: "박코딩",
      course: "React 완벽 가이드",
      content:
        "과제 2번에서 컴포넌트 구조를 어떻게 잡아야 할지 막막합니다. 힌트 좀 주실 수 있나요?",
      replies: 3,
      likes: 7,
      timestamp: "1일 전",
      category: "질문",
    },
    {
      id: 4,
      title: "디자인 시스템 구축 시 주의사항",
      author: "최디자인",
      course: "디자인 시스템 구축",
      content:
        "실무에서 디자인 시스템을 구축하면서 겪은 시행착오를 공유합니다.",
      replies: 15,
      likes: 42,
      timestamp: "2일 전",
      category: "정보공유",
    },
  ];

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">커뮤니티</h1>
            <p className="text-muted-foreground mt-2">
              다른 학습자들과 소통하고 지식을 공유하세요
            </p>
          </div>
          <Button className="gap-2">
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
                  <p className="text-3xl font-bold mt-2">8</p>
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
                  <p className="text-3xl font-bold mt-2">47</p>
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
                  <p className="text-3xl font-bold mt-2">23</p>
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
            />
          </div>
          <Button variant="outline" className="rounded-xl">
            필터
          </Button>
        </div>

        {/* 게시글 목록 */}
        <div className="space-y-4">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          post.category === "질문" ? "default" : "secondary"
                        }
                      >
                        {post.category}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {post.course}
                      </span>
                    </div>
                    <CardTitle className="text-xl hover:text-primary transition-colors">
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
