import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col items-center justify-between"
      style={{
        background: "#FEFEFE",
        fontFamily: "'Pretendard', -apple-system, sans-serif",
      }}
    >
      {/* 배경 장식 원형 4개 - 원본과 동일한 위치 */}

      {/* 왼쪽 상단 보라 */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          top: "12%",
          left: "8%",
          width: "160px",
          height: "160px",
          background: "radial-gradient(circle, #E1BEE7 20%, #D1C4E9 80%)",
          filter: "blur(65px)",
          opacity: 0.75,
        }}
      />

      {/* 오른쪽 상단 큰 그라데이션 (보라→민트) */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          top: "-8%",
          right: "-8%",
          width: "480px",
          height: "480px",
          background: "radial-gradient(circle, #D1C4E9 30%, #B2EBF2 80%)",
          filter: "blur(85px)",
          opacity: 0.65,
        }}
      />

      {/* 왼쪽 하단 큰 민트 */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          bottom: "-8%",
          left: "-12%",
          width: "420px",
          height: "420px",
          background: "radial-gradient(circle, #B2DFDB 25%, #80CBC4 75%)",
          filter: "blur(80px)",
          opacity: 0.7,
        }}
      />

      {/* 오른쪽 중하단 오렌지 */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          bottom: "22%",
          right: "6%",
          width: "180px",
          height: "180px",
          background: "radial-gradient(circle, #FFCCBC 30%, #FFE0B2 70%)",
          filter: "blur(65px)",
          opacity: 0.65,
        }}
      />

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-lg px-6 pt-20 pb-6">
        {/* 캐릭터 이미지 */}
        <div className="mb-7">
          <img
            src="/youngscatch-character.png"
            alt="Youngs Catch Character"
            className="w-[320px] h-[320px] md:w-[360px] md:h-[360px] object-contain"
            style={{
              filter: "drop-shadow(0 10px 28px rgba(0, 0, 0, 0.07))",
            }}
          />
        </div>

        {/* 타이틀 */}
        <h1
          className="font-bold leading-none mb-4 text-center"
          style={{
            fontSize: "clamp(32px, 8vw, 50px)",
            color: "#5B4D7C",
            letterSpacing: "-0.015em",
            fontWeight: 700,
            fontFamily: "Pretendard",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "100%",
            padding: "0 4px",
          }}
        >
          Youngs Catch AI
        </h1>

        {/* 서브타이틀 */}
        <p
          className="text-center leading-relaxed"
          style={{
            fontSize: "18px",
            color: "#6A6A6A",
            fontWeight: 500,
            lineHeight: "1.6",
            fontFamily: "Pretendard",
          }}
        >
          입문자도 쉽게 시작하는 OPIc AI 학습 앱
        </p>
      </div>

      {/* Start 버튼 (3D 효과 극대화) */}
      <div
        className="w-full max-w-lg relative z-10 px-6"
        style={{
          paddingBottom: "max(56px, env(safe-area-inset-bottom) + 56px)",
        }}
      >
        <button
          onClick={() => navigate("/practice")}
          className="w-full rounded-full text-white font-bold relative overflow-hidden transition-all duration-150 active:scale-[0.98]"
          style={{
            height: "85px",
            fontSize: "38px",
            letterSpacing: "0.01em",
            fontWeight: 700,
            fontFamily: "Pretendard",
            background:
              "linear-gradient(100deg, #B39DDB 0%, #CE93D8 42%, #F8BBD0 100%)",
            boxShadow: `
              0 22px 55px rgba(179, 157, 219, 0.5),
              0 10px 25px rgba(206, 147, 216, 0.35),
              0 4px 12px rgba(0, 0, 0, 0.08),
              inset 0 -5px 15px rgba(0, 0, 0, 0.18),
              inset 0 3px 10px rgba(255, 255, 255, 0.35)
            `,
            border: "none",
          }}
        >
          <span
            className="relative z-10"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
          >
            Start
          </span>

          {/* 상단 하이라이트 (3D 광택) */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 55%)",
            }}
          />
        </button>
      </div>
    </div>
  );
};

export default Landing;
