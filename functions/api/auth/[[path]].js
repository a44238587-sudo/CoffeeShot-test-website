import { createPagesAuthHandler } from 'website-auth-sdk/cloudflare-pages';
export const onRequest = createPagesAuthHandler({
  appSlug: 'coffeeshot',
  allowedEmail: 'a44238587@gmail.com',
  bindingName: 'AUTH_SUPABASE_APP'
});
