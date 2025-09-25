
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Frown } from 'lucide-react';

export function EditScoresClient() {
  return (
      <Card className="mx-auto w-full max-w-2xl bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             <Frown className="h-6 w-6 text-amber-600 dark:text-amber-400" />
             Komponen Dalam Perbaikan
          </CardTitle>
          <CardDescription className="text-amber-800 dark:text-amber-200">
            Halaman 'Edit Nilai' sedang dalam proses desain ulang untuk mendukung riwayat skor berdasarkan tanggal. 
            Fitur ini akan segera kembali dengan fungsionalitas yang lebih baik. Untuk saat ini, silakan gunakan halaman 'Input Data' untuk mencatat skor baru.
          </CardDescription>
        </CardHeader>
      </Card>
  );
}
