
'use server';

import {
  habitDeclineNotification,
  type HabitDeclineNotificationInput,
} from '@/ai/flows/habit-decline-notification';
import { verifyLoginNisnFlow, type VerifyLoginNisnInput } from '@/ai/flows/verify-nisn-flow';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';


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
        // Query disederhanakan untuk menghindari kebutuhan indeks komposit yang kompleks.
        const entriesQuery = query(
            collection(db, 'habit_entries'),
            where('studentId', '==', studentId),
            where('habitName', '==', habitName)
        );

        const querySnapshot = await getDocs(entriesQuery);
        
        if (querySnapshot.empty) {
            return { success: false, error: `Tidak ada data skor yang ditemukan untuk kebiasaan '${habitName}'.` };
        }
        
        // Lakukan pengurutan dan pembatasan di sisi server.
        const allEntries = querySnapshot.docs.map(doc => {
            const data = doc.data();
            // Konversi Firebase Timestamp ke objek Date JavaScript
            return { ...data, date: (data.date as Timestamp).toDate() };
        });

        // Urutkan berdasarkan tanggal, dari yang terbaru ke yang terlama
        allEntries.sort((a, b) => b.date.getTime() - a.date.getTime());

        // Ambil 3 entri teratas
        const recentEntries = allEntries.slice(0, 3);

        if (recentEntries.length < 3) {
            return { success: false, error: `Data skor untuk kebiasaan '${habitName}' kurang dari 3 hari.` };
        }
        
        // Balik urutan agar menjadi kronologis (dari yang terlama ke terbaru) untuk analisis AI
        const scores = recentEntries.map(entry => entry.score).reverse(); 

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
