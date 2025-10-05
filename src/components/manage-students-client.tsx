'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Loader2, MoreHorizontal, PlusCircle, Pencil, Trash2, Search, Link2, UserCheck } from 'lucide-react';
import type { Student, UserProfile, Habit } from '@/lib/types';
import { StudentDialog } from '@/components/student-dialog';
import { translations } from '@/lib/translations';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { LinkParentDialog } from './link-parent-dialog';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, serverTimestamp, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { HABIT_DEFINITIONS } from '@/lib/types';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

export function ManageStudentsClient() {
  const [students, setStudents] = useState<Student[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [linkParentDialogOpen, setLinkParentDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const language = 'id';
  const { toast } = useToast();
  const t = translations[language]?.manageStudentsPage || translations.en.manageStudentsPage;

  useEffect(() => {
    setLoading(true);
    const studentsQuery = query(collection(db, 'students'));
    const usersQuery = query(collection(db, 'users'));

    const unsubStudents = onSnapshot(studentsQuery, 
      (snapshot) => {
        const studentData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
        setStudents(studentData);
        if (users.length > 0) setLoading(false);
      },
      (error) => {
        const permissionError = new FirestorePermissionError({
          path: 'students',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
      }
    );

    const unsubUsers = onSnapshot(usersQuery,
      (snapshot) => {
        const userData = snapshot.docs.map(doc => doc.data() as UserProfile);
        setUsers(userData);
        if (students.length > 0 || snapshot.docs.length > 0) setLoading(false);
      },
      (error) => {
        const permissionError = new FirestorePermissionError({
          path: 'users',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
      }
    );

    return () => {
      unsubStudents();
      unsubUsers();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setDialogOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setDialogOpen(true);
  };
  
  const handleOpenLinkParentDialog = (student: Student) => {
    setSelectedStudent(student);
    setLinkParentDialogOpen(true);
  };
  
  const addStudent = async (newStudentData: Omit<Student, 'id' | 'habits' | 'avatarUrl' | 'linkedUserUid'>) => {
    const nisnQuery = query(collection(db, 'students'), where('nisn', '==', newStudentData.nisn));
    const nisnSnapshot = await getDocs(nisnQuery);
    if (!nisnSnapshot.empty && newStudentData.nisn) {
      throw new Error(`NISN ${newStudentData.nisn} sudah digunakan oleh siswa lain.`);
    }

    const initialHabits: Habit[] = Object.entries(HABIT_DEFINITIONS).map(([habitName, subHabitNames], habitIndex) => ({
      id: `${habitIndex + 1}`,
      name: habitName,
      subHabits: subHabitNames.map((subHabitName, subHabitIndex) => ({
        id: `${habitIndex + 1}-${subHabitIndex + 1}`,
        name: subHabitName,
        score: 0, 
      })),
    }));
    
    const finalData = {
      ...newStudentData,
      avatarUrl: `https://avatar.vercel.sh/${newStudentData.nisn}.png`, // Generate avatar from NISN
      habits: initialHabits,
      createdAt: serverTimestamp(),
      lockedDates: [],
    };

    addDoc(collection(db, 'students'), finalData)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: 'students',
          operation: 'create',
          requestResourceData: finalData,
        });
        errorEmitter.emit('permission-error', permissionError);
        // Throw a user-facing error to be caught by handleDialogSave
        throw new Error("Gagal menambahkan siswa karena masalah izin.");
      });
  };

  const updateStudent = async (studentId: string, updatedData: Partial<Omit<Student, 'id' | 'habits' | 'avatarUrl' | 'linkedUserUid'>>) => {
     if (updatedData.nisn) {
      const q = query(collection(db, 'students'), where('nisn', '==', updatedData.nisn));
      const querySnapshot = await getDocs(q);
      const isDuplicate = !querySnapshot.empty && querySnapshot.docs.some(doc => doc.id !== studentId);
      if (isDuplicate) {
        throw new Error(`NISN ${updatedData.nisn} sudah digunakan.`);
      }
    }
    
    const studentDocRef = doc(db, 'students', studentId);
    const finalData = { ...updatedData, updatedAt: serverTimestamp() };
    
    updateDoc(studentDocRef, finalData)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: studentDocRef.path,
          operation: 'update',
          requestResourceData: finalData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw new Error("Gagal memperbarui data siswa karena masalah izin.");
    });
  }

  const deleteStudent = async (studentId: string) => {
    const studentDocRef = doc(db, 'students', studentId);
    
    deleteDoc(studentDocRef)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: studentDocRef.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
       toast({
        variant: "destructive",
        title: "Gagal Menghapus",
        description: "Tidak dapat menghapus siswa karena masalah izin.",
      });
    });
  };
  
  const linkParentToStudent = async (studentId: string, parentId: string, parentName: string) => {
    const studentDocRef = doc(db, 'students', studentId);
    const updateData = { parentId, parentName };

    updateDoc(studentDocRef, updateData)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: studentDocRef.path,
        operation: 'update',
        requestResourceData: updateData,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw new Error("Gagal menautkan orang tua karena masalah izin.");
    });
  };


  const handleDialogSave = async (studentData: Omit<Student, 'id' | 'habits' | 'avatarUrl' | 'linkedUserUid'>) => {
    try {
      if (selectedStudent) {
        await updateStudent(selectedStudent.id, studentData);
         toast({ title: "Sukses", description: "Data siswa berhasil diperbarui." });
      } else {
        await addStudent(studentData);
        toast({ title: "Sukses", description: `Siswa ${studentData.name} berhasil ditambahkan.` });
      }
      setDialogOpen(false);
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Gagal Menyimpan",
        description: error.message,
      });
    }
  };
  
  const parentUsers = users.filter(u => u.role === 'orangtua');

  const handleLinkParentSave = async (studentId: string, parentId: string) => {
    const parent = parentUsers.find(u => u.uid === parentId);
    if (parent) {
      try {
        await linkParentToStudent(studentId, parent.uid, parent.name);
        toast({
          title: "Sukses",
          description: `Akun orang tua ${parent.name} berhasil ditautkan.`,
        });
        setLinkParentDialogOpen(false);
      } catch (error: any) {
         toast({
            variant: "destructive",
            title: "Gagal Menautkan",
            description: error.message,
          });
      }
    }
  };

  const handleDeleteStudent = (student: Student) => {
    // You might want to add a confirmation dialog here
    deleteStudent(student.id).then(() => {
        toast({
            title: "Siswa Dihapus",
            description: `Data untuk ${student.name} telah dihapus.`,
        });
    });
  }

  const filteredStudents = students.filter(student => {
    const term = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(term) ||
      (student.nisn && student.nisn.toLowerCase().includes(term)) ||
      (student.email && student.email.toLowerCase().includes(term))
    );
  });
  
  const linkedUserUids = new Set(students.map(s => s.linkedUserUid).filter(Boolean));
  const unlinkedStudentUsers = users.filter(user => user.role === 'siswa' && !linkedUserUids.has(user.uid));


  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {dialogOpen && (
        <StudentDialog 
          isOpen={dialogOpen} 
          onOpenChange={setDialogOpen} 
          onSave={handleDialogSave}
          student={selectedStudent} 
        />
      )}
      {selectedStudent && (
        <LinkParentDialog
            isOpen={linkParentDialogOpen}
            onOpenChange={setLinkParentDialogOpen}
            onSave={handleLinkParentSave}
            student={selectedStudent}
            parents={parentUsers}
        />
      )}
        <Card>
          <CardHeader>
             <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle>{t.studentList}</CardTitle>
                    <CardDescription>{t.totalStudents1} {filteredStudents.length} {t.totalStudents2}</CardDescription>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Cari siswa..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleAddStudent} className="w-full sm:w-auto">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {t.addNewStudent}
                    </Button>
                </div>
             </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.student}</TableHead>
                  <TableHead>NISN</TableHead>
                  <TableHead>Status Akun</TableHead>
                  <TableHead>Orang Tua</TableHead>
                  <TableHead>{t.class}</TableHead>
                  <TableHead className="text-right">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={student.avatarUrl} alt={student.name} data-ai-hint="person portrait" />
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-medium">{student.name}</span>
                            <span className="text-xs text-muted-foreground">{student.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                        <span className="font-mono text-xs">{student.nisn}</span>
                    </TableCell>
                    <TableCell>
                        {student.linkedUserUid ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                <UserCheck className="mr-1 h-3 w-3" />
                                Tertaut
                            </Badge>
                        ) : (
                            <Badge variant="secondary">Belum Tertaut</Badge>
                        )}
                    </TableCell>
                    <TableCell>
                        {student.parentName ? (
                            <Badge variant="outline">{student.parentName}</Badge>
                        ) : (
                            <span className="text-xs text-muted-foreground">Belum ada</span>
                        )}
                    </TableCell>
                    <TableCell>
                      {student.class ? (
                        <Badge variant="secondary">{student.class}</Badge>
                      ) : (
                        <Badge variant="destructive">Belum Pilih</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">{t.menu}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditStudent(student)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Ubah Detail Siswa
                          </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleOpenLinkParentDialog(student)}>
                            <Link2 className="mr-2 h-4 w-4" />
                            Tautkan Akun Orang Tua
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteStudent(student)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t.delete}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </>
  );
}
