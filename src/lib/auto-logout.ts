'use client';

let logoutTimer: NodeJS.Timeout | null = null;
let isActive = true;

const INACTIVITY_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

export function initAutoLogout() {
  if (typeof window === 'undefined') return;

  const resetTimer = () => {
    if (logoutTimer) clearTimeout(logoutTimer);
    
    logoutTimer = setTimeout(() => {
      // Auto logout
      fetch('/api/auth/logout', { method: 'POST' });
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    }, INACTIVITY_TIME);
  };

  const handleActivity = () => {
    if (!isActive) return;
    resetTimer();
  };

  // Track user activity
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
    document.addEventListener(event, handleActivity, true);
  });

  // Start timer
  resetTimer();

  // Cleanup function
  return () => {
    if (logoutTimer) clearTimeout(logoutTimer);
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
      document.removeEventListener(event, handleActivity, true);
    });
    isActive = false;
  };
}