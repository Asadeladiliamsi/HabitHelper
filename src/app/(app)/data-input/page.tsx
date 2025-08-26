import { DataInputClient } from '@/components/data-input-client';
import { mockStudents } from '@/lib/mock-data';

export default function DataInputPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Input Data Harian</h1>
        <p className="text-muted-foreground">
          Catat perkembangan kebiasaan siswa di sini secara rutin.
        </p>
      </header>
      <DataInputClient students={mockStudents} />
    </div>
  );
}
