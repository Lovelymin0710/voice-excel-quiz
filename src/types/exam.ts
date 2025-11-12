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
  what: boolean;  // 무엇을 했는지
  feeling: boolean;  // 어떤 감정이었는지
  why: boolean;  // 왜 그랬는지
}

// AI 피드백 결과
export interface AIFeedback {
  grammar: number;  // 문법 점수 (0-100)
  naturalness: number;  // 자연스러움 점수 (0-100)
  mp: MPStructure;  // MP 구조 분석
  suggestion: string;  // 개선된 문장
  feedback: string;  // 한글 피드백
}

// 평가 요청 데이터
export interface EvaluationRequest {
  question: string;
  answer: string;
}

