import { CalendarIcon, ListBulletIcon, TableIcon } from '@radix-ui/react-icons';
import { SegmentedControl, Tooltip } from '@radix-ui/themes';
import { useLocation } from 'wouter';
import {
  RouteTripExpenses,
  RouteTripListView,
  RouteTripTimetableView,
} from '../Routes/routes';
import s from './TripMenuFloating.module.css';

export function TripMenuFloating() {
  const [location, setLocation] = useLocation();
  return (
    <nav className={s.nav}>
      <div className={s.controlContainer}>
        <SegmentedControl.Root
          defaultValue={location}
          value={location}
          size="3"
          variant="classic"
          className={s.control}
          onValueChange={(value) => {
            setLocation(value);
          }}
        >
          <Tooltip content="Timetable view">
            <SegmentedControl.Item
              value={RouteTripTimetableView.routePath}
              data-state={
                location === (RouteTripTimetableView.routePath as string)
                  ? 'on'
                  : 'off'
              }
            >
              <CalendarIcon className={s.controlIcon} />
            </SegmentedControl.Item>
          </Tooltip>
          <Tooltip content="List view">
            <SegmentedControl.Item
              value={RouteTripListView.routePath}
              data-state={
                location === (RouteTripListView.routePath as string)
                  ? 'on'
                  : 'off'
              }
            >
              <ListBulletIcon className={s.controlIcon} />
            </SegmentedControl.Item>
          </Tooltip>
          <Tooltip content="Expenses">
            <SegmentedControl.Item
              value={RouteTripExpenses.routePath}
              data-state={
                location === (RouteTripExpenses.routePath as string)
                  ? 'on'
                  : 'off'
              }
            >
              <TableIcon className={s.controlIcon} />
            </SegmentedControl.Item>
          </Tooltip>
        </SegmentedControl.Root>
      </div>
    </nav>
  );
}
