'use client';

import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import 'firebaseui/dist/firebaseui.css';
import type { auth as FirebaseAuth } from 'firebaseui';

// This is a wrapper around the official firebaseui-react library
// It's needed because the official library is not compatible with Next.js App Router
// See https://github.com/firebase/firebaseui-web-react/issues/173

interface Props {
  // The Firebase UI Web UI Config object.
  // See: https://github.com/firebase/firebaseui-web#configuration
  uiConfig: FirebaseAuth.Config;
  // The Firebase App auth instance to use.
  firebaseAuth: any;
  className?: string;
}

export const StyledFirebaseAuth = ({
  uiConfig,
  firebaseAuth,
  className,
}: Props) => {
  const [firebaseui, setFirebaseui] = useState<
    typeof import('firebaseui') | null
  >(null);
  const [userSignedIn, setUserSignedIn] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Firebase UI only works on the Client. So we're loading the package only on the client-side.
    // We can't use dynamic import for this because it's a CJS module.
    setFirebaseui(require('firebaseui'));
  }, []);

  useEffect(() => {
    if (firebaseui === null) return;

    // Get or Create a firebaseUI instance.
    const firebaseUiWidget =
      firebaseui.auth.AuthUI.getInstance() ||
      new firebaseui.auth.AuthUI(firebaseAuth);
      
    if (uiConfig.signInFlow === 'popup') firebaseUiWidget.reset();

    // We track the auth state to reset firebaseUi if the user signs out.
    const unregisterAuthObserver = onAuthStateChanged(firebaseAuth, (user) => {
      if (!user && userSignedIn) firebaseUiWidget.reset();
      setUserSignedIn(!!user);
    });

    // Trigger the sign-in flow.
    if (elementRef.current) {
      firebaseUiWidget.start(elementRef.current, uiConfig);
    }

    return () => {
      unregisterAuthObserver();
      firebaseUiWidget.reset();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseui, uiConfig]);

  return <div className={className} ref={elementRef} />;
};
