'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search } from 'lucide-react';
import type { Student } from '@/lib/types';

interface StudentSearchDialogProps {
  students: Student[];
  selectedStudentId: string;
  onStudentSelect: (studentId: string) => void;
  placeholder: string;
  selectedStudentName: string;
}

export function StudentSearchDialog({
  students,
  onStudentSelect,
  placeholder,
  selectedStudentName
}: StudentSearchDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.nisn && student.nisn.includes(searchTerm))
  );

  const handleSelect = (studentId: string) => {
    onStudentSelect(studentId);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="flex gap-2">
            <Input
                readOnly
                value={selectedStudentName}
                placeholder={placeholder}
                className="flex-grow cursor-pointer"
            />
            <Button type="button" variant="outline">
                <Search className="h-4 w-4" />
                <span className="sr-only">Cari Siswa</span>
            </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Pilih Siswa</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari berdasarkan nama atau NISN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="max-h-[300px] overflow-auto border rounded-md">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>NISN</TableHead>
                <TableHead>Kelas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <TableRow
                    key={student.id}
                    onClick={() => handleSelect(student.id)}
                    className="cursor-pointer hover:bg-muted"
                  >
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.nisn}</TableCell>
                    <TableCell>{student.class}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Tidak ada hasil.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
