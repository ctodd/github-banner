/**
 * Pattern index file that combines all character patterns
 */

const alphabet = require('./alphabet');
const numbers = require('./numbers');
const special = require('./special');

// Combine all patterns into a single object
const allPatterns = {
  ...alphabet,
  ...numbers,
  ...special
};

module.exports = allPatterns;
