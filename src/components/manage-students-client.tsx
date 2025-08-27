'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Pencil, Trash2, Search, Link2 } from 'lucide-react';
import type { Student, UserProfile } from '@/lib/types';
import { StudentDialog } from '@/components/student-dialog';
import { useStudent } from '@/contexts/student-context';
import { HABIT_NAMES } from '@/lib/types';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { LinkParentDialog } from './link-parent-dialog';

interface ManageStudentsClientProps {
  parentUsers: UserProfile[];
}

export function ManageStudentsClient({ parentUsers }: ManageStudentsClientProps) {
  const { students, addStudent, updateStudent, deleteStudent, linkParentToStudent } = useStudent();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [linkParentDialogOpen, setLinkParentDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { language } = useLanguage();
  const { toast } = useToast();
  const t = translations[language]?.manageStudentsPage || translations.en.manageStudentsPage;

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
  
  const handleDialogSave = async (studentData: Omit<Student, 'id' | 'habits' | 'avatarUrl'>) => {
    try {
      if (selectedStudent) {
        // Update existing student
        await updateStudent(selectedStudent.id, studentData);
      } else {
        // Add new student
        const newStudent: Omit<Student, 'id'> = {
          habits: HABIT_NAMES.map((name, index) => ({
            id: `habit-${index + 1}`,
            name: name,
            score: 4, // Default score
          })),
          avatarUrl: `https://placehold.co/100x100.png?text=${studentData.name.charAt(0)}`,
          ...studentData,
        };
        await addStudent(newStudent);
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
  
  const handleLinkParentSave = async (studentId: string, parentId: string) => {
    const parent = parentUsers.find(u => u.uid === parentId);
    if (parent) {
      await linkParentToStudent(studentId, parent.uid, parent.name);
      toast({
        title: "Sukses",
        description: `Akun orang tua ${parent.name} berhasil ditautkan.`,
      });
    }
    setLinkParentDialogOpen(false);
  };

  const handleDeleteStudent = (studentId: string) => {
    deleteStudent(studentId);
  }

  const filteredStudents = students.filter(student => {
    const term = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(term) ||
      (student.nisn && student.nisn.toLowerCase().includes(term)) ||
      (student.email && student.email.toLowerCase().includes(term))
    );
  });

  return (
    <>
      <StudentDialog 
        isOpen={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onSave={handleDialogSave}
        student={selectedStudent} 
      />
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
                        <span className="font-medium">{student.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                        <span className="font-mono text-xs">{student.nisn}</span>
                    </TableCell>
                    <TableCell>
                        {student.parentName ? (
                            <Badge variant="outline">{student.parentName}</Badge>
                        ) : (
                            <span className="text-xs text-muted-foreground">Belum ditautkan</span>
                        )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{student.class}</Badge>
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
                            {t.edit}
                          </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleOpenLinkParentDialog(student)}>
                            <Link2 className="mr-2 h-4 w-4" />
                            Tautkan Orang Tua
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteStudent(student.id)}
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
