import type { ReactNode } from 'react';
import { SidebarInset, SidebarProvider } from '@repo/ui/components/sidebar';
import { TooltipProvider } from '@repo/ui/components/tooltip';
import type { UserDetails } from '@/shared/types/auth-types';
import { AppHeader } from './components/app-header';
import { AppSidebar } from './components/app-sidebar';

interface AdminShellProps {
  user: UserDetails;
  children?: ReactNode;
}

export const AdminShell = ({ user, children }: AdminShellProps) => {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar user={user} />
        <SidebarInset>
          <AppHeader user={user} />
          <div className='flex flex-1 flex-col gap-6 p-4 md:p-6'>{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
};
