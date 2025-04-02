import { useEffect, useState, useCallback, memo } from "react";
import { Image as AntImage, Skeleton } from "antd";
import styles from "./OptimizedImage.module.scss";

interface ImageCache {
  [key: string]: {
    data: string;
    timestamp: number;
  };
}

interface OptimizedImageProps {
  src: string;
  alt: string;
  size?: "small" | "medium" | "large";
  quality?: number;
  className?: string;
}

const imageCache: ImageCache = {};

const processImage = (src: string, quality: number = 0.7): Promise<string> => {
  return new Promise((resolve) => {
    const img = document.createElement("img");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      if (ctx) {
        ctx.drawImage(img, 0, 0);

        const processedData = canvas.toDataURL("image/jpeg", quality);
        imageCache[src] = {
          data: processedData,
          timestamp: Date.now(),
        };

        resolve(processedData);
      } else {
        resolve(src);
      }
    };

    img.src = src;
  });
};

export const OptimizedImage = memo(
  ({
    src,
    alt,
    size = "medium",
    quality = 0.7,
    className,
  }: OptimizedImageProps) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processedSrc, setProcessedSrc] = useState<string | null>(null);

    useEffect(() => {
      let isMounted = true;

      const loadImage = async () => {
        try {
          setLoading(true);
          setError(null);

          const processed = await processImage(src, quality);

          if (isMounted) {
            setProcessedSrc(processed);
            setLoading(false);
          }
        } catch {
          if (isMounted) {
            setError("Failed to load image");
            setLoading(false);
          }
        }
      };

      loadImage();

      return () => {
        isMounted = false;
      };
    }, [src, quality]);

    const handleError = useCallback(() => {
      setError("Failed to load image");
      setLoading(false);
    }, []);

    const dimensions = {
      small: { width: 50, height: 50 },
      medium: { width: 100, height: 100 },
      large: { width: 200, height: 200 },
    }[size];

    if (error) {
      return <div className={styles.error}>{error}</div>;
    }

    return (
      <div
        className={`${styles.container} ${className || ""}`}
        style={dimensions}
      >
        {loading ? (
          <Skeleton.Image active style={dimensions} />
        ) : (
          <AntImage
            src={processedSrc || src}
            alt={alt}
            {...dimensions}
            className={styles.image}
            onError={handleError}
            preview={false}
          />
        )}
      </div>
    );
  }
);
