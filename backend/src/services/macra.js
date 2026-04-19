/**
 * MACRA Integration Service
 * Server-to-server communication with MACRA's CEIR system.
 *
 * When a police officer verifies a theft report, SDIRS automatically
 * notifies MACRA to greylist the IMEI on their EIR — so the device
 * stays on the network (honey trap) but is flagged for monitoring.
 *
 * When a device is recovered, SDIRS notifies MACRA to whitelist it.
 */

const MACRA_WEBHOOK_URL = process.env.MACRA_WEBHOOK_URL;
const MACRA_API_KEY     = process.env.MACRA_API_KEY;

/**
 * Notify MACRA to greylist an IMEI (device verified stolen by police)
 * Greylist = device stays on network but is flagged for monitoring
 */
async function notifyMacraGreylist(payload) {
  return _sendToMacra('/imei/greylist', {
    imei:        payload.imei,
    action:      'GREYLIST',
    reason:      'THEFT_VERIFIED',
    case_number: payload.caseNumber,
    report_id:   payload.reportId,
    verified_by: payload.verifiedBy,
    district:    payload.district,
    timestamp:   new Date().toISOString(),
    source:      'SDIRS',
  });
}

/**
 * Notify MACRA to whitelist an IMEI (device recovered)
 */
async function notifyMacraWhitelist(payload) {
  return _sendToMacra('/imei/whitelist', {
    imei:        payload.imei,
    action:      'WHITELIST',
    reason:      'DEVICE_RECOVERED',
    case_number: payload.caseNumber,
    report_id:   payload.reportId,
    timestamp:   new Date().toISOString(),
    source:      'SDIRS',
  });
}

/**
 * Core HTTP sender to MACRA's webhook endpoint
 */
async function _sendToMacra(path, body) {
  // Skip in dev if no webhook URL configured
  if (!MACRA_WEBHOOK_URL || !MACRA_API_KEY) {
    console.warn(`[MACRA] Webhook not configured — skipping ${path} (dev mode)`);
    console.warn('[MACRA] Payload would have been:', JSON.stringify(body, null, 2));
    return { skipped: true, devMode: true };
  }

  const response = await fetch(`${MACRA_WEBHOOK_URL}${path}`, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key':    MACRA_API_KEY,
      'x-source':     'SDIRS-MALAWI',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`MACRA webhook error ${response.status}: ${text}`);
  }

  console.log(`[MACRA] ${body.action} sent for IMEI ${body.imei} — ${response.status}`);
  return response.json();
}

module.exports = { notifyMacraGreylist, notifyMacraWhitelist };
