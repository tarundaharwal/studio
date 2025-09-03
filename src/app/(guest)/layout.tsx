
import { Logo } from '@/components/icons';

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Logo className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">
            IndMon
          </span>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
