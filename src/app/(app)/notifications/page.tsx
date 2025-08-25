import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificationsClient } from '@/components/notifications-client';
import { mockStudents } from '@/lib/mock-data';

export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Notifikasi AI</h1>
        <p className="text-muted-foreground">
          Sistem akan mendeteksi penurunan kebiasaan siswa dan memberikan notifikasi.
        </p>
      </header>

      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Periksa Penurunan Kebiasaan</CardTitle>
          <CardDescription>
            Pilih siswa, nama kebiasaan, dan masukkan skor 3 hari terakhir untuk dianalisis oleh AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationsClient students={mockStudents} />
        </CardContent>
      </Card>
    </div>
  );
}
