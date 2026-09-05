import { Platform } from 'react-native';

export function injectWebStyles(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return;
  }

  if (document.getElementById('coffeeshot-web-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'coffeeshot-web-styles';
  style.textContent = `
    html, body, #root {
      height: 100%;
      margin: 0;
      background: #0B0A09;
      overflow: hidden;
    }
    body {
      font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
    }
    * {
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }
  `;
  document.head.appendChild(style);
}
