import { createPagesAuthHandler } from 'website-auth-sdk/cloudflare-pages';
export const onRequest = createPagesAuthHandler({
  appSlug: 'coffeeframe',
  allowedEmail: 'a44238587@gmail.com',
  bindingName: 'AUTH_SUPABASE_APP'
});
