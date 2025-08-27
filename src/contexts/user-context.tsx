'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, updateDoc, doc, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile, UserRole } from '@/lib/types';
import { useAuth } from './auth-context';
import { Loader2 } from 'lucide-react';

interface UserContextType {
  users: UserProfile[];
  loading: boolean;
  updateUserRole: (uid: string, newRole: UserRole) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user || userProfile?.role !== 'admin') {
      setLoading(false);
      setUsers([]);
      return;
    }

    setLoading(true);
    const q = query(collection(db, 'users'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersData: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push(doc.data() as UserProfile);
      });
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, userProfile, authLoading]);

  const updateUserRole = async (uid: string, newRole: UserRole) => {
    if (!user || userProfile?.role !== 'admin') {
        throw new Error("Authentication required or insufficient permissions");
    }
    const userDocRef = doc(db, 'users', uid);
    try {
      await updateDoc(userDocRef, { role: newRole });
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };
  
   if (authLoading) {
     return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const contextValue = { users, loading, updateUserRole };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
