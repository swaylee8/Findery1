import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

interface FullScreenImageViewerProps {
  images: string[];
  currentIndex: number;
  title: string;
  onClose: () => void;
  onImageChange: (index: number) => void;
}

export function FullScreenImageViewer({
  images,
  currentIndex,
  title,
  onClose,
  onImageChange,
}: FullScreenImageViewerProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset zoom when image changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Handle double-tap to zoom
  const handleImageTap = (e: React.MouseEvent) => {
    const now = Date.now();
    const timeBetweenTaps = now - lastTap;
    
    if (timeBetweenTaps < 300 && timeBetweenTaps > 0) {
      // Double tap detected
      e.preventDefault();
      e.stopPropagation();
      
      if (scale === 1) {
        // Zoom in to cursor/touch position
        const rect = imageRef.current?.getBoundingClientRect();
        if (rect) {
          const centerX = (e.clientX - rect.left - rect.width / 2) * 0.5;
          const centerY = (e.clientY - rect.top - rect.height / 2) * 0.5;
          setPosition({ x: -centerX, y: -centerY });
        }
        setScale(2.5);
      } else {
        // Zoom out
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
    }
    
    setLastTap(now);
  };

  // Handle pinch-to-zoom (touch devices)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      containerRef.current?.setAttribute('data-initial-distance', distance.toString());
      containerRef.current?.setAttribute('data-initial-scale', scale.toString());
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      const initialDistance = parseFloat(
        containerRef.current?.getAttribute('data-initial-distance') || '0'
      );
      const initialScale = parseFloat(
        containerRef.current?.getAttribute('data-initial-scale') || '1'
      );
      
      if (initialDistance > 0) {
        const newScale = Math.max(0.5, Math.min(4, initialScale * (distance / initialDistance)));
        setScale(newScale);
      }
    }
  };

  // Handle mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.5, Math.min(4, scale * delta));
    setScale(newScale);
    
    if (newScale === 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  // Handle pan/drag when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      containerRef.current?.setAttribute('data-start-x', e.clientX.toString());
      containerRef.current?.setAttribute('data-start-y', e.clientY.toString());
      containerRef.current?.setAttribute('data-start-pos-x', position.x.toString());
      containerRef.current?.setAttribute('data-start-pos-y', position.y.toString());
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      const startX = parseFloat(containerRef.current?.getAttribute('data-start-x') || '0');
      const startY = parseFloat(containerRef.current?.getAttribute('data-start-y') || '0');
      const startPosX = parseFloat(containerRef.current?.getAttribute('data-start-pos-x') || '0');
      const startPosY = parseFloat(containerRef.current?.getAttribute('data-start-pos-y') || '0');
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      setPosition({
        x: startPosX + deltaX,
        y: startPosY + deltaY
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const zoomIn = () => {
    const newScale = Math.min(4, scale * 1.5);
    setScale(newScale);
  };

  const zoomOut = () => {
    const newScale = Math.max(0.5, scale / 1.5);
    setScale(newScale);
    if (newScale === 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      onImageChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
    } else {
      onImageChange(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95"
      onClick={onClose}
      data-testid="fullscreen-image-viewer"
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            zoomOut();
          }}
          className="p-3 bg-black/70 rounded-full text-white hover:bg-black/90 transition-colors"
          data-testid="zoom-out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            zoomIn();
          }}
          className="p-3 bg-black/70 rounded-full text-white hover:bg-black/90 transition-colors"
          data-testid="zoom-in"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={onClose}
          className="p-3 bg-black/70 rounded-full text-white hover:bg-black/90 transition-colors"
          data-testid="close-fullscreen"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Image Container */}
      <div
        ref={containerRef}
        className="absolute inset-0 flex items-center justify-center p-4 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
      >
        <motion.img
          ref={imageRef}
          src={images[currentIndex]}
          alt={title}
          className="max-w-full max-h-full object-contain select-none"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease',
          }}
          onClick={handleImageTap}
          onDragStart={(e) => e.preventDefault()}
          data-testid="fullscreen-image"
        />
      </div>

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black/70 rounded-full text-white text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Zoom indicator */}
      {scale !== 1 && (
        <div className="absolute bottom-6 right-6 px-3 py-2 bg-black/70 rounded-full text-white text-sm">
          {Math.round(scale * 100)}%
        </div>
      )}

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateImage('prev');
            }}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/70 rounded-full text-white hover:bg-black/90 transition-colors"
            data-testid="prev-image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateImage('next');
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/70 rounded-full text-white hover:bg-black/90 transition-colors"
            data-testid="next-image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
    </motion.div>
  );
}