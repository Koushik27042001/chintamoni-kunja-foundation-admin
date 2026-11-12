/**
 * Escapes special RegExp characters in user-supplied search queries
 * to prevent ReDoS attacks and RegExp syntax crashes.
 */
function escapeRegex(str = '') {
  return String(str).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { escapeRegex };

