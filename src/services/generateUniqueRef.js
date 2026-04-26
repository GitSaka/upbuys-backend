const crypto = require("crypto");

function generateUniqueRef() {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(5).toString("hex").toUpperCase();

  return `TXN_${timestamp}_${random}`;
}

module.exports = generateUniqueRef;