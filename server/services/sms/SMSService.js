/**
 * SMSService
 *
 * Production integration layer for sending SMS via authorized gateways.
 * Supported providers: Fast2SMS, MSG91, Twilio.
 *
 * Configuration via environment variables:
 * - SMS_PROVIDER (fast2sms | msg91 | twilio | none)
 * - SMS_API_KEY
 * - SMS_SENDER_ID (optional DLT sender ID e.g. KISANP)
 * - SMS_TEMPLATE_ID (optional DLT registered template ID)
 */

class SMSService {
  constructor() {
    this.provider = (process.env.SMS_PROVIDER || 'fast2sms').toLowerCase();
    this.apiKey = process.env.SMS_API_KEY || '';
    this.senderId = process.env.SMS_SENDER_ID || 'KISANP';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 5);
  }

  /**
   * Send real OTP SMS to farmer mobile
   */
  async sendOtp(mobile, otp) {
    const cleanMobile = String(mobile).replace(/\D/g, '').slice(-10);
    const message = `Your Kisan Procurement Connect verification code is ${otp}. Valid for 5 minutes. Do not share this OTP with anyone.`;

    if (this.isConfigured()) {
      try {
        if (this.provider === 'fast2sms') {
          return await this._sendViaFast2SMS(cleanMobile, message, otp);
        } else if (this.provider === 'msg91') {
          return await this._sendViaMSG91(cleanMobile, message, otp);
        } else if (this.provider === 'twilio') {
          return await this._sendViaTwilio(cleanMobile, message);
        }
      } catch (err) {
        console.error(`[SMS GATEWAY ERROR] Failed to send SMS via ${this.provider}:`, err.message);
        throw new Error(`SMS gateway error: ${err.message}`);
      }
    }

    // When no third-party SMS provider API key is configured:
    // Follow the user prompt: "If official OTP/Aadhaar API credentials are not configured in the project,
    // create a clean backend integration layer with environment variables and clearly marked configuration points.
    // Do NOT pretend that Aadhaar or SMS verification is real when no authorized provider is connected."
    console.warn(
      `\n⚠️  [SMS GATEWAY NOT CONFIGURED IN .env]\n` +
      `   To deliver real SMS to +91 ${cleanMobile}, please set SMS_API_KEY and SMS_PROVIDER in server/.env.\n` +
      `   [SERVER TERMINAL DEBUG ONLY - NEVER EXPOSED IN CLIENT API]: Code = ${otp}\n`
    );

    return {
      delivered: false,
      configured: false,
      note: 'SMS gateway credentials pending configuration in .env',
    };
  }

  /**
   * Send mandatory KYC submission confirmation SMS
   */
  async sendKycConfirmation(mobile) {
    const cleanMobile = String(mobile).replace(/\D/g, '').slice(-10);
    const message = 'Your KYC application has been successfully submitted. Your KYC will be updated within 2 working days.';

    console.log(`\n📱 [KYC SMS DISPATCH to +91 ${cleanMobile}]: "${message}"\n`);

    if (this.isConfigured()) {
      try {
        if (this.provider === 'fast2sms') {
          await this._sendViaFast2SMS(cleanMobile, message);
        } else if (this.provider === 'msg91') {
          await this._sendViaMSG91(cleanMobile, message);
        } else if (this.provider === 'twilio') {
          await this._sendViaTwilio(cleanMobile, message);
        }
      } catch (err) {
        console.error('[SMS GATEWAY ERROR] Failed to deliver KYC confirmation SMS:', err.message);
      }
    }

    return { delivered: this.isConfigured(), message };
  }

  // Provider Implementation: Fast2SMS (India Bulk SMS)
  async _sendViaFast2SMS(mobile, message, otp) {
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        authorization: this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: otp ? 'otp' : 'v3',
        variables_values: otp || undefined,
        message: otp ? undefined : message,
        numbers: mobile,
      }),
    });

    const data = await response.json();
    if (!response.ok || data.return === false) {
      throw new Error(data.message?.[0] || 'Fast2SMS gateway returned error');
    }
    return { delivered: true, provider: 'fast2sms', response: data };
  }

  // Provider Implementation: MSG91 (Enterprise SMS)
  async _sendViaMSG91(mobile, message, otp) {
    const response = await fetch('https://api.msg91.com/api/v5/otp', {
      method: 'POST',
      headers: {
        authkey: this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template_id: process.env.SMS_TEMPLATE_ID,
        mobile: `91${mobile}`,
        otp,
      }),
    });

    const data = await response.json();
    if (!response.ok || data.type === 'error') {
      throw new Error(data.message || 'MSG91 gateway error');
    }
    return { delivered: true, provider: 'msg91', response: data };
  }

  // Provider Implementation: Twilio
  async _sendViaTwilio(mobile, message) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const fromPhone = process.env.TWILIO_FROM_NUMBER;
    const authHeader = Buffer.from(`${accountSid}:${this.apiKey}`).toString('base64');

    const params = new URLSearchParams({
      To: `+91${mobile}`,
      From: fromPhone,
      Body: message,
    });

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Twilio SMS gateway error');
    }
    return { delivered: true, provider: 'twilio', response: data };
  }
}

const smsService = new SMSService();
module.exports = smsService;
