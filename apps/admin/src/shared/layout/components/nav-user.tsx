import { useLogout } from '@/shared/hooks/use-logout';
import type { UserDetails } from '@/shared/types/auth-types';
import { Avatar, AvatarFallback } from '@repo/ui/components/avatar';
import { Button } from '@repo/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import { ChevronsUpDownIcon, LogOutIcon } from 'lucide-react';

interface NavUserProps {
  user: UserDetails;
}

const getInitials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

export const NavUser = ({ user }: NavUserProps) => {
  const logout = useLogout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant='ghost' className='h-9 gap-2 px-1.5 sm:px-2'>
            <Avatar size='sm'>
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <span className='hidden max-w-32 truncate text-sm font-medium sm:inline'>
              {user.name}
            </span>
            <ChevronsUpDownIcon data-icon='inline-end' />
          </Button>
        }
      />
      <DropdownMenuContent align='end' className='w-56'>
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className='flex flex-col gap-0.5'>
              <span className='truncate text-sm font-medium'>{user.name}</span>
              <span className='truncate text-xs font-normal text-muted-foreground'>
                {user.email}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant='destructive' onClick={logout}>
            <LogOutIcon />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
