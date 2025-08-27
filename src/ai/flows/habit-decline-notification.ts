// src/ai/flows/habit-decline-notification.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for detecting and notifying habit declines in students.
 *
 * - habitDeclineNotification - A function that triggers the habit decline notification flow.
 * - HabitDeclineNotificationInput - The input type for the habitDeclineNotification function.
 * - HabitDeclineNotificationOutput - The return type for the habitDeclineNotification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HabitDeclineNotificationInputSchema = z.object({
  studentId: z.string().describe('The ID of the student.'),
  habitName: z.string().describe('The name of the habit being monitored.'),
  habitScores: z
    .array(z.number())
    .min(3)
    .describe(
      'An array of the student\'s habit scores for the last three (or more) days in chronological order.'
    ),
});
export type HabitDeclineNotificationInput = z.infer<
  typeof HabitDeclineNotificationInputSchema
>;

const HabitDeclineNotificationOutputSchema = z.object({
  shouldNotify: z
    .boolean()
    .describe(
      'Whether a notification should be sent based on a significant decline in habit scores.'
    ),
  notificationMessage: z
    .string()
    .describe('A helpful and informative message for the teacher, explaining the trend and suggesting action. This message should be generated regardless of whether a notification is sent or not.'),
});
export type HabitDeclineNotificationOutput = z.infer<
  typeof HabitDeclineNotificationOutputSchema
>;

export async function habitDeclineNotification(
  input: HabitDeclineNotificationInput
): Promise<HabitDeclineNotificationOutput> {
  return habitDeclineNotificationFlow(input);
}

const habitDeclineNotificationPrompt = ai.definePrompt({
  name: 'habitDeclineNotificationPrompt',
  input: {schema: HabitDeclineNotificationInputSchema},
  output: {schema: HabitDeclineNotificationOutputSchema},
  prompt: `You are an AI assistant for "HabitHelper", a school app that helps teachers monitor student habits. Your role is to analyze student habit scores and provide insightful notifications for teachers.

You will receive a student's ID, a specific habit being monitored, and their scores for that habit over the last three days. The scores are on a scale of 1 to 4.

Student Information:
- Student ID: {{{studentId}}}
- Habit: {{{habitName}}}
- Scores (last 3 days, chronological): {{{habitScores}}}

Your Tasks:
1.  **Analyze for Significant Decline:** A "significant decline" is strictly defined as a decrease of at least 1 point each day for 3 consecutive days. For example, scores like [4, 3, 2] or [3, 2, 1] show a significant decline. Scores like [4, 4, 3] or [4, 2, 3] do not.
2.  **Set 'shouldNotify' Flag:** Based on your analysis, set the 'shouldNotify' boolean field to 'true' if there is a significant decline, and 'false' otherwise.
3.  **Generate a Notification Message:** You must ALWAYS generate a helpful and well-written 'notificationMessage' for the teacher, in BAHASA INDONESIA.
    *   **If 'shouldNotify' is true:** Write a clear alert message. Explain that the student has shown a significant decline in the specified habit over the last three days (mention the scores). Suggest that the teacher check in with the student to understand the situation.
    *   **If 'shouldNotify' is false:** Write a positive or neutral message. If the scores are stable or improving, mention this. For example, "Tidak ada penurunan signifikan pada kebiasaan '{{habitName}}'. Skor siswa stabil/meningkat dalam tiga hari terakhir: {{habitScores}}." This confirms to the teacher that the analysis was performed and everything is okay.

Example Output (for a decline):
{
  "shouldNotify": true,
  "notificationMessage": "Perhatian! Siswa dengan kebiasaan 'Rajin Olahraga' menunjukkan penurunan skor yang signifikan selama 3 hari terakhir (dari 4 menjadi 3, lalu 2). Disarankan untuk berkomunikasi dengan siswa untuk mengetahui kondisinya."
}

Example Output (for no decline):
{
  "shouldNotify": false,
  "notificationMessage": "Analisis selesai. Tidak ada penurunan signifikan pada kebiasaan 'Bangun Pagi'. Skor siswa stabil dalam tiga hari terakhir: 4, 4, 3."
}

Output your response in the required JSON format.`,
});

const habitDeclineNotificationFlow = ai.defineFlow(
  {
    name: 'habitDeclineNotificationFlow',
    inputSchema: HabitDeclineNotificationInputSchema,
    outputSchema: HabitDeclineNotificationOutputSchema,
  },
  async input => {
    const {output} = await habitDeclineNotificationPrompt(input);
    return output!;
  }
);
