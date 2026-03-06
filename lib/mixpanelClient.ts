import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

export const initMixpanel = () => {
  if (!MIXPANEL_TOKEN) {
    console.warn('[Mixpanel] Token ausente. Verifique o arquivo .env.local.');
    return;
  }

  mixpanel.init(MIXPANEL_TOKEN, {
    autocapture: false,
    persistence: 'localStorage',
  });
};

export const track = (event: string, properties?: Record<string, unknown>) => {
  if (!MIXPANEL_TOKEN) return;
  mixpanel.track(event, properties);
};

export const identify = (userId: string) => {
  if (!MIXPANEL_TOKEN) return;
  mixpanel.identify(userId);
};

export const setUserProperties = (properties: Record<string, unknown>) => {
  if (!MIXPANEL_TOKEN) return;
  mixpanel.people.set(properties);
};
