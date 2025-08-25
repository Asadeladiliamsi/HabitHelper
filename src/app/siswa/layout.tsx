import AppLayout from "@/app/(app)/layout";

export default function SiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
