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
import { useEffect } from 'react';
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StudentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: Omit<Student, 'id' | 'habits' | 'avatarUrl'>) => void;
  student: Student | null;
  studentUsers: UserProfile[]; // Users with 'siswa' role
}

const formSchema = z.object({
  name: z.string(), // Now it will be auto-filled
  class: z.string().min(1, { message: 'Kelas harus diisi.' }),
  nisn: z.string().min(1, { message: 'NISN harus diisi.' }),
  email: z.string(), // Now it will be auto-filled
  linkedUserUid: z.string().min(1, { message: 'Akun siswa harus dipilih.' }),
});

type FormValues = z.infer<typeof formSchema>;

export function StudentDialog({ isOpen, onOpenChange, onSave, student, studentUsers }: StudentDialogProps) {
  const { language } = useLanguage();
  const t = translations[language]?.studentDialog || translations.en.studentDialog;
  const isEditMode = !!student;

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      class: '',
      nisn: '',
      email: '',
      linkedUserUid: '',
    }
  });

  const selectedUserUid = watch('linkedUserUid');

  useEffect(() => {
    if (isOpen) {
      if (student) {
        // Edit mode
        reset({ 
            name: student.name, 
            class: student.class, 
            nisn: student.nisn, 
            email: student.email,
            linkedUserUid: student.linkedUserUid || ''
        });
      } else {
        // Add mode
        reset({ name: '', class: '', nisn: '', email: '', linkedUserUid: '' });
      }
    }
  }, [isOpen, student, reset]);


  useEffect(() => {
    if (!isEditMode && selectedUserUid) {
        const selectedUser = studentUsers.find(u => u.uid === selectedUserUid);
        if (selectedUser) {
            setValue('name', selectedUser.name);
            setValue('email', selectedUser.email || '');
        }
    }
  }, [selectedUserUid, isEditMode, studentUsers, setValue]);


  const onSubmit = (data: FormValues) => {
    onSave({
      name: data.name,
      class: data.class,
      nisn: data.nisn,
      email: data.email,
      linkedUserUid: data.linkedUserUid
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
              {student ? t.editDescription : 'Pilih akun siswa yang sudah terdaftar, lalu lengkapi data NISN dan kelas.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            
            {!isEditMode && (
                 <div className="space-y-2">
                    <Label htmlFor="linkedUserUid">Akun Siswa</Label>
                     <Controller
                        control={control}
                        name="linkedUserUid"
                        render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger id="linkedUserUid">
                            <SelectValue placeholder="Pilih akun siswa..." />
                            </SelectTrigger>
                            <SelectContent>
                            {studentUsers.map((user) => (
                                <SelectItem key={user.uid} value={user.uid}>
                                    {user.name} ({user.email})
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        )}
                    />
                    {errors.linkedUserUid && <p className="text-sm text-destructive mt-1">{errors.linkedUserUid.message}</p>}
                </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">
                {t.name}
              </Label>
              <Input id="name" {...register('name')} readOnly={!isEditMode} className={isEditMode ? "" : "bg-muted/50 cursor-not-allowed"} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="email">
                Email Siswa
              </Label>
              <Input id="email" type="email" {...register('email')} readOnly={!isEditMode} className={isEditMode ? "" : "bg-muted/50 cursor-not-allowed"}/>
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
