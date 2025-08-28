
'use server';

/**
 * @fileOverview This file defines a Genkit flow for verifying a student's NISN and linking it to their user account.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';

const VerifyNisnInputSchema = z.object({
  uid: z.string().describe('The user ID of the student attempting to verify.'),
  nisn: z.string().describe("The student's national student identification number (NISN)."),
});
export type VerifyNisnInput = z.infer<typeof VerifyNisnInputSchema>;

const VerifyNisnOutputSchema = z.object({
  success: z.boolean().describe('Whether the verification and linking were successful.'),
  message: z.string().describe('A message indicating the result of the operation.'),
});
export type VerifyNisnOutput = z.infer<typeof VerifyNisnOutputSchema>;


// Initialize Firebase Admin SDK
let adminApp: App;
if (!getApps().length) {
  adminApp = initializeApp();
} else {
  adminApp = getApps()[0];
}
const db = getFirestore(adminApp);


export const verifyNisnFlow = ai.defineFlow(
  {
    name: 'verifyNisnFlow',
    inputSchema: VerifyNisnInputSchema,
    outputSchema: VerifyNisnOutputSchema,
  },
  async ({ uid, nisn }) => {
    try {
      const studentsRef = db.collection('students');
      const usersRef = db.collection('users');

      // 1. Check if a student with the given NISN exists
      const studentQuery = await studentsRef.where('nisn', '==', nisn).limit(1).get();

      if (studentQuery.empty) {
        return { success: false, message: `NISN ${nisn} tidak ditemukan. Pastikan Anda memasukkan NISN yang benar atau hubungi guru Anda.` };
      }
      
      const studentDoc = studentQuery.docs[0];
      const studentData = studentDoc.data();

      // 2. Check if the student data is already linked to a different user account
      if (studentData.linkedUserUid && studentData.linkedUserUid !== uid) {
          return { success: false, message: `NISN ${nisn} sudah ditautkan ke akun lain.` };
      }

      // 3. Check if any other user account already has this NISN
      const userNisnQuery = await usersRef.where('nisn', '==', nisn).limit(1).get();
      if (!userNisnQuery.empty) {
          const userDoc = userNisnQuery.docs[0];
          if (userDoc.id !== uid) {
              return { success: false, message: `NISN ${nisn} sudah digunakan oleh pengguna lain.` };
          }
      }

      // 4. If all checks pass, link the NISN to the user and the user to the student
      const userDocRef = usersRef.doc(uid);
      
      // Get user email to store in student document for easier lookup
      const userRecord = await userDocRef.get();
      const userEmail = userRecord.data()?.email;

      await userDocRef.update({ nisn: nisn });
      await studentDoc.ref.update({ linkedUserUid: uid, email: userEmail });


      return { success: true, message: 'Verifikasi NISN berhasil! Anda akan diarahkan ke dasbor.' };

    } catch (error) {
      console.error('Error in verifyNisnFlow:', error);
      return { success: false, message: 'Terjadi kesalahan internal saat verifikasi. Silakan coba lagi nanti.' };
    }
  }
);
