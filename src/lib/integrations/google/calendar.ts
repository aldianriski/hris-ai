/**
 * Google Calendar API Client
 * Functions for creating and managing calendar events
 */

import { GOOGLE_CONFIG } from '../config';

export interface CalendarEvent {
  summary: string;
  description?: string;
  start: {
    date?: string; // YYYY-MM-DD for all-day events
    dateTime?: string; // RFC3339 timestamp for timed events
    timeZone?: string;
  };
  end: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }>;
  location?: string;
  colorId?: string;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

export interface CalendarApiResponse {
  error?: {
    code: number;
    message: string;
    errors?: any[];
  };
}

/**
 * Create calendar event for leave request
 */
export async function createLeaveEvent(
  accessToken: string,
  data: {
    employeeName: string;
    employeeEmail: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason?: string;
  }
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  const event: CalendarEvent = {
    summary: `${data.employeeName} - ${data.leaveType}`,
    description: data.reason || `${data.leaveType} leave`,
    start: {
      date: data.startDate, // All-day event
    },
    end: {
      date: data.endDate,
    },
    attendees: [
      {
        email: data.employeeEmail,
        displayName: data.employeeName,
      },
    ],
    colorId: '11', // Red color for leave
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 day before
        { method: 'popup', minutes: 10 },
      ],
    },
  };

  return createEvent(accessToken, 'primary', event);
}

/**
 * Create calendar event
 */
export async function createEvent(
  accessToken: string,
  calendarId: string,
  event: CalendarEvent
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const response = await fetch(
      `${GOOGLE_CONFIG.API_BASE_URL}/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errorData = data as CalendarApiResponse;
      return {
        success: false,
        error: errorData.error?.message || `Failed to create event: ${response.statusText}`,
      };
    }

    return {
      success: true,
      eventId: data.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Update calendar event
 */
export async function updateEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  event: Partial<CalendarEvent>
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${GOOGLE_CONFIG.API_BASE_URL}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errorData = data as CalendarApiResponse;
      return {
        success: false,
        error: errorData.error?.message || `Failed to update event: ${response.statusText}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Delete calendar event
 */
export async function deleteEvent(
  accessToken: string,
  calendarId: string,
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${GOOGLE_CONFIG.API_BASE_URL}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to delete event: ${response.statusText}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * List calendars
 */
export async function listCalendars(
  accessToken: string
): Promise<{ success: boolean; calendars?: any[]; error?: string }> {
  try {
    const response = await fetch(`${GOOGLE_CONFIG.API_BASE_URL}/users/me/calendarList`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const errorData = data as CalendarApiResponse;
      return {
        success: false,
        error: errorData.error?.message || `Failed to list calendars: ${response.statusText}`,
      };
    }

    return {
      success: true,
      calendars: data.items,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
