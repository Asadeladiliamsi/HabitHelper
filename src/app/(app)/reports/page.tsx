import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Laporan & Evaluasi</h1>
        <p className="text-muted-foreground">
          Ekspor laporan perkembangan siswa dalam format PDF atau Excel.
        </p>
      </header>
      <Card className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
          <div className="rounded-full border bg-card p-4">
            <FileText className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Halaman Sedang Dibangun
          </CardTitle>
          <CardDescription className="max-w-xs text-muted-foreground">
            Fitur untuk mengekspor laporan siswa akan segera hadir. Nantikan pembaruan dari kami.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
