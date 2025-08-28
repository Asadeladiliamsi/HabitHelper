'use server';

/**
 * @fileOverview This file defines a Genkit flow for verifying a student's NISN and linking it to their user account.
 *
 * - verifyNisn - A function that handles the NISN verification process.
 * - VerifyNisnInput - The input type for the verifyNisn function.
 * - VerifyNisnOutput - The return type for the verifyNisn function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';

const VerifyNisnInputSchema = z.object({
  uid: z.string().describe('The user ID of the student account.'),
  nisn: z.string().describe('The National Student Identification Number (NISN) to verify.'),
});
export type VerifyNisnInput = z.infer<typeof VerifyNisnInputSchema>;

const VerifyNisnOutputSchema = z.object({
  success: z.boolean().describe('Whether the verification and linking were successful.'),
  error: z.string().optional().describe('An error message if the process failed.'),
});
export type VerifyNisnOutput = z.infer<typeof VerifyNisnOutputSchema>;

// Initialize Firebase Admin SDK if not already initialized
function getFirebaseAdminApp(): App {
    if (getApps().length) {
        return getApps()[0];
    }
    return initializeApp();
}

getFirebaseAdminApp();
const adminDb = getFirestore();


export async function verifyNisn(input: VerifyNisnInput): Promise<VerifyNisnOutput> {
  return verifyNisnFlow(input);
}

const verifyNisnFlow = ai.defineFlow(
  {
    name: 'verifyNisnFlow',
    inputSchema: VerifyNisnInputSchema,
    outputSchema: VerifyNisnOutputSchema,
  },
  async ({ uid, nisn }) => {
    try {
      // 1. Check if a student with this NISN exists in the 'students' collection
      const studentsQuery = adminDb.collection('students').where('nisn', '==', nisn);
      const studentSnapshot = await studentsQuery.get();

      if (studentSnapshot.empty) {
        return { success: false, error: 'NISN tidak ditemukan. Pastikan NISN sudah benar dan terdaftar oleh guru Anda.' };
      }

      // 2. Check if this NISN is already linked to another user account
      const usersQuery = adminDb.collection('users').where('nisn', '==', nisn);
      const userSnapshot = await usersQuery.get();

      if (!userSnapshot.empty) {
        const isSameUser = userSnapshot.docs.some(doc => doc.id === uid);
        if (!isSameUser) {
          return { success: false, error: 'NISN ini sudah ditautkan ke akun lain.' };
        }
      }

      // 3. Link the NISN to the user's profile
      const userDocRef = adminDb.collection('users').doc(uid);
      await userDocRef.update({ nisn: nisn });

      return { success: true };

    } catch (error: any) {
      console.error("Error during NISN verification flow:", error);
      return { success: false, error: 'Terjadi kesalahan internal saat verifikasi. Silakan coba lagi nanti.' };
    }
  }
);
