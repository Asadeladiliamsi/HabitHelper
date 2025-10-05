
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/lib/error-emitter';

/**
 * A client component that listens for Firestore permission errors and
 * throws them as uncaught exceptions to be picked up by Next.js's
 * development error overlay. This is for development-time debugging only.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: Error) => {
      // Throwing the error makes it an uncaught exception, which Next.js
      // will display in the development error overlay.
      setTimeout(() => {
        throw error;
      }, 0);
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, []);

  return null; // This component does not render anything.
}
