/**
 * @fileoverview Cursor-based pagination utilities.
 */

/**
 * Encode a database record's cursor fields into a base64 string.
 * @param {Object} record - The record to encode.
 * @param {string} record.id - The record's ID.
 * @param {Date|string} record.createdAt - The record's creation date.
 * @returns {string} The base64 encoded cursor.
 */
export function encodeCursor(record) {
  if (!record || !record.id || !record.createdAt) {
    throw new Error('Record must have id and createdAt to encode cursor');
  }
  const payload = JSON.stringify({ id: record.id, createdAt: record.createdAt });
  return Buffer.from(payload).toString('base64');
}

/**
 * Decode a base64 cursor string into an object.
 * @param {string} cursor - The base64 encoded cursor.
 * @returns {{ id: string, createdAt: string } | null} The decoded cursor object, or null if invalid.
 */
export function decodeCursor(cursor) {
  if (!cursor) return null;
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded);
    if (!parsed.id || !parsed.createdAt) return null;
    return parsed;
  } catch (error) {
    return null;
  }
}

/**
 * Build pagination metadata from the fetched records.
 * Note: records array should be queried with (limit + 1) to determine hasMore.
 * @param {Array} records - The records fetched from DB.
 * @param {number} limit - The requested page limit.
 * @returns {Object} { data: Array, meta: { nextCursor: string|null, hasMore: boolean } }
 */
export function buildPaginationMeta(records, limit) {
  const hasMore = records.length > limit;
  let nextCursor = null;

  if (hasMore) {
    records.pop(); // Remove the extra record used for detection
  }

  if (records.length > 0) {
    const lastRecord = records[records.length - 1];
    nextCursor = encodeCursor(lastRecord);
  }

  return {
    data: records,
    meta: {
      nextCursor: hasMore ? nextCursor : null,
      hasMore,
    },
  };
}
