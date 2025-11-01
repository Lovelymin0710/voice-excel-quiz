import { useState } from "react";
import { Mic, MicOff, ArrowRight, RotateCcw, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { calculateSimilarity } from "@/lib/similarity";

interface Sentence {
  순번: number;
  한글: string;
  영어: string;
  암기날짜: string;
}

interface SentencePracticeProps {
  sentences: Sentence[];
  onReset: () => void;
}

const SentencePractice = ({ sentences, onReset }: SentencePracticeProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [result, setResult] = useState<{
    similarity: number;
    isCorrect: boolean;
  } | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [savedExpressions, setSavedExpressions] = useState<Sentence[]>([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const displaySentences = showSavedOnly ? savedExpressions : sentences;
  const currentSentence = displaySentences[currentIndex];
  const progress = ((currentIndex + 1) / displaySentences.length) * 100;

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("이 브라우저는 음성 인식을 지원하지 않습니다.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.lang = 'en-US';
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;

    recognitionInstance.onstart = () => {
      setIsListening(true);
      toast.info("말씀하세요...");
    };

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserAnswer(transcript);
      setIsListening(false);
      
      // 자동 채점
      const similarity = calculateSimilarity(transcript.toLowerCase(), currentSentence.영어.toLowerCase());
      const isCorrect = similarity >= 70;
      setResult({ similarity, isCorrect });
      
      if (isCorrect) {
        toast.success(`정답입니다! (유사도: ${similarity}%)`);
      } else {
        toast.error(`틀렸습니다. (유사도: ${similarity}%)`);
      }
    };

    recognitionInstance.onerror = (event) => {
      setIsListening(false);
      
      // Security: Map technical errors to user-friendly messages
      const errorMessages: Record<string, string> = {
        'no-speech': '음성이 감지되지 않았습니다. 다시 시도해주세요.',
        'audio-capture': '마이크를 사용할 수 없습니다. 마이크 권한을 확인해주세요.',
        'not-allowed': '마이크 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.',
        'network': '네트워크 오류가 발생했습니다.',
        'aborted': '음성 인식이 중단되었습니다.',
      };
      
      const message = errorMessages[event.error] || '음성 인식 중 오류가 발생했습니다.';
      toast.error(message);
      
      // Log technical details only in development
      if (import.meta.env.DEV) {
        console.error('Speech recognition error:', event.error);
      }
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    setRecognition(recognitionInstance);
    recognitionInstance.start();
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const nextSentence = () => {
    if (currentIndex < displaySentences.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer("");
      setResult(null);
    } else {
      toast.success("모든 문장을 완료했습니다!");
    }
  };

  const saveExpression = () => {
    if (!savedExpressions.find(s => s.순번 === currentSentence.순번)) {
      setSavedExpressions([...savedExpressions, currentSentence]);
      toast.success("표현이 저장되었습니다!");
    } else {
      toast.info("이미 저장된 표현입니다.");
    }
  };

  const toggleSavedView = () => {
    setShowSavedOnly(!showSavedOnly);
    setCurrentIndex(0);
    setUserAnswer("");
    setResult(null);
    toast.info(showSavedOnly ? "전체 문장 보기" : "저장된 표현만 보기");
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          문제 {currentIndex + 1} / {displaySentences.length}
          {showSavedOnly && " (저장된 표현)"}
        </div>
        <div className="flex gap-2">
          <Button 
            variant={showSavedOnly ? "default" : "outline"} 
            size="sm" 
            onClick={toggleSavedView}
            disabled={savedExpressions.length === 0}
          >
            저장된 표현 ({savedExpressions.length})
          </Button>
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            다시 시작
          </Button>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      <Card className="p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="text-sm text-muted-foreground">Korean:</div>
          <div className="text-3xl font-bold">{currentSentence.한글}</div>
        </div>

        <div className="flex justify-center gap-3">
          {!isListening ? (
            <Button onClick={startListening} size="lg" className="gap-2">
              <Mic className="w-5 h-5" />
              ▶ 말하기 시작
            </Button>
          ) : (
            <Button onClick={stopListening} variant="destructive" size="lg" className="gap-2">
              <MicOff className="w-5 h-5" />
              ⏹ 말하기 종료
            </Button>
          )}
          <Button onClick={saveExpression} variant="secondary" size="lg" className="gap-2">
            <BookmarkPlus className="w-5 h-5" />
            표현저장하기
          </Button>
        </div>

        {userAnswer && (
          <div className="space-y-4 p-6 bg-muted rounded-lg">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">You said:</div>
              <div className="text-lg">{userAnswer}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Correct is:</div>
              <div className="text-lg font-medium">{currentSentence.영어}</div>
            </div>

            {result && (
              <div className={`text-center py-4 rounded-lg ${result.isCorrect ? 'bg-success/10' : 'bg-destructive/10'}`}>
                <div className={`text-2xl font-bold ${result.isCorrect ? 'text-success' : 'text-destructive'}`}>
                  Similar: {result.similarity}% ({result.isCorrect ? 'O' : 'X'})
                </div>
              </div>
            )}
          </div>
        )}

        {currentIndex < displaySentences.length - 1 && (
          <div className="flex justify-center">
            <Button onClick={nextSentence} size="lg" className="gap-2">
              ⏭ 다음 문장
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        )}

        {currentIndex === displaySentences.length - 1 && result && (
          <div className="text-center text-muted-foreground">
            마지막 문장입니다. '다시 시작' 버튼을 눌러 처음부터 다시 연습하세요.
          </div>
        )}
      </Card>
    </div>
  );
};

export default SentencePractice;
