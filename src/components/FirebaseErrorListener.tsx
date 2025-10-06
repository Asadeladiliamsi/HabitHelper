'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/lib/error-emitter';

// This is a client component that listens for Firestore permission errors
// and throws them to be caught by the Next.js error overlay. This provides
// a much better developer experience than just logging to the console.
export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: Error) => {
      // Throwing the error here will cause it to be displayed in the Next.js
      // development error overlay.
      throw error;
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  return null; // This component does not render anything.
}
