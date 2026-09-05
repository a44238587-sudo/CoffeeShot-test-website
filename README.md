# CoffeeShot test website

Browser test page for **CoffeeShot**. The Expo / React Native Web UI is a thin shell: preview chrome, framing overlay, shutter, and result panel. **Camera, flip, capture, and analyze** are driven by the [CoffeeShot browser SDK](https://github.com/a44238587-sudo/CoffeeShot-sdk).

Live CDN: `https://coffeeshot-sdk.pages.dev/sdk.mjs`  
Contract: [`SDK_CONTRACT.md`](https://github.com/a44238587-sudo/CoffeeShot-sdk/blob/main/SDK_CONTRACT.md)  
SDK demo: https://coffeeshot-sdk.pages.dev/

## Stack

- Expo SDK 57 (React Native + React Native Web)
- CoffeeShot browser SDK loaded at runtime from the CDN (`checkCompatibility`, `createClient`)
- Single full-bleed camera screen, dark UI, French copy

## Run on web

```bash
npm install
npx expo start --web
```

Or `npm run web`. Metro serves the page; open the printed localhost URL.

On first load, grant camera permission. You should see:

1. A full-bleed camera preview (SDK-attached `<video>`)
2. A rule-of-thirds overlay and a rotating AI hint from the SDK (e.g. « Centrez le sujet »)
3. Shutter + flip camera controls (`client.flip()` / `client.capture()`)
4. After capture: local preview, upload/mock progress, then a result card (`result` event)

If the browser has no camera, or permission is denied, use **Continuer en mode démo**. Demo mode calls `client.start({ demo: true })` so the overlay, still, and mock analysis still run.

## Environment

Copy `.env.example` to `.env` and restart Expo after changes.

| Variable | Required | Description |
| --- | --- | --- |
| `EXPO_PUBLIC_SDK_ORIGIN` | no | Origin that hosts `sdk.mjs`. Default: `https://coffeeshot-sdk.pages.dev`. |
| `EXPO_PUBLIC_API_URL` | no | Backend origin passed to `createClient({ apiUrl })`. When unset, the SDK uses a local mock analysis. |
| `EXPO_PUBLIC_ANALYZE_PATH` | no | Path passed to `createClient({ analyzePath })`. Default: `/analyze`. |

The page loads the SDK with:

```js
const sdkOrigin = process.env.EXPO_PUBLIC_SDK_ORIGIN || 'https://coffeeshot-sdk.pages.dev';
const { checkCompatibility, createClient } = await import(`${sdkOrigin}/sdk.mjs`);
```

`createClient` is called with `locale: 'fr'`, the optional API URL / analyze path, and a host `<video>` (`overlay: false` — this page keeps its own framing chrome and subscribes to `hint` / `banner` events).

When `EXPO_PUBLIC_API_URL` is set, the SDK `POST`s `multipart/form-data` to `{apiUrl}{analyzePath}` with:

- `image` — captured JPEG
- `source` — `coffeeshot-test-website`

A JSON body such as `{ "title": "...", "score": 90, "tips": ["..."] }` is displayed. Upload progress comes from SDK `status` events.

## Camera on the web

The SDK uses the browser [MediaDevices / `getUserMedia`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) API.

- Serve over **HTTPS** or **localhost** (browsers treat localhost as a secure context). A plain `http://` LAN IP will usually block the camera.
- The first visit prompts for camera permission. If you deny it, re-enable the camera for this origin in the browser site settings.
- If the page is embedded in an iframe, the iframe needs `allow="camera"`.
- `flip()` stops the current stream, remounts the preview, and opens the other facing. A single-camera device keeps the live preview and shows a banner.

## Native (iOS / Android)

The browser SDK is not available in Expo Go / native binaries. Those targets show a short message asking you to open the page in a browser. Web is the supported test surface.

```bash
npx expo start
```

## Project layout

```
App.tsx
src/screens/CameraScreen.tsx    # RN Web shell: gate, overlay, shutter, result
src/sdk/                        # CDN loader + createClient session
src/components/                 # framing overlay, permission gate, result sheet
```
