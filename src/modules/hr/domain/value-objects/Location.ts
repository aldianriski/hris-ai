/**
 * GPS Location Value Object
 */
export class Location {
  constructor(
    public readonly latitude: number,
    public readonly longitude: number
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.latitude < -90 || this.latitude > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }

    if (this.longitude < -180 || this.longitude > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }
  }

  /**
   * Calculate distance to another location using Haversine formula
   * Returns distance in meters
   */
  distanceTo(other: Location): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(other.latitude - this.latitude);
    const dLon = this.toRadians(other.longitude - this.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(this.latitude)) *
        Math.cos(this.toRadians(other.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Check if location is within radius of another location
   */
  isWithinRadius(other: Location, radiusMeters: number): boolean {
    return this.distanceTo(other) <= radiusMeters;
  }

  /**
   * Format as "lat, lng"
   */
  toString(): string {
    return `${this.latitude}, ${this.longitude}`;
  }

  /**
   * Get Google Maps URL
   */
  toGoogleMapsUrl(): string {
    return `https://www.google.com/maps?q=${this.latitude},${this.longitude}`;
  }

  equals(other: Location): boolean {
    return this.latitude === other.latitude && this.longitude === other.longitude;
  }

  toObject(): { latitude: number; longitude: number } {
    return {
      latitude: this.latitude,
      longitude: this.longitude,
    };
  }
}
