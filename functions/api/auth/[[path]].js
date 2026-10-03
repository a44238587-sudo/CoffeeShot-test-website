import { createPagesAuthHandler } from 'website-auth-sdk/cloudflare-pages';
export const onRequest = createPagesAuthHandler({
  appSlug: 'coffeeframe',
  bindingName: 'AUTH_SUPABASE_APP'
});
