'use client';

import { useForm, Controller } from 'react-hook-form';
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
import type { Student, UserProfile } from '@/lib/types';
import { useEffect, useState } from 'react';
import { translations } from '@/lib/translations';

// NISN is now required when adding a student through this dialog.
const formSchema = z.object({
  name: z.string().min(3, { message: 'Nama harus diisi.'}),
  class: z.string().optional(),
  nisn: z.string().min(1, { message: 'NISN harus diisi.' }),
  email: z.string().email({ message: 'Email tidak valid.'}).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

interface StudentDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (studentData: Omit<Student, 'id' | 'habits' | 'avatarUrl' | 'linkedUserUid'>) => void;
    student: Student | null;
}


export function StudentDialog({ isOpen, onOpenChange, onSave, student }: StudentDialogProps) {
  const language = 'id';
  const t = translations[language]?.studentDialog || translations.en.studentDialog;
  const isEditMode = !!student;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      class: '',
      nisn: '',
      email: '',
    }
  });


  useEffect(() => {
    if (isOpen) {
      if (student) {
        // Edit mode: Fill form with existing student data
        reset({ 
            name: student.name, 
            class: student.class || '', 
            nisn: student.nisn || '', 
            email: student.email || '',
        });
      } else {
        // Add mode: Reset form
        reset({ name: '', class: '', nisn: '', email: '' });
      }
    }
  }, [isOpen, student, reset]);

  const onSubmit = (data: FormValues) => {
    // linkedUserUid is not managed here anymore.
    onSave({
      name: data.name,
      class: data.class || '', 
      nisn: data.nisn,
      email: data.email || '',
    });
    onOpenChange(false);
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] flex flex-col max-h-[90vh]">
        <DialogHeader className="flex-shrink-0">
            <DialogTitle>{student ? t.editTitle : t.addTitle}</DialogTitle>
            <DialogDescription>
              {student ? "Ubah data siswa yang sudah ada." : 'Masukkan data siswa baru. Siswa dapat menautkan akun mereka sendiri nanti menggunakan NISN.'}
            </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto pr-2 -mr-4">
             <form id="student-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">
                        {t.name}
                    </Label>
                    <Input id="name" {...register('name')} placeholder="Nama lengkap siswa..."/>
                     {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="nisn">
                        NISN
                    </Label>
                    <Input id="nisn" {...register('nisn')} placeholder="Nomor Induk Siswa Nasional" />
                    {errors.nisn && <p className="text-sm text-destructive mt-1">{errors.nisn.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">
                        Email Siswa (Opsional)
                    </Label>
                    <Input id="email" type="email" {...register('email')} placeholder="email@siswa.id" />
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="class">
                        {t.class}
                    </Label>
                    <Input id="class" {...register('class')} placeholder="Contoh: 7 Ruang 1" />
                </div>
            </form>
        </div>
        
        <DialogFooter className="flex-shrink-0 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t.cancel}</Button>
            <Button type="submit" form="student-form" disabled={!isValid}>{t.save}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
