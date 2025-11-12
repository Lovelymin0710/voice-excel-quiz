// 문제 타입
export interface Question {
  id: number;
  question: string;
  category: string;
  difficulty: "IL" | "IM" | "IH" | "AL";
  ko?: string; // 한국어 해석(선택)
}

// MP 구조 분석 결과
export interface MPStructure {
  what: boolean; // 무엇을 했는지
  feeling: boolean; // 어떤 감정이었는지
  why: boolean; // 왜 그랬는지
}

// AI 피드백 결과
export interface AIFeedback {
  grammar: number;
  naturalness: number;
  mp: MPStructure;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  improved_answer: string; // 사용자 답변을 개선한 완성된 영어 문장
  feedback_summary: string;
  level: "IL" | "IM1" | "IM2" | "IH";
  tone: "encouraging" | "neutral" | "strict";
}

// 평가 요청 데이터
export interface EvaluationRequest {
  question: string;
  answer: string;
  durationSec?: number;
}
