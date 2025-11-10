export const addMinutes = (date: Date, minutes: number) =>
  new Date(date.getTime() + minutes * 60 * 1000);

export const addDays = (date: Date, days: number) =>
  new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
