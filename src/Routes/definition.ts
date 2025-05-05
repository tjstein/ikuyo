interface RouteNoParam<RoutePath extends string> {
  routePath: RoutePath;
  asRouteTarget: () => string;
  asRootRoute: () => string;
}
interface RouteOneParam<RoutePath extends string> {
  routePath: RoutePath;
  asRouteTarget: (param: string) => string;
  asRootRoute: () => string;
}
interface Route<RoutePath extends string> {
  routePath: RoutePath;
  asRouteTarget: (...params: string[]) => string;
  asRootRoute: () => string;
}

export function createRouteParam<RoutePath extends string>(
  routePath: RoutePath,
  replaceParams: (routePath: RoutePath) => string,
  parentRoute?: Route<RoutePath>,
): RouteNoParam<RoutePath>;
export function createRouteParam<RoutePath extends string>(
  routePath: RoutePath,
  replaceParams: (routePath: RoutePath, param: string[]) => string,
  parentRoute?: Route<RoutePath>,
): RouteOneParam<RoutePath>;
export function createRouteParam<RoutePath extends string>(
  routePath: RoutePath,
  replaceParams: (routePath: RoutePath, params: string[]) => string,
  parentRoute?: Route<RoutePath>,
): Route<RoutePath> {
  return {
    routePath,
    asRouteTarget: (...params: string[]) => replaceParams(routePath, params),
    asRootRoute: () => {
      if (parentRoute) {
        return parentRoute.asRootRoute() + routePath;
      }
      return asRootRoutePath(routePath);
    },
  };
}

function asRootRoutePath<RoutePath extends string>(
  route: RoutePath,
): `~${RoutePath}` {
  return `~${route}`;
}

export function identity<RoutePath extends string>(
  routePath: RoutePath,
): RoutePath {
  return routePath;
}

export function replaceId<RoutePath extends string>(
  routePath: RoutePath,
  params: string[],
): RoutePath {
  return routePath.replace(':id', params[0]) as RoutePath;
}
