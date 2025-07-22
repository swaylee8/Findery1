import { useState } from "react";

interface PhotoCarouselProps {
  images: string[];
}

export default function PhotoCarousel({ images }: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "left" && currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (direction === "right" && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="relative">
      <img
        src={images[currentIndex]}
        alt={`Photo ${currentIndex + 1}`}
        className="w-full h-64 object-cover"
        onTouchStart={(e) => {
          const startX = e.touches[0].clientX;
          e.currentTarget.onTouchEnd = (endE) => {
            const endX = endE.changedTouches[0].clientX;
            const diff = startX - endX;
            if (Math.abs(diff) > 50) {
              handleSwipe(diff > 0 ? "left" : "right");
            }
          };
        }}
      />
      
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full ${
                index === currentIndex ? "bg-white" : "bg-white bg-opacity-50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
