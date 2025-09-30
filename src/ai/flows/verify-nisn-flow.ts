
'use server';

/**
 * @fileOverview This file defines a Genkit flow for verifying a student's NISN for session login.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const VerifyLoginNisnInputSchema = z.object({
  enteredNisn: z.string().describe("The student's submitted national student identification number (NISN)."),
  userNisn: z.string().describe("The correct NISN stored in the user's profile."),
});
export type VerifyLoginNisnInput = z.infer<typeof VerifyLoginNisnInputSchema>;

const VerifyLoginNisnOutputSchema = z.object({
  success: z.boolean().describe('Whether the verification was successful.'),
  message: z.string().describe('A message indicating the result of the operation.'),
});
export type VerifyLoginNisnOutput = z.infer<typeof VerifyLoginNisnOutputSchema>;


export const verifyLoginNisnFlow = ai.defineFlow(
  {
    name: 'verifyLoginNisnFlow',
    inputSchema: VerifyLoginNisnInputSchema,
    outputSchema: VerifyLoginNisnOutputSchema,
  },
  async ({ enteredNisn, userNisn }) => {
    if (!enteredNisn || !userNisn) {
        return { success: false, message: 'Data tidak lengkap untuk verifikasi.' };
    }

    if (enteredNisn === userNisn) {
      return { success: true, message: 'Verifikasi NISN berhasil!' };
    } else {
      return { success: false, message: 'NISN yang Anda masukkan salah. Silakan coba lagi.' };
    }
  }
);

