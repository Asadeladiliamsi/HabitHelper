'use client';

import { DataInputClient } from '@/components/data-input-client';
import { ManageStudentsClient } from '@/components/manage-students-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { translations } from '@/lib/translations';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase/provider';
import { ManageClassesClient } from '@/components/manage-classes-client';
import { Separator } from '@/components/ui/separator';

export default function DataMasterPage() {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
       <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Redirect if not the correct role (only for teachers and admins)
  if (!userProfile || (userProfile.role !== 'guru' && userProfile.role !== 'admin')) {
    router.replace('/dashboard');
    return (
       <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const language = 'id';
  const t = translations[language] || translations.en;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          {t.sidebar.dataInput} & Manajemen
        </h1>
        <p className="text-muted-foreground">
          Kelola semua data master terkait siswa dan kelas dari satu tempat.
        </p>
      </header>
      
      <div className="space-y-8">
         <Card>
            <CardHeader>
                <CardTitle>Panduan Penilaian Skor</CardTitle>
                <CardDescription>Gunakan panduan ini untuk memberikan skor yang konsisten.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><strong className="text-foreground">4 (Sangat Memadai):</strong> Siswa memenuhi semua kriteria secara mandiri dan konsisten.</li>
                    <li><strong className="text-foreground">3 (Memadai):</strong> Siswa memenuhi sebagian besar kriteria dengan sedikit bimbingan.</li>
                    <li><strong className="text-foreground">2 (Tidak Memadai):</strong> Siswa memenuhi sebagian kecil kriteria atau membutuhkan bimbingan.</li>
                    <li><strong className="text-foreground">1 (Sangat Tidak Memadai):</strong> Siswa tidak memenuhi kriteria atau memerlukan banyak bimbingan.</li>
                </ul>
            </CardContent>
        </Card>
        
        <DataInputClient />
        
        <Separator />
        
        <ManageStudentsClient />
        
        <Separator />
        
        <ManageClassesClient />
      </div>

    </div>
  );
}
