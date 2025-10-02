'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';

export function useUserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      // No user logged in, no profile to fetch.
      return;
    }

    // User is logged in, fetch their profile.
    const profileDocRef = doc(db, 'users', user.uid);
    const unsubscribeProfile = onSnapshot(profileDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile);
      } else {
        // This case might happen briefly during signup before the profile is created.
        setUserProfile(null); 
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user profile:", error);
      setUserProfile(null);
      setLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user]);

  return { user, userProfile, loading };
}
