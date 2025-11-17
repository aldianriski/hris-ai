import OpenAI from 'openai';
import type { AttendanceRecord } from '../../domain/entities/AttendanceRecord';
import { Location } from '../../domain/value-objects/Location';

export interface AnomalyDetectionResult {
  isAnomaly: boolean;
  anomalyType: 'location' | 'time' | 'hours' | 'impossible_travel' | null;
  reason: string | null;
  confidence: number;
  suggestions?: string[];
}

export interface AttendanceHistory {
  averageClockInHour: number;
  averageClockInMinute: number;
  averageLocation: { lat: number; lng: number };
  averageWorkHours: number;
  totalRecords: number;
}

export class AIAnomalyDetector {
  private openai: OpenAI;
  private readonly LOCATION_THRESHOLD_METERS = 5000; // 5km
  private readonly TIME_THRESHOLD_HOURS = 3;
  private readonly MAX_WORK_HOURS = 12;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Detect anomalies in attendance record
   */
  async detectAnomalies(
    record: AttendanceRecord,
    history: AttendanceHistory
  ): Promise<AnomalyDetectionResult> {
    const anomalies: Array<{
      type: 'location' | 'time' | 'hours' | 'impossible_travel';
      reason: string;
      confidence: number;
    }> = [];

    // 1. Location anomaly detection
    const locationAnomaly = this.detectLocationAnomaly(record, history);
    if (locationAnomaly) {
      anomalies.push(locationAnomaly);
    }

    // 2. Time anomaly detection
    const timeAnomaly = this.detectTimeAnomaly(record, history);
    if (timeAnomaly) {
      anomalies.push(timeAnomaly);
    }

    // 3. Excessive hours detection (if clocked out)
    if (record.clockOut && record.workHoursDecimal) {
      const hoursAnomaly = this.detectExcessiveHours(record);
      if (hoursAnomaly) {
        anomalies.push(hoursAnomaly);
      }
    }

    // No anomalies detected
    if (anomalies.length === 0) {
      return {
        isAnomaly: false,
        anomalyType: null,
        reason: null,
        confidence: 0,
      };
    }

    // Use AI to evaluate if this is a real anomaly
    const aiEvaluation = await this.evaluateWithAI(record, anomalies, history);

    // Return highest confidence anomaly
    const highestConfidence = anomalies.reduce((max, a) =>
      a.confidence > max.confidence ? a : max
    );

    return {
      isAnomaly: aiEvaluation.isAnomaly,
      anomalyType: highestConfidence.type,
      reason: aiEvaluation.reason ?? highestConfidence.reason,
      confidence: aiEvaluation.confidence,
      suggestions: aiEvaluation.suggestions,
    };
  }

  /**
   * Detect location deviation
   */
  private detectLocationAnomaly(
    record: AttendanceRecord,
    history: AttendanceHistory
  ): { type: 'location'; reason: string; confidence: number } | null {
    if (history.totalRecords < 5) {
      return null; // Not enough history
    }

    const currentLocation = new Location(record.locationLat, record.locationLng);
    const averageLocation = new Location(
      history.averageLocation.lat,
      history.averageLocation.lng
    );

    const distance = currentLocation.distanceTo(averageLocation);

    if (distance > this.LOCATION_THRESHOLD_METERS) {
      const distanceKm = Math.round(distance / 1000);
      return {
        type: 'location',
        reason: `Clocked in ${distanceKm}km from usual location`,
        confidence: Math.min(0.95, 0.7 + (distance / this.LOCATION_THRESHOLD_METERS) * 0.25),
      };
    }

    return null;
  }

