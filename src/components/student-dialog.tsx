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
import { useLanguage } from '@/contexts/language-provider';
import { translations } from '@/lib/translations';
import { StudentUserSearchDialog } from './student-user-search-dialog';
import { checkNisnExists } from '@/app/actions';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';


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
  const [selectedUserName, setSelectedUserName] = useState('');
  
  const [isNisnChecking, setIsNisnChecking] = useState(false);
  const [nisnStatus, setNisnStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [nisnMessage, setNisnMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    getValues,
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
  const nisnValue = watch('nisn');

  useEffect(() => {
    // Reset NISN status when the NISN value changes
    setNisnStatus('idle');
    setNisnMessage(null);
  }, [nisnValue]);

  useEffect(() => {
    if (isOpen) {
      if (student) {
        // Edit mode
        reset({ 
            name: student.name, 
            class: student.class, 
            nisn: student.nisn || '', 
            email: student.email,
            linkedUserUid: student.linkedUserUid || ''
        });
        setSelectedUserName(student.name);
        // In edit mode, we can assume the initial NISN is valid for this student
        setNisnStatus('valid'); 
      } else {
        // Add mode
        reset({ name: '', class: '', nisn: '', email: '', linkedUserUid: '' });
        setSelectedUserName('');
        setNisnStatus('idle');
        setNisnMessage(null);
      }
    }
  }, [isOpen, student, reset]);


  useEffect(() => {
    const selectedUser = studentUsers.find(u => u.uid === selectedUserUid);
    if (selectedUser) {
        setValue('name', selectedUser.name);
        setValue('email', selectedUser.email || '');
        setSelectedUserName(selectedUser.name);
    }
  }, [selectedUserUid, studentUsers, setValue]);


  const handleCheckNisn = async () => {
    const nisn = getValues('nisn');
    if (!nisn) return;

    setIsNisnChecking(true);
    setNisnMessage(null);
    try {
      const result = await checkNisnExists(nisn, student ? student.id : null);
      if (result.exists) {
        setNisnStatus('invalid');
        setNisnMessage('NISN ini sudah digunakan oleh siswa lain.');
      } else {
        setNisnStatus('valid');
        setNisnMessage('NISN tersedia.');
      }
    } catch (error) {
      setNisnStatus('invalid');
      setNisnMessage('Gagal memeriksa NISN.');
    } finally {
      setIsNisnChecking(false);
    }
  };


  const onSubmit = (data: FormValues) => {
    if (nisnStatus !== 'valid') {
        alert("Mohon periksa ketersediaan NISN terlebih dahulu.");
        return;
    }
    onSave({
      name: data.name,
      class: data.class,
      nisn: data.nisn,
      email: data.email,
      linkedUserUid: data.linkedUserUid
    });
    onOpenChange(false);
  };

  const canSubmit = isValid && nisnStatus === 'valid';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] flex flex-col max-h-[90vh]">
        <DialogHeader>
            <DialogTitle>{student ? t.editTitle : t.addTitle}</DialogTitle>
            <DialogDescription>
              {student ? t.editDescription : 'Pilih akun siswa yang sudah terdaftar, lalu lengkapi data NISN dan kelas.'}
            </DialogDescription>
        </DialogHeader>
        
        <form id="student-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-6 -mr-6">
                <div className="space-y-4 py-4">
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
                        <div className="flex gap-2">
                            <Input id="nisn" {...register('nisn')} placeholder="Nomor Induk Siswa Nasional" />
                            <Button type="button" variant="secondary" onClick={handleCheckNisn} disabled={isNisnChecking || !nisnValue}>
                                {isNisnChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cek NISN"}
                            </Button>
                        </div>
                        {errors.nisn && <p className="text-sm text-destructive mt-1">{errors.nisn.message}</p>}
                        {nisnMessage && (
                            <p className={cn("text-sm", nisnStatus === 'valid' ? 'text-green-600' : 'text-destructive')}>
                                {nisnMessage}
                            </p>
                        )}
                    </div>
                </div>
            </ScrollArea>
        </form>
        
        <DialogFooter className="mt-auto pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t.cancel}</Button>
            <Button type="submit" form="student-form" disabled={!canSubmit}>{t.save}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
