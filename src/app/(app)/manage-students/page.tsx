'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import type { Student } from '@/lib/types';
import { StudentDialog } from '@/components/student-dialog';
import { useStudent } from '@/contexts/student-context';
import { HABIT_NAMES } from '@/lib/types';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';


export default function ManageStudentsPage() {
  const { students, addStudent, updateStudent, deleteStudent } = useStudent();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const { language } = useLanguage();
  const t = translations[language]?.manageStudentsPage || translations.en.manageStudentsPage;

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setDialogOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setDialogOpen(true);
  };
  
  const handleDialogSave = (studentData: Omit<Student, 'id' | 'habits' | 'avatarUrl'>) => {
    if (selectedStudent) {
      // Update existing student
      updateStudent(selectedStudent.id, studentData);
    } else {
      // Add new student
      const newStudent: Omit<Student, 'id'> = {
        habits: HABIT_NAMES.map((name, index) => ({
          id: `habit-${index + 1}`,
          name: name,
          score: 8, // Default score
        })),
        avatarUrl: `https://placehold.co/100x100.png?text=${studentData.name.charAt(0)}`,
        ...studentData,
      };
      addStudent(newStudent);
    }
    setDialogOpen(false);
  };

  const handleDeleteStudent = (studentId: string) => {
    deleteStudent(studentId);
  }

  return (
    <>
      <StudentDialog 
        isOpen={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onSave={handleDialogSave}
        student={selectedStudent} 
      />
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <header>
            <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
            <p className="text-muted-foreground">
              {t.description}
            </p>
          </header>
          <Button onClick={handleAddStudent}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t.addNewStudent}
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t.studentList}</CardTitle>
            <CardDescription>{t.totalStudents1} {students.length} {t.totalStudents2}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.student}</TableHead>
                  <TableHead>{t.class}</TableHead>
                  <TableHead className="text-right">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
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
      </div>
    </>
  );
}
