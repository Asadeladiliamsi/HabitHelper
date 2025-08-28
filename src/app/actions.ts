
'use server';

import {
  habitDeclineNotification,
  type HabitDeclineNotificationInput,
} from '@/ai/flows/habit-decline-notification';
import { verifyNisnFlow } from '@/ai/flows/verify-nisn-flow';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { auth } from 'firebase-admin';
import { getApps, initializeApp } from 'firebase-admin/app';


if (!getApps().length) {
  initializeApp();
}

export async function checkHabitDecline(input: HabitDeclineNotificationInput) {
  try {
    const result = await habitDeclineNotification(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in AI flow:', error);
    return { success: false, error: 'Failed to process habit data.' };
  }
}

export async function getRecentHabitScores(studentId: string, habitName: string): Promise<{ success: boolean; scores?: number[], error?: string }> {
    try {
        const entriesQuery = query(
            collection(db, 'habit_entries'),
            where('studentId', '==', studentId),
            where('habitName', '==', habitName),
            orderBy('date', 'desc'),
            limit(3)
        );

        const querySnapshot = await getDocs(entriesQuery);
        if (querySnapshot.docs.length < 3) {
            return { success: false, error: `Data skor untuk kebiasaan '${habitName}' kurang dari 3 hari.` };
        }
        
        const scores = querySnapshot.docs.map(doc => doc.data().score).reverse(); // a prompt says last 3 days, so we need to have it in chronological order
        return { success: true, scores };

    } catch (error) {
        console.error('Error fetching recent scores:', error);
        return { success: false, error: 'Gagal mengambil data skor dari database.' };
    }
}


export async function verifyNisn(nisn: string): Promise<{ success: boolean; message: string }> {
    try {
        // This is a placeholder for getting the currently logged-in user's UID.
        // In a real Next.js app with a proper auth setup (like NextAuth.js or Clerk),
        // you would get the session on the server to securely get the user's ID.
        // For now, we'll need to adjust the flow to accept the UID from the client,
        // while acknowledging this is not the most secure pattern.
        // THIS IS A SIMPLIFIED EXAMPLE.
        
        // A better approach would be to get the user from the session, e.g.:
        // const session = await auth();
        // const uid = session?.user?.id;
        // if (!uid) {
        //   return { success: false, message: 'User not authenticated.' };
        // }
        // For now, we need to adapt the `verify-nisn-flow` to accept UID from client-side action.

        // The logic is now inside `verify-nisn-flow.ts` and that flow needs the UID.
        // The client will call this action, and this action will call the flow.
        // We need to get the UID from the client call. Let's modify the `useAuth` hook.
        
        // This action is now a simple pass-through to the flow.
        // The client will provide the UID.
        // This is a placeholder and should be implemented with a secure session check.
        throw new Error("UID must be provided from a secure session, which is not implemented in this version.");

    } catch (error: any) {
        console.error('Error in verifyNisn action:', error);
        return { success: false, message: error.message || 'An unexpected error occurred.' };
    }
}
