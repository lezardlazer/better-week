import { addDays, format, startOfWeek } from 'date-fns';

export function getWeekStartISO(date: Date = new Date()): string {
  return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

export function getWeekDays(weekStartISO: string): Date[] {
  const start = new Date(`${weekStartISO}T00:00:00`);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function formatWeekRange(weekStartISO: string): string {
  const days = getWeekDays(weekStartISO);
  const start = days[0];
  const end = days[6];
  const sameMonth = format(start, 'MMM') === format(end, 'MMM');
  return sameMonth
    ? `${format(start, 'MMM d')} – ${format(end, 'd')}`
    : `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`;
}

export function toDateISO(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function todayISO(): string {
  return toDateISO(new Date());
}

export function addDaysToISO(dateISO: string, days: number): string {
  return toDateISO(addDays(new Date(`${dateISO}T00:00:00`), days));
}
