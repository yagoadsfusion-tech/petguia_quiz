import { createHash } from 'crypto';

const TIKTOK_EVENTS_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';

// Mapeamento de price_id → { value, content_name }
const PRICE_MAP: Record<string, { value: number; content_name: string }> = {
  // Pay — planos regulares
  price_1T7KpZ6oqWcsG0cdx4It6l4s: { value: 149.90, content_name: 'Anual' },
  price_1T7KpK6oqWcsG0cdfCSYZF65: { value: 129.90, content_name: 'Semestral' },
  price_1T7Kow6oqWcsG0cdkGsMi4Jj: { value:  99.90, content_name: 'Mensal' },
  // Pay — planos semanais (variante B)
  price_1T7ksD6oqWcsG0cdh1SfzMR1: { value:  49.90, content_name: 'Plano de 7 dias' },
  price_1T7ktd6oqWcsG0cdGLSYll4P: { value:  79.90, content_name: 'Plano de 4 semanas' },
  price_1T7kuC6oqWcsG0cdKiStAiMB: { value:  99.90, content_name: 'Plano de 12 semanas' },
  // Offer — planos de exit offer
  price_1T7ys66oqWcsG0cdnODbhaHM: { value:  29.90, content_name: 'Plano de 7 dias (Oferta)' },
  price_1T7ysi6oqWcsG0cdSAKOqZc2: { value:  39.90, content_name: 'Plano de 4 semanas (Oferta)' },
  price_1T7ytG6oqWcsG0cdipvSkiBE: { value:  59.90, content_name: 'Plano de 12 semanas (Oferta)' },
};

function sha256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

interface SendTikTokEventParams {
  event: string;
  email: string;
  priceId: string;
}

export async function sendTikTokEvent({ event, email, priceId }: SendTikTokEventParams): Promise<void> {
  const pixelCode = process.env.TIKTOK_PIXEL_ID;
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;

  if (!pixelCode || !accessToken) {
    console.warn('[TikTok] TIKTOK_PIXEL_ID ou TIKTOK_ACCESS_TOKEN não configurados — evento ignorado');
    return;
  }

  const priceInfo = PRICE_MAP[priceId];
  if (!priceInfo) {
    console.warn(`[TikTok] price_id desconhecido: ${priceId} — evento ignorado`);
    return;
  }

  const payload = {
    event_source:    'web',
    event_source_id: pixelCode,
    data: [
      {
        event,
        event_time: Math.floor(Date.now() / 1000),
        user: {
          email: sha256(email),
        },
        properties: {
          currency: 'BRL',
          value: priceInfo.value,
          content_id: priceId,
          content_type: 'product',
          content_name: priceInfo.content_name,
        },
      },
    ],
  };

  const res = await fetch(TIKTOK_EVENTS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Token': accessToken,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`TikTok Events API respondeu ${res.status}: ${body}`);
  }

  const json = await res.json();
  console.log(`[TikTok] Evento "${event}" enviado com sucesso:`, json);
}
