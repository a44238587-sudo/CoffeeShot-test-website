import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

type SdkPreviewProps = {
  onReady: (video: HTMLVideoElement) => void;
};

export function SdkPreview({ onReady }: SdkPreviewProps) {
  const hostRef = useRef<View>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const host = hostRef.current as unknown as HTMLElement | null;
    if (!host) {
      return;
    }

    const video = document.createElement('video');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    Object.assign(video.style, {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      background: '#0B0A09',
      display: 'block',
    });
    host.appendChild(video);
    onReadyRef.current(video);

    return () => {
      video.remove();
    };
  }, []);

  return <View ref={hostRef} style={StyleSheet.absoluteFill} pointerEvents="none" />;
}
