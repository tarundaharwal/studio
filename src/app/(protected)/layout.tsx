
'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    Home,
    LineChart,
    Package,
    Settings,
    Users2,
  } from 'lucide-react';
  import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarProvider,
  } from '@/components/ui/sidebar';
  import { Logo } from '@/components/icons';
  import { DashboardHeader } from '@/components/dashboard-header';
  import { useAuth } from '@/hooks/use-auth';
  import { Skeleton } from '@/components/ui/skeleton';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <Logo className="h-10 w-10 animate-pulse" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider defaultOpen={false}>
        <Sidebar>
        <SidebarHeader>
            <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Logo className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
                IndMon
            </span>
            </div>
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard">
                <a href="/dashboard">
                    <Home className="size-5" />
                    <span className="group-data-[collapsible=icon]:hidden">
                    Dashboard
                    </span>
                </a>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Strategies">
                    <a href="/strategies">
                    <Package className="size-5" />
                    <span className="group-data-[collapsible=icon]:hidden">
                        Strategies
                    </span>
                </a>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Backtests">
                <a href="/backtests">
                    <LineChart className="size-5" />
                    <span className="group-data-[collapsible=icon]:hidden">
                    Backtests
                    </span>
                </a>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Community">
                <a href="/community">
                    <Users2 className="size-5" />
                    <span className="group-data-[collapsible=icon]:hidden">
                    Community
                    </span>
                </a>
                </SidebarMenuButton>
            </SidebarMenuItem>
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                <a href="/settings">
                    <Settings className="size-5" />
                    <span className="group-data-[collapsible=icon]:hidden">
                    Settings
                    </span>
                </a>
                </SidebarMenuButton>
            </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1">
        <DashboardHeader />
        <SidebarInset>
            {children}
        </SidebarInset>
        </div>
    </SidebarProvider>
  );
}
