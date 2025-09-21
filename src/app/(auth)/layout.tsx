
import { Logo } from '@/components/icons/logo';
import Link from 'next/link';

export default function AuthLayout({
  children,
  params: _params,
}: {
  children: React.ReactNode;
  params: any;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
            <Link href="/" className="flex items-center gap-2">
                <Logo />
                <span className="font-bold text-xl text-primary">Kaih.Spensa id</span>
            </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
