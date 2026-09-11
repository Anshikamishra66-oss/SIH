const notificationService = require('../services/notification/NotificationService');

/**
 * Socket.IO event handler
 *
 * Rooms:
 *   centre:{centreId}    → Officers + farmers watching a specific centre queue
 *   user:{userId}        → Farmer-specific events (notifications, booking updates)
 *
 * Events emitted by server:
 *   queue:updated        → Queue state changed at a centre
 *   token:called         → Farmer's specific token was called
 *   booking:updated      → Farmer's booking status changed
 *   procurement:updated  → Procurement status changed
 *   payment:updated      → Payment status changed
 *   notification:new     → New in-app notification
 */

const socketHandler = (io) => {
  // Make io available to notification service for real-time delivery
  notificationService.setIO(io);

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Farmer joins their personal room and a centre room
    socket.on('join:farmer', ({ userId, centreId }) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`  → Joined user room: user:${userId}`);
      }
      if (centreId) {
        socket.join(`centre:${centreId}`);
        console.log(`  → Joined centre room: centre:${centreId}`);
      }
    });

    // Officer joins their centre room
    socket.on('join:officer', ({ centreId }) => {
      if (centreId) {
        socket.join(`centre:${centreId}`);
        console.log(`  → Officer joined centre room: centre:${centreId}`);
      }
    });

    // Leave rooms
    socket.on('leave:centre', ({ centreId }) => {
      socket.leave(`centre:${centreId}`);
    });

    // Ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id} (${reason})`);
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });
  });

  return io;
};

module.exports = socketHandler;
