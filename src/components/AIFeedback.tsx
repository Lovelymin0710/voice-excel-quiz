import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import type { AIFeedback } from "@/types/exam";

interface AIFeedbackProps {
  feedback: AIFeedback;
  userAnswer: string;
}

export default function AIFeedbackDisplay({
  feedback,
  userAnswer,
}: AIFeedbackProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent!";
    if (score >= 80) return "Great!";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    return "Keep practicing!";
  };

  return (
    <div className="space-y-6">
      {/* 점수 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 평가 결과
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Grammar Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">문법 정확도 (Grammar)</span>
              <span
                className={`text-2xl font-bold ${getScoreColor(
                  feedback.grammar
                )}`}
              >
                {feedback.grammar}점
              </span>
            </div>
            <Progress value={feedback.grammar} className="h-3" />
            <p className="text-sm text-muted-foreground mt-1">
              {getScoreLabel(feedback.grammar)}
            </p>
          </div>

          {/* Naturalness Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">자연스러움 (Naturalness)</span>
              <span
                className={`text-2xl font-bold ${getScoreColor(
                  feedback.naturalness
                )}`}
              >
                {feedback.naturalness}점
              </span>
            </div>
            <Progress value={feedback.naturalness} className="h-3" />
            <p className="text-sm text-muted-foreground mt-1">
              {getScoreLabel(feedback.naturalness)}
            </p>
          </div>

          {/* MP Structure */}
          <div>
            <span className="font-semibold block mb-3">
              MP 구조 (What / Feeling / Why)
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                {feedback.mp.what ? (
                  <CheckCircle2 className="h-8 w-8 text-green-600 mb-2" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600 mb-2" />
                )}
                <span className="text-sm font-medium">What</span>
                <span className="text-xs text-muted-foreground text-center mt-1">
                  무엇을
                </span>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                {feedback.mp.feeling ? (
                  <CheckCircle2 className="h-8 w-8 text-green-600 mb-2" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600 mb-2" />
                )}
                <span className="text-sm font-medium">Feeling</span>
                <span className="text-xs text-muted-foreground text-center mt-1">
                  감정
                </span>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                {feedback.mp.why ? (
                  <CheckCircle2 className="h-8 w-8 text-green-600 mb-2" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600 mb-2" />
                )}
                <span className="text-sm font-medium">Why</span>
                <span className="text-xs text-muted-foreground text-center mt-1">
                  이유
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 답변 비교 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💬 답변 비교
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 사용자 답변 */}
          <div>
            <Badge className="mb-2">Your Answer</Badge>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-base">{userAnswer}</p>
            </div>
          </div>

          {/* 개선된 답변 */}
          <div>
            <Badge
              variant="secondary"
              className="mb-2 bg-green-100 text-green-800"
            >
              <Lightbulb className="h-3 w-3 mr-1" />
              Suggested Answer
            </Badge>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-base text-green-900">{feedback.suggestion}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI 피드백 */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🤖 AI 피드백
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed">{feedback.feedback}</p>
        </CardContent>
      </Card>
    </div>
  );
}
