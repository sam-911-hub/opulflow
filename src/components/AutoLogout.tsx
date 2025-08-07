'use client';

import { useEffect } from 'react';
import { initAutoLogout } from '@/lib/auto-logout';

export default function AutoLogout() {
  useEffect(() => {
    const cleanup = initAutoLogout();
    return cleanup;
  }, []);

  return null;
}