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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import type { Student, UserProfile } from '@/lib/types';

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

  useEffect(() => {
    if (isOpen) {
      setSelectedParentId(student.parentId || null);
    }
  }, [isOpen, student]);

  const handleSave = () => {
    if (selectedParentId) {
      onSave(student.id, selectedParentId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tautkan Orang Tua</DialogTitle>
          <DialogDescription>
            Pilih akun orang tua untuk ditautkan ke siswa{' '}
            <span className="font-semibold">{student.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <Command className="rounded-lg border shadow-md">
          <CommandInput placeholder="Cari nama orang tua..." />
          <CommandList>
            <CommandEmpty>Tidak ada orang tua ditemukan.</CommandEmpty>
            <CommandGroup>
              {parents.map((parent) => (
                <CommandItem
                  key={parent.uid}
                  value={parent.name}
                  onSelect={() => {
                    setSelectedParentId(parent.uid);
                  }}
                  className={`cursor-pointer ${selectedParentId === parent.uid ? 'bg-accent text-accent-foreground' : ''}`}
                >
                  <div className="flex flex-col">
                    <span>{parent.name}</span>
                    <span className="text-xs text-muted-foreground">{parent.email}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
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
