
'use server';

import {
  habitDeclineNotification,
  type HabitDeclineNotificationInput,
} from '@/ai/flows/habit-decline-notification';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';


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
            where('habitName', '==', habitName)
        );

        const querySnapshot = await getDocs(entriesQuery);
        
        if (querySnapshot.empty) {
            return { success: false, error: `Tidak ada data skor yang ditemukan untuk kebiasaan '${habitName}'.` };
        }
        
        const allEntries: { score: number; date: Date }[] = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();
            // Defensive check: pastikan field 'date' ada dan merupakan Timestamp yang valid
            if (data.date && data.date instanceof Timestamp) {
                allEntries.push({ 
                    score: data.score, 
                    date: data.date.toDate() 
                });
            } else {
                console.warn(`Skipping habit entry with ID ${doc.id} due to missing or invalid date field.`);
            }
        });

        if (allEntries.length === 0) {
             return { success: false, error: `Tidak ada data skor yang valid yang ditemukan untuk kebiasaan '${habitName}'.` };
        }

        // Urutkan berdasarkan tanggal, dari yang terbaru ke yang terlama
        allEntries.sort((a, b) => b.date.getTime() - a.date.getTime());

        // Ambil 3 entri teratas
        const recentEntries = allEntries.slice(0, 3);

        if (recentEntries.length < 3) {
            return { success: false, error: `Data skor untuk kebiasaan '${habitName}' hanya ada ${recentEntries.length}, dibutuhkan minimal 3 data.` };
        }
        
        // Balik urutan agar menjadi kronologis (dari yang terlama ke terbaru) untuk analisis AI
        const scores = recentEntries.map(entry => entry.score).reverse(); 

        return { success: true, scores };

    } catch (error) {
        console.error('Error fetching recent scores:', error);
        return { success: false, error: 'Gagal mengambil data skor dari database. Terjadi kesalahan internal saat memproses data.' };
    }
}
