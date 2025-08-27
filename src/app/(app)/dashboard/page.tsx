
import { DashboardClient } from '@/components/dashboard-client';

// This is now a Server Component
export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardClient />
    </div>
  );
}
