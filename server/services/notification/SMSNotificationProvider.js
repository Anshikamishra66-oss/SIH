/**
 * SMSNotificationProvider (Stub)
 *
 * Future integration point for real SMS gateway (MSG91, Twilio, etc.)
 * To activate: set NOTIFICATION_PROVIDER=sms in .env and provide SMS_API_KEY
 */

class SMSNotificationProvider {
  async send({ userId, type, title, message, metadata, io }) {
    // TODO: Integrate real SMS gateway
    // Example with MSG91:
    //   await msg91.sendSMS({ mobile: user.mobile, message });

    // Also create in-app notification
    const Notification = require('../../models/Notification.model');
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      metadata: metadata || {},
      deliveryStatus: { inApp: true, sms: true, push: false },
    });

    if (io) {
      io.to(`user:${userId}`).emit('notification:new', notification);
    }

    return notification;
  }
}

module.exports = SMSNotificationProvider;
