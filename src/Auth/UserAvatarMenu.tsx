import { Button, DropdownMenu } from '@radix-ui/themes';
import { Link, useLocation } from 'wouter';
import { RouteAccount, RouteLogin } from '../Routes/routes';
import { db } from '../data/db';
import type { DbUser } from '../data/types';
import { UserAvatar } from './UserAvatar';

export function UserAvatarMenu({ user }: { user: DbUser | null | undefined }) {
  const [, setLocation] = useLocation();
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="ghost">
          <UserAvatar user={user} />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Label>Account</DropdownMenu.Label>
        <DropdownMenu.Item asChild>
          <Link to={RouteAccount.asRootRoute()}>Edit account</Link>
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onClick={() => {
            void db.auth.signOut().then(() => {
              setLocation(RouteLogin.asRootRoute());
            });
          }}
        >
          Log out
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
