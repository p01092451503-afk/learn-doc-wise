import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CaptchaChallenge {
  id: string;
  type: 'simple_math' | 'image_select' | 'text_input';
  challenge: string;
  expectedAnswer: string;
}

export const useCaptcha = (courseId?: string, contentId?: string) => {
  const [currentChallenge, setCurrentChallenge] = useState<CaptchaChallenge | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // 간단한 수학 문제 생성
  const generateMathChallenge = useCallback((): { challenge: string; answer: string } => {
    const operations = ['+', '-', '×'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1: number, num2: number, answer: number;
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 50) + 20;
        num2 = Math.floor(Math.random() * 20) + 1;
        answer = num1 - num2;
        break;
      case '×':
        num1 = Math.floor(Math.random() * 9) + 2;
        num2 = Math.floor(Math.random() * 9) + 2;
        answer = num1 * num2;
        break;
      default:
        num1 = 5;
        num2 = 3;
        answer = 8;
    }
    
    return {
      challenge: `${num1} ${operation} ${num2} = ?`,
      answer: answer.toString(),
    };
  }, []);

  // 텍스트 입력 문제 생성 (무작위 문자열 따라쓰기)
  const generateTextChallenge = useCallback((): { challenge: string; answer: string } => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let text = '';
    for (let i = 0; i < 5; i++) {
      text += chars[Math.floor(Math.random() * chars.length)];
    }
    
    return {
      challenge: `다음 문자를 입력하세요: ${text}`,
      answer: text,
    };
  }, []);

  // 새 캡차 생성
  const createChallenge = useCallback(async (type: 'simple_math' | 'text_input' = 'simple_math'): Promise<CaptchaChallenge | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      let challengeData: { challenge: string; answer: string };
      
      if (type === 'simple_math') {
        challengeData = generateMathChallenge();
      } else {
        challengeData = generateTextChallenge();
      }

      const { data, error } = await supabase
        .from("captcha_verifications")
        .insert({
          user_id: user.id,
          course_id: courseId || null,
          content_id: contentId || null,
          captcha_type: type,
          challenge: challengeData.challenge,
          expected_answer: challengeData.answer,
          is_verified: false,
          attempts: 0,
        })
        .select()
        .single();

      if (error) throw error;

      const challenge: CaptchaChallenge = {
        id: data.id,
        type,
        challenge: challengeData.challenge,
        expectedAnswer: challengeData.answer,
      };

      setCurrentChallenge(challenge);
      setIsVerified(false);
      setAttempts(0);

      return challenge;
    } catch (error) {
      console.error("Failed to create captcha:", error);
      return null;
    }
  }, [courseId, contentId, generateMathChallenge, generateTextChallenge]);

  // 캡차 검증
  const verifyCaptcha = useCallback(async (userAnswer: string): Promise<boolean> => {
    if (!currentChallenge) return false;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const isCorrect = userAnswer.trim().toUpperCase() === currentChallenge.expectedAnswer.toUpperCase();
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      await supabase
        .from("captcha_verifications")
        .update({
          user_answer: userAnswer,
          is_verified: isCorrect,
          attempts: newAttempts,
          verified_at: isCorrect ? new Date().toISOString() : null,
        })
        .eq("id", currentChallenge.id);

      if (isCorrect) {
        setIsVerified(true);
        return true;
      }

      // 3회 실패시 새 문제 생성
      if (newAttempts >= 3) {
        await createChallenge(currentChallenge.type === 'image_select' ? 'simple_math' : currentChallenge.type);
      }

      return false;
    } catch (error) {
      console.error("Failed to verify captcha:", error);
      return false;
    }
  }, [currentChallenge, attempts, createChallenge]);

  // 캡차 초기화
  const resetCaptcha = useCallback(() => {
    setCurrentChallenge(null);
    setIsVerified(false);
    setAttempts(0);
  }, []);

  return {
    currentChallenge,
    isVerified,
    attempts,
    createChallenge,
    verifyCaptcha,
    resetCaptcha,
  };
};
