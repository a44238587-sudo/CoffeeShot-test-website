# CoffeeShot test website

Browser test page for **CoffeeShot**: a native-feeling camera prototype with framing guidance, a custom AI overlay, still capture, and an upload path to a backend API.

This repo is the **web-first test site**. A separate CoffeeFrame app will be the production mobile client later. The same Expo project is also ready for iOS and Android via Expo Go / a native build.

## Stack

- Expo SDK 57 (React Native + React Native Web)
- `expo-camera` for the live preview (`getUserMedia` on the web)
- Single full-bleed camera screen, dark UI, French copy

## Run on web

```bash
npm install
npx expo start --web
```

Or `npm run web`. Metro serves the page; open the printed localhost URL.

On first load, grant camera permission. You should see:

1. A full-bleed camera preview
2. A rule-of-thirds overlay and a rotating mock AI hint (e.g. « Centrez le sujet »)
3. Shutter + flip camera controls
4. After capture: local preview, upload/mock progress, then a result card

If the browser has no camera, or permission is denied, use **Continuer en mode démo**. Demo mode still shows the overlay, produces a still, and runs the mock analysis so the page stays usable.

## Environment

Copy `.env.example` to `.env` if you want a real backend:

| Variable | Required | Description |
| --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | no | Backend origin, e.g. `https://api.example.com`. When unset, capture is logged and a fake AI result is shown. |
| `EXPO_PUBLIC_ANALYZE_PATH` | no | Path appended to the base URL. Default: `/analyze`. |

Restart Expo after changing env vars.

When `EXPO_PUBLIC_API_URL` is set, the app `POST`s `multipart/form-data` to `{EXPO_PUBLIC_API_URL}{path}` with:

- `image` — captured JPEG
- `source` — `coffeeshot-test-website`

A JSON body such as `{ "title": "...", "score": 90, "tips": ["..."] }` is displayed. Any other JSON/text is shown as a fallback. Upload progress uses `XMLHttpRequest`.

## Camera on the web

`expo-camera` uses the browser [MediaDevices / `getUserMedia`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) API.

- Serve over **HTTPS** or **localhost** (browsers treat localhost as a secure context). A plain `http://` LAN IP will usually block the camera.
- The first visit prompts for camera permission. If you deny it, re-enable the camera for this origin in the browser site settings.
- If the page is embedded in an iframe, the iframe needs `allow="camera"`.
- `takePictureAsync` returns a **base64 data URI** on web (no local filesystem). Native targets return a file URI. Both are accepted by the upload helper.

## Native (iOS / Android)

The project is a standard Expo app:

```bash
npx expo start
```

Then open it in Expo Go, or run `npm run ios` / `npm run android`. `app.json` includes the `expo-camera` config plugin and camera permission strings.

## Project layout

```
App.tsx
src/screens/CameraScreen.tsx    # preview, overlay, shutter, permission/demo
src/components/                 # framing overlay, permission gate, result sheet
src/services/analyzePhoto.ts    # multipart upload or mock AI result
```
