'use client';

import { Card, CardHeader, CardBody, Chip, Tabs, Tab, Button } from '@heroui/react';
import { Calendar, MapPin, Plus, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface Holiday {
  id: string;
  name: string;
  nameId: string; // Indonesian name
  date: string;
  type: 'national' | 'regional' | 'company' | 'religious';
  location?: string; // For regional holidays
  isRecurring: boolean;
  description?: string;
}

export function HolidayCalendar() {
  const [activeTab, setActiveTab] = useState('all');

  // Indonesian National Holidays for 2025
  const holidays: Holiday[] = [
    {
      id: '1',
      name: "New Year's Day",
      nameId: 'Tahun Baru Masehi',
      date: '2025-01-01',
      type: 'national',
      isRecurring: true,
      description: 'Celebrates the first day of the year in the Gregorian calendar',
    },
    {
      id: '2',
      name: 'Chinese New Year',
      nameId: 'Tahun Baru Imlek',
      date: '2025-01-29',
      type: 'national',
      isRecurring: true,
      description: 'Celebrates the beginning of a new year on the Chinese calendar',
    },
    {
      id: '3',
      name: 'Isra and Mi\'raj',
      nameId: 'Isra Miraj Nabi Muhammad SAW',
      date: '2025-01-27',
      type: 'religious',
      isRecurring: true,
      description: 'Commemoration of the night journey of the Prophet Muhammad',
    },
    {
      id: '4',
      name: 'Day of Silence (Nyepi)',
      nameId: 'Hari Suci Nyepi (Tahun Baru Saka)',
      date: '2025-03-29',
      type: 'national',
      isRecurring: true,
      description: 'Balinese New Year and day of silence',
    },
    {
      id: '5',
      name: 'Good Friday',
      nameId: 'Wafat Yesus Kristus',
      date: '2025-04-18',
      type: 'national',
      isRecurring: true,
      description: 'Observance of the crucifixion of Jesus Christ',
    },
    {
      id: '6',
      name: 'Eid al-Fitr',
      nameId: 'Hari Raya Idul Fitri',
      date: '2025-03-31',
      type: 'national',
      isRecurring: true,
      description: 'End of Ramadan, the Islamic holy month of fasting',
    },
    {
      id: '7',
      name: 'Eid al-Fitr (Day 2)',
      nameId: 'Hari Raya Idul Fitri (Hari Kedua)',
      date: '2025-04-01',
      type: 'national',
      isRecurring: true,
      description: 'Second day of Eid al-Fitr celebration',
    },
    {
      id: '8',
      name: 'Labor Day',
      nameId: 'Hari Buruh Internasional',
      date: '2025-05-01',
      type: 'national',
      isRecurring: true,
      description: 'International Workers\' Day',
    },
    {
      id: '9',
      name: 'Ascension of Jesus Christ',
      nameId: 'Kenaikan Yesus Kristus',
      date: '2025-05-29',
      type: 'national',
      isRecurring: true,
      description: 'Christian holiday celebrating the ascension of Jesus into heaven',
    },
    {
      id: '10',
      name: 'Vesak Day',
      nameId: 'Hari Raya Waisak',
      date: '2025-05-12',
      type: 'national',
      isRecurring: true,
      description: 'Celebration of the birth, enlightenment, and death of Buddha',
    },
    {
      id: '11',
      name: 'Pancasila Day',
      nameId: 'Hari Lahir Pancasila',
      date: '2025-06-01',
      type: 'national',
      isRecurring: true,
      description: 'Commemoration of the birth of Pancasila ideology',
    },
    {
      id: '12',
      name: 'Eid al-Adha',
      nameId: 'Hari Raya Idul Adha',
      date: '2025-06-07',
      type: 'national',
      isRecurring: true,
      description: 'Festival of Sacrifice',
    },
    {
      id: '13',
      name: 'Islamic New Year',
      nameId: 'Tahun Baru Hijriyah',
      date: '2025-06-27',
      type: 'national',
      isRecurring: true,
      description: 'First day of Muharram, the Islamic New Year',
    },
    {
      id: '14',
      name: 'Independence Day',
      nameId: 'Hari Kemerdekaan RI',
      date: '2025-08-17',
      type: 'national',
      isRecurring: true,
      description: 'Indonesian Independence Day',
    },
    {
      id: '15',
      name: 'Birthday of Prophet Muhammad',
      nameId: 'Maulid Nabi Muhammad SAW',
      date: '2025-09-05',
      type: 'religious',
      isRecurring: true,
      description: 'Celebration of the birth of the Prophet Muhammad',
    },
    {
      id: '16',
      name: 'Christmas Day',
      nameId: 'Hari Raya Natal',
      date: '2025-12-25',
      type: 'national',
      isRecurring: true,
      description: 'Christian celebration of the birth of Jesus Christ',
    },
    // Company holidays (examples)
    {
      id: '17',
      name: 'Company Anniversary',
      nameId: 'Hari Jadi Perusahaan',
      date: '2025-07-15',
      type: 'company',
      isRecurring: true,
      description: 'Annual company anniversary celebration',
    },
    {
      id: '18',
      name: 'Year-End Shutdown',
      nameId: 'Tutup Akhir Tahun',
      date: '2025-12-26',
      type: 'company',
      isRecurring: true,
      description: 'Company-wide year-end holiday',
    },
  ];

  const getTypeColor = (type: string) => {
    const colors: Record<string, 'primary' | 'success' | 'warning' | 'secondary'> = {
      national: 'primary',
      regional: 'warning',
      company: 'success',
      religious: 'secondary',
    };
    return colors[type] || 'default';
  };

  const filterHolidays = (holidays: Holiday[]) => {
    if (activeTab === 'all') return holidays;
    if (activeTab === 'upcoming') {
      const today = new Date();
      return holidays.filter((h) => new Date(h.date) >= today);
    }
    return holidays.filter((h) => h.type === activeTab);
  };

  const filteredHolidays = filterHolidays(holidays).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const stats = {
    total: holidays.length,
    national: holidays.filter((h) => h.type === 'national').length,
    religious: holidays.filter((h) => h.type === 'religious').length,
    company: holidays.filter((h) => h.type === 'company').length,
    upcoming: holidays.filter((h) => new Date(h.date) >= new Date()).length,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    const holiday = new Date(dateString);
    const diffTime = holiday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-50 dark:bg-primary-100/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-default-500">Total Holidays</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-100/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.national}</p>
                  <p className="text-sm text-default-500">National</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-100/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.religious}</p>
                  <p className="text-sm text-default-500">Religious</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success-50 dark:bg-success-100/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.company}</p>
                  <p className="text-sm text-default-500">Company</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 dark:bg-orange-100/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.upcoming}</p>
                  <p className="text-sm text-default-500">Upcoming</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Holiday List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
              size="lg"
            >
              <Tab key="all" title="All Holidays" />
              <Tab key="upcoming" title="Upcoming" />
              <Tab key="national" title="National" />
              <Tab key="religious" title="Religious" />
              <Tab key="company" title="Company" />
            </Tabs>
            <div className="flex items-center gap-2">
              <Button
                variant="flat"
                startContent={<Download className="h-4 w-4" />}
                size="sm"
              >
                Export Calendar
              </Button>
              <Button color="primary" startContent={<Plus className="h-4 w-4" />} size="sm">
                Add Holiday
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody className="gap-3">
          {filteredHolidays.map((holiday, index) => {
            const daysUntil = getDaysUntil(holiday.date);
            const isPast = daysUntil < 0;
            const isToday = daysUntil === 0;
            const isUpcoming = daysUntil > 0 && daysUntil <= 30;

            return (
              <motion.div
                key={holiday.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className={isPast ? 'opacity-60' : ''}>
                  <CardBody>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-xl ${
                            isToday
                              ? 'bg-success-50 dark:bg-success-950/30'
                              : isUpcoming
                              ? 'bg-warning-50 dark:bg-warning-950/30'
                              : 'bg-default-100'
                          }`}
                        >
                          <Calendar
                            className={`h-6 w-6 ${
                              isToday
                                ? 'text-success'
                                : isUpcoming
                                ? 'text-warning'
                                : 'text-default-500'
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start gap-2 mb-1">
                            <div>
                              <h3 className="font-semibold text-lg">{holiday.name}</h3>
                              <p className="text-sm text-default-600">{holiday.nameId}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <Chip color={getTypeColor(holiday.type)} variant="flat" size="sm">
                              {holiday.type.charAt(0).toUpperCase() + holiday.type.slice(1)}
                            </Chip>
                            {isToday && (
                              <Chip color="success" variant="flat" size="sm">
                                Today
                              </Chip>
                            )}
                            {isUpcoming && (
                              <Chip color="warning" variant="flat" size="sm">
                                In {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
                              </Chip>
                            )}
                            {holiday.location && (
                              <Chip
                                variant="flat"
                                size="sm"
                                startContent={<MapPin className="h-3 w-3" />}
                              >
                                {holiday.location}
                              </Chip>
                            )}
                          </div>
                          {holiday.description && (
                            <p className="text-sm text-default-500 mt-2">{holiday.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatDate(holiday.date)}</p>
                        <p className="text-xs text-default-500 mt-1">
                          {new Date(holiday.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            );
          })}

          {filteredHolidays.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto text-default-300 mb-4" />
              <p className="text-default-500">No holidays found</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
