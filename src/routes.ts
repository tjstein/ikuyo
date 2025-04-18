export enum ROUTES {
  Login = '/login',
  Trips = '/trip',
  Trip = '/trip/:id',
  Account = '/account/edit',
  Privacy = '/privacy',
  Terms = '/terms',
}
export function asRootRoute(route: string) {
  return `~${route}`;
}
export enum ROUTES_TRIP {
  ListView = '/list',
  TimetableView = '/timetable',
  Expenses = '/expenses',
}
