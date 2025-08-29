import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
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

export const metadata: Metadata = {
  title: 'IndMon',
  description: 'Personal, risk-first, fully automated Nifty trading console.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider>
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
                    <a href="/">
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
        <Toaster />
      </body>
    </html>
  );
}
