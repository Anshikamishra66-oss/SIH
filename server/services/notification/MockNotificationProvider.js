/**
 * MockNotificationProvider
 *
 * Development/demo provider that:
 * 1. Logs notification events to console
 * 2. Creates in-app notification records in MongoDB
 * 3. Emits real-time notification via Socket.IO
 *
 * To integrate a real SMS gateway (e.g., MSG91, Twilio):
 * - Create SMSNotificationProvider.js implementing the same interface
 * - Swap provider in NotificationService.js
 */

class MockNotificationProvider {
  async send({ userId, type, title, message, metadata, io }) {
    // Log to console with clear DEMO marker
    console.log(`\n📱 [MOCK NOTIFICATION - DEMO MODE]`);
    console.log(`  To:      User ${userId}`);
    console.log(`  Type:    ${type}`);
    console.log(`  Title:   ${title}`);
    console.log(`  Message: ${message}`);
    console.log(`  Meta:    ${JSON.stringify(metadata || {})}`);
    console.log(`  Note:    Real SMS/Push would be sent in production\n`);

    // Persist to DB
    const Notification = require('../../models/Notification.model');
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      metadata: metadata || {},
      deliveryStatus: { inApp: true, sms: false, push: false },
    });

    // Real-time delivery via Socket.IO if available
    if (io) {
      io.to(`user:${userId}`).emit('notification:new', notification);
    }

    return notification;
  }
}

module.exports = MockNotificationProvider;
