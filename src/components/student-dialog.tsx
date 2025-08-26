
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Student } from '@/lib/types';
import { useEffect } from 'react';

interface StudentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: Omit<Student, 'id' | 'avatarUrl' | 'habits'>) => void;
  student: Student | null;
}

const formSchema = z.object({
  name: z.string().min(3, { message: 'Nama harus memiliki setidaknya 3 karakter.' }),
  class: z.string().min(1, { message: 'Kelas harus diisi.' }),
});

type FormValues = z.infer<typeof formSchema>;

export function StudentDialog({ isOpen, onOpenChange, onSave, student }: StudentDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (student) {
        reset({ name: student.name, class: student.class });
      } else {
        reset({ name: '', class: '' });
      }
    }
  }, [isOpen, student, reset]);


  const onSubmit = (data: FormValues) => {
    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{student ? 'Edit Siswa' : 'Tambah Siswa Baru'}</DialogTitle>
            <DialogDescription>
              {student ? 'Ubah detail siswa di bawah ini.' : 'Isi detail untuk siswa baru di bawah ini.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nama
              </Label>
              <div className="col-span-3">
                <Input id="name" {...register('name')} className="w-full" />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="class" className="text-right">
                Kelas
              </Label>
               <div className="col-span-3">
                <Input id="class" {...register('class')} className="w-full" />
                {errors.class && <p className="text-sm text-destructive mt-1">{errors.class.message}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit">Simpan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
