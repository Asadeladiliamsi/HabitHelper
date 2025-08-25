'use server';

import { habitDeclineNotification } from '@/ai/flows/habit-decline-notification';
import type { HabitDeclineNotificationInput } from '@/ai/flows/habit-decline-notification';

export async function checkHabitDecline(input: HabitDeclineNotificationInput) {
  try {
    const result = await habitDeclineNotification(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in AI flow:', error);
    return { success: false, error: 'Failed to process habit data.' };
  }
}
