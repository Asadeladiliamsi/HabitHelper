'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Student, UserProfile } from '@/lib/types';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableRow } from './ui/table';
import { Search } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface LinkParentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (studentId: string, parentId: string) => void;
  student: Student;
  parents: UserProfile[];
}

export function LinkParentDialog({
  isOpen,
  onOpenChange,
  onSave,
  student,
  parents,
}: LinkParentDialogProps) {
  const [selectedParentId, setSelectedParentId] = useState<string | null>(student.parentId || null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedParentId(student.parentId || null);
      setSearchTerm('');
    }
  }, [isOpen, student]);

  const handleSave = () => {
    if (selectedParentId) {
      onSave(student.id, selectedParentId);
    }
  };

  const filteredParents = parents.filter(parent =>
    parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (parent.email && parent.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const selectedParentName = parents.find(p => p.uid === selectedParentId)?.name || '';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tautkan Orang Tua</DialogTitle>
          <DialogDescription>
            Pilih akun orang tua untuk ditautkan ke siswa{' '}
            <span className="font-semibold">{student.name}</span>.
            {selectedParentId && <p className="font-semibold text-foreground pt-2">Terpilih: {selectedParentName}</p>}
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Cari nama atau email orang tua..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
            />
        </div>
        
        <ScrollArea className="h-60 rounded-md border">
           <Table>
                <TableBody>
                {filteredParents.length > 0 ? (
                    filteredParents.map((parent) => (
                    <TableRow
                        key={parent.uid}
                        onClick={() => setSelectedParentId(parent.uid)}
                        className={`cursor-pointer ${selectedParentId === parent.uid ? 'bg-accent text-accent-foreground' : ''}`}
                    >
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="font-medium">{parent.name}</span>
                                <span className="text-xs text-muted-foreground">{parent.email}</span>
                            </div>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={1} className="h-24 text-center">
                        Tidak ada orang tua ditemukan.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </ScrollArea>
       
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button type="button" onClick={handleSave} disabled={!selectedParentId}>
            Simpan Tautan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
