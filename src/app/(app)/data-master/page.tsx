'use client';

import { DataInputClient } from '@/components/data-input-client';
import { ManageStudentsClient } from '@/components/manage-students-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { translations } from '@/lib/translations';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/firebase';

function DataMasterTabs() {
  const language = 'id';
  const t = translations[language] || translations.en;
  
  return (
    <Tabs defaultValue="data-input">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="data-input">
          {t.sidebar.dataInput}
        </TabsTrigger>
        <TabsTrigger value="manage-students">
          {t.sidebar.manageStudents}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="data-input" className="mt-6 space-y-6">
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
      </TabsContent>
      <TabsContent value="manage-students" className="mt-6">
        <ManageStudentsClient />
      </TabsContent>
    </Tabs>
  )
}

export default function DataMasterPage() {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && userProfile && (userProfile.role === 'orangtua' || userProfile.role === 'siswa')) {
      router.replace('/dashboard');
    }
  }, [userProfile, loading, router]);

  if (loading || !userProfile || userProfile.role === 'orangtua' || userProfile.role === 'siswa') {
    return (
       <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const language = 'id';
  const t = translations[language] || translations.en;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          {t.sidebar.dataMaster}
        </h1>
        <p className="text-muted-foreground">
          {t.dataMasterPage.description}
        </p>
      </header>
      <DataMasterTabs />
    </div>
  );
}
