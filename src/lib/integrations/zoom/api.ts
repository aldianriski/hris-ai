/**
 * Zoom API Client
 * Functions for creating and managing Zoom meetings
 */

import { ZOOM_CONFIG } from '../config';

export interface ZoomMeeting {
  topic: string;
  type: 1 | 2 | 3 | 8; // 1=Instant, 2=Scheduled, 3=Recurring with no fixed time, 8=Recurring with fixed time
  start_time?: string; // ISO 8601 format (required for scheduled meetings)
  duration?: number; // Duration in minutes
  timezone?: string; // Timezone (e.g., 'Asia/Jakarta')
  password?: string;
  agenda?: string;
  settings?: {
    host_video?: boolean;
    participant_video?: boolean;
    join_before_host?: boolean;
    mute_upon_entry?: boolean;
    watermark?: boolean;
    use_pmi?: boolean;
    approval_type?: 0 | 1 | 2; // 0=automatically approve, 1=manually approve, 2=no registration
    registration_type?: 1 | 2 | 3; // 1=Attendees register once, 2=Attendees need to register for each occurrence, 3=Attendees register once and choose occurrences
    audio?: 'both' | 'telephony' | 'voip';
    auto_recording?: 'local' | 'cloud' | 'none';
    waiting_room?: boolean;
  };
}

export interface ZoomMeetingResponse {
  id: number;
  uuid: string;
  host_id: string;
  host_email: string;
  topic: string;
  type: number;
  status: string;
  start_time: string;
  duration: number;
  timezone: string;
  created_at: string;
  start_url: string;
  join_url: string;
  password?: string;
  error?: {
    code: number;
    message: string;
  };
}

/**
 * Create Zoom meeting
 */
export async function createMeeting(
  accessToken: string,
  meeting: ZoomMeeting
): Promise<{ success: boolean; meeting?: ZoomMeetingResponse; error?: string }> {
  try {
    const response = await fetch(`${ZOOM_CONFIG.API_BASE_URL}/users/me/meetings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meeting),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.message || data.message || `Failed to create meeting: ${response.statusText}`,
      };
    }

    return {
      success: true,
      meeting: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Create meeting for performance review
 */
export async function createPerformanceReviewMeeting(
  accessToken: string,
  data: {
    employeeName: string;
    reviewerName: string;
    startTime: string; // ISO 8601
    duration: number;
  }
): Promise<{ success: boolean; meeting?: ZoomMeetingResponse; error?: string }> {
  const meeting: ZoomMeeting = {
    topic: `Performance Review: ${data.employeeName}`,
    type: 2, // Scheduled meeting
    start_time: data.startTime,
    duration: data.duration || 60,
    timezone: 'Asia/Jakarta',
    agenda: `Performance review meeting between ${data.reviewerName} and ${data.employeeName}`,
    settings: {
      host_video: true,
      participant_video: true,
      join_before_host: false,
      mute_upon_entry: false,
      watermark: false,
      audio: 'both',
      auto_recording: 'cloud',
      waiting_room: true,
    },
  };

  return createMeeting(accessToken, meeting);
}

/**
 * Create meeting for interview
 */
export async function createInterviewMeeting(
  accessToken: string,
  data: {
    candidateName: string;
    interviewerName: string;
    position: string;
    startTime: string;
    duration: number;
  }
): Promise<{ success: boolean; meeting?: ZoomMeetingResponse; error?: string }> {
  const meeting: ZoomMeeting = {
    topic: `Interview: ${data.candidateName} - ${data.position}`,
    type: 2,
    start_time: data.startTime,
    duration: data.duration || 60,
    timezone: 'Asia/Jakarta',
    agenda: `Interview for ${data.position} position with ${data.candidateName}`,
    password: Math.random().toString(36).substring(2, 8),
    settings: {
      host_video: true,
      participant_video: true,
      join_before_host: false,
      mute_upon_entry: true,
      watermark: true,
      audio: 'both',
      auto_recording: 'cloud',
      waiting_room: true,
    },
  };

  return createMeeting(accessToken, meeting);
}

/**
 * Get meeting details
 */
export async function getMeeting(
  accessToken: string,
  meetingId: string
): Promise<{ success: boolean; meeting?: ZoomMeetingResponse; error?: string }> {
  try {
    const response = await fetch(`${ZOOM_CONFIG.API_BASE_URL}/meetings/${meetingId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.message || data.message || `Failed to get meeting: ${response.statusText}`,
      };
    }

    return {
      success: true,
      meeting: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Delete meeting
 */
export async function deleteMeeting(
  accessToken: string,
  meetingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${ZOOM_CONFIG.API_BASE_URL}/meetings/${meetingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok && response.status !== 204) {
      const data = await response.json();
      return {
        success: false,
        error: data.error?.message || data.message || `Failed to delete meeting: ${response.statusText}`,
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
 * List meetings
 */
export async function listMeetings(
  accessToken: string
): Promise<{ success: boolean; meetings?: any[]; error?: string }> {
  try {
    const response = await fetch(`${ZOOM_CONFIG.API_BASE_URL}/users/me/meetings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.message || data.message || `Failed to list meetings: ${response.statusText}`,
      };
    }

    return {
      success: true,
      meetings: data.meetings,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
