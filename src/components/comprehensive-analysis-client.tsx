'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { checkHabitDecline, getRecentHabitScores } from '@/app/actions';
import type { Student } from '@/lib/types';
import type { HabitDeclineNotificationOutput } from '@/ai/flows/habit-decline-notification';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { translations } from '@/lib/translations';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AnalysisResult extends HabitDeclineNotificationOutput {
  studentName: string;
  habitName: string;
  scores: number[];
}

export function ComprehensiveAnalysisClient() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [analysisTimestamp, setAnalysisTimestamp] = useState<string | null>(null);
  const language = 'id';
  const tHabits = translations[language]?.landingPage.habits || translations.en.landingPage.habits;

  useEffect(() => {
    setStudentsLoading(true);
    const q = query(collection(db, 'students'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studentData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
      setStudents(studentData);
      setStudentsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const habitTranslationMapping: Record<string, string> = {
    'Bangun Pagi': tHabits.bangunPagi.name,
    'Taat Beribadah': tHabits.taatBeribadah.name,
    'Rajin Olahraga': tHabits.rajinOlahraga.name,
    'Makan Sehat & Bergizi': tHabits.makanSehat.name,
    'Gemar Belajar': tHabits.gemarBelajar.name,
    'Bermasyarakat': tHabits.bermasyarakat.name,
    'Tidur Cepat': tHabits.tidurCepat.name,
  };


  const runAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setResults([]);

    const allAnalysisPromises = [];

    for (const student of students) {
      if (!student.habits) continue;
      for (const habit of student.habits) {
        const promise = getRecentHabitScores(student.id, habit.name)
          .then(scoreResponse => {
            if (scoreResponse.success && scoreResponse.scores) {
              return checkHabitDecline({
                studentId: student.id,
                habitName: habit.name,
                habitScores: scoreResponse.scores,
              }).then(aiResponse => {
                 if (aiResponse.success && aiResponse.data && aiResponse.data.shouldNotify) {
                    return {
                        ...aiResponse.data,
                        studentName: student.name,
                        habitName: habit.name,
                        scores: scoreResponse.scores,
                    } as AnalysisResult;
                 }
                 return null;
              });
            }
            return null;
          });
        allAnalysisPromises.push(promise);
      }
    }

    try {
        const analysisResults = await Promise.all(allAnalysisPromises);
        const filteredResults = analysisResults.filter((r): r is AnalysisResult => r !== null);
        setResults(filteredResults);
        setAnalysisTimestamp(new Date().toLocaleString('id-ID'));
    } catch (e) {
        console.error("Comprehensive analysis failed:", e);
        setError("Terjadi kesalahan tak terduga selama analisis.");
    }


    setIsLoading(false);
  };
  
  const hasResults = results.length > 0;
  const hasRun = analysisTimestamp !== null;

  return (
    <div className="space-y-6">
      <Button onClick={runAnalysis} disabled={isLoading || studentsLoading} size="lg">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menganalisis Seluruh Siswa...
          </>
        ) : (
          'Jalankan Analisis Menyeluruh'
        )}
      </Button>
      
      {studentsLoading && <p className="text-sm text-muted-foreground">Memuat data siswa...</p>}

      {error && (
         <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Analisis Gagal</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
      )}

      {hasRun && !isLoading && !hasResults && (
         <Alert variant="default" className="border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
            <CheckCircle className="h-4 w-4 !text-green-600 dark:!text-green-400" />
            <AlertTitle>Analisis Selesai</AlertTitle>
            <AlertDescription>Tidak ada siswa yang terdeteksi mengalami penurunan kebiasaan yang signifikan saat ini.</AlertDescription>
          </Alert>
      )}

      {hasResults && (
        <div className="space-y-4">
             <p className="text-sm text-muted-foreground">
                Analisis terakhir pada: {analysisTimestamp}. Ditemukan {results.length} kasus yang memerlukan perhatian.
            </p>
            <div className="border rounded-lg">
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Siswa</TableHead>
                        <TableHead>Kebiasaan</TableHead>
                        <TableHead>Skor Terakhir</TableHead>
                        <TableHead>Rekomendasi AI</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {results.map((res, index) => (
                        <TableRow key={`${res.studentName}-${res.habitName}-${index}`} className="bg-destructive/5 hover:bg-destructive/10">
                            <TableCell className="font-medium">{res.studentName}</TableCell>
                            <TableCell>{habitTranslationMapping[res.habitName] || res.habitName}</TableCell>
                            <TableCell>
                                <div className="flex gap-1">
                                    {res.scores.map((score, i) => (
                                        <Badge key={i} variant="destructive">{score}</Badge>
                                    ))}
                                </div>
                            </TableCell>
                            <TableCell className="text-destructive text-sm font-medium">{res.notificationMessage}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
      )}
    </div>
  );
}
