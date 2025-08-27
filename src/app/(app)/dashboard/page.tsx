'use client';

import { DashboardClient } from '@/components/dashboard-client';
import { StudentProvider } from '@/contexts/student-context';

export default function DashboardPage() {
  return (
    <StudentProvider>
      <div className="flex flex-col gap-6">
        <DashboardClient />
      </div>
    </StudentProvider>
  );
}