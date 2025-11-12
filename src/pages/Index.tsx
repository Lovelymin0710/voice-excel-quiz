import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import QuestionDisplay from "@/components/QuestionDisplay";
import SpeechRecorder from "@/components/SpeechRecorder";
import AIFeedbackDisplay from "@/components/AIFeedback";
import { evaluateSpeaking } from "@/services/openai";
import type { Question, AIFeedback } from "@/types/exam";
import { Shuffle, RotateCcw } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const Index = () => {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<
    "ALL" | "IL" | "IM" | "IH" | "AL"
  >("ALL");
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<AIFeedback | null>(null);
  const [answerDurationMs, setAnswerDurationMs] = useState<number | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // exam.json 로드
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch("/exam.json");
        if (!response.ok) {
          throw new Error("Failed to load questions");
        }
        const data: Question[] = await response.json();

        setAllQuestions(data);
        // 초기에는 전체에서 랜덤으로 섞기
        const initial = [...data].sort(() => Math.random() - 0.5);
        setQuestions(initial);
        setCurrentQuestion(initial[0] ?? null);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load questions:", error);
        toast.error("문제를 불러오는데 실패했습니다.");
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, []);

  const applyFilter = (level: "ALL" | "IL" | "IM" | "IH" | "AL") => {
    setSelectedLevel(level);
    const filtered =
      level === "ALL"
        ? allQuestions
        : allQuestions.filter((q) => q.difficulty === level);
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setCurrentQuestion(shuffled[0] ?? null);
    setFeedback(null);
    setUserAnswer("");
    if (filtered.length === 0) {
      toast.info("선택한 등급의 문제가 없습니다.");
    }
  };

  // 음성 인식 완료 핸들러
  const handleTranscriptComplete = async (
    transcript: string,
    durationMs: number
  ) => {
    if (!currentQuestion) return;

    setUserAnswer(transcript);
    setAnswerDurationMs(durationMs);
    setIsEvaluating(true);

    try {
      const result = await evaluateSpeaking({
        question: currentQuestion.question,
        answer: transcript,
        durationSec: Math.max(1, Math.round(durationMs / 1000)),
      });
      setFeedback(result);
      toast.success("평가 완료! 결과를 확인하세요.");
    } catch (error) {
      console.error("Evaluation error:", error);
      toast.error("평가 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsEvaluating(false);
    }
  };

  // 다음 문제
  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(questions[nextIndex]);
      setFeedback(null);
      setUserAnswer("");
      setAnswerDurationMs(null);
    } else {
      toast.success("모든 문제를 완료했습니다! 🎉");
    }
  };

  // 다시 답변하기
  const handleRetry = () => {
    setFeedback(null);
    setUserAnswer("");
    setAnswerDurationMs(null);
  };

  // 문제 다시 섞기
  const handleShuffle = () => {
    const base =
      selectedLevel === "ALL"
        ? allQuestions
        : allQuestions.filter((q) => q.difficulty === selectedLevel);
    const shuffled = [...base].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setCurrentQuestion(shuffled[0] ?? null);
    setFeedback(null);
    setUserAnswer("");
    toast.success("문제를 다시 섞었습니다!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">문제를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">
            문제를 불러올 수 없습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-background py-6 px-3"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 92px)" }}
    >
      <div className="mx-auto w-full max-w-md">
        {/* Header */}
        <header className="text-center mb-6">
          <h1 className="text-3xl sm:text-5xl font-bold mb-2 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            영스캐치
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground">
            🎤 영어 스피킹을 캐치하다! AI가 즉시 피드백을 드립니다.
          </p>
        </header>

        <main className="space-y-6">
          {/* 필터 바 */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">OPIc 등급</span>
              <div className="w-36">
                <Select
                  value={selectedLevel}
                  onValueChange={(v) => applyFilter(v as any)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="ALL" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">ALL</SelectItem>
                    <SelectItem value="IL">IL</SelectItem>
                    <SelectItem value="IM">IM</SelectItem>
                    <SelectItem value="IH">IH</SelectItem>
                    <SelectItem value="AL">AL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={handleShuffle}
              className="flex items-center gap-2 h-10"
            >
              <Shuffle className="h-4 w-4" />
              문제 섞기
            </Button>
          </div>
          {/* 문제 표시 */}
          <QuestionDisplay
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
          />

          {/* 피드백이 없을 때: 녹음 UI */}
          {!feedback && (
            <SpeechRecorder
              onTranscriptComplete={handleTranscriptComplete}
              isEvaluating={isEvaluating}
            />
          )}

          {/* 피드백이 있을 때: 결과 표시 */}
          {feedback && (
            <>
              <AIFeedbackDisplay
                feedback={feedback}
                userAnswer={userAnswer}
                durationMs={answerDurationMs ?? 0}
              />

              {/* 액션 버튼 */}
              <div className="flex gap-3 justify-center">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleRetry}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-5 w-5" />
                  다시 답변하기
                </Button>
                <Button
                  size="lg"
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex + 1 >= questions.length}
                  className="flex items-center gap-2"
                >
                  {currentQuestionIndex + 1 >= questions.length
                    ? "마지막 문제입니다 🎉"
                    : "다음 문제 →"}
                </Button>
              </div>
            </>
          )}

          {/* 문제 섞기 버튼 */}
          <div className="flex justify-center pt-4">
            <Button
              variant="ghost"
              onClick={handleShuffle}
              className="flex items-center gap-2"
            >
              <Shuffle className="h-4 w-4" />
              문제 순서 다시 섞기
            </Button>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center mt-12 space-y-2">
          <p className="text-sm text-muted-foreground">
            💡 Chrome 또는 Edge 브라우저를 사용하면 음성 인식이 더 정확합니다.
          </p>
          <p className="text-sm text-muted-foreground">
            🎯 오픽(OPIc) 대비에 최적화된 AI 스피킹 코치
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
