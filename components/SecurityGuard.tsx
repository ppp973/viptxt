'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function SecurityGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const [isTerminated, setIsTerminated] = useState(false);

  useEffect(() => {
    if (pathname === '/terminated') return;

    const terminate = () => {
      if (isTerminated) return;
      setIsTerminated(true);
      
      try {
        // Clear all session data
        sessionStorage.clear();
        localStorage.clear();
        // Redirect to terminated page
        router.replace('/terminated');
      } catch (e) {
        // Fallback for when router fails
        window.location.href = '/terminated';
      }
    };

    // 1. Detect DevTools via window size (common for docked DevTools)
    const threshold = 160;
    const checkSize = () => {
      // Only check if not in an iframe (AI Studio preview is an iframe)
      // or if the diff is truly massive
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      if (widthDiff || heightDiff) {
        // In AI Studio preview, outerWidth/innerWidth can be tricky
        // So we only terminate if it's very likely DevTools
        if (window.self === window.top) {
          terminate();
        }
      }
    };

    // 2. Detect DevTools via console.log getter
    const element = new Image();
    Object.defineProperty(element, 'id', {
      get: function() {
        terminate();
        throw new Error('Unauthorized Access');
      }
    });

    const interval = setInterval(() => {
      // Only run in production or if not in the AI Studio preview environment
      // to avoid breaking the developer's own workflow
      if (process.env.NODE_ENV === 'production') {
        console.log(element);
        checkSize();
      }
    }, 2000);

    window.addEventListener('resize', checkSize);

    // 4. Disable right click and common shortcuts
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        terminate();
        return false;
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', checkSize);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router, pathname, isTerminated]);

  if (isTerminated) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
        <div className="text-red-600 font-mono text-xl animate-pulse">
          SYSTEM TERMINATED: UNAUTHORIZED ACCESS DETECTED
        </div>
      </div>
    );
  }

  return null;
}
