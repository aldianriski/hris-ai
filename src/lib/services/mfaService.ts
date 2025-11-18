import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';
import { authenticator } from 'otplib';

export interface MFASettings {
  id: string;
  user_id: string;
  mfa_enabled: boolean;
  mfa_method: 'totp' | 'sms' | 'email';
  totp_secret?: string;
  totp_verified_at?: string;
  phone_number?: string;
  phone_verified?: boolean;
  phone_verified_at?: string;
  email_verified_at?: string;
  backup_codes?: string[];
  backup_codes_generated_at?: string;
  recovery_email?: string;
  recovery_email_verified?: boolean;
  created_at: string;
  updated_at: string;
}

export interface TOTPSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export class MFAService {
  /**
   * Generate TOTP secret and QR code for setup
   */
  static async generateTOTPSetup(userId: string, userEmail: string): Promise<TOTPSetup> {
    // Generate secret
    const secret = authenticator.generateSecret();

    // Generate OTP Auth URL for QR code
    const otpauthUrl = authenticator.keyuri(
      userEmail,
      'HRIS Platform',
      secret
    );

    // Generate backup codes (10 codes)
    const backupCodes = Array.from({ length: 10 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    // Hash backup codes for storage
    const hashedBackupCodes = backupCodes.map(code =>
      crypto.createHash('sha256').update(code).digest('hex')
    );

    // Store secret and backup codes (not yet verified)
    const supabase = await createClient();
    const { error } = await supabase
      .from('user_mfa_settings')
      .upsert({
        user_id: userId,
        totp_secret: this.encryptSecret(secret),
        backup_codes: hashedBackupCodes,
        backup_codes_generated_at: new Date().toISOString(),
        mfa_enabled: false, // Not enabled until verified
      });

    if (error) {
      throw new Error(`Failed to save TOTP setup: ${error.message}`);
    }

    return {
      secret,
      qrCodeUrl: otpauthUrl,
      backupCodes, // Return plain codes for user to save
    };
  }

  /**
   * Verify TOTP code and enable MFA
   */
  static async verifyTOTPAndEnable(userId: string, code: string): Promise<boolean> {
    const supabase = await createClient();

    // Get user's TOTP secret
    const { data: mfaSettings, error } = await supabase
      .from('user_mfa_settings')
      .select('totp_secret')
      .eq('user_id', userId)
      .single();

    if (error || !mfaSettings?.totp_secret) {
      throw new Error('TOTP not set up');
    }

    // Decrypt secret
    const secret = this.decryptSecret(mfaSettings.totp_secret);

    // Verify code
    const isValid = authenticator.verify({ token: code, secret });

    // Log attempt
    await this.logVerificationAttempt(userId, 'totp', isValid);

    if (isValid) {
      // Enable MFA
      await supabase
        .from('user_mfa_settings')
        .update({
          mfa_enabled: true,
          mfa_method: 'totp',
          totp_verified_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    }

    return isValid;
  }

  /**
   * Verify TOTP code for login
   */
  static async verifyTOTP(userId: string, code: string): Promise<boolean> {
    const supabase = await createClient();

    // Get user's TOTP secret
    const { data: mfaSettings } = await supabase
      .from('user_mfa_settings')
      .select('totp_secret, mfa_enabled')
      .eq('user_id', userId)
      .single();

    if (!mfaSettings?.mfa_enabled || !mfaSettings?.totp_secret) {
      return false;
    }

    // Decrypt secret
    const secret = this.decryptSecret(mfaSettings.totp_secret);

    // Verify code
    const isValid = authenticator.verify({ token: code, secret });

    // Log attempt
    await this.logVerificationAttempt(userId, 'totp', isValid);

    return isValid;
  }

  /**
   * Verify backup code
   */
  static async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const supabase = await createClient();

    // Get user's backup codes
    const { data: mfaSettings } = await supabase
      .from('user_mfa_settings')
      .select('backup_codes, mfa_enabled')
      .eq('user_id', userId)
      .single();

    if (!mfaSettings?.mfa_enabled || !mfaSettings?.backup_codes) {
      return false;
    }

    // Hash provided code
    const hashedCode = crypto.createHash('sha256').update(code.toUpperCase()).digest('hex');

    // Check if code exists
    const isValid = mfaSettings.backup_codes.includes(hashedCode);

    // Log attempt
    await this.logVerificationAttempt(userId, 'backup_code', isValid);

    if (isValid) {
      // Remove used backup code
      const updatedCodes = mfaSettings.backup_codes.filter(c => c !== hashedCode);
      await supabase
        .from('user_mfa_settings')
        .update({ backup_codes: updatedCodes })
        .eq('user_id', userId);
    }

    return isValid;
  }

  /**
   * Disable MFA
   */
  static async disableMFA(userId: string, verificationCode: string): Promise<boolean> {
    // Verify current code before disabling
    const isValid = await this.verifyTOTP(userId, verificationCode);

    if (!isValid) {
      return false;
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('user_mfa_settings')
      .update({
        mfa_enabled: false,
        totp_secret: null,
        totp_verified_at: null,
        backup_codes: null,
      })
      .eq('user_id', userId);

    return !error;
  }

  /**
   * Get MFA settings for user
   */
  static async getMFASettings(userId: string): Promise<MFASettings | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('user_mfa_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      return null;
    }

    // Don't expose secrets
    return {
      ...data,
      totp_secret: undefined,
      backup_codes: undefined,
    } as MFASettings;
  }

  /**
   * Generate new backup codes
   */
  static async generateNewBackupCodes(userId: string, verificationCode: string): Promise<string[] | null> {
    // Verify current code before generating new backup codes
    const isValid = await this.verifyTOTP(userId, verificationCode);

    if (!isValid) {
      return null;
    }

    // Generate new backup codes
    const backupCodes = Array.from({ length: 10 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    // Hash backup codes for storage
    const hashedBackupCodes = backupCodes.map(code =>
      crypto.createHash('sha256').update(code).digest('hex')
    );

    const supabase = await createClient();
    const { error } = await supabase
      .from('user_mfa_settings')
      .update({
        backup_codes: hashedBackupCodes,
        backup_codes_generated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      return null;
    }

    return backupCodes;
  }

  /**
   * Check if MFA is required for user
   */
  static async isMFARequired(userId: string): Promise<boolean> {
    const settings = await this.getMFASettings(userId);
    return settings?.mfa_enabled ?? false;
  }

  /**
   * Log verification attempt for security monitoring
   */
  private static async logVerificationAttempt(
    userId: string,
    method: string,
    success: boolean
  ): Promise<void> {
    const supabase = await createClient();
    await supabase.from('mfa_verification_attempts').insert({
      user_id: userId,
      method,
      success,
      attempted_at: new Date().toISOString(),
    });
  }

  /**
   * Encrypt secret for storage (simple implementation - use proper encryption in production)
   */
  private static encryptSecret(secret: string): string {
    // TODO: Implement proper encryption using env variable key
    // For now, just base64 encode (NOT SECURE - use AES-256 in production)
    return Buffer.from(secret).toString('base64');
  }

  /**
   * Decrypt secret from storage
   */
  private static decryptSecret(encryptedSecret: string): string {
    // TODO: Implement proper decryption
    // For now, just base64 decode
    return Buffer.from(encryptedSecret, 'base64').toString('utf-8');
  }

  /**
   * Get recent failed attempts count (for rate limiting)
   */
  static async getRecentFailedAttempts(userId: string, minutes: number = 15): Promise<number> {
    const supabase = await createClient();
    const cutoff = new Date(Date.now() - minutes * 60 * 1000).toISOString();

    const { count, error } = await supabase
      .from('mfa_verification_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('success', false)
      .gte('attempted_at', cutoff);

    if (error) {
      return 0;
    }

    return count ?? 0;
  }
}
