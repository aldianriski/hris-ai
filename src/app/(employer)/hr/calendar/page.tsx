'use client';

import { PageContainer } from '@/components/ui/PageContainer';
import { HolidayCalendar } from '@/components/calendar/HolidayCalendar';

export default function HolidayCalendarPage() {
  return (
    <PageContainer
      title="Holiday Calendar"
      subtitle="Indonesian National Holidays, Regional Events, and Company Holidays for 2025"
    >
      <HolidayCalendar />
    </PageContainer>
  );
}
