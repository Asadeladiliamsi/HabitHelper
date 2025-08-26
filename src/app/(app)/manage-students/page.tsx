
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { mockStudents } from '@/lib/mock-data';
import type { Student } from '@/lib/types';
import { StudentDialog } from '@/components/student-dialog';

export default function ManageStudentsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

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
      // Logic to update student
      console.log('Updating student:', selectedStudent.id, studentData);
    } else {
      // Logic to add new student
      console.log('Adding new student:', studentData);
    }
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
            <h1 className="text-3xl font-bold tracking-tight">Manajemen Siswa</h1>
            <p className="text-muted-foreground">
              Tambah, edit, atau hapus data siswa di sini.
            </p>
          </header>
          <Button onClick={handleAddStudent}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Siswa Baru
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Daftar Siswa</CardTitle>
            <CardDescription>Total {mockStudents.length} siswa terdaftar dalam sistem.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Siswa</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockStudents.map((student) => (
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
                            <span className="sr-only">Menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditStudent(student)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
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
