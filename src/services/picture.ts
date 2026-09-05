import { Platform } from 'react-native';

function guessMime(uri: string): string {
  if (uri.startsWith('data:')) {
    const match = /^data:([^;]+);/.exec(uri);
    return match?.[1] ?? 'image/jpeg';
  }
  if (uri.toLowerCase().includes('.png')) {
    return 'image/png';
  }
  return 'image/jpeg';
}

async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return response.blob();
}

export async function appendCapturedImage(
  formData: FormData,
  field: string,
  uri: string,
): Promise<void> {
  const name = `coffeeshot-${Date.now()}.jpg`;
  const type = guessMime(uri);

  if (Platform.OS === 'web' || uri.startsWith('data:')) {
    const blob = await uriToBlob(uri);
    formData.append(field, blob, name);
    return;
  }

  formData.append(
    field,
    {
      uri,
      name,
      type,
    } as unknown as Blob,
  );
}

export async function createDemoCapture(): Promise<string> {
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1440;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return FALLBACK_JPEG;
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 1440);
    gradient.addColorStop(0, '#2A1810');
    gradient.addColorStop(0.45, '#6B3A1F');
    gradient.addColorStop(1, '#120C09');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1440);

    ctx.fillStyle = 'rgba(243, 230, 212, 0.12)';
    ctx.beginPath();
    ctx.arc(540, 700, 240, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(232, 165, 75, 0.55)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(540, 700, 180, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(243, 230, 212, 0.92)';
    ctx.font = '600 44px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('CoffeeShot · mode démo', 540, 220);

    ctx.font = '24px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(243, 230, 212, 0.7)';
    ctx.fillText(new Date().toLocaleString('fr-FR'), 540, 1180);

    return canvas.toDataURL('image/jpeg', 0.86);
  }

  return FALLBACK_JPEG;
}

const FALLBACK_JPEG =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUTExIVFRUXFxcXFxcXFxcXFxcXFxUXFxUXFxUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGy0lHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAKgBLAMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAAEAAIDBQYBB//EADkQAAIBAwMCBAQFAwQBBQAAAAECAwAEEQUSITFBBhNRYXEigZGh8BQyscHR4QcjQlLxFjNDcoL/xAAZAQADAQEBAAAAAAAAAAAAAAAAAQIDBAX/xAAhEQACAgMBAQEAAwEAAAAAAAAAAQIRAyESMUETIlFhMv/aAAwDAQACEQMRAD8A9gooorQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQB//Z';
