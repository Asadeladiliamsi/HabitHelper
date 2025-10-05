'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { type User } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

interface FirebaseContextValue {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export const FirebaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (!user) {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
        // If user is null, we are done loading as there's no profile to fetch.
        setLoading(false);
        return;
    }

    setLoading(true); // Start loading profile
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        } else {
          setUserProfile(null);
        }
        setLoading(false); // Finish loading profile
      }, (error) => {
        console.error("Error fetching user profile:", error);
         const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setUserProfile(null);
        setLoading(false); // Finish loading even if there's an error
      });

    return () => unsubscribeProfile();
  }, [user]); // This effect depends only on the user object.

  
  const value = { user, userProfile, loading };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context;
};
