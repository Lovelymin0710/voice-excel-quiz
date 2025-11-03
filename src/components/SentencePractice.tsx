import { useState, useEffect } from "react";
import { Mic, MicOff, ArrowRight, RotateCcw, BookmarkPlus, Volume2 } from "lucide-react";
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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string>("");

  const displaySentences = showSavedOnly ? savedExpressions : sentences;
  const currentSentence = displaySentences[currentIndex];

  // 음성 목록 로드 대기 (iOS Safari 대응)
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    
    // 즉시 실행
    loadVoices();
    
    // iOS Safari용 이벤트 리스너
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // 오디오 URL 정리 (메모리 누수 방지)
  useEffect(() => {
    return () => {
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  const progress = ((currentIndex + 1) / displaySentences.length) * 100;

  const startListening = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("이 브라우저는 음성 인식을 지원하지 않습니다.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.lang = 'en-US';
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;

    // MediaRecorder로 음성 녹음 시작
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        
        // 스트림 정리
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
    } catch (error) {
      toast.error("마이크 접근 권한이 필요합니다.");
      console.error('MediaRecorder error:', error);
    }

    recognitionInstance.onstart = () => {
      setIsListening(true);
      toast.info("말씀하세요...");
    };

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserAnswer(transcript);
      setIsListening(false);
      
      // MediaRecorder도 함께 중지 (녹음 완료)
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
      
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
    
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  };

  const playRecording = () => {
    if (!audioURL) {
      toast.error("녹음된 음성이 없습니다.");
      return;
    }

    const audio = new Audio(audioURL);
    
    audio.onplay = () => setIsPlayingRecording(true);
    audio.onended = () => setIsPlayingRecording(false);
    audio.onerror = () => {
      setIsPlayingRecording(false);
      toast.error("음성 재생 중 오류가 발생했습니다.");
    };

    audio.play();
  };

  const speakSentence = (text: string) => {
    // 이미 재생 중이면 중지
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // 영어 음성 설정
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // iOS용 고품질 음성 선택
    const voices = window.speechSynthesis.getVoices();
    
    // 고품질 영어 음성 우선순위: Samantha(여성) > Karen(여성) > Nicky(여성) > 기타 en-US
    const preferredVoices = ['Samantha', 'Karen', 'Nicky'];
    let selectedVoice = null;
    
    // 우선순위대로 음성 검색
    for (const voiceName of preferredVoices) {
      selectedVoice = voices.find(v => v.name === voiceName && v.lang.startsWith('en'));
      if (selectedVoice) break;
    }
    
    // 우선순위 음성이 없으면 en-US 중 localService가 아닌(고품질) 음성 찾기
    if (!selectedVoice) {
      selectedVoice = voices.find(v => 
        v.lang.startsWith('en-US') && !v.localService
      );
    }
    
    // 그래도 없으면 아무 en-US 음성
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith('en-US'));
    }
    
    // 음성 할당
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('Selected voice:', selectedVoice.name);
    }

    // 이벤트 핸들러
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      setIsSpeaking(false);
      toast.error("음성 재생 중 오류가 발생했습니다.");
      console.error('Speech error:', event.error);
    };

    window.speechSynthesis.speak(utterance);
  };

  const nextSentence = () => {
    if (currentIndex < displaySentences.length - 1) {
      // 기존 오디오 URL 정리
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
      
      setCurrentIndex(currentIndex + 1);
      setUserAnswer("");
      setResult(null);
      setAudioBlob(null);
      setAudioURL("");
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
              <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                You said:
                {audioBlob && (
                  <button
                    onClick={playRecording}
                    className="p-1.5 rounded-full hover:bg-primary/10 transition-colors"
                    aria-label="녹음된 음성 듣기"
                    disabled={isPlayingRecording}
                  >
                    <Volume2 className={`w-5 h-5 ${isPlayingRecording ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                  </button>
                )}
              </div>
              <div className="text-lg">{userAnswer}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                Correct is:
                <button
                  onClick={() => speakSentence(currentSentence.영어)}
                  className="p-1.5 rounded-full hover:bg-primary/10 transition-colors"
                  aria-label="문장 듣기"
                  disabled={isSpeaking}
                >
                  <Volume2 className={`w-5 h-5 ${isSpeaking ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                </button>
              </div>
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
