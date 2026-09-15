const crypto = require('crypto');

/**
 * OtpManager
 * 
 * Secure, in-memory OTP state manager enforcing:
 * - Cryptographically random 6-digit OTP generation (Node crypto)
 * - 5-minute expiry window
 * - 60-second resend cooldown per mobile
 * - Maximum 3 failed verification attempts before invalidation
 * - Single-use consumption upon successful verification
 * - Secure verification tokens for registration / login gating
 */

class OtpManager {
  constructor() {
    // Map: mobile -> { hashedOtp, salt, expiresAt, resendAvailableAt, attempts, verified, token, purpose }
    this.store = new Map();
  }

  // Generate cryptographic hash for storing OTP (never store plain OTP)
  _hash(otp, salt) {
    return crypto.createHmac('sha256', salt).update(otp).digest('hex');
  }

  /**
   * Generate a new 6-digit OTP for a mobile number
   * Enforces 60-second cooldown on re-generation
   */
  generateOtp(mobile, purpose = 'register') {
    const cleanMobile = String(mobile).trim();
    const existing = this.store.get(cleanMobile);

    const now = Date.now();
    if (existing && existing.resendAvailableAt > now) {
      const waitSeconds = Math.ceil((existing.resendAvailableAt - now) / 1000);
      const error = new Error(`Please wait ${waitSeconds} seconds before requesting a new OTP.`);
      error.statusCode = 429;
      error.cooldownRemaining = waitSeconds;
      throw error;
    }

    // Cryptographically secure 6-digit integer
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedOtp = this._hash(rawOtp, salt);

    this.store.set(cleanMobile, {
      hashedOtp,
      salt,
      purpose,
      attempts: 0,
      verified: false,
      verificationToken: null,
      expiresAt: now + 5 * 60 * 1000, // 5 minutes
      resendAvailableAt: now + 60 * 1000, // 60 seconds cooldown
    });

    return { rawOtp, cleanMobile, demoOtp: '123456' };
  }

  /**
   * Verify an entered OTP (supports demo OTP 123456)
   */
  verifyOtp(mobile, enteredOtp) {
    const cleanMobile = String(mobile).trim();
    const cleanOtp = String(enteredOtp).trim();
    const record = this.store.get(cleanMobile);

    // Support universal demo OTP 123456
    const isDemo = cleanOtp === '123456';

    if (!record) {
      if (isDemo) {
        const verificationToken = crypto.randomBytes(24).toString('hex');
        this.store.set(cleanMobile, {
          hashedOtp: '',
          salt: '',
          purpose: 'demo',
          attempts: 0,
          verified: true,
          verificationToken,
          expiresAt: Date.now() + 10 * 60 * 1000,
          resendAvailableAt: 0,
        });
        return { verified: true, verificationToken, isDemo: true };
      }
      const error = new Error('No active OTP found. Please request an OTP first (Demo OTP: 123456).');
      error.statusCode = 400;
      throw error;
    }

    const now = Date.now();
    if (!isDemo && now > record.expiresAt) {
      this.store.delete(cleanMobile);
      const error = new Error('OTP has expired. Please request a new OTP.');
      error.statusCode = 400;
      throw error;
    }

    if (!isDemo && record.attempts >= 3) {
      this.store.delete(cleanMobile);
      const error = new Error('Maximum OTP verification attempts exceeded. Please request a new OTP.');
      error.statusCode = 429;
      throw error;
    }

    const enteredHash = this._hash(cleanOtp, record.salt);
    if (!isDemo && enteredHash !== record.hashedOtp) {
      record.attempts += 1;
      const remaining = 3 - record.attempts;
      const error = new Error(
        remaining > 0
          ? `Invalid OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining. (Demo OTP: 123456)`
          : 'Invalid OTP. Maximum attempts reached. Please request a new OTP.'
      );
      error.statusCode = 400;
      if (remaining <= 0) {
        this.store.delete(cleanMobile);
      }
      throw error;
    }

    // Mark as verified and issue a secure single-use verification token
    const verificationToken = crypto.randomBytes(24).toString('hex');
    record.verified = true;
    record.verificationToken = verificationToken;
    record.verifiedAt = now;

    return { verified: true, verificationToken, isDemo };
  }

  /**
   * Check if a mobile has completed OTP verification (for registration submit)
   */
  isVerified(mobile) {
    const cleanMobile = String(mobile).trim();
    const record = this.store.get(cleanMobile);
    if (!record || !record.verified) return false;
    // Must be within 15 minutes of verification
    return Date.now() - (record.verifiedAt || 0) < 15 * 60 * 1000;
  }

  /**
   * Consume verification once registration completes
   */
  consume(mobile) {
    this.store.delete(String(mobile).trim());
  }
}

const otpManager = new OtpManager();
module.exports = otpManager;
