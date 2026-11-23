import { Image as AntImage, Skeleton } from "antd";
import { useEffect, useState } from "react";
import styles from "./OptimizedImage.module.scss";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  quality?: number;
  className?: string;
}

const cache = new Map<string, string>();
const MAX_DISPLAY_WIDTH = 240;

const processImage = (
  src: string,
  width: number,
  height: number,
  quality: number,
  isCancelled: () => boolean,
): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";

    img.onload = () => {
      if (isCancelled()) return;

      try {
        const scale = Math.min(1, width / img.naturalWidth, height / img.naturalHeight);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        const context = canvas.getContext("2d");
        if (!context) {
          resolve(src);
          return;
        }
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch {
        resolve(src);
      }
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });

export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  quality = 0.7,
  className,
}: OptimizedImageProps) => {
  const displayWidth = Math.min(Math.max(width, 1), MAX_DISPLAY_WIDTH);
  const displayHeight = Math.max(1, Math.round((displayWidth * height) / width));
  const cacheKey = `${src}|${displayWidth}|${displayHeight}|${quality}`;
  const [processedSrc, setProcessedSrc] = useState<string | null>(
    () => cache.get(cacheKey) ?? null,
  );
  const [loading, setLoading] = useState(() => !cache.has(cacheKey));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cached = cache.get(cacheKey);

    if (cached) {
      setProcessedSrc(cached);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    void processImage(src, displayWidth, displayHeight, quality, () => cancelled)
      .then((data) => {
        if (cancelled) return;
        cache.set(cacheKey, data);
        setProcessedSrc(data);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Failed to load image");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cacheKey, src, displayWidth, displayHeight, quality]);

  const dimensions = { width: displayWidth, height: displayHeight };

  if (error) {
    return (
      <div
        className={`${styles.container} ${styles.error} ${className ?? ""}`}
        style={dimensions}
        role="img"
        aria-label={alt}
      >
        {error}
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className ?? ""}`} style={dimensions}>
      {loading ? (
        <Skeleton.Image active style={dimensions} />
      ) : (
        <AntImage
          src={processedSrc ?? src}
          alt={alt}
          width={displayWidth}
          height={displayHeight}
          className={styles.image}
          loading="lazy"
          preview={false}
          onError={() => setError("Failed to load image")}
        />
      )}
    </div>
  );
};
