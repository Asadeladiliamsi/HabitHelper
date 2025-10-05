'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { Label } from './ui/label';

interface ClassData {
    id: string;
    isLocked: boolean;
}

const KELAS_LIST = [
    "7 Ruang 1", "7 Ruang 2", "7 Ruang 3", "7 Ruang 4", "7 Ruang 5", "7 Ruang 6", "7 Ruang 7", "7 Ruang 8", "7 Ruang 9",
    "8 Ruang 1", "8 Ruang 2", "8 Ruang 3", "8 Ruang 4", "8 Ruang 5", "8 Ruang 6", "8 Ruang 7", "8 Ruang 8", "8 Ruang 9",
    "9 Ruang 1", "9 Ruang 2", "9 Ruang 3", "9 Ruang 4", "9 Ruang 5", "9 Ruang 6", "9 Ruang 7", "9 Ruang 8", "9 Ruang 9",
];


export function ManageClassesClient() {
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const classesRef = collection(db, 'classes');
        const unsubscribe = onSnapshot(classesRef, (snapshot) => {
            const fetchedClasses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClassData));
            
            const allClassData: ClassData[] = KELAS_LIST.map(className => {
                const found = fetchedClasses.find(c => c.id === className);
                return found || { id: className, isLocked: false };
            });

            setClasses(allClassData.sort((a,b) => a.id.localeCompare(b.id)));
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleLockToggle = async (className: string, isLocked: boolean) => {
        const classRef = doc(db, 'classes', className);
        try {
            await setDoc(classRef, { name: className, isLocked: isLocked }, { merge: true });
        } catch (error) {
            console.error("Failed to toggle class lock status:", error);
        }
    };
    
    if (loading) {
        return (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manajemen Status Kelas</CardTitle>
                <CardDescription>Kunci kelas untuk mencegah siswa baru mendaftar. Kelas yang dikunci tidak akan muncul di pilihan kelas saat pendaftaran.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama Kelas</TableHead>
                            <TableHead className="text-right w-32">Status Terkunci</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {classes.map((classItem) => (
                        <TableRow key={classItem.id}>
                            <TableCell className="font-medium">{classItem.id}</TableCell>
                            <TableCell className="text-right">
                               <div className="flex items-center justify-end space-x-2">
                                    <Switch
                                        id={`lock-switch-${classItem.id}`}
                                        checked={classItem.isLocked}
                                        onCheckedChange={(checked) => handleLockToggle(classItem.id, checked)}
                                        aria-label={`Lock status for ${classItem.id}`}
                                    />
                                    <Label htmlFor={`lock-switch-${classItem.id}`} className="sr-only">
                                        {classItem.isLocked ? 'Terkunci' : 'Terbuka'}
                                    </Label>
                                </div>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
