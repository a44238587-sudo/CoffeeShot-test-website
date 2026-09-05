import { Platform } from 'react-native';

export async function countWebVideoInputs(): Promise<number | null> {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') {
    return null;
  }

  try {
    const devices = await navigator.mediaDevices?.enumerateDevices?.();
    if (!devices) {
      return null;
    }
    return devices.filter((device) => device.kind === 'videoinput').length;
  } catch {
    return null;
  }
}

export function stopWebVideoStreams(root?: ParentNode): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return;
  }

  const scope = root ?? document;
  scope.querySelectorAll('video').forEach((video) => {
    const stream = video.srcObject;
    if (stream instanceof MediaStream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    video.srcObject = null;
  });
}
