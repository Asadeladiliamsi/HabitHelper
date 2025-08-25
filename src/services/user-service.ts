import { db } from '@/lib/firebase';
import { UserRole, UserProfile } from '@/lib/types';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';

/**
 * Creates a user profile document in Firestore.
 * @param user The user object from Firebase Auth.
 * @param role The role selected by the user during registration.
 */
export async function createUserProfile(user: User, role: UserRole): Promise<void> {
  const userRef = doc(db, 'users', user.uid);
  const newUserProfile: UserProfile = {
    uid: user.uid,
    email: user.email,
    role: role,
    name: user.displayName || user.email?.split('@')[0] || 'Pengguna Baru',
  };
  await setDoc(userRef, newUserProfile);
}

/**
 * Fetches a user profile from Firestore.
 * @param uid The user's unique ID.
 * @returns The user profile object or null if not found.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  } else {
    console.warn(`No user profile found for UID: ${uid}`);
    return null;
  }
}
