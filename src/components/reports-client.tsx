'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StudentSearchDialog } from './student-search-dialog';
import { useToast } from '@/hooks/use-toast';
import { DownloadCloud, Loader2 } from 'lucide-react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student } from '@/lib/types';


const reportFormSchema = z.object({
  reportType: z.string().min(1, 'Jenis laporan harus dipilih.'),
  studentId: z.string().min(1, 'Siswa harus dipilih.'),
  format: z.string().min(1, 'Format harus dipilih.'),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

export function ReportsClient() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'students'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studentData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
      setStudents(studentData);
      setLoading(false);
    }, (error) => {
      console.error("Failed to fetch students:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      reportType: '',
      studentId: '',
      format: 'pdf',
    },
  });

  const selectedStudentName = students.find(s => s.id === form.watch('studentId'))?.name || '';

  const handleGenerateReport = async (data: ReportFormValues) => {
    setIsLoading(true);
    console.log('Generating report with data:', data);

    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: 'Fitur Segera Hadir',
      description: `Pembuatan laporan untuk ${selectedStudentName} dalam format ${data.format.toUpperCase()} akan segera tersedia.`,
    });

    setIsLoading(false);
  };
  
  if (loading) {
    return (
       <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Buat Laporan Siswa</CardTitle>
        <CardDescription>
          Pilih opsi di bawah ini untuk menghasilkan laporan perkembangan siswa.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleGenerateReport)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="reportType">Jenis Laporan</Label>
            <Controller
              control={form.control}
              name="reportType"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="reportType">
                    <SelectValue placeholder="Pilih jenis laporan..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly_progress">Laporan Kemajuan Mingguan</SelectItem>
                    <SelectItem value="monthly_summary" disabled>Laporan Ringkasan Bulanan (Segera Hadir)</SelectItem>
                    <SelectItem value="full_history" disabled>Laporan Riwayat Lengkap (Segera Hadir)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.reportType && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.reportType.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentId">Pilih Siswa</Label>
            <Controller
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <StudentSearchDialog
                  students={students}
                  selectedStudentId={field.value}
                  onStudentSelect={field.onChange}
                  placeholder="Cari dan pilih siswa..."
                  selectedStudentName={selectedStudentName}
                />
              )}
            />
            {form.formState.errors.studentId && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.studentId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Format Ekspor</Label>
            <Controller
              control={form.control}
              name="format"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="format" className="w-[180px]">
                    <SelectValue placeholder="Pilih format..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv" disabled>CSV (Segera Hadir)</SelectItem>
                    <SelectItem value="excel" disabled>Excel (Segera Hadir)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <Button type="submit" disabled={isLoading || !form.formState.isValid} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Membuat Laporan...
              </>
            ) : (
              <>
                <DownloadCloud className="mr-2 h-4 w-4" />
                Buat Laporan
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
