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
   * Get encryption key from environment variable
   * Key must be 32 bytes (256 bits) for AES-256
   */
  private static getEncryptionKey(): Buffer {
    const key = process.env.MFA_ENCRYPTION_KEY;

    if (!key) {
      throw new Error(
        'MFA_ENCRYPTION_KEY environment variable is required. ' +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
      );
    }

    // Convert hex string to Buffer
    const keyBuffer = Buffer.from(key, 'hex');

    if (keyBuffer.length !== 32) {
      throw new Error(
        'MFA_ENCRYPTION_KEY must be 32 bytes (64 hex characters). ' +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
      );
    }

    return keyBuffer;
  }

  /**
   * Encrypt secret for storage using AES-256-GCM
   * Returns: iv:authTag:encryptedData (all in hex)
   */
  private static encryptSecret(secret: string): string {
    try {
      const key = this.getEncryptionKey();

      // Generate a random initialization vector (IV)
      const iv = crypto.randomBytes(16);

      // Create cipher with AES-256-GCM
      const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

      // Encrypt the secret
      let encrypted = cipher.update(secret, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get the authentication tag
      const authTag = cipher.getAuthTag();

      // Return format: iv:authTag:encryptedData
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
      console.error('Error encrypting MFA secret:', error);
      throw new Error('Failed to encrypt MFA secret');
    }
  }

  /**
   * Decrypt secret from storage using AES-256-GCM
   * Input format: iv:authTag:encryptedData (all in hex)
   */
  private static decryptSecret(encryptedSecret: string): string {
    try {
      const key = this.getEncryptionKey();

      // Split the encrypted string into components
      const parts = encryptedSecret.split(':');

      if (parts.length !== 3) {
        throw new Error('Invalid encrypted secret format');
      }

      const [ivHex, authTagHex, encryptedHex] = parts;

      // Convert hex strings back to Buffers
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');

      // Create decipher with AES-256-GCM
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);

      // Set the authentication tag
      decipher.setAuthTag(authTag);

      // Decrypt the data
      let decrypted = decipher.update(encrypted, undefined, 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Error decrypting MFA secret:', error);
      throw new Error('Failed to decrypt MFA secret');
    }
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
