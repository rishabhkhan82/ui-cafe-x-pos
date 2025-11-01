import { Injectable } from '@angular/core';

export interface DateTimeFormat {
  date: string;
  time: string;
  datetime: string;
  relative: string;
  iso: string;
}

export interface BusinessHours {
  day: string;
  open: string;
  close: string;
  closed: boolean;
  currentStatus: 'open' | 'closed' | 'opening_soon' | 'closing_soon';
}

export interface ShiftInfo {
  name: string;
  startTime: string;
  endTime: string;
  duration: number; // in hours
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DateTimeService {

  constructor() { }

  // ===============================
  // FORMATTING METHODS
  // ===============================

  /**
   * Format date and time in multiple formats
   */
  formatDateTime(date: Date | string | number): DateTimeFormat {
    const d = new Date(date);

    return {
      date: this.formatDate(d),
      time: this.formatTime(d),
      datetime: this.formatDateTimeFull(d),
      relative: this.formatRelative(d),
      iso: d.toISOString()
    };
  }

  /**
   * Format date only (DD/MM/YYYY)
   */
  formatDate(date: Date | string | number): string {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Format time only (HH:MM AM/PM)
   */
  formatTime(date: Date | string | number): string {
    const d = new Date(date);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Format full date and time
   */
  formatDateTimeFull(date: Date | string | number): string {
    const d = new Date(date);
    return d.toLocaleString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Format relative time (e.g., "2 hours ago", "in 30 minutes")
   */
  formatRelative(date: Date | string | number): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffMins = Math.abs(diffMs) / (1000 * 60);
    const diffHours = diffMins / 60;
    const diffDays = diffHours / 24;

    const isPast = diffMs < 0;
    const suffix = isPast ? 'ago' : 'from now';

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      const mins = Math.floor(diffMins);
      return `${mins} minute${mins > 1 ? 's' : ''} ${suffix}`;
    } else if (diffHours < 24) {
      const hours = Math.floor(diffHours);
      return `${hours} hour${hours > 1 ? 's' : ''} ${suffix}`;
    } else if (diffDays < 7) {
      const days = Math.floor(diffDays);
      return `${days} day${days > 1 ? 's' : ''} ${suffix}`;
    } else {
      return this.formatDate(d);
    }
  }

  // ===============================
  // BUSINESS HOURS METHODS
  // ===============================

  /**
   * Check if restaurant is currently open
   */
  isRestaurantOpen(businessHours: any): boolean {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    const todayHours = businessHours[currentDay];
    if (!todayHours || todayHours.closed) {
      return false;
    }

    return currentTime >= todayHours.open && currentTime <= todayHours.close;
  }

  /**
   * Get current business status for all days
   */
  getBusinessHoursStatus(businessHours: any): BusinessHours[] {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5);

    return days.map(day => {
      const hours = businessHours[day];
      let status: 'open' | 'closed' | 'opening_soon' | 'closing_soon' = 'closed';

      if (hours && !hours.closed) {
        if (currentTime >= hours.open && currentTime <= hours.close) {
          // Check if closing within next 30 minutes
          const closeTime = this.parseTime(hours.close);
          const currentTimeParsed = this.parseTime(currentTime);
          const timeUntilClose = (closeTime.getTime() - currentTimeParsed.getTime()) / (1000 * 60); // minutes

          status = timeUntilClose <= 30 ? 'closing_soon' : 'open';
        } else if (currentTime < hours.open) {
          // Check if opening within next 30 minutes
          const openTime = this.parseTime(hours.open);
          const currentTimeParsed = this.parseTime(currentTime);
          const timeUntilOpen = (openTime.getTime() - currentTimeParsed.getTime()) / (1000 * 60); // minutes

          status = timeUntilOpen <= 30 ? 'opening_soon' : 'closed';
        }
      }

      return {
        day: day.charAt(0).toUpperCase() + day.slice(1),
        open: hours?.open || '00:00',
        close: hours?.close || '00:00',
        closed: hours?.closed || true,
        currentStatus: status
      };
    });
  }

  /**
   * Get next opening time
   */
  getNextOpeningTime(businessHours: any): { day: string; time: string; minutesUntil: number } | null {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5);

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    // Check remaining hours today
    const todayHours = businessHours[currentDay];
    if (todayHours && !todayHours.closed && currentTime < todayHours.open) {
      const minutesUntil = this.getMinutesBetweenTimes(currentTime, todayHours.open);
      return {
        day: 'Today',
        time: this.formatTimeFromString(todayHours.open),
        minutesUntil
      };
    }

    // Check next days
    const currentDayIndex = days.indexOf(currentDay);
    for (let i = 1; i <= 7; i++) {
      const dayIndex = (currentDayIndex + i) % 7;
      const day = days[dayIndex];
      const hours = businessHours[day];

      if (hours && !hours.closed) {
        const dayName = i === 1 ? 'Tomorrow' : days[dayIndex].charAt(0).toUpperCase() + days[dayIndex].slice(1);
        const minutesUntil = i * 24 * 60 + this.getMinutesBetweenTimes('00:00', hours.open);

        return {
          day: dayName,
          time: this.formatTimeFromString(hours.open),
          minutesUntil
        };
      }
    }

    return null;
  }

  // ===============================
  // SHIFT MANAGEMENT METHODS
  // ===============================

