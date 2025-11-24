import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { useEffect } from "react";
import { shouldRedirect, redirectToChrome } from "@/utils/browserDetect";

const queryClient = new QueryClient();

const App = () => {
  // 안드로이드 카카오톡 인앱일 때만 자동 리디렉션
  useEffect(() => {
    if (shouldRedirect()) {
      console.log("🔄 안드로이드 카카오톡 감지: Chrome으로 자동 리디렉션");

      // 0.5초 대기 후 리디렉션
      const timer = setTimeout(() => {
        redirectToChrome();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Analytics />
        <SpeedInsights />
        <BrowserRouter>
          <Routes>
            {/* 새 랜딩 페이지 */}
            <Route path="/" element={<Landing />} />
            {/* 기존 연습 화면은 /practice 로 이동 */}
            <Route path="/practice" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
