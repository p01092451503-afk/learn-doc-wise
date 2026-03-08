import { describe, it, expect } from "vitest";
import { cn, formatAIResponse, getVideoThumbnail } from "../utils";

describe("cn()", () => {
  it("단일 클래스를 반환한다", () => {
    expect(cn("p-4")).toBe("p-4");
  });

  it("여러 클래스를 병합한다", () => {
    expect(cn("p-4", "m-2")).toBe("p-4 m-2");
  });

  it("충돌하는 Tailwind 클래스를 병합한다", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("falsy 값을 무시한다", () => {
    expect(cn("p-4", undefined, null, false, "m-2")).toBe("p-4 m-2");
  });

  it("조건부 클래스를 처리한다", () => {
    const isActive = true;
    expect(cn("base", isActive && "active")).toBe("base active");
  });

  it("빈 입력에 대해 빈 문자열을 반환한다", () => {
    expect(cn()).toBe("");
  });
});

describe("getVideoThumbnail()", () => {
  it("YouTube URL에서 썸네일을 추출한다", () => {
    const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    expect(getVideoThumbnail(url, "youtube")).toBe(
      "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
    );
  });

  it("Vimeo URL에서 썸네일을 추출한다", () => {
    const url = "https://vimeo.com/123456789";
    expect(getVideoThumbnail(url, "vimeo")).toBe(
      "https://vumbnail.com/123456789.jpg"
    );
  });

  it("빈 URL에 대해 null을 반환한다", () => {
    expect(getVideoThumbnail("", "youtube")).toBeNull();
  });
});

describe("formatAIResponse()", () => {
  it("마크다운 볼드를 제거한다", () => {
    expect(formatAIResponse("**bold text**")).toBe("bold text");
  });

  it("리스트 마커를 변환한다", () => {
    expect(formatAIResponse("- item")).toBe("• item");
  });

  it("빈 입력에 대해 빈 문자열을 반환한다", () => {
    expect(formatAIResponse("")).toBe("");
  });
});
