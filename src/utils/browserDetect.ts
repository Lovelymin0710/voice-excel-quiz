/**
 * 카카오톡 인앱 브라우저 감지
 */
export function isKakaoInAppBrowser(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('kakaotalk');
}

/**
 * 안드로이드 기기 감지
 */
export function isAndroid(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('android');
}

/**
 * 안드로이드 카카오톡 인앱 브라우저 감지
 */
export function isKakaoAndroid(): boolean {
  return isKakaoInAppBrowser() && isAndroid();
}

/**
 * 안드로이드 카카오톡 인앱 브라우저에서 Chrome으로 자동 리디렉션
 * @param url 열 URL (기본값: 현재 페이지)
 * @returns 리디렉션 성공 여부
 */
export function redirectToChrome(url: string = window.location.href): boolean {
  if (!isKakaoAndroid()) {
    return false;
  }

  try {
    // Intent URL 생성
    const intentUrl = url.replace(/https?:\/\//, '');
    
    // Chrome으로 열기 시도
    window.location.href = `intent://${intentUrl}#Intent;scheme=https;package=com.android.chrome;end`;
    
    return true;
  } catch (error) {
    console.error('Chrome 리디렉션 실패:', error);
    return false;
  }
}

/**
 * 안드로이드 카카오톡에서 외부 브라우저로 열기
 */
export function openInExternalBrowser(url: string = window.location.href): void {
  if (!isKakaoAndroid()) {
    return;
  }

  const intentUrl = url.replace(/https?:\/\//, '');
  
  // 방법 1: Chrome 우선
  try {
    window.location.href = `intent://${intentUrl}#Intent;scheme=https;package=com.android.chrome;end`;
  } catch (e) {
    // 방법 2: 브라우저 선택기 표시 (Chrome이 없을 경우)
    try {
      window.location.href = `intent://${intentUrl}#Intent;scheme=https;action=android.intent.action.VIEW;end`;
    } catch (e2) {
      alert('외부 브라우저로 열 수 없습니다. URL을 복사하여 Chrome에서 열어주세요.');
    }
  }
}

/**
 * SessionStorage를 사용하여 리디렉션 루프 방지
 */
export function shouldRedirect(): boolean {
  const REDIRECT_KEY = 'kakao_android_redirect_attempted';
  
  // 이미 리디렉션을 시도했다면 false 반환
  if (sessionStorage.getItem(REDIRECT_KEY) === 'true') {
    return false;
  }
  
  // 안드로이드 카카오톡 인앱인 경우에만 true
  if (isKakaoAndroid()) {
    // 리디렉션 시도 기록
    sessionStorage.setItem(REDIRECT_KEY, 'true');
    return true;
  }
  
  return false;
}

/**
 * 리디렉션 기록 초기화 (사용자가 수동으로 머물기를 선택한 경우)
 */
export function clearRedirectFlag(): void {
  sessionStorage.removeItem('kakao_android_redirect_attempted');
}


