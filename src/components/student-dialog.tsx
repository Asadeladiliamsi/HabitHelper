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
import { StudentUserSearchDialog } from './student-user-search-dialog';

const formSchema = z.object({
  name: z.string(), // Auto-filled
  class: z.string().optional(), // Class is now optional for the teacher/admin
  nisn: z.string(), // Auto-filled
  email: z.string(), // Auto-filled
  linkedUserUid: z.string().min(1, { message: 'Akun siswa harus dipilih.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface StudentDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (studentData: Omit<Student, 'id' | 'habits' | 'avatarUrl'>) => void;
    student: Student | null;
    studentUsers: UserProfile[];
}


export function StudentDialog({ isOpen, onOpenChange, onSave, student, studentUsers }: StudentDialogProps) {
  const language = 'id';
  const t = translations[language]?.studentDialog || translations.en.studentDialog;
  const isEditMode = !!student;
  const [selectedUserName, setSelectedUserName] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
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
        // Edit mode: Fill form with existing student data
        reset({ 
            name: student.name, 
            class: student.class || '', 
            nisn: student.nisn || '', 
            email: student.email,
            linkedUserUid: student.linkedUserUid || ''
        });
        setSelectedUserName(student.name);
      } else {
        // Add mode: Reset form
        reset({ name: '', class: '', nisn: '', email: '', linkedUserUid: '' });
        setSelectedUserName('');
      }
    }
  }, [isOpen, student, reset]);


  useEffect(() => {
    const selectedUser = studentUsers?.find(u => u.uid === selectedUserUid);
    if (selectedUser) {
        setValue('name', selectedUser.name);
        setValue('email', selectedUser.email || '');
        if (!isEditMode) {
          setValue('nisn', selectedUser.nisn || '');
        }
        setSelectedUserName(selectedUser.name);
    }
  }, [selectedUserUid, studentUsers, setValue, isEditMode]);


  const onSubmit = (data: FormValues) => {
    onSave({
      name: data.name,
      // When saving, ensure class is an empty string if not provided
      class: data.class || '', 
      nisn: data.nisn,
      email: data.email,
      linkedUserUid: data.linkedUserUid
    });
    onOpenChange(false);
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] flex flex-col max-h-[90vh]">
        <DialogHeader className="flex-shrink-0">
            <DialogTitle>{student ? t.editTitle : t.addTitle}</DialogTitle>
            <DialogDescription>
              {student ? "Ubah data siswa yang sudah ada." : 'Pilih akun siswa yang sudah terdaftar untuk menautkannya ke sistem. Siswa akan memilih kelasnya sendiri setelah login.'}
            </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto pr-2 -mr-4">
             <form id="student-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {!isEditMode && (
                    <div className="space-y-2">
                        <Label htmlFor="linkedUserUid">Akun Siswa</Label>
                        <Controller
                            control={control}
                            name="linkedUserUid"
                            render={({ field }) => (
                            <StudentUserSearchDialog
                                users={studentUsers}
                                selectedUserId={field.value}
                                onUserSelect={(userId) => field.onChange(userId)}
                                placeholder="Cari & pilih akun siswa..."
                                selectedUserName={selectedUserName}
                            />
                            )}
                        />
                        {errors.linkedUserUid && <p className="text-sm text-destructive mt-1">{errors.linkedUserUid.message}</p>}
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="name">
                        {t.name}
                    </Label>
                    <Input id="name" {...register('name')} readOnly className="bg-muted/50 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">
                        Email Siswa
                    </Label>
                    <Input id="email" type="email" {...register('email')} readOnly className="bg-muted/50 cursor-not-allowed"/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="nisn">
                        NISN
                    </Label>
                    <Input id="nisn" {...register('nisn')} placeholder="Nomor Induk Siswa Nasional" readOnly className="bg-muted/50 cursor-not-allowed" />
                    {errors.nisn && <p className="text-sm text-destructive mt-1">{errors.nisn.message}</p>}
                </div>

                {/* Only show class input in edit mode, and make it read-only as students choose it */}
                {isEditMode && (
                    <div className="space-y-2">
                        <Label htmlFor="class">
                            {t.class}
                        </Label>
                        <Input id="class" {...register('class')} readOnly className="bg-muted/50 cursor-not-allowed" placeholder="Siswa belum memilih kelas" />
                    </div>
                )}
            </form>
        </div>
        
        <DialogFooter className="flex-shrink-0 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t.cancel}</Button>
            <Button type="submit" form="student-form" disabled={!isValid && !isEditMode}>{isEditMode ? 'Simpan' : t.save}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
