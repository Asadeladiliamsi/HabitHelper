
'use server';

import {
  habitDeclineNotification,
  type HabitDeclineNotificationInput,
} from '@/ai/flows/habit-decline-notification';
import { verifyLoginNisnFlow, type VerifyLoginNisnInput } from '@/ai/flows/verify-nisn-flow';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';


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

export async function verifyLoginNisn(input: VerifyLoginNisnInput): Promise<{ success: boolean; message: string }> {
    try {
        const result = await verifyLoginNisnFlow(input);
        return result;
    } catch (error: any) {
        console.error('Error in verifyLoginNisn action:', error);
        return { success: false, message: error.message || 'An unexpected error occurred.' };
    }
}
