// --- Libraries
import { useState } from "react";

// --- Utils
import { getOptimizedImageUrl } from "@utils/optimizeImage";
import { cn } from "@utils/cn";

// --- Types
import type { ProductImageType } from "@/types/types";

type ProductImagesProps = {
  images: ProductImageType[];
  title: string;
};

// --- Main Component
const ProductImages = ({ images, title }: ProductImagesProps) => {
  // --- Product Images Logic
  const [currentImage, setCurrentImage] = useState<number>(0);
  const hasMultipleImages = images && images.length > 1;

  // --- Return JSX
  return (
    <div className="col-span-4 max-md:mb-5 md:col-span-2 mx-auto">
      {/* --- Main Image */}
      <div className="w-40 h-40 mb-5 sm:w-60 sm:h-60 xl:w-70 xl:h-70 mx-auto overflow-hidden rounded-md group">
        <img
          src={getOptimizedImageUrl(images[currentImage]?.url, 800)}
          alt={title}
          loading="lazy"
          className={cn(
            "h-full w-full object-contain transition-transform duration-300 ease-in-out",
            !hasMultipleImages && "group-hover:scale-110",
          )}
        />
      </div>
      {/* --- Product Images */}
      {hasMultipleImages && (
        <div className="flex gap-0.5 justify-center">
          {images.map((img, index) => (
            <img
              src={getOptimizedImageUrl(img.url, 150)}
              alt={title}
              loading="lazy"
              key={index}
              className={cn(
                "w-14 h-14 sm:w-18 sm:h-18 xl:w-20 xl:h-20 object-contain hover:border-warning hover:p-0.5 transition-all duration-150 cursor-pointer rounded-md",
                currentImage === index ? "border-2 border-warning p-0.5" : "border border-gray-200",
              )}
              onClick={() => setCurrentImage(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImages;
