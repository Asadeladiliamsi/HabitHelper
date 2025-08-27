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
import { useUser } from '@/contexts/user-context';
import { Loader2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { UserProfile, UserRole } from '@/lib/types';
import { useState } from 'react';
import { UserEditDialog } from './user-edit-dialog';
import { UserDeleteDialog } from './user-delete-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ManageStudentsClient } from './manage-students-client';

export function AdminDashboardClient() {
  const { users, loading, updateUserRole, updateUserName, deleteUser } =
    useUser();
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);

  const handleRoleChange = (uid: string, role: UserRole) => {
    updateUserRole(uid, role);
  };

  const handleSaveName = (uid: string, newName: string) => {
    updateUserName(uid, newName);
    setEditingUser(null);
  };

  const handleDeleteConfirm = (uid: string) => {
    deleteUser(uid);
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

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const parentUsers = users.filter(u => u.role === 'orangtua');

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
            Kelola pengguna dan data siswa dari satu tempat.
          </p>
        </header>

         <Tabs defaultValue="manage-users">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manage-users">Manajemen Pengguna</TabsTrigger>
                <TabsTrigger value="manage-students">Manajemen Siswa</TabsTrigger>
            </TabsList>
            <TabsContent value="manage-users" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Daftar Pengguna</CardTitle>
                    <CardDescription>
                      Total {users.length} pengguna terdaftar di dalam sistem.
                    </CardDescription>
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
                                  <DropdownMenuItem onClick={() => setEditingUser(user)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Ubah Nama
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleRoleChange(user.uid, 'admin')}
                                  >
                                    Jadikan Admin
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleRoleChange(user.uid, 'guru')}
                                  >
                                    Jadikan Guru
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleRoleChange(user.uid, 'siswa')}
                                  >
                                    Jadikan Siswa
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleRoleChange(user.uid, 'orangtua')
                                    }
                                  >
                                    Jadikan Orang Tua
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setDeletingUser(user)}
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
            </TabsContent>
             <TabsContent value="manage-students" className="mt-6">
                <ManageStudentsClient parentUsers={parentUsers} />
            </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
