'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody, Button } from '@heroui/react';
import { Clock, MapPin, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface AttendanceClockCardProps {
  onClockIn: (location?: { latitude: number; longitude: number }) => void;
  onClockOut: (location?: { latitude: number; longitude: number }) => void;
  isClockedIn: boolean;
  clockInTime?: Date;
  isLoading?: boolean;
}

export function AttendanceClockCard({
  onClockIn,
  onClockOut,
  isClockedIn,
  clockInTime,
  isLoading = false,
}: AttendanceClockCardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState<string>('Mengambil lokasi...');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation('Lokasi terdeteksi');
        },
        () => {
          setLocation('Lokasi tidak tersedia');
        }
      );
    }
  }, []);

  const handleClock = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const gps = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          if (isClockedIn) {
            onClockOut(gps);
          } else {
            onClockIn(gps);
          }
        },
        () => {
          // Fallback without GPS
          if (isClockedIn) {
            onClockOut();
          } else {
            onClockIn();
          }
        }
      );
    } else {
      if (isClockedIn) {
        onClockOut();
      } else {
        onClockIn();
      }
    }
  };

  return (
    <Card className="border-none shadow-talixa-lg">
      <CardBody className="p-6 md:p-8">
        <div className="text-center space-y-6">
          {/* Current Time */}
          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Waktu Sekarang
              </p>
            </div>
            <motion.p
              key={currentTime.toTimeString()}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="text-5xl md:text-6xl font-bold text-talixa-indigo dark:text-talixa-indigo-200 tracking-tight"
            >
              {currentTime.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </motion.p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(currentTime, 'long')}
            </p>
          </div>

          {/* Clock In Time (if clocked in) */}
          {isClockedIn && clockInTime && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Clock In
              </p>
              <p className="text-2xl font-bold text-green-600">
                {clockInTime.toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </motion.div>
          )}

          {/* Location */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>

          {/* Clock In/Out Button */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="pt-4"
          >
            <Button
              size="lg"
              color={isClockedIn ? 'danger' : 'primary'}
              className={
                isClockedIn
                  ? 'w-full h-16 text-lg font-semibold'
                  : 'w-full h-16 text-lg font-semibold bg-gradient-primary'
              }
              onPress={handleClock}
              isLoading={isLoading}
            >
              {isClockedIn ? '🏁 Clock Out' : '▶️ Clock In'}
            </Button>
          </motion.div>
        </div>
      </CardBody>
    </Card>
  );
}
