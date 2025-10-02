'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificationsClient } from '@/components/notifications-client';
import { translations } from '@/lib/translations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ComprehensiveAnalysisClient } from '@/components/comprehensive-analysis-client';

export default function NotificationsPage() {
  const language = 'id';
  const t = translations[language]?.notificationsPage || translations.en.notificationsPage;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-muted-foreground">
          {t.description}
        </p>
      </header>

       <Tabs defaultValue="comprehensive">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="comprehensive">
            Analisis Menyeluruh
          </TabsTrigger>
          <TabsTrigger value="individual">
            Analisis Individu
          </TabsTrigger>
        </TabsList>
        <TabsContent value="comprehensive" className="mt-6">
           <Card className="mx-auto w-full">
            <CardHeader>
              <CardTitle>Dasbor Analisis AI Menyeluruh</CardTitle>
              <CardDescription>
               Jalankan analisis pada semua siswa untuk mendeteksi penurunan kebiasaan secara proaktif. Hasilnya akan ditampilkan di bawah.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComprehensiveAnalysisClient />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="individual" className="mt-6">
           <Card className="mx-auto w-full max-w-2xl">
            <CardHeader>
              <CardTitle>{t.cardTitle}</CardTitle>
              <CardDescription>
                {t.cardDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationsClient />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
