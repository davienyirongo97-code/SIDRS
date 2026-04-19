/**
 * CEIR Integration Service
 * Validates IMEIs against MACRA's Central Equipment Identity Register
 * https://www.ceir.mw
 */

const CEIR_API_URL = process.env.CEIR_API_URL || 'https://www.ceir.mw/api';
const CEIR_API_KEY = process.env.CEIR_API_KEY;

/**
 * Check IMEI compliance with CEIR
 * Returns: { compliant: bool, registered: bool, status: string }
 */
async function checkImei(imei) {
  // If no API key configured, skip CEIR check (dev mode)
  if (!CEIR_API_KEY) {
    console.warn('CEIR_API_KEY not set — skipping CEIR validation (dev mode)');
    return { compliant: true, registered: true, status: 'unchecked', devMode: true };
  }

  try {
    const response = await fetch(`${CEIR_API_URL}/check/${imei}`, {
      headers: {
        'Authorization': `Bearer ${CEIR_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CEIR API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      compliant:  data.compliant  ?? true,
      registered: data.registered ?? false,
      status:     data.status     || 'unknown',
    };
  } catch (err) {
    console.error('CEIR check failed:', err.message);
    // Fail open in dev — fail closed in production
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CEIR validation unavailable. Try again later.');
    }
    return { compliant: true, registered: false, status: 'ceir_unavailable' };
  }
}

/**
 * Extract TAC (Type Allocation Code) from IMEI
 * First 8 digits — identifies manufacturer and model
 */
function extractTAC(imei) {
  return imei?.replace(/\D/g, '').substring(0, 8) || null;
}

/**
 * Validate IMEI check digit using Luhn algorithm
 */
function validateImeiCheckDigit(imei) {
  const digits = imei.replace(/\D/g, '');
  if (digits.length !== 15) return false;

  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let d = parseInt(digits[i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return (10 - (sum % 10)) % 10 === parseInt(digits[14]);
}

module.exports = { checkImei, extractTAC, validateImeiCheckDigit };
