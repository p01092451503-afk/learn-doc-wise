import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, ThumbsUp, Search, Plus, Eye } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  course_id: string;
  post_type: string;
  status: string;
  is_pinned: boolean;
  views_count: number;
  likes_count: number;
  comments_count: number;
  tags: string[] | null;
  created_at: string;
  profiles: {
    full_name: string | null;
  } | null;
  courses: {
    title: string;
  } | null;
}

const StudentCommunity = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    myPosts: 0,
    receivedLikes: 0,
    myComments: 0,
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    course_id: "",
    post_type: "discussion",
  });
  const [enrolledCourses, setEnrolledCourses] = useState<{ id: string; title: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
    loadPosts();
    loadStats();
    loadEnrolledCourses();
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .eq("status", "active")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Load author profiles and course info separately
      const postsWithProfiles = await Promise.all(
        (data || []).map(async (post) => {
          const [profileResult, courseResult] = await Promise.all([
            supabase
              .from("profiles")
              .select("full_name")
              .eq("user_id", post.author_id)
              .maybeSingle(),
            supabase
              .from("courses")
              .select("title")
              .eq("id", post.course_id)
              .maybeSingle(),
          ]);
          
          return {
            ...post,
            profiles: profileResult.data,
            courses: courseResult.data,
          };
        })
      );
      
      setPosts(postsWithProfiles as Post[]);
    } catch (error: any) {
      toast({
        title: "게시글을 불러올 수 없습니다",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 내 게시글 수
      const { count: postsCount } = await supabase
        .from("community_posts")
        .select("*", { count: "exact", head: true })
        .eq("author_id", user.id);

      // 받은 좋아요 수
      const { data: likesData } = await supabase
        .from("community_posts")
        .select("likes_count")
        .eq("author_id", user.id);
      const totalLikes = likesData?.reduce((sum, post) => sum + post.likes_count, 0) || 0;

      // 내 댓글 수
      const { count: commentsCount } = await supabase
        .from("community_comments")
        .select("*", { count: "exact", head: true })
        .eq("author_id", user.id);

      setStats({
        myPosts: postsCount || 0,
        receivedLikes: totalLikes,
        myComments: commentsCount || 0,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const loadEnrolledCourses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("enrollments")
        .select("course_id, courses(id, title)")
        .eq("user_id", user.id);

      if (error) throw error;
      
      const courses = data?.map((e: any) => ({
        id: e.courses.id,
        title: e.courses.title,
      })) || [];
      
      setEnrolledCourses(courses);
    } catch (error) {
      console.error("Failed to load courses:", error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content || !newPost.course_id) {
      toast({
        title: "모든 필드를 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다");

      const { error } = await supabase.from("community_posts").insert([{
        title: newPost.title,
        content: newPost.content,
        course_id: newPost.course_id,
        post_type: newPost.post_type as "discussion" | "question",
        author_id: user.id,
      }]);

      if (error) throw error;

      toast({
        title: "게시글이 작성되었습니다",
      });

      setIsCreateDialogOpen(false);
      setNewPost({ title: "", content: "", course_id: "", post_type: "discussion" });
      loadPosts();
      loadStats();
    } catch (error: any) {
      toast({
        title: "게시글 작성에 실패했습니다",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다");

      // Check if already liked
      const { data: existingLike } = await supabase
        .from("community_likes")
        .select("id")
        .eq("user_id", user.id)
        .eq("post_id", postId)
        .maybeSingle();

      if (existingLike) {
        // Unlike
        await supabase
          .from("community_likes")
          .delete()
          .eq("id", existingLike.id);
      } else {
        // Like
        await supabase
          .from("community_likes")
          .insert({ user_id: user.id, post_id: postId });
      }

      loadPosts();
    } catch (error: any) {
      toast({
        title: "좋아요 처리에 실패했습니다",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const incrementViewCount = async (postId: string) => {
    try {
      const { data } = await supabase
        .from("community_posts")
        .select("views_count")
        .eq("id", postId)
        .single();
      
      if (data) {
        await supabase
          .from("community_posts")
          .update({ views_count: data.views_count + 1 })
          .eq("id", postId);
      }
    } catch (error) {
      console.error("Failed to increment view count:", error);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case "question": return "질문";
      case "discussion": return "토론";
      case "announcement": return "공지";
      default: return type;
    }
  };

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-violet-500" />
              커뮤니티
            </h1>
            <p className="text-muted-foreground mt-2">
              다른 학습자들과 소통하고 지식을 공유하세요
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                새 글 작성
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>새 게시글 작성</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="course">강좌 선택</Label>
                  <Select
                    value={newPost.course_id}
                    onValueChange={(value) => setNewPost({ ...newPost, course_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="강좌를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {enrolledCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">게시글 유형</Label>
                  <Select
                    value={newPost.post_type}
                    onValueChange={(value) => setNewPost({ ...newPost, post_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discussion">토론</SelectItem>
                      <SelectItem value="question">질문</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">제목</Label>
                  <Input
                    id="title"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="게시글 제목을 입력하세요"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">내용</Label>
                  <Textarea
                    id="content"
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="게시글 내용을 입력하세요"
                    rows={8}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    취소
                  </Button>
                  <Button onClick={handleCreatePost}>
                    작성하기
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
                  <p className="text-3xl font-bold mt-2">{stats.myPosts}</p>
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
                  <p className="text-3xl font-bold mt-2">{stats.receivedLikes}</p>
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
                  <p className="text-3xl font-bold mt-2">{stats.myComments}</p>
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 게시글 목록 */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              로딩 중...
            </div>
          ) : filteredPosts.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? "검색 결과가 없습니다" : "아직 게시글이 없습니다"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <Card
                key={post.id}
                className="border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => incrementViewCount(post.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {post.is_pinned && (
                          <Badge variant="default" className="bg-primary">
                            공지
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {getPostTypeLabel(post.post_type)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {post.courses?.title || "전체"}
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
                            {post.profiles?.full_name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {post.profiles?.full_name || "익명"}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(post.created_at), {
                          addSuffix: true,
                          locale: ko,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{post.views_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.comments_count}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLikePost(post.id);
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{post.likes_count}</span>
                        </div>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentCommunity;
