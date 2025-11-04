import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCheck, MessageSquare, BookOpen, Trophy, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface NotificationListProps {
  notifications: any[];
  onNotificationClick: (notification: any) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationList = ({
  notifications,
  onNotificationClick,
  onMarkAllAsRead,
}: NotificationListProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case "assignment":
        return <CheckCheck className="h-4 w-4 text-blue-500" />;
      case "course_update":
        return <BookOpen className="h-4 w-4 text-green-500" />;
      case "encouragement":
        return <Bell className="h-4 w-4 text-orange-500" />;
      case "achievement":
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case "message":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-4 border-l-red-500";
      case "high":
        return "border-l-4 border-l-orange-500";
      case "normal":
        return "border-l-4 border-l-blue-500";
      case "low":
        return "border-l-4 border-l-gray-300";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[500px]">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-lg">알림</h3>
        {notifications.some(n => !n.is_read) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsRead}
            className="text-xs"
          >
            모두 읽음
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Bell className="h-12 w-12 mb-2 opacity-20" />
            <p className="text-sm">알림이 없습니다</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => onNotificationClick(notification)}
                className={`w-full text-left p-4 hover:bg-accent transition-colors ${
                  !notification.is_read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                } ${getPriorityColor(notification.priority)}`}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm line-clamp-1">
                        {notification.title}
                      </h4>
                      {!notification.is_read && (
                        <Badge variant="default" className="text-xs flex-shrink-0">
                          NEW
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
