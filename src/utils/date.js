export const startOfDay = (date = new Date()) => {
  const normalizedDate = new Date(date);

  normalizedDate.setHours(0, 0, 0, 0);

  return normalizedDate;
};

export const endOfDay = (date = new Date()) => {
  const normalizedDate = new Date(date);

  normalizedDate.setHours(23, 59, 59, 999);

  return normalizedDate;
};

export const addDays = (date, days) => {
  const result = new Date(date);

  result.setDate(result.getDate() + days);

  return result;
};

export const subtractDays = (date, days) => {
  return addDays(date, -days);
};

export const isSameDay = (firstDate, secondDate) => {
  return startOfDay(firstDate).getTime() === startOfDay(secondDate).getTime();
};

export const isYesterday = (date, baseDate = new Date()) => {
  const yesterday = subtractDays(startOfDay(baseDate), 1);

  return isSameDay(date, yesterday);
};

export const differenceInDays = (fromDate, toDate = new Date()) => {
  const from = startOfDay(fromDate).getTime();
  const to = startOfDay(toDate).getTime();

  return Math.floor((to - from) / (1000 * 60 * 60 * 24));
};
