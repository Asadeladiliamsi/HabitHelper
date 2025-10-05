'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, MoreHorizontal, Pencil, Trash2, Search, KeyRound } from 'lucide-react';
import type { UserProfile, UserRole } from '@/lib/types';
import { useEffect, useState } from 'react';
import { UserEditDialog } from './user-edit-dialog';
import { UserDeleteDialog } from './user-delete-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ManageStudentsClient } from './manage-students-client';
import { ManageClassesClient } from './manage-classes-client';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { collection, onSnapshot, updateDoc, doc, deleteDoc, getDoc, setDoc, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

function UserTable({
  users,
  title,
  description,
  onEdit,
  onRoleChange,
  onDelete,
  getRoleBadgeVariant,
}: {
  users: UserProfile[];
  title: string;
  description: string;
  onEdit: (user: UserProfile) => void;
  onRoleChange: (uid: string, role: UserRole) => void;
  onDelete: (user: UserProfile) => void;
  getRoleBadgeVariant: (role: UserRole) => 'destructive' | 'default' | 'secondary' | 'outline';
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Peran</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.uid}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(user)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Ubah Nama
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onRoleChange(user.uid, 'admin')}
                      >
                        Jadikan Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onRoleChange(user.uid, 'guru')}
                      >
                        Jadikan Guru
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onRoleChange(user.uid, 'siswa')}
                      >
                        Jadikan Siswa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          onRoleChange(user.uid, 'orangtua')
                        }
                      >
                        Jadikan Orang Tua
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(user)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus Pengguna
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TeacherCodeManager() {
    const [teacherCode, setTeacherCode] = useState<string | null>(null);
    const [code, setCode] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

     const fetchTeacherCode = async () => {
        const settingsDocRef = doc(db, 'app_settings', 'registration');
        const docSnap = await getDoc(settingsDocRef);
        const code = docSnap.exists() ? docSnap.data().teacherCode : '';
        setTeacherCode(code);
        setCode(code);
    };

    useEffect(() => {
        fetchTeacherCode();
    }, []);


    const handleSave = async () => {
        setIsSaving(true);
        try {
            const settingsDocRef = doc(db, 'app_settings', 'registration');
            await setDoc(settingsDocRef, { teacherCode: code });
            setTeacherCode(code);
            toast({
                title: 'Sukses',
                description: 'Kode registrasi guru berhasil diperbarui.',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Gagal',
                description: `Gagal menyimpan kode: ${error.message}`,
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (teacherCode === null) {
        return <Loader2 className="h-6 w-6 animate-spin" />;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5" />
                    Manajemen Kode Registrasi Guru
                </CardTitle>
                <CardDescription>
                    Atur kode rahasia yang harus dimasukkan oleh pengguna saat mendaftar sebagai guru.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center space-x-2">
                    <Input 
                        value={code} 
                        onChange={(e) => setCode(e.target.value)} 
                        placeholder="Masukkan kode..." 
                    />
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Simpan Kode
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    Pastikan untuk memberikan kode ini hanya kepada guru yang berwenang.
                </p>
            </CardContent>
        </Card>
    );
}


export function AdminDashboardClient() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

   useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => doc.data() as UserProfile);
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error("Failed to fetch users:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRoleChange = async (uid: string, role: UserRole) => {
     const userDocRef = doc(db, 'users', uid);
     await updateDoc(userDocRef, { role });
  };

  const handleSaveName = async (uid: string, newName: string) => {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, { name: newName });
    setEditingUser(null);
  };

  const handleDeleteConfirm = async (uid: string) => {
    const userDocRef = doc(db, 'users', uid);
    await deleteDoc(userDocRef);
    setDeletingUser(null);
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'guru':
        return 'default';
      case 'siswa':
        return 'secondary';
      case 'orangtua':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const teacherUsers = filteredUsers.filter(user => user.role === 'guru');


  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {editingUser && (
        <UserEditDialog
          user={editingUser}
          isOpen={!!editingUser}
          onOpenChange={() => setEditingUser(null)}
          onSave={handleSaveName}
        />
      )}
      {deletingUser && (
        <UserDeleteDialog
          user={deletingUser}
          isOpen={!!deletingUser}
          onOpenChange={() => setDeletingUser(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">
            Dasbor Admin
          </h1>
          <p className="text-muted-foreground">
            Kelola pengguna, siswa, dan kelas dari satu tempat.
          </p>
        </header>

         <Tabs defaultValue="manage-users">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="manage-users">Manajemen Pengguna</TabsTrigger>
                <TabsTrigger value="manage-teachers">Manajemen Guru</TabsTrigger>
                <TabsTrigger value="manage-students">Manajemen Siswa</TabsTrigger>
                <TabsTrigger value="manage-classes">Manajemen Kelas</TabsTrigger>
            </TabsList>
            <TabsContent value="manage-users" className="mt-6 space-y-6">
                <div className="relative sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari semua pengguna..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                 <UserTable 
                    users={filteredUsers}
                    title="Daftar Semua Pengguna"
                    description={`Menampilkan ${filteredUsers.length} dari ${users.length} total pengguna.`}
                    onEdit={setEditingUser}
                    onRoleChange={handleRoleChange}
                    onDelete={setDeletingUser}
                    getRoleBadgeVariant={getRoleBadgeVariant}
                />
            </TabsContent>
             <TabsContent value="manage-teachers" className="mt-6 space-y-6">
                <TeacherCodeManager />
                 <div className="relative sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari guru..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <UserTable 
                    users={teacherUsers}
                    title="Daftar Guru"
                    description={`Menampilkan ${teacherUsers.length} guru.`}
                    onEdit={setEditingUser}
                    onRoleChange={handleRoleChange}
                    onDelete={setDeletingUser}
                    getRoleBadgeVariant={getRoleBadgeVariant}
                />
            </TabsContent>
             <TabsContent value="manage-students" className="mt-6">
                <ManageStudentsClient />
            </TabsContent>
            <TabsContent value="manage-classes" className="mt-6">
                <ManageClassesClient />
            </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
