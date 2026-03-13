import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { createHash } from 'crypto';

// Carrega .env.local da raiz do projeto
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const TIKTOK_EVENTS_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';

const ACCESS_TOKEN    = process.env.TIKTOK_ACCESS_TOKEN;
const PIXEL_ID        = process.env.TIKTOK_PIXEL_ID;
const TEST_EVENT_CODE = process.env.TIKTOK_TEST_EVENT_CODE || undefined;

if (!ACCESS_TOKEN || !PIXEL_ID) {
  console.error('❌ TIKTOK_ACCESS_TOKEN ou TIKTOK_PIXEL_ID não encontrados no .env.local');
  process.exit(1);
}

function sha256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

async function main() {
  const email       = 'yagoadsfusion@gmail.com';
  const value       = 49.90;
  const currency    = 'BRL';
  const contentId   = 'price_1T7ksD6oqWcsG0cdh1SfzMR1';
  const contentName = '7 dias PetGuia';

  const eventData: Record<string, unknown> = {
    event:      'CompletePayment',
    event_time: Math.floor(Date.now() / 1000),
    user: {
      email: sha256(email),
    },
    properties: {
      currency,
      value,
      content_id:   contentId,
      content_type: 'product',
      content_name: contentName,
    },
  };

  const payload: Record<string, unknown> = {
    event_source:    'web',
    event_source_id: PIXEL_ID,
    data:            [eventData],
  };

  if (TEST_EVENT_CODE) {
    payload.test_event_code = TEST_EVENT_CODE;
  }

  console.log('\n📦 Payload enviado:');
  console.log(JSON.stringify(payload, null, 2));
  console.log(`\n🔑 Email original: ${email}`);
  console.log(`🔒 Email (SHA-256): ${sha256(email)}`);
  if (TEST_EVENT_CODE) {
    console.log(`🧪 test_event_code: ${TEST_EVENT_CODE}`);
  }
  console.log('\n🚀 Enviando para TikTok Events API...\n');

  const res = await fetch(TIKTOK_EVENTS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Token':  ACCESS_TOKEN!,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  console.log(`📡 Status HTTP: ${res.status}`);
  console.log('📬 Resposta da API:');
  console.log(JSON.stringify(json, null, 2));

  if (res.ok && json.code === 0) {
    console.log('\n✅ Evento enviado com sucesso!');
  } else {
    console.log('\n❌ Erro ao enviar evento.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Erro inesperado:', err);
  process.exit(1);
});
