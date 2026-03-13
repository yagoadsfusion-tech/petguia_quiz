import crypto from 'crypto';

const META_API_VERSION = 'v18.0';

function hashEmail(email: string): string {
  return crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
}

interface MetaPurchaseEventParams {
  eventId: string;
  value: number;
  email?: string;
  userAgent?: string;
  ip?: string;
  fbc?: string;
  fbp?: string;
  eventSourceUrl?: string;
  numItems?: number;
}

export async function sendMetaPurchaseEvent(params: MetaPurchaseEventParams): Promise<void> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    console.warn('[Meta] META_PIXEL_ID ou META_ACCESS_TOKEN não configurados — evento ignorado');
    return;
  }

  const url = `https://graph.facebook.com/${META_API_VERSION}/${pixelId}/events?access_token=${accessToken}`;

  const userData: Record<string, string> = {};
  if (params.email) userData.em = hashEmail(params.email);
  if (params.userAgent) userData.client_user_agent = params.userAgent;
  if (params.ip) userData.client_ip_address = params.ip;
  if (params.fbc) userData.fbc = params.fbc;
  if (params.fbp) userData.fbp = params.fbp;

  const eventData: Record<string, unknown> = {
    event_name: 'Purchase',
    event_time: Math.floor(Date.now() / 1000),
    event_id: params.eventId,
    action_source: 'website',
    custom_data: {
      currency: 'BRL',
      value: params.value,
      num_items: params.numItems ?? 1,
    },
    user_data: userData,
  };

  if (params.eventSourceUrl) {
    eventData.event_source_url = params.eventSourceUrl;
  }

  const payload: Record<string, unknown> = {
    data: [eventData],
  };

  const testEventCode = process.env.META_TEST_EVENT_CODE;
  if (testEventCode) {
    payload.test_event_code = testEventCode;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Meta Conversions API respondeu ${res.status}: ${body}`);
  }

  const json = await res.json();
  console.log('[Meta] Evento "Purchase" enviado com sucesso:', JSON.stringify(json));
}