  /**
   * Get standard POS shifts
   */
  getStandardShifts(): ShiftInfo[] {
    return [
      {
        name: 'Morning',
        startTime: '09:00',
        endTime: '17:00',
        duration: 8,
        isActive: this.isShiftActive('09:00', '17:00')
      },
      {
        name: 'Afternoon',
        startTime: '14:00',
        endTime: '22:00',
        duration: 8,
        isActive: this.isShiftActive('14:00', '22:00')
      },
      {
        name: 'Evening',
        startTime: '18:00',
        endTime: '02:00',
        duration: 8,
        isActive: this.isShiftActive('18:00', '02:00')
      },
      {
        name: 'Night',
        startTime: '22:00',
        endTime: '06:00',
        duration: 8,
        isActive: this.isShiftActive('22:00', '06:00')
      }
    ];
  }

  /**
   * Check if current time is within a shift
   */
  isShiftActive(startTime: string, endTime: string): boolean {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    if (startTime < endTime) {
      // Same day shift
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight shift
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * Calculate shift duration in hours
   */
  calculateShiftDuration(startTime: string, endTime: string): number {
    const start = this.parseTime(startTime);
    const end = this.parseTime(endTime);

    let duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    // Handle overnight shifts
    if (duration <= 0) {
      duration += 24;
    }

    return duration;
  }

  /**
   * Get shift report date range
   */
  getShiftDateRange(shift: string, date: Date = new Date()): { start: Date; end: Date } {
    const shifts = {
      'morning': { start: '09:00', end: '17:00' },
      'afternoon': { start: '14:00', end: '22:00' },
      'evening': { start: '18:00', end: '02:00' },
      'night': { start: '22:00', end: '06:00' }
    };

    const shiftInfo = shifts[shift as keyof typeof shifts];
    if (!shiftInfo) {
      throw new Error(`Invalid shift: ${shift}`);
    }

    const startDate = new Date(date);
    const endDate = new Date(date);

    // Set start time
    const [startHour, startMin] = shiftInfo.start.split(':').map(Number);
    startDate.setHours(startHour, startMin, 0, 0);

    // Set end time
    const [endHour, endMin] = shiftInfo.end.split(':').map(Number);
    endDate.setHours(endHour, endMin, 0, 0);

    // Handle overnight shifts
    if (endHour < startHour) {
      endDate.setDate(endDate.getDate() + 1);
    }

    return { start: startDate, end: endDate };
  }

  // ===============================
  // ORDER TIMING METHODS
  // ===============================

  /**
   * Calculate estimated completion time for order
   */
  calculateEstimatedCompletion(orderTime: Date, preparationTime: number): Date {
    return new Date(orderTime.getTime() + preparationTime * 60 * 1000);
  }

  /**
   * Check if order is overdue
   */
  isOrderOverdue(orderTime: Date, estimatedTime: Date): boolean {
    return new Date() > estimatedTime;
  }

  /**
   * Get order priority based on waiting time
   */
  getOrderPriority(orderTime: Date, estimatedTime: Date): 'low' | 'medium' | 'high' | 'urgent' {
    const now = new Date();
    const timeSinceOrder = (now.getTime() - orderTime.getTime()) / (1000 * 60); // minutes
    const timeUntilDue = (estimatedTime.getTime() - now.getTime()) / (1000 * 60); // minutes

    if (timeUntilDue < 0) {
      return 'urgent'; // Overdue
    } else if (timeUntilDue < 5) {
      return 'high'; // Due within 5 minutes
    } else if (timeSinceOrder > 15) {
      return 'medium'; // Waiting more than 15 minutes
    } else {
      return 'low';
    }
  }

  // ===============================
  // UTILITY METHODS
  // ===============================

  /**
   * Parse time string to Date object
   */
  private parseTime(timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  /**
   * Get minutes between two time strings
   */
  private getMinutesBetweenTimes(time1: string, time2: string): number {
    const date1 = this.parseTime(time1);
    const date2 = this.parseTime(time2);
    return Math.abs((date2.getTime() - date1.getTime()) / (1000 * 60));
  }

  /**
   * Format time string to readable format
   */
  private formatTimeFromString(timeString: string): string {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return this.formatTime(date);
  }

  /**
   * Validate time format (HH:MM)
   */
  validateTimeFormat(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  /**
   * Get business days between two dates
   */
  getBusinessDays(startDate: Date, endDate: Date): number {
    let businessDays = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Saturday or Sunday
        businessDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return businessDays;
  }

  /**
   * Check if date is a holiday/weekend
   */
  isNonWorkingDay(date: Date, holidays: Date[] = []): boolean {
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday

    const isHoliday = holidays.some(holiday =>
      holiday.toDateString() === date.toDateString()
    );

    return isWeekend || isHoliday;
  }

  // ===============================
  // REPORTING TIME METHODS
  // ===============================

  /**
   * Get date range for reports
   */
  getReportDateRange(period: 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month'): { start: Date; end: Date } {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (period) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;

      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
        end = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);
        break;

      case 'this_week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        start = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;

      case 'last_week':
        const lastWeekEnd = new Date(now);
        lastWeekEnd.setDate(now.getDate() - now.getDay()); // Last Sunday
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekEnd.getDate() - 6); // Last Monday
        start = new Date(lastWeekStart.getFullYear(), lastWeekStart.getMonth(), lastWeekStart.getDate());
        end = new Date(lastWeekEnd.getFullYear(), lastWeekEnd.getMonth(), lastWeekEnd.getDate(), 23, 59, 59);
        break;

      case 'this_month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59); // Last day of month
        break;

      case 'last_month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59); // Last day of previous month
        break;

      default:
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    }

    return { start, end };
  }
}