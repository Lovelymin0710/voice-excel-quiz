import { useEffect, useRef, useState } from "react";
import type { Question } from "@/types/exam";
import { Volume2, VolumeX, Eye, EyeOff } from "lucide-react";

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
  const [isHidden, setIsHidden] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showKo, setShowKo] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // 안드로이드 + iOS 모두 대응: 음성 목록 로드
  useEffect(() => {
    synthRef.current = window.speechSynthesis ?? null;

    const loadVoices = () => {
      if (synthRef.current) {
        const voices = synthRef.current.getVoices();
        if (voices.length > 0) {
          setVoicesLoaded(true);
        }
      }
    };

    // 안드로이드: AudioContext 활성화 (TTS를 위해 필요)
    const activateAudioContext = () => {
      if (!audioContextRef.current) {
        try {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
          console.warn("AudioContext 생성 실패:", e);
        }
      }
    };

    // 즉시 시도
    loadVoices();
    activateAudioContext();

    // iOS Safari + 안드로이드 Chrome용 이벤트 리스너
    if (synthRef.current?.onvoiceschanged !== undefined) {
      synthRef.current.onvoiceschanged = loadVoices;
    }

    // 안드로이드: 약간의 지연 후 다시 시도 (음성 목록 로드 대기)
    const timeoutId = setTimeout(() => {
      loadVoices();
      if (!voicesLoaded) {
        setTimeout(loadVoices, 1000);
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (synthRef.current?.onvoiceschanged) {
        synthRef.current.onvoiceschanged = null;
      }
      if (synthRef.current?.speaking || synthRef.current?.pending) {
        synthRef.current.cancel();
      }
    };
  }, []);

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

  const stopSpeak = () => {
    if (!synthRef.current) return;
    if (synthRef.current.speaking || synthRef.current.pending) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
  };

  const speakQuestion = () => {
    if (!synthRef.current) {
      console.error("SpeechSynthesis를 사용할 수 없습니다.");
      return;
    }
    
    if (synthRef.current.speaking || synthRef.current.pending) {
      stopSpeak();
      return;
    }

    const text = question.question;
    if (!text?.trim()) return;

    // 안드로이드: AudioContext 활성화 (사용자 상호작용 시점)
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume().catch(() => {
        console.warn("AudioContext 활성화 실패");
      });
    }

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 0.95; // 두 플랫폼 모두 자연스러운 속도
    utter.pitch = 1.0; // 자연스러운 pitch
    utter.volume = 1.0;

    // 플랫폼별 최적 여성 음성 선택
    const voices = synthRef.current.getVoices?.() || [];
    let selectedVoice = null;

    // 안드로이드: 음성 목록이 비어있으면 재시도
    if (voices.length === 0) {
      console.warn("음성 목록이 비어있습니다. 재시도 중...");
      if (synthRef.current.getVoices) {
        const retryVoices = synthRef.current.getVoices();
        if (retryVoices.length > 0) {
          voices.push(...retryVoices);
        }
      }
    }

    // ===== 여성 음성만 선택 =====
    
    // 1. iOS 최우선: Samantha (가장 자연스러운 여성 음성)
    selectedVoice = voices.find(
      (v) => 
        v.name === "Samantha" && 
        v.lang?.toLowerCase() === "en-us" &&
        !v.localService // iOS의 고품질 Samantha만
    );

    // 2. iOS: Karen (자연스러운 여성 음성)
    if (!selectedVoice) {
      selectedVoice = voices.find(
        (v) => 
          v.name === "Karen" && 
          v.lang?.toLowerCase().startsWith("en") &&
          !v.localService
      );
    }

    // 3. iOS: Victoria (자연스러운 여성 음성)
    if (!selectedVoice) {
      selectedVoice = voices.find(
        (v) => 
          v.name === "Victoria" && 
          v.lang?.toLowerCase().startsWith("en") &&
          !v.localService
      );
    }

    // 4. iOS: Nicky (자연스러운 여성 음성)
    if (!selectedVoice) {
      selectedVoice = voices.find(
        (v) => 
          v.name === "Nicky" && 
          v.lang?.toLowerCase().startsWith("en") &&
          !v.localService
      );
    }

    // 5. 안드로이드: Microsoft Zira (여성 음성)
    if (!selectedVoice) {
      selectedVoice = voices.find(
        (v) => 
          (v.name.includes("Zira") || v.name === "Microsoft Zira") &&
          v.lang?.toLowerCase() === "en-us"
      );
    }

    // 6. 안드로이드: Google US English (여성 버전)
    if (!selectedVoice) {
      selectedVoice = voices.find(
        (v) => 
          (v.name.includes("Google US English") || v.name.includes("US English")) &&
          v.lang?.toLowerCase() === "en-us" &&
          !v.name.toLowerCase().includes("male") // 남성 음성 제외
      );
    }

    // 7. iOS: localService: false인 여성 음성 (고품질)
    if (!selectedVoice) {
      selectedVoice = voices.find(
        (v) => 
          v.lang?.toLowerCase() === "en-us" && 
          !v.localService &&
          !v.name.toLowerCase().includes("alex") && // Alex 제외
          !v.name.toLowerCase().includes("daniel") && // Daniel 제외
          !v.name.toLowerCase().includes("mark") && // Mark 제외
          !v.name.toLowerCase().includes("male") // 남성 음성 제외
      );
    }

    // 8. 공통: en-US 여성 음성 (이름으로 판단)
    if (!selectedVoice) {
      selectedVoice = voices.find((v) => {
        const name = v.name.toLowerCase();
        const isFemale = 
          name.includes("samantha") ||
          name.includes("karen") ||
          name.includes("victoria") ||
          name.includes("nicky") ||
          name.includes("zira") ||
          name.includes("female") ||
          (!name.includes("alex") && 
           !name.includes("daniel") && 
           !name.includes("mark") && 
           !name.includes("male") &&
           !name.includes("david") &&
           !name.includes("fred"));
        return v.lang?.toLowerCase() === "en-us" && isFemale;
      });
    }

    // 9. 최후의 수단: en-US 음성 (localService 상관없이, 남성 제외)
    if (!selectedVoice) {
      selectedVoice = voices.find((v) => {
        const name = v.name.toLowerCase();
        return v.lang?.toLowerCase() === "en-us" &&
          !name.includes("alex") &&
          !name.includes("daniel") &&
          !name.includes("mark") &&
          !name.includes("male") &&
          !name.includes("david") &&
          !name.includes("fred");
      });
    }

    if (selectedVoice) {
      utter.voice = selectedVoice;
      console.log("✅ 선택된 여성 음성:", selectedVoice.name, selectedVoice.lang, 
        selectedVoice.localService !== undefined ? `localService: ${selectedVoice.localService}` : "");
    } else {
      console.warn("⚠️ 여성 영어 음성을 찾을 수 없습니다. 기본 음성을 사용합니다.");
    }

    // 에러 핸들링 개선
    utter.onstart = () => {
      setIsSpeaking(true);
      console.log("🎤 TTS 시작 (여성 음성)");
    };
    
    utter.onend = () => {
      setIsSpeaking(false);
      console.log("✅ TTS 종료");
    };
    
    utter.onerror = (event) => {
      setIsSpeaking(false);
      console.error("❌ TTS 오류:", event.error, event.type);
      if (event.error === 'not-allowed') {
        console.error("TTS 권한이 거부되었습니다.");
      }
    };

    utterRef.current = utter;
    
    try {
      synthRef.current.speak(utter);
    } catch (error) {
      console.error("TTS 실행 오류:", error);
      setIsSpeaking(false);
    }
  };

  return (
    <div
      className="w-full rounded-2xl p-5"
      style={{
        background: "white",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
        border: "1px solid #F0F0F0",
        fontFamily: "'Pretendard', -apple-system, sans-serif",
      }}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <span
            className="px-3 py-1 rounded-full text-sm font-medium"
            style={{
              background: "#F7F7F7",
              color: "#5B4D7C",
              border: "1px solid #E0E0E0",
            }}
          >
            Question {questionNumber} / {totalQuestions}
          </span>
          <div className="flex gap-2 items-center">
            <span
              className="px-2 py-1 rounded-lg text-xs font-medium"
              style={{
                background: "#F0F0F0",
                color: "#6A6A6A",
              }}
            >
              {question.category}
            </span>
            <span
              className="px-2 py-1 rounded-lg text-xs font-semibold text-white"
              style={{
                background: getLevelClass(question.difficulty).includes("IL")
                  ? "#9E9E9E"
                  : getLevelClass(question.difficulty).includes("IM")
                  ? "#64B5F6"
                  : getLevelClass(question.difficulty).includes("IH")
                  ? "#9C27B0"
                  : "#212121",
              }}
            >
              {question.difficulty}
            </span>
            <button
              onClick={() => setIsHidden((v) => !v)}
              title={isHidden ? "질문 보이기" : "질문 숨기기"}
              className="h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-[#F7F7F7]"
              style={{ color: "#6A6A6A" }}
            >
              {isHidden ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={isSpeaking ? stopSpeak : speakQuestion}
              title={isSpeaking ? "읽기 중지" : "질문 듣기"}
              className="h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-[#F7F7F7]"
              style={{ color: "#6A6A6A" }}
            >
              {isSpeaking ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>

            {/* 한국어 해석 토글 */}
            <button
              onClick={() => setShowKo((v) => !v)}
              title={showKo ? "한글 해석 숨기기" : "한글 해석 보기"}
              disabled={!question.ko}
              className="h-8 px-2 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F7F7F7]"
              style={{
                color: question.ko ? "#5B4D7C" : "#D0D0D0",
              }}
            >
              {showKo ? "한글 숨기기" : "한글 보기"}
            </button>
          </div>
        </div>
        <h2
          className={`text-2xl leading-relaxed mb-0 ${
            isHidden ? "blur-sm select-none" : ""
          }`}
          style={{
            color: "#111111",
            fontWeight: 600,
            fontSize: "24px",
            lineHeight: "1.6",
          }}
        >
          {question.question}
        </h2>
      </div>
      <div className="space-y-4">
        {question.ko && showKo && (
          <div
            className="p-4 rounded-xl"
            style={{
              background: "#F9F9F9",
              border: "1px solid #E8E8E8",
            }}
          >
            <p
              className="text-sm leading-relaxed"
              style={{
                color: "#4A4A4A",
                fontSize: "14px",
                lineHeight: "1.7",
              }}
            >
              {question.ko}
            </p>
          </div>
        )}
        {/* 추천 필러 (입문자용) */}
        {question.recommended_fillers &&
          question.recommended_fillers.length > 0 && (
            <div
              className="p-4 rounded-xl"
              style={{
                background: "linear-gradient(135deg, #F3E5F5 0%, #E8EAF6 100%)",
                border: "1px solid #D1C4E9",
              }}
            >
              <p
                className="text-sm font-semibold mb-2"
                style={{
                  color: "#5B4D7C",
                  fontSize: "14px",
                }}
              >
                🎯 오늘의 필러 (Fillers)
              </p>
              <div className="flex gap-2 flex-wrap">
                {question.recommended_fillers.map((filler, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg text-sm font-medium"
                    style={{
                      background: "white",
                      color: "#5B4D7C",
                      border: "1px solid #B39DDB",
                      fontWeight: 600,
                    }}
                  >
                    "{filler}"
                  </span>
                ))}
              </div>
              <p
                className="text-xs mt-2"
                style={{
                  color: "#6A6A6A",
                  fontSize: "12px",
                }}
              >
                💬 이 필러를 3번 이상 사용해보세요!
              </p>
            </div>
          )}

        {/* 문장 뼈대 (Sentence Skeleton) - 입문자용 */}
        {question.skeleton && (
          <div
            className="p-4 rounded-xl"
            style={{
              background: "linear-gradient(135deg, #E8F5E9 0%, #E0F2F1 100%)",
              border: "1px solid #A5D6A7",
            }}
          >
            <p
              className="text-sm font-semibold mb-3"
              style={{
                color: "#2E7D32",
                fontSize: "14px",
              }}
            >
              📝 문장 뼈대 (이 구조로 말해보세요!)
            </p>
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <span
                  className="px-2 py-1 rounded text-xs font-bold flex-shrink-0"
                  style={{
                    background: "#4CAF50",
                    color: "white",
                  }}
                >
                  Start
                </span>
                <p
                  className="text-sm flex-1"
                  style={{
                    color: "#1B5E20",
                    fontSize: "13px",
                    lineHeight: "1.6",
                  }}
                >
                  {question.skeleton.start}
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <span
                  className="px-2 py-1 rounded text-xs font-bold flex-shrink-0"
                  style={{
                    background: "#66BB6A",
                    color: "white",
                  }}
                >
                  Reason
                </span>
                <p
                  className="text-sm flex-1"
                  style={{
                    color: "#1B5E20",
                    fontSize: "13px",
                    lineHeight: "1.6",
                  }}
                >
                  {question.skeleton.reason}
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <span
                  className="px-2 py-1 rounded text-xs font-bold flex-shrink-0"
                  style={{
                    background: "#81C784",
                    color: "white",
                  }}
                >
                  Example
                </span>
                <p
                  className="text-sm flex-1"
                  style={{
                    color: "#1B5E20",
                    fontSize: "13px",
                    lineHeight: "1.6",
                  }}
                >
                  {question.skeleton.example}
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <span
                  className="px-2 py-1 rounded text-xs font-bold flex-shrink-0"
                  style={{
                    background: "#A5D6A7",
                    color: "#1B5E20",
                  }}
                >
                  Wrap-up
                </span>
                <p
                  className="text-sm flex-1"
                  style={{
                    color: "#1B5E20",
                    fontSize: "13px",
                    lineHeight: "1.6",
                  }}
                >
                  {question.skeleton.wrapup}
                </p>
              </div>
            </div>
          </div>
        )}

        <div
          className="p-4 rounded-xl"
          style={{
            background: "#F7F7F7",
          }}
        >
          <p
            className="text-sm"
            style={{
              color: "#6A6A6A",
              fontSize: "14px",
              lineHeight: "1.6",
            }}
          >
            💡 <strong style={{ color: "#5B4D7C" }}>Tip:</strong> 답변할 때{" "}
            <strong>What</strong>(무엇을), <strong>Feeling</strong>(감정),{" "}
            <strong>Why</strong>(이유)를 포함하면 좋은 점수를 받을 수 있어요!
          </p>
        </div>
      </div>
    </div>
  );
}
