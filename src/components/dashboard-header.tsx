
'use client';

import { CircleUser, Menu, Search, LogOut } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { OverviewCards } from '../app/(protected)/overview-cards';
import { MachineStatus } from './machine-status';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-30 flex h-auto flex-wrap items-center gap-4 border-b bg-background px-4 py-2 sm:h-16 sm:flex-nowrap sm:px-6">
      {user && <SidebarTrigger />}
      
      {/* Overview Cards will be visible here on larger screens */}
      <div className="hidden flex-1 items-center gap-2 lg:flex">
         {user && <MachineStatus />}
         {user && <OverviewCards />}
      </div>

      <div className="relative ml-auto flex items-center gap-4 self-start sm:self-center md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
        />
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <CircleUser className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
      
       {/* Overview Cards will be visible here on smaller screens as a second row */}
       <div className="flex w-full items-center gap-2 overflow-x-auto lg:hidden">
         {user && <MachineStatus />}
         {user && <OverviewCards />}
      </div>
    </header>
  );
}
