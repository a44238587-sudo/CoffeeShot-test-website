import { createPagesWebsiteGuard } from 'website-auth-sdk/cloudflare-pages';

// Every page, asset and API is private except these exact login resources.
export const onRequest = createPagesWebsiteGuard({
  appSlug: 'coffeeshot',
  allowedEmail: 'a44238587@gmail.com',
  bindingName: 'AUTH_SUPABASE_APP',
  signInPath: '/test-access/',
  publicPaths: [
    "/test-access/",
    "/test-access",
    "/test-access/login.js",
    "/test-access/login.css",
    "/_test-auth/index.js",
    "/_test-auth/flow.js",
    "/_test-auth/flow-controller.js",
    "/_test-auth/cookie-client.js",
    "/_test-auth/recovery.js"
],
});
