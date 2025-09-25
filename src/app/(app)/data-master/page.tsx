
'use client';

import { DataInputClient } from '@/components/data-input-client';
import { EditScoresClient } from '@/components/edit-scores-client';
import { ManageStudentsClient } from '@/components/manage-students-client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-provider';
import { StudentProvider, useStudent } from '@/contexts/student-context';
import { UserProvider, useUser } from '@/contexts/user-context';
import { translations } from '@/lib/translations';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function DataMasterTabs() {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const { users, loading: usersLoading } = useUser();
  const { students, loading: studentsLoading } = useStudent();
  
  if (usersLoading || studentsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  const parentUsers = users.filter(u => u.role === 'orangtua');
  const linkedUserUids = new Set(students.map(s => s.linkedUserUid).filter(Boolean));
  const unlinkedStudentUsers = users.filter(user => user.role === 'siswa' && !linkedUserUids.has(user.uid));

  return (
    <Tabs defaultValue="manage-students">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="data-input">
          {t.sidebar.dataInput}
        </TabsTrigger>
        <TabsTrigger value="manage-students">
          {t.sidebar.manageStudents}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="data-input" className="mt-6">
        <DataInputClient />
      </TabsContent>
      <TabsContent value="manage-students" className="mt-6">
        <ManageStudentsClient parentUsers={parentUsers} studentUsers={unlinkedStudentUsers} />
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
    if (userProfile && (userProfile.role === 'orangtua' || userProfile.role === 'siswa')) {
      router.replace('/dashboard');
    }
  }, [userProfile, router]);

  if (userProfile?.role === 'orangtua' || userProfile?.role === 'siswa') {
    return null; 
  }

  return (
    <UserProvider>
      <StudentProvider>
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
      </StudentProvider>
    </UserProvider>
  );
}
