'use client';

import { DataInputClient } from '@/components/data-input-client';
import { EditScoresClient } from '@/components/edit-scores-client';
import { ManageStudentsClient } from '@/components/manage-students-client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-provider';
import { StudentProvider } from '@/contexts/student-context';
import { UserProvider, useUser } from '@/contexts/user-context';
import { translations } from '@/lib/translations';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function DataMasterTabs() {
  const { language } = useLanguage();
  const { users } = useUser();
  const t = translations[language] || translations.en;
  
  const parentUsers = users.filter(u => u.role === 'orangtua');

  return (
    <Tabs defaultValue="manage-students">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="data-input">
          {t.sidebar.dataInput}
        </TabsTrigger>
        <TabsTrigger value="manage-students">
          {t.sidebar.manageStudents}
        </TabsTrigger>
        <TabsTrigger value="edit-scores">
          {t.sidebar.editScores}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="data-input" className="mt-6">
        <DataInputClient />
      </TabsContent>
      <TabsContent value="manage-students" className="mt-6">
        <ManageStudentsClient parentUsers={parentUsers} />
      </TabsContent>
      <TabsContent value="edit-scores" className="mt-6">
        <EditScoresClient />
      </TabsContent>
    </Tabs>
  )
}

export default function DataMasterPage() {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const { userProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (userProfile && userProfile.role === 'orangtua') {
      router.replace('/dashboard');
    }
  }, [userProfile, router]);

  if (userProfile?.role === 'orangtua') {
    return null; 
  }

  return (
    <StudentProvider>
      <UserProvider>
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
      </UserProvider>
    </StudentProvider>
  );
}
