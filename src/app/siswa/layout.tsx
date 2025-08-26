import AppLayout from '@/app/(app)/layout';

export default function SiswaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { [key: string]: string };
}) {
  return <AppLayout>{children}</AppLayout>;
}
