import AppLayout from '@/app/(app)/layout';

export default function GuruLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { [key: string]: string };
}) {
  return <AppLayout>{children}</AppLayout>;
}
