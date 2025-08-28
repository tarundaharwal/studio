import {
  Home,
  LineChart,
  Package,
  Package2,
  Settings,
  Users2,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { DashboardHeader } from '@/components/dashboard-header';
import { OverviewCards } from '@/components/overview-cards';
import { PerformanceChart } from '@/components/performance-chart';
import { PositionsTable } from '@/components/positions-table';
import { OrdersTable } from '@/components/orders-table';
import { SignalsFeed } from '@/components/signals-feed';

export default function DashboardPage() {
  return (
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
              <SidebarMenuButton isActive tooltip="Dashboard">
                <Home className="size-5" />
                <span className="group-data-[collapsible=icon]:hidden">
                  Dashboard
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Strategies">
                <Package className="size-5" />
                <span className="group-data-[collapsible=icon]:hidden">
                  Strategies
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Backtests">
                <LineChart className="size-5" />
                <span className="group-data-[collapsible=icon]:hidden">
                  Backtests
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Community">
                <Users2 className="size-5" />
                <span className="group-data-[collapsible=icon]:hidden">
                  Community
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Settings">
                <Settings className="size-5" />
                <span className="group-data-[collapsible=icon]:hidden">
                  Settings
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <OverviewCards />
          </div>
          <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <PerformanceChart />
            </div>
            <SignalsFeed />
          </div>
          <div className="grid grid-cols-1 gap-4 md:gap-8">
            <PositionsTable />
          </div>
          <div className="grid grid-cols-1 gap-4 md:gap-8">
            <OrdersTable />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
