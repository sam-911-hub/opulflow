import { useState, useEffect } from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export default function useResponsive() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isXs = isMounted && windowSize.width < breakpoints.sm;
  const isSm = isMounted && windowSize.width >= breakpoints.sm && windowSize.width < breakpoints.md;
  const isMd = isMounted && windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg;
  const isLg = isMounted && windowSize.width >= breakpoints.lg && windowSize.width < breakpoints.xl;
  const isXl = isMounted && windowSize.width >= breakpoints.xl && windowSize.width < breakpoints['2xl'];
  const is2Xl = isMounted && windowSize.width >= breakpoints['2xl'];

  const isMobile = isXs || isSm;
  const isTablet = isMd;
  const isDesktop = isLg || isXl || is2Xl;

  const breakpoint: Breakpoint = 
    isXs ? 'xs' :
    isSm ? 'sm' :
    isMd ? 'md' :
    isLg ? 'lg' :
    isXl ? 'xl' : '2xl';

  const up = (bp: Breakpoint) => windowSize.width >= breakpoints[bp];
  const down = (bp: Breakpoint) => windowSize.width < breakpoints[bp];
  const between = (start: Breakpoint, end: Breakpoint) => 
    windowSize.width >= breakpoints[start] && windowSize.width < breakpoints[end];
  const only = (bp: Breakpoint) => {
    const keys = Object.keys(breakpoints) as Breakpoint[];
    const index = keys.indexOf(bp);
    const nextBp = keys[index + 1];
    
    return nextBp 
      ? windowSize.width >= breakpoints[bp] && windowSize.width < breakpoints[nextBp]
      : windowSize.width >= breakpoints[bp];
  };

  return {
    windowSize,
    breakpoint,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
    isMobile,
    isTablet,
    isDesktop,
    up,
    down,
    between,
    only,
  };
}