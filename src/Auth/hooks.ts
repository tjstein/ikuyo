import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { db } from '../data/db';
import { useBoundStore } from '../data/store';
import type { DbUser } from '../data/types';
import { RouteLogin, UnauthenticatedRoutes } from '../Routes/routes';

export function useAuthUser() {
  const setCurrentUser = useBoundStore((state) => state.setCurrentUser);
  const { user, isLoading } = db.useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      if (
        UnauthenticatedRoutes.some((route) => {
          return `~${location}` === route.asRootRoute();
        })
      ) {
        // nothing
      } else {
        setLocation(RouteLogin.asRootRoute());
      }
    }
    if (!isLoading && user) {
      (async () => {
        const userEmail = user?.email;
        if (userEmail) {
          const { data: userData } = await db.queryOnce({
            user: {
              $: {
                where: {
                  email: userEmail,
                },
                limit: 1,
              },
            },
          });
          const user = userData.user[0] as DbUser | undefined;
          setCurrentUser(user);
        }
      })();
    }
  }, [isLoading, location, user, setLocation, setCurrentUser]);
}
