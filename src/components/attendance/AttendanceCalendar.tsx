/**
 * Attendance Calendar Component
 * Monthly calendar view with attendance status
 */

'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';

interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  clockIn?: string;
  clockOut?: string;
}

interface AttendanceCalendarProps {
  records?: AttendanceRecord[];
  month?: Date;
  onMonthChange?: (month: Date) => void;
}

const statusStyles = {
  present: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    icon: CheckCircle,
  },
  absent: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    icon: XCircle,
  },
  late: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    icon: Clock,
  },
  leave: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    icon: Calendar,
  },
};

export function AttendanceCalendar({
  records = [],
  month: initialMonth,
  onMonthChange,
}: AttendanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth || new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const getRecordForDate = (day: number): AttendanceRecord | undefined => {
    const dateString = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return records.find((r) => r.date === dateString);
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="p-2" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const record = getRecordForDate(day);
    const isToday =
      day === new Date().getDate() &&
      currentMonth.getMonth() === new Date().getMonth() &&
      currentMonth.getFullYear() === new Date().getFullYear();

    days.push(
      <div
        key={day}
        className={`relative p-2 border border-gray-200 min-h-[80px] ${
          isToday ? 'bg-blue-50 ring-2 ring-blue-500' : 'bg-white'
        } ${record ? 'cursor-pointer hover:shadow-md' : ''}`}
      >
        <div className="flex items-start justify-between">
          <span
            className={`text-sm font-medium ${
              isToday ? 'text-blue-600' : 'text-gray-700'
            }`}
          >
            {day}
          </span>
          {isToday && (
            <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-xs text-white">
              Today
            </span>
          )}
        </div>

        {record && (
          <div className="mt-2">
            <div
              className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${
                statusStyles[record.status].bg
              } ${statusStyles[record.status].text}`}
            >
              {React.createElement(statusStyles[record.status].icon, {
                className: 'h-3 w-3',
              })}
              {record.status}
            </div>
            {record.clockIn && (
              <div className="mt-1 text-xs text-gray-600">
                In: {record.clockIn}
              </div>
            )}
            {record.clockOut && (
              <div className="text-xs text-gray-600">
                Out: {record.clockOut}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="p-4">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="bg-gray-50 px-2 py-2 text-center text-xs font-semibold text-gray-700"
            >
              {day}
            </div>
          ))}
          {days}
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-gray-200 px-6 py-4">
        <div className="flex flex-wrap gap-4">
          {Object.entries(statusStyles).map(([status, style]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`h-4 w-4 rounded ${style.bg}`} />
              <span className="text-sm text-gray-600 capitalize">{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
