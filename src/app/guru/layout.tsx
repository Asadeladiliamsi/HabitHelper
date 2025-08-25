import AppLayout from "@/app/(app)/layout";

export default function GuruLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
