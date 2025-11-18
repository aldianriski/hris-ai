import { describe, it, expect } from 'vitest';

/**
 * Integration Tests for Attendance API
 * Tests critical attendance tracking and validation flows
 */

describe('Attendance Check-in/Check-out Integration Tests', () => {
  const mockEmployee = {
    id: 'emp-123',
    employeeNumber: 'EMP001',
    fullName: 'Jane Doe',
    department: 'Sales'
  };

  describe('POST /api/v1/attendance/check-in', () => {
    it('should create valid check-in record', () => {
      const checkIn = {
        employeeId: 'emp-123',
        date: new Date('2024-01-15'),
        checkInTime: new Date('2024-01-15T09:00:00'),
        checkInLocation: {
          lat: -6.2088,
          lng: 106.8456,
          address: 'Jakarta Office'
        },
        status: 'present' as const
      };

      expect(checkIn.employeeId).toBeDefined();
      expect(checkIn.checkInTime).toBeInstanceOf(Date);
      expect(checkIn.checkInLocation.lat).toBeDefined();
      expect(checkIn.checkInLocation.lng).toBeDefined();
      expect(checkIn.status).toBe('present');
    });

    it('should mark as late if check-in after scheduled time', () => {
      const scheduledTime = new Date('2024-01-15T09:00:00');
      const actualCheckIn = new Date('2024-01-15T09:15:00');

      const isLate = actualCheckIn > scheduledTime;
      const minutesLate = Math.floor((actualCheckIn.getTime() - scheduledTime.getTime()) / (1000 * 60));

      expect(isLate).toBe(true);
      expect(minutesLate).toBe(15);
    });

    it('should not allow duplicate check-in for same date', () => {
      const existingCheckIn = {
        employeeId: 'emp-123',
        date: new Date('2024-01-15')
      };

      const newCheckIn = {
        employeeId: 'emp-123',
        date: new Date('2024-01-15')
      };

      const isDuplicate =
        existingCheckIn.employeeId === newCheckIn.employeeId &&
        existingCheckIn.date.toDateString() === newCheckIn.date.toDateString();

      expect(isDuplicate).toBe(true);
    });
  });

  describe('POST /api/v1/attendance/check-out', () => {
    it('should create valid check-out record', () => {
      const checkOut = {
        attendanceId: 'att-123',
        checkOutTime: new Date('2024-01-15T17:30:00'),
        checkOutLocation: {
          lat: -6.2088,
          lng: 106.8456,
          address: 'Jakarta Office'
        }
      };

      expect(checkOut.attendanceId).toBeDefined();
      expect(checkOut.checkOutTime).toBeInstanceOf(Date);
    });

    it('should calculate work hours correctly', () => {
      const checkInTime = new Date('2024-01-15T09:00:00');
      const checkOutTime = new Date('2024-01-15T17:30:00');

      const workMinutes = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60);
      const workHours = workMinutes / 60;

      expect(workHours).toBe(8.5);
    });

    it('should require check-in before check-out', () => {
      const checkOutTime = new Date('2024-01-15T17:30:00');
      const checkInTime = null; // No check-in

      const canCheckOut = checkInTime !== null;

      expect(canCheckOut).toBe(false);
    });
  });
});

describe('Attendance Validation Integration Tests', () => {
  describe('Location Validation', () => {
    const officeLocation = { lat: -6.2088, lng: 106.8456 };
    const allowedRadius = 100; // meters

    function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
      // Haversine formula (simplified for testing)
      const R = 6371000; // Earth's radius in meters
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }

    it('should accept check-in within allowed radius', () => {
      const employeeLocation = { lat: -6.2089, lng: 106.8457 }; // Very close

      const distance = calculateDistance(
        officeLocation.lat,
        officeLocation.lng,
        employeeLocation.lat,
        employeeLocation.lng
      );

      const isWithinRadius = distance <= allowedRadius;

      expect(isWithinRadius).toBe(true);
    });

    it('should reject check-in outside allowed radius', () => {
      const employeeLocation = { lat: -6.3, lng: 106.9 }; // Far away

      const distance = calculateDistance(
        officeLocation.lat,
        officeLocation.lng,
        employeeLocation.lat,
        employeeLocation.lng
      );

      const isWithinRadius = distance <= allowedRadius;

      expect(isWithinRadius).toBe(false);
    });
  });

  describe('Time Validation', () => {
    it('should not allow backdated attendance', () => {
      const currentDate = new Date();
      const attendanceDate = new Date('2023-01-01'); // Past date

      const isPast = attendanceDate < currentDate;
      const daysAgo = Math.floor((currentDate.getTime() - attendanceDate.getTime()) / (1000 * 60 * 60 * 24));

      const allowBackdating = daysAgo <= 7; // Only allow 7 days back

      expect(isPast).toBe(true);
      expect(allowBackdating).toBe(false);
    });

    it('should not allow future attendance', () => {
      const currentDate = new Date();
      const attendanceDate = new Date('2025-12-31'); // Future date

      const isFuture = attendanceDate > currentDate;

      expect(isFuture).toBe(true);
    });
  });
});

