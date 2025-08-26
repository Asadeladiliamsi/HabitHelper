import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil } from 'lucide-react';

export default function EditScoresPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Edit Nilai Perkembangan</h1>
        <p className="text-muted-foreground">
          Ubah atau perbarui nilai perkembangan kebiasaan siswa di sini.
        </p>
      </header>
      <Card className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
          <div className="rounded-full border bg-card p-4">
            <Pencil className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Halaman Sedang Dibangun
          </CardTitle>
          <CardDescription className="max-w-xs text-muted-foreground">
            Fitur untuk mengedit nilai perkembangan siswa akan segera hadir. Nantikan pembaruan dari kami.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