  /**
   * Detect time deviation
   */
  private detectTimeAnomaly(
    record: AttendanceRecord,
    history: AttendanceHistory
  ): { type: 'time'; reason: string; confidence: number } | null {
    if (history.totalRecords < 5) {
      return null; // Not enough history
    }

    const clockInHour = record.clockIn.getHours();
    const clockInMinute = record.clockIn.getMinutes();

    const averageClockInDecimal = history.averageClockInHour + history.averageClockInMinute / 60;
    const currentClockInDecimal = clockInHour + clockInMinute / 60;

    const hoursDifference = Math.abs(currentClockInDecimal - averageClockInDecimal);

    if (hoursDifference > this.TIME_THRESHOLD_HOURS) {
      const direction = currentClockInDecimal > averageClockInDecimal ? 'later' : 'earlier';
      return {
        type: 'time',
        reason: `Clock in time ${Math.round(hoursDifference)}h ${direction} than average`,
        confidence: Math.min(0.9, 0.6 + (hoursDifference / this.TIME_THRESHOLD_HOURS) * 0.3),
      };
    }

    return null;
  }

  /**
   * Detect excessive work hours
   */
  private detectExcessiveHours(
    record: AttendanceRecord
  ): { type: 'hours'; reason: string; confidence: number } | null {
    if (!record.workHoursDecimal) return null;

    if (record.workHoursDecimal > this.MAX_WORK_HOURS) {
      return {
        type: 'hours',
        reason: `Work hours (${record.workHoursDecimal.toFixed(1)}h) exceed ${this.MAX_WORK_HOURS}h limit`,
        confidence: 0.95,
      };
    }

    return null;
  }

  /**
   * Use AI to evaluate anomalies and provide reasoning
   */
  private async evaluateWithAI(
    record: AttendanceRecord,
    anomalies: Array<{
      type: string;
      reason: string;
      confidence: number;
    }>,
    history: AttendanceHistory
  ): Promise<{
    isAnomaly: boolean;
    confidence: number;
    reason: string;
    suggestions: string[];
  }> {
    try {
      const systemPrompt = `You are an AI attendance anomaly evaluator for an Indonesian HRIS system.
Your role is to determine if detected attendance anomalies are legitimate concerns or false positives.

Consider Indonesian work culture:
- Field employees may clock in from different locations (valid)
- Traffic in Jakarta can cause late arrivals (common)
- Overtime up to 4 hours/day is allowed by law
- Remote work and client visits are normal

Evaluate the anomaly and respond in JSON format:
{
  "isAnomaly": boolean,
  "confidence": number (0-1),
  "reason": "explanation",
  "suggestions": ["action1", "action2"]
}`;

      const userPrompt = `
Employee Attendance History:
- Average clock in: ${history.averageClockInHour}:${String(history.averageClockInMinute).padStart(2, '0')}
- Average location: ${history.averageLocation.lat}, ${history.averageLocation.lng}
- Average work hours: ${history.averageWorkHours.toFixed(1)}h
- Total records: ${history.totalRecords}

Current Attendance:
- Clock in: ${record.clockIn.toISOString()}
- Location: ${record.locationLat}, ${record.locationLng}
- Work hours: ${record.workHoursDecimal?.toFixed(1) ?? 'N/A'}h

Detected Anomalies:
${anomalies.map((a) => `- ${a.type}: ${a.reason} (confidence: ${(a.confidence * 100).toFixed(0)}%)`).join('\n')}

Should HR review this attendance record?`;

      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0]?.message?.content ?? '{}');

      return {
        isAnomaly: result.isAnomaly ?? true,
        confidence: result.confidence ?? anomalies[0]?.confidence ?? 0.8,
        reason: result.reason ?? anomalies[0]?.reason ?? 'Unknown anomaly',
        suggestions: result.suggestions ?? [],
      };
    } catch (error) {
      console.error('AI anomaly evaluation failed:', error);

      // Fallback to rule-based decision
      const highestConfidence = anomalies[0]?.confidence ?? 0.8;
      return {
        isAnomaly: highestConfidence > 0.8,
        confidence: highestConfidence,
        reason: anomalies[0]?.reason ?? 'Anomaly detected',
        suggestions: ['Review attendance manually', 'Contact employee for clarification'],
      };
    }
  }
}
