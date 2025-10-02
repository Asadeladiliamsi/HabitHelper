'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  query,
  deleteDoc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile, UserRole } from '@/lib/types';
import { useAuth } from './auth-context';
import { Loader2 } from 'lucide-react';

interface UserContextType {
  users: UserProfile[];
  loading: boolean;
  teacherCode: string | null;
  updateUserRole: (uid: string, newRole: UserRole) => Promise<void>;
  updateUserName: (uid: string, newName: string) => Promise<void>;
  deleteUser: (uid: string) => Promise<void>;
  fetchTeacherCode: () => Promise<void>;
  updateTeacherCode: (code: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [teacherCode, setTeacherCode] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !userProfile) {
      setLoading(true);
      return;
    }

    if (userProfile.role === 'admin') {
      fetchTeacherCode();
    }

    // Only admins and teachers should be able to fetch the full user list.
    if (!['admin', 'guru'].includes(userProfile.role)) {
      setLoading(false);
      setUsers([]);
      return;
    }

    setLoading(true);
    const q = query(collection(db, 'users'));

    const unsubscribe = onSnapshot(
      q,
      querySnapshot => {
        const usersData: UserProfile[] = [];
        querySnapshot.forEach(doc => {
          usersData.push(doc.data() as UserProfile);
        });
        setUsers(usersData);
        setLoading(false);
      },
      error => {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userProfile, authLoading]);

  const fetchTeacherCode = async () => {
    if (!userProfile || userProfile.role !== 'admin') return;
    const settingsDocRef = doc(db, 'app_settings', 'registration');
    const docSnap = await getDoc(settingsDocRef);
    if (docSnap.exists()) {
      setTeacherCode(docSnap.data().teacherCode);
    } else {
      setTeacherCode(''); // No code set yet
    }
  };
  
  const updateTeacherCode = async (code: string) => {
    if (!userProfile || userProfile.role !== 'admin') {
      throw new Error('Insufficient permissions');
    }
    const settingsDocRef = doc(db, 'app_settings', 'registration');
    await setDoc(settingsDocRef, { teacherCode: code });
    setTeacherCode(code);
  };


  const updateUserRole = async (uid: string, newRole: UserRole) => {
    if (!userProfile || userProfile.role !== 'admin') {
      throw new Error('Authentication required or insufficient permissions');
    }
    const userDocRef = doc(db, 'users', uid);
    try {
      await updateDoc(userDocRef, { role: newRole });
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const updateUserName = async (uid: string, newName: string) => {
    if (!userProfile || userProfile.role !== 'admin') {
      throw new Error('Authentication required or insufficient permissions');
    }
    const userDocRef = doc(db, 'users', uid);
    try {
      await updateDoc(userDocRef, { name: newName });
    } catch (error) {
      console.error('Error updating user name:', error);
    }
  };

  const deleteUser = async (uid: string) => {
    if (!userProfile || userProfile.role !== 'admin') {
      throw new Error('Authentication required or insufficient permissions');
    }
    // Note: This only deletes the Firestore user profile document.
    // The actual Firebase Auth user is not deleted here, which would require a server-side function.
    const userDocRef = doc(db, 'users', uid);
    try {
      await deleteDoc(userDocRef);
    } catch (error) {
      console.error('Error deleting user profile:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const contextValue = {
    users,
    loading,
    updateUserRole,
    updateUserName,
    deleteUser,
    teacherCode,
    fetchTeacherCode,
    updateTeacherCode
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
