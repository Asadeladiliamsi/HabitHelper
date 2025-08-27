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
    .length(3)
    .describe(
      'An array of the student\'s habit scores for the last three days.'
    ),
});
export type HabitDeclineNotificationInput = z.infer<
  typeof HabitDeclineNotificationInputSchema
>;

const HabitDeclineNotificationOutputSchema = z.object({
  shouldNotify: z
    .boolean()
    .describe(
      'Whether a notification should be sent based on the decline in habit scores.'
    ),
  notificationMessage: z
    .string()
    .describe('The message to be sent in the notification, if any.'),
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
  prompt: `You are an AI assistant that helps teachers monitor student habits.

You will receive a student's habit scores for the last three days. Your task is to determine if there has been a significant decline in the habit scores, and if so, generate a notification message.

Here is the student's information:
Student ID: {{{studentId}}}
Habit Name: {{{habitName}}}
Habit Scores (last 3 days): {{{habitScores}}}

Rules for notification:
1.  A significant decline is defined as a decrease of at least 1 point each day for 3 consecutive days. The habit scores are on a scale of 1-4.

Based on these rules, determine if a notification should be sent. If so, generate a message that informs the teacher about the decline in the student's habit and suggests they check in with the student.

Output your response in JSON format with 'shouldNotify' set to true or false, and 'notificationMessage' containing the message if 'shouldNotify' is true, or an empty string if 'shouldNotify' is false.`,
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
