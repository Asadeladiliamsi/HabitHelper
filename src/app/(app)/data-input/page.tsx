import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus2 } from 'lucide-react';

export default function DataInputPage() {
  return (
    <div className="flex flex-col gap-6">
       <header>
        <h1 className="text-3xl font-bold tracking-tight">Input Data Harian</h1>
        <p className="text-muted-foreground">
          Catat perkembangan kebiasaan siswa di sini.
        </p>
      </header>
      <Card className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <div className="rounded-full border bg-card p-4">
                 <FilePlus2 className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
                Halaman Sedang Dibangun
            </CardTitle>
            <CardDescription className="max-w-xs text-muted-foreground">
                Fitur untuk menginput data harian siswa akan segera tersedia. Terima kasih atas kesabaran Anda.
            </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
