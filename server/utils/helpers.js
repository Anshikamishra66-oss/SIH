/**
 * Generate a token string for a booking within a queue.
 * Format: F001, F002, ... F999
 * The number is the position within the day's queue for the centre.
 */
const generateToken = (sequenceNumber) => {
  const padded = String(sequenceNumber).padStart(3, '0');
  return `F${padded}`;
};

/**
 * Generate a unique booking ID
 */
const generateBookingId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK-${timestamp}-${random}`;
};

/**
 * Format minutes into human-readable time
 */
const formatWaitTime = (minutes) => {
  if (minutes <= 0) return 'Less than a minute';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
};

/**
 * Get start of day (midnight) for a given date
 */
const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get end of day for a given date
 */
const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

module.exports = {
  generateToken,
  generateBookingId,
  formatWaitTime,
  startOfDay,
  endOfDay,
};
