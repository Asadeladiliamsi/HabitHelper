'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OrangTuaDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
       <header>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Orang Tua</h1>
        <p className="text-muted-foreground">
          Selamat datang, Orang Tua!
        </p>
      </header>
      <Card className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">
                Halaman Sedang Dibangun
            </CardTitle>
            <CardDescription className="max-w-xs text-muted-foreground">
                Fitur untuk dasbor orang tua akan segera tersedia. Terima kasih atas kesabaran Anda.
            </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
