import { ThemeSettings } from '@/components/theme-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground">
          Kelola pengaturan aplikasi dan preferensi Anda di sini.
        </p>
      </header>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Tampilan</CardTitle>
            <CardDescription>
              Sesuaikan tampilan aplikasi. Aktifkan mode gelap atau terang.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeSettings />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>
              Kelola informasi profil Anda. (Segera Hadir)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-md bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Pengaturan profil akan tersedia di sini.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifikasi</CardTitle>
            <CardDescription>
              Atur preferensi notifikasi Anda. (Segera Hadir)
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-md bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Pengaturan notifikasi akan tersedia di sini.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
