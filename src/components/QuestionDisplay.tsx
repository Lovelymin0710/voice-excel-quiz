import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Question } from "@/types/exam";

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
}

export default function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
}: QuestionDisplayProps) {
  const getLevelClass = (level: string) => {
    switch (level) {
      case "IL":
        return "bg-gray-500 text-white";
      case "IM":
        return "bg-blue-500";
      case "IH":
        return "bg-purple-600";
      case "AL":
        return "bg-black text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-sm">
            Question {questionNumber} / {totalQuestions}
          </Badge>
          <div className="flex gap-2">
            <Badge variant="secondary">{question.category}</Badge>
            <Badge className={getLevelClass(question.difficulty)}>
              {question.difficulty}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-2xl leading-relaxed">
          {question.question}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> 답변할 때 <strong>What</strong>(무엇을),{" "}
            <strong>Feeling</strong>(감정), <strong>Why</strong>(이유)를 포함하면
            좋은 점수를 받을 수 있어요!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

