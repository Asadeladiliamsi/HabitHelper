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
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';

interface StudentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: Omit<Student, 'id' | 'habits' | 'avatarUrl'>) => void;
  student: Student | null;
}

const formSchema = z.object({
  name: z.string().min(3, { message: 'Nama harus memiliki setidaknya 3 karakter.' }),
  class: z.string().min(1, { message: 'Kelas harus diisi.' }),
  nisn: z.string().min(1, { message: 'NISN harus diisi.' }),
});

type FormValues = z.infer<typeof formSchema>;

export function StudentDialog({ isOpen, onOpenChange, onSave, student }: StudentDialogProps) {
  const { language } = useLanguage();
  const t = translations[language]?.studentDialog || translations.en.studentDialog;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      class: '',
      nisn: '',
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (student) {
        reset({ name: student.name, class: student.class, nisn: student.nisn });
      } else {
        reset({ name: '', class: '', nisn: '' });
      }
    }
  }, [isOpen, student, reset]);

  const onSubmit = (data: FormValues) => {
    onSave({
      name: data.name,
      class: data.class,
      nisn: data.nisn,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{student ? t.editTitle : t.addTitle}</DialogTitle>
            <DialogDescription>
              {student ? t.editDescription : t.addDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {t.name}
              </Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="class">
                {t.class}
              </Label>
              <Input id="class" {...register('class')} />
              {errors.class && <p className="text-sm text-destructive mt-1">{errors.class.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nisn">
                NISN
              </Label>
              <Input id="nisn" {...register('nisn')} placeholder="Nomor Induk Siswa Nasional" />
              {errors.nisn && <p className="text-sm text-destructive mt-1">{errors.nisn.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t.cancel}</Button>
            <Button type="submit">{t.save}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
