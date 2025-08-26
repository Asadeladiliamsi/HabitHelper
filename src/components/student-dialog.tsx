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
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';


interface StudentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: Omit<Student, 'id' | 'habits'>) => void;
  student: Student | null;
}

const formSchema = z.object({
  name: z.string().min(3, { message: 'Nama harus memiliki setidaknya 3 karakter.' }),
  class: z.string().min(1, { message: 'Kelas harus diisi.' }),
  avatar: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function StudentDialog({ isOpen, onOpenChange, onSave, student }: StudentDialogProps) {
  const { language } = useLanguage();
  const t = translations[language]?.studentDialog || translations.en.studentDialog;
  const [preview, setPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      class: '',
    }
  });

  const avatarFile = watch('avatar');

  useEffect(() => {
    if (isOpen) {
      if (student) {
        reset({ name: student.name, class: student.class });
        setPreview(student.avatarUrl);
      } else {
        reset({ name: '', class: '' });
        setPreview(null);
      }
    }
  }, [isOpen, student, reset]);
  
  useEffect(() => {
    if (avatarFile && avatarFile.length > 0) {
      const file = avatarFile[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [avatarFile]);


  const onSubmit = (data: FormValues) => {
    onSave({
      name: data.name,
      class: data.class,
      avatarUrl: preview || 'https://placehold.co/100x100.png',
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
                <Label htmlFor="avatar">Foto Profil</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={preview || ''} data-ai-hint="person portrait" />
                    <AvatarFallback>{student?.name.charAt(0) || 'S'}</AvatarFallback>
                  </Avatar>
                  <Input id="avatar" type="file" {...register('avatar')} accept="image/*" />
                </div>
              </div>
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
