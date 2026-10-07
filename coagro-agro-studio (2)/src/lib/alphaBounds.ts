export interface AlphaBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  aspectRatio: number;
  opaquePixelCount: number;
}

export type ProductOrientation = 'vertical' | 'horizontal' | 'compact' | 'small';

export interface AdaptiveProductInfo {
  croppedSrc: string;
  bounds: AlphaBounds | null;
  orientation: ProductOrientation;
  isWide: boolean;
  isSmall: boolean;
}

export function calculateAlphaBounds(
  imageData: ImageData,
  alphaThreshold = 8
): AlphaBounds | null {
  const { data, width, height } = imageData;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  let opaquePixelCount = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > alphaThreshold) {
        opaquePixelCount += 1;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) return null;

  const visibleWidth = maxX - minX + 1;
  const visibleHeight = maxY - minY + 1;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: visibleWidth,
    height: visibleHeight,
    aspectRatio: visibleWidth / visibleHeight,
    opaquePixelCount,
  };
}

/**
 * Analisa a imagem do produto, calcula o bounding box alfa e faz o corte justo
 * (tight crop) para ancoragem física pela base sem espaços vazios transparentes.
 */
export async function processAdaptiveProduct(
  imageSrc: string
): Promise<AdaptiveProductInfo> {
  // Para SVGs data URI ou strings vazias, mantém compatibilidade sem processamento de canvas
  if (!imageSrc || imageSrc.startsWith('data:image/svg+xml')) {
    return {
      croppedSrc: imageSrc,
      bounds: null,
      orientation: 'compact',
      isWide: false,
      isSmall: false,
    };
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            croppedSrc: imageSrc,
            bounds: null,
            orientation: 'compact',
            isWide: false,
            isSmall: false,
          });
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const bounds = calculateAlphaBounds(imageData);

        if (!bounds || bounds.width <= 0 || bounds.height <= 0) {
          resolve({
            croppedSrc: imageSrc,
            bounds: null,
            orientation: 'compact',
            isWide: false,
            isSmall: false,
          });
          return;
        }

        // Determina proporção e preenchimento real com base nos pixels opacos
        const totalPixels = canvas.width * canvas.height;
        const fillRatio = bounds.opaquePixelCount / totalPixels;

        let orientation: ProductOrientation = 'compact';
        const isWide = bounds.aspectRatio > 1.2;
        const isTall = bounds.aspectRatio < 0.75;
        const isSmall = fillRatio < 0.28;

        if (isSmall) {
          orientation = 'small';
        } else if (isWide) {
          orientation = 'horizontal';
        } else if (isTall) {
          orientation = 'vertical';
        } else {
          orientation = 'compact';
        }

        // Cria canvas com corte justo nos limites do produto
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = bounds.width;
        cropCanvas.height = bounds.height;
        const cropCtx = cropCanvas.getContext('2d');

        if (!cropCtx) {
          resolve({
            croppedSrc: imageSrc,
            bounds,
            orientation,
            isWide,
            isSmall,
          });
          return;
        }

        cropCtx.drawImage(
          canvas,
          bounds.minX,
          bounds.minY,
          bounds.width,
          bounds.height,
          0,
          0,
          bounds.width,
          bounds.height
        );

        const croppedSrc = cropCanvas.toDataURL('image/png');
        resolve({
          croppedSrc,
          bounds,
          orientation,
          isWide,
          isSmall,
        });
      } catch (err) {
        console.warn('Erro ao calcular bounding box alfa:', err);
        resolve({
          croppedSrc: imageSrc,
          bounds: null,
          orientation: 'compact',
          isWide: false,
          isSmall: false,
        });
      }
    };

    img.onerror = () => {
      resolve({
        croppedSrc: imageSrc,
        bounds: null,
        orientation: 'compact',
        isWide: false,
        isSmall: false,
      });
    };

    img.src = imageSrc;
  });
}
