import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Trash2, BookOpen, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CartItem {
  id: string;
  course_id: string;
  courses: {
    id: string;
    title: string;
    description: string;
    price: number;
    thumbnail_url: string;
    level: string;
    duration_hours: number;
  };
}

const StudentCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("cart" as any)
        .select(`
          id,
          course_id,
          courses (
            id,
            title,
            description,
            price,
            thumbnail_url,
            level,
            duration_hours
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      setCartItems((data || []) as any);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast({
        title: "오류",
        description: "장바구니를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("cart" as any)
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      setCartItems(cartItems.filter(item => item.id !== itemId));
      toast({
        title: "삭제 완료",
        description: "장바구니에서 강의가 제거되었습니다.",
      });
    } catch (error) {
      console.error("Error removing item:", error);
      toast({
        title: "오류",
        description: "삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.courses?.price || 0), 0);

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-primary" />
            장바구니
          </h1>
          <p className="text-muted-foreground mt-2">
            관심있는 강의를 담아두고 한 번에 결제하세요
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">장바구니를 불러오는 중...</p>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">장바구니가 비어있습니다</h3>
              <p className="text-muted-foreground mb-6">
                관심있는 강의를 장바구니에 담아보세요
              </p>
              <Link to="/courses">
                <Button variant="premium">강의 둘러보기</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* 장바구니 아이템 목록 */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const course = item.courses;
                if (!course) return null;

                return (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                          {course.thumbnail_url ? (
                            <img
                              src={course.thumbnail_url}
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                              <BookOpen className="h-8 w-8 text-primary/40" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold mb-1 truncate">{course.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {course.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{course.level}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {course.duration_hours}시간
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <p className="text-lg font-bold">
                            ₩{course.price.toLocaleString()}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            삭제
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* 주문 요약 */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>주문 요약</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">상품 수</span>
                      <span className="font-medium">{cartItems.length}개</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">총 상품 금액</span>
                      <span className="font-medium">₩{totalPrice.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>총 결제 금액</span>
                      <span className="text-primary">₩{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      토스 결제 연동은 추후 업데이트 예정입니다.
                    </AlertDescription>
                  </Alert>

                  <Button variant="premium" size="lg" className="w-full" disabled>
                    전체 결제하기 (준비 중)
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    장바구니에 담긴 강의는 최대 30일간 보관됩니다
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentCart;
