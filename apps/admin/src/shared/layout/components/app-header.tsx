import type { UserDetails } from '@/shared/types/auth-types';
import { SidebarTrigger } from '@repo/ui/components/sidebar';
import { NavUser } from './nav-user';

interface AppHeaderProps {
  user: UserDetails;
}

export const AppHeader = ({ user }: AppHeaderProps) => {
  return (
    <header className='flex h-14 shrink-0 items-center gap-2 border-b px-4'>
      <SidebarTrigger />
      <div className='ml-auto'>
        <NavUser user={user} />
      </div>
    </header>
  );
};
