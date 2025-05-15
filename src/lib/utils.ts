// IT APPEARS THAT BIG CALENDAR SHOWS THE LAST WEEK WHEN THE CURRENT DAY IS A WEEKEND.
// FOR THIS REASON WE'LL GET THE LAST WEEK AS THE REFERENCE WEEK.
// IN THE TUTORIAL WE'RE TAKING THE NEXT WEEK AS THE REFERENCE WEEK.

const getLatestMonday = (): Date => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const latestMonday = today;
  latestMonday.setDate(today.getDate() - daysSinceMonday);
  return latestMonday;
};

export const adjustScheduleToCurrentWeek = (
  lessons: { title: string; start: Date; end: Date }[]
): { title: string; start: Date; end: Date }[] => {
  const latestMonday = getLatestMonday();

  return lessons.map((lesson) => {
    const lessonDayOfWeek = lesson.start.getDay();

    const daysFromMonday = lessonDayOfWeek === 0 ? 6 : lessonDayOfWeek - 1;

    const adjustedStartDate = new Date(latestMonday);

    adjustedStartDate.setDate(latestMonday.getDate() + daysFromMonday);
    adjustedStartDate.setHours(
      lesson.start.getHours(),
      lesson.start.getMinutes(),
      lesson.start.getSeconds()
    );
    const adjustedEndDate = new Date(adjustedStartDate);
    adjustedEndDate.setHours(
      lesson.end.getHours(),
      lesson.end.getMinutes(),
      lesson.end.getSeconds()
    );

    return {
      title: lesson.title,
      start: adjustedStartDate,
      end: adjustedEndDate,
    };
  });
};

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}
