import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type ErrorType = "network" | "auth" | "server" | "unknown";

function classifyError(error: unknown): { type: ErrorType; message: string; status?: number } {
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return { type: "network", message: "네트워크 연결을 확인해주세요." };
  }

  if (error && typeof error === "object") {
    const err = error as Record<string, unknown>;
    const status = (err.status as number) || (err.statusCode as number);
    const msg = (err.message as string) || (err.error_description as string) || "";

    if (status === 401 || status === 403 || msg.includes("JWT") || msg.includes("token")) {
      return { type: "auth", message: "인증이 만료되었습니다. 다시 로그인해주세요.", status };
    }
    if (status && status >= 500) {
      return { type: "server", message: "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.", status };
    }
    if (status === 429) {
      return { type: "server", message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.", status };
    }
    if (msg) {
      return { type: "unknown", message: msg, status };
    }
  }

  if (error instanceof Error) {
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      return { type: "network", message: "네트워크 연결을 확인해주세요." };
    }
    return { type: "unknown", message: error.message };
  }

  return { type: "unknown", message: "알 수 없는 오류가 발생했습니다." };
}

export function useErrorHandler() {
  const navigate = useNavigate();

  const handleError = useCallback(
    (error: unknown, context?: string) => {
      const { type, message } = classifyError(error);

      console.error(`[ErrorHandler${context ? `:${context}` : ""}]`, error);

      switch (type) {
        case "network":
          toast.error("네트워크 오류", { description: message });
          break;
        case "auth":
          toast.error("인증 오류", { description: message });
          navigate("/auth", { replace: true });
          break;
        case "server":
          toast.error("서버 오류", { description: message });
          break;
        default:
          toast.error("오류 발생", { description: message });
      }
    },
    [navigate],
  );

  return { handleError };
}

// Standalone version for use outside components
export function handleErrorStandalone(error: unknown, context?: string) {
  const { type, message } = classifyError(error);
  console.error(`[ErrorHandler${context ? `:${context}` : ""}]`, error);

  switch (type) {
    case "network":
      toast.error("네트워크 오류", { description: message });
      break;
    case "auth":
      toast.error("인증 오류", { description: message });
      window.location.href = "/auth";
      break;
    case "server":
      toast.error("서버 오류", { description: message });
      break;
    default:
      toast.error("오류 발생", { description: message });
  }
}