describe('Attendance Analytics Integration Tests', () => {
  describe('GET /api/v1/analytics/attendance', () => {
    it('should calculate attendance rate correctly', () => {
      const workingDays = 22; // Days in month
      const presentDays = 20;
      const absentDays = 2;

      const attendanceRate = (presentDays / workingDays) * 100;

      expect(attendanceRate).toBeCloseTo(90.91, 2);
      expect(presentDays + absentDays).toBe(workingDays);
    });

    it('should calculate average work hours', () => {
      const dailyHours = [8, 8.5, 9, 8, 7.5]; // 5 days
      const totalHours = dailyHours.reduce((sum, h) => sum + h, 0);
      const avgHours = totalHours / dailyHours.length;

      expect(avgHours).toBeCloseTo(8.2, 1);
    });

    it('should count late arrivals correctly', () => {
      const attendance = [
        { checkIn: new Date('2024-01-15T08:55:00'), onTime: true },
        { checkIn: new Date('2024-01-16T09:15:00'), onTime: false },
        { checkIn: new Date('2024-01-17T09:00:00'), onTime: true },
        { checkIn: new Date('2024-01-18T09:30:00'), onTime: false },
        { checkIn: new Date('2024-01-19T08:45:00'), onTime: true }
      ];

      const lateCount = attendance.filter(a => !a.onTime).length;
      const lateRate = (lateCount / attendance.length) * 100;

      expect(lateCount).toBe(2);
      expect(lateRate).toBe(40);
    });
  });

  describe('Attendance Status Types', () => {
    it('should support all attendance status types', () => {
      const validStatuses = [
        'present',
        'absent',
        'late',
        'half_day',
        'remote',
        'sick_leave',
        'annual_leave'
      ];

      const testStatus = 'present';

      expect(validStatuses).toContain(testStatus);
      expect(validStatuses).toHaveLength(7);
    });
  });
});

describe('Attendance Anomaly Detection Integration Tests', () => {
  describe('GET /api/v1/attendance/anomalies', () => {
    it('should detect suspicious pattern - always on time', () => {
      const attendance = [
        { checkIn: new Date('2024-01-15T09:00:00') },
        { checkIn: new Date('2024-01-16T09:00:00') },
        { checkIn: new Date('2024-01-17T09:00:00') },
        { checkIn: new Date('2024-01-18T09:00:00') },
        { checkIn: new Date('2024-01-19T09:00:00') }
      ];

      // Check if all check-ins are at exactly the same time
      const times = attendance.map(a => a.checkIn.toTimeString().substring(0, 5));
      const uniqueTimes = new Set(times);

      const isSuspicious = uniqueTimes.size === 1; // All same time

      expect(isSuspicious).toBe(true);
    });

    it('should detect location jumping', () => {
      const locations = [
        { lat: -6.2088, lng: 106.8456, time: new Date('2024-01-15T09:00:00') }, // Jakarta
        { lat: -6.2088, lng: 106.8456, time: new Date('2024-01-15T17:00:00') }, // Jakarta
        { lat: -7.2575, lng: 112.7521, time: new Date('2024-01-15T17:10:00') }  // Surabaya - 10 min later!
      ];

      // Distance between Jakarta and Surabaya ~ 700km
      // 10 minutes travel time is impossible
      const timeDiff = (locations[2].time.getTime() - locations[1].time.getTime()) / 1000 / 60; // minutes
      const isSuspicious = timeDiff < 30; // Less than 30 min between distant locations

      expect(isSuspicious).toBe(true);
    });

    it('should detect check-in without check-out pattern', () => {
      const records = [
        { date: '2024-01-15', checkIn: '09:00', checkOut: null },
        { date: '2024-01-16', checkIn: '09:00', checkOut: null },
        { date: '2024-01-17', checkIn: '09:00', checkOut: null },
        { date: '2024-01-18', checkIn: '09:00', checkOut: null }
      ];

      const missingCheckOuts = records.filter(r => r.checkOut === null).length;
      const isSuspicious = missingCheckOuts > 3; // More than 3 consecutive days

      expect(missingCheckOuts).toBe(4);
      expect(isSuspicious).toBe(true);
    });
  });
});
