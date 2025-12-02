import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/operator/EmptyState";

interface Cohort {
  id: string;
  name: string;
  courseName: string;
  startDate: string;
  endDate?: string;
  studentCount: number;
  isActive: boolean;
}

interface CohortListProps {
  cohorts: Cohort[];
  selectedCohortId: string | null;
  onSelectCohort: (cohortId: string) => void;
}

export function CohortList({
  cohorts,
  selectedCohortId,
  onSelectCohort,
}: CohortListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">진행 중인 기수</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {cohorts.length === 0 ? (
          <div className="py-8">
            <EmptyState
              icon={Users}
              title="진행 중인 기수가 없습니다"
              description="활성화된 기수가 없습니다"
              theme="light"
            />
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-2 p-4">
              {cohorts.map((cohort) => (
                <button
                  key={cohort.id}
                  onClick={() => onSelectCohort(cohort.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border transition-all",
                    "hover:bg-primary/10 hover:border-primary",
                    selectedCohortId === cohort.id
                      ? "bg-primary/10 border-primary shadow-sm"
                      : "bg-card border-border"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">
                        {cohort.name}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {cohort.courseName}
                      </p>
                    </div>
                    {cohort.isActive && (
                      <Badge variant="default" className="shrink-0">
                        진행중
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(cohort.startDate).toLocaleDateString("ko-KR")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{cohort.studentCount}명</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
