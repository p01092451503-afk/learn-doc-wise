import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Users, BookOpen, TrendingUp, Star, Eye, Clock, Award, Target } from "lucide-react";

const TeacherAnalytics = () => {
  return (
    <DashboardLayout userRole="teacher">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">통계 분석</h1>
          <p className="text-muted-foreground">
            강의 성과와 학생 참여도를 분석하세요
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard
            title="전체 조회수"
            value="12,450"
            icon={<Eye className="h-4 w-4" />}
            description="+24% from last month"
            trend="up"
          />
          <StatsCard
            title="평균 수강 시간"
            value="4.2시간"
            icon={<Clock className="h-4 w-4" />}
            description="학생당 평균"
          />
          <StatsCard
            title="강의 완료율"
            value="78%"
            icon={<Target className="h-4 w-4" />}
            description="+5% from last month"
            trend="up"
          />
          <StatsCard
            title="평균 만족도"
            value="4.75/5"
            icon={<Award className="h-4 w-4" />}
            description="281개 리뷰 기반"
          />
        </div>

        {/* Course Performance */}
        <Card>
          <CardHeader>
            <CardTitle>강의별 성과</CardTitle>
            <CardDescription>각 강의의 주요 지표를 확인하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <CoursePerformance
                title="React 완벽 가이드"
                students={145}
                completion={85}
                rating={4.9}
                engagement={92}
              />
              <CoursePerformance
                title="TypeScript 마스터클래스"
                students={98}
                completion={78}
                rating={4.7}
                engagement={88}
              />
              <CoursePerformance
                title="Next.js 풀스택 개발"
                students={76}
                completion={82}
                rating={4.8}
                engagement={90}
              />
              <CoursePerformance
                title="Node.js 백엔드 개발"
                students={54}
                completion={65}
                rating={4.6}
                engagement={75}
              />
            </div>
          </CardContent>
        </Card>

        {/* Student Engagement */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>학생 참여도</CardTitle>
              <CardDescription>최근 30일 기준</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <EngagementMetric
                  label="질문 등록"
                  value={156}
                  percentage={85}
                  color="bg-blue-500"
                />
                <EngagementMetric
                  label="과제 제출"
                  value={342}
                  percentage={92}
                  color="bg-green-500"
                />
                <EngagementMetric
                  label="토론 참여"
                  value={89}
                  percentage={68}
                  color="bg-purple-500"
                />
                <EngagementMetric
                  label="리뷰 작성"
                  value={45}
                  percentage={45}
                  color="bg-orange-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>학습 성과</CardTitle>
              <CardDescription>학생들의 학습 달성도</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AchievementMetric
                  label="우수 학생"
                  value={45}
                  description="90% 이상 완료"
                  icon={<Award className="h-4 w-4 text-yellow-600" />}
                />
                <AchievementMetric
                  label="평균 학생"
                  value={187}
                  description="60-90% 완료"
                  icon={<Users className="h-4 w-4 text-blue-600" />}
                />
                <AchievementMetric
                  label="집중 필요"
                  value={32}
                  description="60% 미만"
                  icon={<TrendingUp className="h-4 w-4 text-red-600" />}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Lessons */}
        <Card>
          <CardHeader>
            <CardTitle>인기 레슨 Top 5</CardTitle>
            <CardDescription>가장 많이 수강된 레슨</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <LessonRank rank={1} title="React Hooks 완전 정복" views={1245} completion={95} />
              <LessonRank rank={2} title="TypeScript 제네릭 마스터" views={1089} completion={88} />
              <LessonRank rank={3} title="Next.js App Router 가이드" views={987} completion={92} />
              <LessonRank rank={4} title="상태 관리 패턴" views={876} completion={85} />
              <LessonRank rank={5} title="API 통합 베스트 프랙티스" views={765} completion={90} />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  description,
  trend 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  description: string;
  trend?: "up" | "down";
}) => (
  <Card className="overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium whitespace-nowrap">{title}</CardTitle>
      <div className="text-muted-foreground flex-shrink-0">{icon}</div>
    </CardHeader>
    <CardContent className="space-y-1 min-w-0">
      <div className="text-xl font-bold break-all">{value}</div>
      <p className={`text-xs whitespace-nowrap ${trend === "up" ? "text-green-600" : "text-muted-foreground"}`}>
        {description}
      </p>
    </CardContent>
  </Card>
);

const CoursePerformance = ({
  title,
  students,
  completion,
  rating,
  engagement,
}: {
  title: string;
  students: number;
  completion: number;
  rating: number;
  engagement: number;
}) => (
  <div className="p-4 rounded-lg border hover:border-primary/50 transition-colors">
    <div className="flex items-center justify-between mb-4">
      <h4 className="font-semibold">{title}</h4>
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="font-medium">{rating}</span>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-4 text-sm">
      <div>
        <p className="text-muted-foreground mb-1">수강생</p>
        <p className="font-semibold">{students}명</p>
      </div>
      <div>
        <p className="text-muted-foreground mb-1">완료율</p>
        <p className="font-semibold">{completion}%</p>
      </div>
      <div>
        <p className="text-muted-foreground mb-1">참여도</p>
        <p className="font-semibold">{engagement}%</p>
      </div>
    </div>
  </div>
);

const EngagementMetric = ({
  label,
  value,
  percentage,
  color,
}: {
  label: string;
  value: number;
  percentage: number;
  color: string;
}) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-sm text-muted-foreground">{value}건 ({percentage}%)</span>
    </div>
    <div className="w-full bg-secondary rounded-full h-2">
      <div
        className={`${color} h-2 rounded-full transition-all duration-500`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  </div>
);

const AchievementMetric = ({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}) => (
  <div className="flex items-center justify-between p-3 rounded-lg border">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
    <span className="text-2xl font-bold">{value}</span>
  </div>
);

const LessonRank = ({
  rank,
  title,
  views,
  completion,
}: {
  rank: number;
  title: string;
  views: number;
  completion: number;
}) => (
  <div className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/50 transition-colors">
    <div className="flex items-center gap-4">
      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <span className="font-bold text-primary">#{rank}</span>
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{views} 조회 • {completion}% 완료</p>
      </div>
    </div>
  </div>
);

export default TeacherAnalytics;
