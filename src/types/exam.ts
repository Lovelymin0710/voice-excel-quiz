// 문장 뼈대 (Sentence Skeleton)
export interface SentenceSkeleton {
  start: string;
  reason: string;
  example: string;
  wrapup: string;
}

// 문제 타입
export interface Question {
  id: number;
  question: string;
  category: string;
  difficulty: "IL" | "IM" | "IH" | "AL";
  ko?: string; // 한국어 해석(선택)
  skeleton?: SentenceSkeleton; // 입문자용 문장 뼈대
  recommended_fillers?: string[]; // 추천 필러 2개
}

// MP 구조 분석 결과
export interface MPStructure {
  what: boolean; // 무엇을 했는지
  feeling: boolean; // 어떤 감정이었는지
  why: boolean; // 왜 그랬는지
}

// 필러 사용 분석
export interface FillerUsage {
  used_fillers: string[]; // 사용한 필러 목록
  count: number; // 총 사용 횟수
  feedback: string; // 필러 사용에 대한 피드백
}

// AI 피드백 결과
export interface AIFeedback {
  structure_score: number; // 구조 완성도 (0-100) - 기존 grammar 대체
  logic_flow: number; // 논리 흐름 (0-100) - 기존 naturalness 대체
  mp: MPStructure;
  filler_usage: FillerUsage; // 필러 사용 분석 추가
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
